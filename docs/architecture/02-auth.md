# Authentication & Authorization

## Packages and why

`@supabase/supabase-js` + `@supabase/ssr`. **Not** `@supabase/auth-helpers-nextjs`
— deprecated, replaced by `@supabase/ssr` (Supabase's own migration guide is
explicit about this). Cookie handlers use the current `getAll`/`setAll`
shape, not the older single-cookie `get`/`set`/`remove` shape. Both the
browser and server client are constructed with the **publishable** key
(`sb_publishable_...`); the **secret** key (`sb_secret_...`, the modern name
for what used to be called `service_role`) never ships to a client, is never
read outside a handful of narrowly-justified server-only code paths, and
Phase 1 doesn't need it at all — see "Privilege escalation" below.

## Client separation

- `src/lib/supabase/client.ts` — `createBrowserClient(...)`, used only from
  Client Components that need live/interactive Supabase access (e.g. an
  autosave hook). Most of the app doesn't need this at all — Server
  Components and Server Actions cover the vast majority of reads/writes.
- `src/lib/supabase/server.ts` — an async `createClient()` wrapping
  `createServerClient(...)`, reading/writing cookies via `next/headers`
  `cookies()`. A **new** client is created per request/render — never
  cached at module scope (that leaks one user's session into another
  user's request under Vercel's shared-instance serverless execution).
- `src/proxy.ts` — Next.js 16 renamed `middleware.ts`/`middleware()` to
  `proxy.ts`/`proxy()` (same mechanism; `middleware.ts` still works today
  but is deprecated, so this project uses the current name). Runs
  `supabase.auth.getClaims()` **immediately** after constructing the
  client (no code in between — an unrelated await between client creation
  and this call can drop the refreshed-cookie write), then writes any
  refreshed session cookies to **both** `request.cookies` and a freshly
  constructed `NextResponse.next({ request })` before returning it.
  Skipping either half causes intermittent, hard-to-reproduce logouts —
  this is the single most footgun-prone part of Supabase SSR auth, called
  out explicitly in Supabase's own docs, so it gets an integration test
  (see [06-testing.md](./06-testing.md)).

## Authorization primitive: `getClaims()`, never `getSession()`

Server-side code authorizes against `getClaims()` (validates the JWT
locally) or, where a network round-trip is acceptable and freshness matters
more than latency, `getUser()` (revalidates against Supabase Auth).
`getSession()` returns whatever is in the cookie **without verifying it** —
never used for an authorization decision, only (if ever) for non-sensitive
UI hints.

## One user table, role-driven staff/customer split

There is one `profiles` row per `auth.users` row (created by a trigger on
`auth.users` insert — never created ad hoc by application code, so it can
never drift out of sync with Supabase Auth). `profiles.user_type` is a fast
`staff | customer` discriminator for UI branching (which layout to render),
but it is **not** the authorization boundary — the real boundary is the
`roles`/`permissions`/`role_permissions`/`user_roles` tables, checked two
ways:

1. **Application-level**, via `requirePermission(permissionKey)` in
   `src/lib/domain/rbac.ts` — reads the caller's roles → permissions,
   throws a typed `ForbiddenError` a route/action can turn into a clean
   403. Fast, gives good error messages, called at the top of every admin
   server action.
2. **Database-level (authoritative)**, via a `has_permission(uid, key)` SQL
   function used inside RLS policies:

   ```sql
   create or replace function public.has_permission(p_user_id uuid, p_permission_key text)
   returns boolean
   language sql
   security definer
   set search_path = public
   stable
   as $$
     select exists (
       select 1
       from public.user_roles ur
       join public.role_permissions rp on rp.role_id = ur.role_id
       join public.permissions p on p.id = rp.permission_id
       where ur.user_id = p_user_id and p.key = p_permission_key
     );
   $$;
   ```

   `security definer` is required here: the function must read
   `role_permissions`/`permissions` regardless of the *calling* role's own
   RLS visibility into those tables, or every policy that calls it would
   need its own redundant grants. It's deliberately narrow (one boolean
   read, `stable`, no side effects) — the RLS equivalent of dohost's
   documented principle that server-side authorization is authoritative,
   pushed one layer deeper so it's authoritative even against a direct API
   call that skips the Next.js app entirely (§7's actual requirement).

Application check and RLS policy are **both** always in effect — defense in
depth, not "pick one." A route handler bug that forgets the application
check still hits a database that says no.

## Seeded roles (`roles.key`)

`super_admin`, `admin`, `billing`, `support`, `content_editor`,
`seo_manager`, `customer` — per §6. Seeded permissions follow the
`resource.action` convention from the spec (`pages.view/create/update/
delete/publish`, `blog.view/create/update/publish`, `media.manage`,
`users.manage`, `settings.manage`, `seo.manage`, plus keys reserved —
unused until their tables exist — for `products.manage`, `domains.manage`,
`orders.manage`, `invoices.manage`, `payments.manage`, `tickets.manage`,
`reports.view`). `content_editor` gets `pages.create`/`update` but not
`pages.publish`, matching §68's "editors can create/edit without
publication privileges unless configured." `customer` gets no admin
permissions at all — its access model is row-ownership, not permissions
(reserved for Phase 6).

## Route protection

Two layers, same pattern dohost validated the hard way:

1. `proxy.ts` does an **optimistic, cookie-presence check** and redirects
   obviously-unauthenticated requests before any rendering starts. It is a
   UX nicety — faster redirects, no flash of protected content — never the
   real gate.
2. Every protected layout calls a `requireStaffSession()` /
   `requireCustomerSession()` helper (`src/lib/supabase/guards.ts`) that
   re-validates via `getClaims()` server-side. This is the actual gate.

**Routing gotcha (learned from dohost, applies identically here):** a
layout's guard applies to every route nested under its folder. Auth pages
(`/admin/login`, `/login`, `/register`, password reset) must be **siblings**
of the protected layout's route group, never children of it — e.g.
`app/admin/(protected)/layout.tsx` holds only pages requiring a staff
session, with `app/admin/login/page.tsx` outside that group. Nesting the
login page under the guarded layout creates an infinite redirect loop for
every unauthenticated visitor. This is encoded directly in the directory
structure in [00-overview.md](./00-overview.md), not left as a rule to
remember.

## Email/password flow (Phase 1 scope: staff auth only)

Phase 1 ships staff authentication (the admin app). Public customer
registration is Phase 6 (client portal) — the `profiles`/`roles` schema
already supports it, but there's no public sign-up UI yet (shipping one
with nothing behind it — no services/orders/invoices to show — would be
exactly the "fake functionality" §59 rules out).

- **Sign-up (staff invite only in Phase 1 — no public self-registration for
  staff):** `supabase.auth.admin.createUser()` from a server-only context
  (an already-authenticated `super_admin`/`admin` action), or
  `signUp({ email, password, options: { emailRedirectTo }})` for the rare
  case of an invited user completing their own setup.
- **Email verification:** Supabase's "Confirm signup" template links to
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`,
  handled by `app/auth/confirm/route.ts` calling
  `supabase.auth.verifyOtp({ type, token_hash })`. PKCE flow (the
  `@supabase/ssr` default) throughout, not the legacy implicit flow.
- **Password reset:** `resetPasswordForEmail(email, { redirectTo:
  '.../auth/update-password' })`, same `/auth/confirm` handler with
  `type=recovery`, then `updateUser({ password })` on the destination page.
- All redirect URLs are registered in the Supabase project's Auth → URL
  Configuration — never accepted as an unchecked query parameter (open
  redirect risk).

## Privilege escalation / service-role use

Phase 1 has exactly one place that needs to act with elevated privilege
beyond a single authenticated user's own permissions: the scheduled-publish
Cron job (any page/post where `status='scheduled' AND scheduled_at <=
now()`). Rather than reaching for the secret key from a Vercel Cron route
handler (broad, easy to misuse elsewhere by accident), this is implemented
as a narrow `security definer` SQL function
(`public.publish_scheduled_content()`) invoked via `supabase.rpc(...)` —
callable only by a route that first checks the `CRON_SECRET` header, does
exactly one bounded thing, and is auditable by reading one function
definition instead of "anything the secret key touches." No other Phase 1
code path uses the secret key; introducing a new use is worth a second
look, not a default.

## 2FA and admin impersonation

Both are real §52/§79 requirements but depend on infrastructure Phase 1
doesn't build yet (TOTP enrollment UI, the client-portal session dohost
models impersonation on top of). Recorded in
[ROADMAP.md](./ROADMAP.md) rather than stubbed half-working.
