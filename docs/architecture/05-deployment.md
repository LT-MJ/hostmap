# Deployment Architecture

## Environments

| Environment | Next.js runs on | Database | Purpose |
| --- | --- | --- | --- |
| Local | `next dev` (Turbopack) | Supabase CLI local stack (`supabase start` — local Postgres/Auth/Storage in Docker) **or** the hosted dev project directly if Docker isn't available | Day-to-day development |
| Preview | Vercel Preview deployment, one per PR | A **Supabase branch** off the dev project (`create_branch`), auto-created/merged alongside the PR | Review changes against real Postgres/RLS without touching production data — §82's "preview environments should never accidentally connect to production data" enforced structurally, not by convention |
| Production | Vercel Production deployment (main branch) | The dedicated `hostmap` Supabase project | Live site |

Supabase branching (a real Postgres branch per PR, not a shared dev
database) is why "preview never touches production" is a structural
guarantee here rather than a policy someone has to remember.

## Environment variables

All Supabase/app config is environment-scoped, never hardcoded — §54/§82.
Full reference lives in `.env.example` (created alongside the Next.js
scaffold); summarized here by category:

| Variable | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | project API URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | `sb_publishable_...` — safe in the browser, RLS-bound |
| `SUPABASE_SECRET_KEY` | server-only | `sb_secret_...` — bypasses RLS; not used by any Phase 1 request path today (see [02-auth.md](./02-auth.md#privilege-escalation--service-role-use)), present only so it's provisioned correctly if a genuinely justified server-only need arises |
| `CRON_SECRET` | server-only | validates Vercel Cron's request to the scheduled-publish route |
| `NEXT_PUBLIC_SITE_URL` | public | canonical absolute origin — drives metadata, sitemap, OG URLs, auth redirect allowlist (§83) |
| *(Phase 2+)* `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, email provider credentials, analytics credentials | server-only | not needed until their owning phase; documented here as reserved names so Phase 5+ doesn't invent inconsistent ones later |

Never committed: any actual `.env`/`.env.local` file (already in
`.gitignore`). `SUPABASE_SECRET_KEY` in particular must never appear in a
client component, a `NEXT_PUBLIC_*` variable, or a source-controlled file
— it's checked in code review and would fail the "no secrets committed"
QA gate (§91) if it ever did.

## Vercel configuration

- One Vercel project (`hostmap`), linked to `LT-MJ/hostmap`, Production
  Branch = the repo's default branch.
- Environment variables scoped per Vercel environment (Production/Preview/
  Development), matching the table above — Preview's Supabase URL/keys
  point at that PR's branch database, not production.
- **Vercel Cron** (`vercel.json`'s `crons` array) hits
  `app/api/cron/publish-scheduled/route.ts` once daily (`0 6 * * *`); the
  route checks the `CRON_SECRET` header before doing anything, then calls
  the `publish_scheduled_content()` RPC. This is the mechanism behind
  §11's "no `setTimeout`, no fake async" — a real scheduled trigger, and
  the function itself is idempotent per-row (see [03-cms.md](./03-cms.md)).
  **Plan constraint, discovered at actual deploy time, not assumed up
  front:** Vercel's Hobby plan rejects any cron schedule that would fire
  more than once a day — the original design here called for a 5–15
  minute interval, which a real deployment attempt bounced with
  `cron_jobs_limits_reached`. On Hobby, a page/post scheduled to publish
  at a given time may not actually go live for up to ~24 hours after that
  time, not minutes — real, and worth knowing before promising an editor
  a specific publish time. Upgrading the Vercel team to Pro lifts this
  back to a short interval; nothing else about the design changes.
- No Edge runtime is used for anything touching Supabase auth/data —
  `proxy.ts` runs on the Node.js runtime (the only runtime it supports as
  of Next.js 16); nothing in this app needs Supabase's separate Edge
  Functions (Deno Deploy) product, which is unrelated to Next.js's Edge
  runtime despite the name overlap.
- Images: Next/Image against Supabase Storage's public URLs, Vercel's
  image optimization pipeline in front.

## Domain configuration (§83)

- Apex domain redirects to the canonical `www` host (or vice versa — pick
  one canonical host and 301 the other) via Vercel's domain redirect
  config, not application code.
- `NEXT_PUBLIC_SITE_URL` is the single source of truth for every absolute
  URL the app generates (metadata `alternates.canonical`, `sitemap.ts`,
  OG `url`, Supabase Auth redirect URLs) — changing environments never
  requires touching a code file, only that variable.
- HTTPS is enforced by Vercel at the edge; the app additionally sets HSTS
  in production response headers (see security headers, §8).

## Storage

Supabase Storage, two buckets: `media` (public — served directly, cache
headers set liberally since content is versioned by filename/path) and
`private` (reserved for Phase 6+ customer-uploaded documents/attachments —
not created until something needs it). No production upload ever touches
the local filesystem (§12/§10) — every upload goes straight to Storage from
a Server Action, and only a validated `{path, bucket}` reference is
persisted in Postgres, never the file bytes.

## Backups / recovery (§53)

- **Database:** Supabase's project-level backups/PITR per the project's
  plan tier; migration history in `supabase/migrations/*.sql` is itself a
  from-scratch-reproducible source of truth independent of any backup.
- **Storage:** documented as a gap until Phase 5+ needs it addressed with
  an actual policy (versioning/lifecycle rules) — not invented
  speculatively now.
- **CMS content:** the revision system ([03-cms.md](./03-cms.md)) is the
  first line of recovery for accidental content changes, independent of
  database-level backups.
- **Config:** every environment variable is documented above; none are
  recoverable from source control by design (that's the point) — they're
  recorded in each environment's secret store (Vercel project settings /
  Supabase project settings) as the actual source of truth for "what is
  production configured with."
