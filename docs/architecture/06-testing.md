# Testing Strategy

One framework per concern, chosen to avoid adding tooling beyond what's
actually needed (§95): **Vitest** for unit + RLS/integration tests,
**Playwright** for E2E. No pgTAP — RLS tests are written as ordinary Vitest
integration tests using real `@supabase/supabase-js` clients against a real
database (a local Supabase stack, or a disposable Supabase branch in CI),
which keeps them in the same language/runner/CI job as everything else
instead of introducing a second test framework and a separate SQL-test
pipeline for one category of test.

## Unit tests

Colocated `*.test.ts` next to the module they cover. Phase 1 targets:

- `validateHeadings()` — zero H1, multiple H1, correctly-nested headings,
  skipped levels, across a representative block list.
- Every block's `configSchema` — valid config accepted, each required
  field's absence rejected, matching the actual error the editor should
  surface.
- `has_permission`-equivalent pure logic used client-side for UI-only
  affordances (e.g. hiding a Publish button) — tested knowing this is a
  convenience check; the authoritative version is the SQL function,
  covered under RLS tests below.
- Slug generation/validation, redirect-loop detection
  (`source == destination`, or a redirect chain that would cycle).
- (Phase 5+) money arithmetic, tax/discount calculation, invoice numbering
  — not applicable yet; listed so the pattern is set before that code
  exists.

## Integration tests

- **`proxy.ts` session refresh** — the single most failure-prone piece of
  Supabase SSR auth per its own docs (§ referenced in
  [02-auth.md](./02-auth.md)): a request with a near-expired session
  cookie comes out the other side with a refreshed cookie actually
  attached to the response, and a request with no session is redirected
  before any protected data is touched.
- **Publish workflow** — draft edit -> publish -> `page_revisions` row
  created -> `published_revision_id` updated -> public route now serves
  the new content -> a second, concurrent "publish" doesn't double-count
  the revision number (tests the transaction, not just the happy path).
- **Scheduled publish idempotency** — calling
  `publish_scheduled_content()` twice in a row on the same due row
  publishes it once, not twice, and does nothing on a row that isn't due
  yet.
- **Custom HTML permission gate** — a `content_editor` session cannot add
  or save a Custom HTML block; a `super_admin` session can.

## RLS tests (the §7 requirement, concretely)

Structure: a setup step using a `service_role`/secret-key client (bypasses
RLS, used only to seed fixtures — never to make an assertion) creates known
rows — a published page, a draft page, users with each seeded role. Each
test then builds a client scoped to a specific caller (`anon`, or
`authenticated` with a JWT for a specific seeded user) and asserts the
actual allow/deny outcome of a real query, not a mocked one:

| Caller | Query | Expected |
| --- | --- | --- |
| `anon` | `select * from pages where status='published'` | rows returned |
| `anon` | `select * from pages where status='draft'` | zero rows (not an error — RLS filters, it doesn't throw) |
| `anon` | `insert into pages (...)` | denied |
| `authenticated` (customer role) | `update pages set ...` | denied |
| `authenticated` (content_editor) | `update pages set title=...` | allowed |
| `authenticated` (content_editor) | `update pages set status='published'` | denied — has `pages.update`, not `pages.publish` |
| `authenticated` (admin) | `update pages set status='published'` | allowed |
| `authenticated` (any) | `update page_revisions set ...` | denied — no UPDATE policy exists, period |
| `authenticated` (user A, once Phase 6 customer tables exist) | `select` a service/order/invoice belonging to user B | denied — the concrete "changing an ID in a URL" attack §7 names by name |

This is what makes "customer cannot access another customer's records by
changing an ID" (§7) a tested fact rather than an assumed one — Phase 1 has
no customer-owned tables yet, so that specific row is a placeholder for
Phase 6, listed here so the pattern is proven on the tables that exist
today (`pages`/`page_revisions`/`media`/etc.) and simply extends.

## E2E plan (Playwright)

Phase 1 scope: staff login -> create a page -> add/reorder/remove blocks
(including one that would fail heading validation, confirming Publish is
actually disabled) -> fix it -> publish -> visit the public URL and see the
new content -> edit again without publishing -> confirm the public URL is
unchanged -> revision restore. Registration/checkout/ticket E2E flows are
listed in the master spec's §56 but depend on features not built until
later phases — added when those phases ship, not stubbed as
skipped/pending tests now (a permanently-skipped test is worse than no
test — it looks like coverage that isn't there).

## CI quality gates (§57)

`typecheck`, `lint`, unit tests, RLS tests, and `build` run on every PR;
migration files are linted for the "never hand-edit production schema"
rule by construction (there is no other way to change schema — Supabase
MCP `apply_migration` / the CLI both require a migration file). A red gate
blocks merge — never suppressed to force a build through (§57's explicit
rule, restated because it's the one most tempting to bypass under
deadline pressure).
