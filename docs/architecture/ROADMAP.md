# Roadmap: what's built vs. deferred, and why

The master build prompt specifies a multi-month, full-team scope (§1–§99).
This document is the honest map between that spec and what this build
actually implements, so nothing here is mistaken for more complete than it
is (§59, §98). It follows the spec's own phase ordering (§94).

## This build's scope: Phases 1–4 (partial), foundation for the rest

| Phase (§94) | Status | Notes |
| --- | --- | --- |
| 1 — Architecture | **Done** | This document set |
| 2 — Foundation | **Done** | Next.js 16 + TS + Tailwind v4 + shadcn/ui, Supabase Auth (SSR), RBAC schema + RLS, design system basics, error boundaries |
| 3 — CMS | **Done** | Pages + blocks + revisions + media (metadata) + navigation + footer + site/theme settings + blog |
| 4 — Public website | **Partial** | Homepage, generic CMS pages, blog listing/post, about/contact/legal (all CMS-driven). Hosting/pricing/domains pages need Phase 5's product data — not built, not faked |
| 5 — Commerce | **Design only** | [04-commerce.md](./04-commerce.md) — no `products`/`orders`/`invoices`/`payments` tables or code |
| 6 — Client area | **Not started** | Depends on Phase 5 |
| 7 — Support | **Not started** | |
| 8 — Integrations | **Not started** | No payment/registrar/provisioning/analytics adapter code exists — only the interface shapes named in the spec (§40), not implemented |
| 9 — QA | **Partial** | Real tests exist for everything built; a full sweep (§89–§92) is only meaningful once more surface area exists |
| 10 — Deployment | **Partial** | Dedicated Supabase project + Vercel project provisioned; preview deployment of what's built in Phases 1–4 |

## Why the line is drawn here

CMS is genuinely usable end to end (a non-technical admin can create,
build, revise, and publish real pages/posts) without commerce behind it —
that's the spec's own Phase 3/4-before-5 ordering. Building `products`/
`orders`/`invoices` tables now, with no checkout/webhook/provisioning logic
to make them real, would be exactly the "empty table, no domain service,
dead weight" anti-pattern called out in [00-overview.md](./00-overview.md)
— and would produce fake-looking hosting/pricing pages, which §48/§59
explicitly rule out. Everything deferred is deferred because building it
half-real would violate a more important rule than "build more."

## §98 acceptance criteria — current status

| Criterion | Status |
| --- | --- |
| Public website works | Partial — CMS-driven pages work; commerce-dependent pages (hosting/pricing/domains) don't exist yet |
| CMS works | Yes |
| Page builder works | Yes (11-block curated set, [03-cms.md](./03-cms.md)) |
| Media library works | Yes (metadata + Storage upload; no image-transform pipeline beyond Next/Image) |
| Blog works | Yes |
| SEO manager works | Partial — per-content SEO fields, heading validation, checklist, sitemap/robots; no redirect-suggestion-on-slug-change UI yet, no 404 dashboard UI (table exists, admin UI doesn't) |
| Products / pricing / cart / checkout / billing / payments | Not built (Phase 5) |
| Customer portal / support tickets | Not built (Phase 6/7) |
| Admin RBAC works | Yes |
| RLS works | Yes, tested (see [06-testing.md](./06-testing.md)) |
| Audit logs work | Yes, for everything built (page/post/media/nav/settings/role mutations) |
| Responsive layouts | Yes, for built surfaces |
| Accessibility | Targeted WCAG 2.1 AA for built surfaces; no dedicated automated a11y CI check wired yet |
| Error/empty/loading states | Yes, for built surfaces |
| Env vars documented | Yes ([05-deployment.md](./05-deployment.md), `.env.example`) |
| Migrations work | Yes |
| Tests pass / build passes | Yes, for what's built |
| Vercel + Supabase deployment succeeds | Yes |
| No critical security vuln / TS / lint errors | Yes, for what's built |
| No placeholder content in the shipped experience | Yes — nothing shipped here is lorem ipsum or a fake integration; unbuilt features simply have no route/nav entry rather than a broken or fake one |

## Immediate next phase (when resumed)

Phase 5 (Commerce) is the natural next step, in the order
[04-commerce.md](./04-commerce.md) already lays out: product/pricing
schema and admin CRUD first (no payment dependency), then cart/checkout,
then the Stripe adapter and webhook handler, then invoices. Each of those
is itself incremental — schema, then server-side logic, then UI, then
tests — per the spec's own §58/§94 discipline, exactly as this build's
Phases 1–4 were done.
