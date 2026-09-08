# hostmap

A CMS-managed hosting-company website and admin dashboard, built on
Next.js 16 and Supabase. See [docs/architecture](./docs/architecture/00-overview.md)
for the full design, and [docs/architecture/ROADMAP.md](./docs/architecture/ROADMAP.md)
for exactly what's implemented vs. deferred to a later phase.

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript (strict) · Tailwind CSS v4 ·
shadcn/ui (Base UI) · Supabase (Postgres, Auth, Storage) · Zod · Vitest ·
dnd-kit.

## Getting started

Prerequisites: Node 22+, a Supabase project (see
[docs/architecture/05-deployment.md](./docs/architecture/05-deployment.md)
for local-vs-hosted options).

```bash
npm install
cp .env.example .env.local   # fill in the Supabase values — see below
```

Apply the migrations in `supabase/migrations/` to your Supabase project (via
the Supabase CLI's `supabase db push`, or the Supabase MCP tools'
`apply_migration` if you're working through an agent session), then seed
demo content:

```bash
npm run db:seed
```

This creates a super_admin user (prints the generated credentials — change
the password immediately), site settings, navigation, a homepage, a few
supporting pages, and one sample blog post. All of it is clearly demo
content meant to be replaced, not a finished site.

```bash
npm run dev
```

Visit `/` for the public site and `/admin/login` for the admin dashboard.

## Environment variables

See `.env.example` for the full list with descriptions. Never commit real
values — `.env*` is gitignored.

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Project API URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Safe in the browser, bound by RLS |
| `SUPABASE_SECRET_KEY` | Yes (seed script + staff invites + Cron) | Server-only, bypasses RLS — see [02-auth.md](./docs/architecture/02-auth.md#privilege-escalation--service-role-use) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical origin for metadata/sitemap/redirects |
| `CRON_SECRET` | Yes (production) | Authorizes the scheduled-publish endpoint |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | No | Override the seed script's default admin credentials |

## Scripts

```bash
npm run dev         # start the dev server (Turbopack)
npm run build       # production build (also typechecks)
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run test        # vitest (unit tests always run; RLS tests run only
                     # when Supabase credentials are present — see below)
npm run db:seed     # idempotent demo-data seed (scripts/seed.ts)
```

## Testing

Unit tests (`src/**/*.test.ts`) run with no external dependencies. The RLS
integration suite (`src/lib/rls.integration.test.ts`) needs a real Supabase
project's credentials in the environment — point it at a disposable dev
project or a Supabase branch, never production, since it creates and
deletes real rows and a real test user. Without those variables set, it
skips cleanly rather than failing. See
[docs/architecture/06-testing.md](./docs/architecture/06-testing.md) for
the full test strategy.

## Deployment

See [docs/architecture/05-deployment.md](./docs/architecture/05-deployment.md)
for the Vercel + Supabase production setup, including the Cron job
(`vercel.json`) that drives scheduled publishing.

## Project structure

```
docs/architecture/   Design docs — read 00-overview.md first
supabase/migrations/ SQL migrations (schema source of truth)
scripts/seed.ts       Idempotent demo-data seed
src/app/(public)/     Public marketing site
src/app/(admin)/      Admin dashboard (staff-only)
src/app/api/cron/     Vercel Cron targets
src/lib/domain/       Server-only business logic (the DAL)
src/lib/actions/      Thin "use server" wrappers around lib/domain
src/lib/supabase/     Browser/server Supabase clients, auth guards
src/lib/domain/blocks/ Page-builder block registry
src/components/ui/    shadcn/ui primitives
src/components/admin/ Admin-only feature components
src/components/public/ Public-site feature components (header/footer/nav)
```
