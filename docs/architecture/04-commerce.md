# Commerce Architecture (design-level — Phase 5, not built yet)

Recorded now, per §97E, so the target is validated before anyone writes a
line of billing code — not implemented in this build. Adapts dohost's
already-validated design decisions to Supabase/RLS instead of Prisma/
app-only checks.

## Pricing model

- `products` (a hosting plan, domain TLD, or add-on) never stores a
  mutable price. `product_prices` rows are versioned and immutable —
  changing a price closes the current row's `effective_to` and inserts a
  new row with `effective_from = now()`. Nothing ever `UPDATE`s a price in
  place, so a historical order's snapshot never drifts.
- Money is `{ amount: integer minor units, currency: text }` end to end —
  Postgres `bigint` for `amount`, never `numeric`/`float`, matching
  dohost's money module. Percentages (tax, discounts) are integer basis
  points, not floats.
- Feature comparison data is structured (`plan_features` rows: `product_id,
  feature_key, value`), not a single text blob, so the pricing/comparison
  page can render a real feature matrix (§20's "avoid putting all plan
  features into a single unstructured text field").

## Checkout flow

```
Visitor -> Product page (server-rendered from `products`/`product_prices`)
        -> Add to cart (`carts`/`cart_items` — cart is server-side state
           keyed to a session, not client-trusted line items)
        -> Customer account (existing session or create one)
        -> Checkout: server re-reads product+price+availability,
           re-validates coupon, computes tax server-side, computes total
           server-side — the client never supplies a price
        -> createOrder() — PENDING, idempotent on (customer_id,
           idempotency_key) so a double-submitted form can't create two
           orders
        -> issueInvoiceForOrder() — order -> AWAITING_PAYMENT
        -> Payment provider adapter creates a payment intent/session
        -> Client redirected to provider-hosted payment UI (never a raw
           card form this app touches — §9)
        -> Webhook (signature-verified, idempotent on provider event id)
           is the ONLY thing that marks an invoice/order PAID — a
           browser-side "success" redirect never does, since a user can
           edit the URL or the redirect can fire before the provider has
           actually confirmed
        -> PAID invoice flips the order to PAID -> triggers a
           provisioning job (Phase 5/6 boundary)
```

Every step server-revalidates rather than trusting the client, per §22.

## Invoice flow

`invoices`/`invoice_items` mirror dohost's snapshot pattern — customer
name/address and line-item name/price are copied onto the invoice at issue
time, so a later product-catalog or customer-profile edit never rewrites
a historical financial document. Invoice numbers come from a `counters`
table with an atomic `UPDATE ... RETURNING` increment (never
`max(invoice_number) + 1`, which races under concurrent inserts, and never
a timestamp, which §23 explicitly rules out as a financial identifier).

State machine (`invoices.status`): `draft -> issued -> partially_paid |
paid -> overdue (time-based, not a user action) -> void | refunded`. Every
transition is validated against an explicit `Record<Status, Status[]>` map
(dohost's pattern) and writes a `status_history` row in the same
transaction — never an ad hoc `UPDATE invoices SET status = ...`.

## Payment architecture

A `PaymentGateway` adapter interface (`createPayment`, `verifyPayment`,
`refundPayment`, `getPayment`) with Stripe as the first implementation and
PayPal second, per §9/§40. Concretely for this stack:

- **Webhook handler** (`app/api/webhooks/[provider]/route.ts`): verify the
  provider's signature first, before parsing the body as trusted JSON;
  look up `webhook_events` by the provider's event id — if it already
  exists, return 200 immediately without reprocessing (idempotency, §41);
  otherwise insert it, process it (update `payments`/`invoices` in one
  transaction), and mark it processed. A payment is never considered
  confirmed by anything the browser reports — only by a verified webhook
  (or, as a fallback when no gateway is configured yet, an explicit
  staff-only manual "mark paid" action that's visibly a fallback, not a
  disguised automatic success, matching dohost's Phase 1 approach and
  §67's "don't fake an unconfigured integration").
- **RLS on `payments`/`invoices`/`orders`**: customers can `SELECT` only
  rows where `customer_id = auth.uid()`'s linked customer record; all
  `INSERT`/`UPDATE` of payment status happens through a `security definer`
  function callable only by the webhook handler's service context, never
  directly by `authenticated` — a customer's own session can read its
  invoice but cannot mark it paid by crafting a request.
- Refunds, chargebacks, and credit balance follow the same
  adapter-interface + webhook-confirmed pattern; ledger entries are
  append-only (a correction is a new reversing entry, never an edit).

## What Phase 1 deliberately does not build

No `products`, `orders`, `invoices`, `payments`, `coupons`, or `carts`
tables exist yet. Building them without the checkout/webhook logic behind
them would be exactly the empty-table-as-fake-progress anti-pattern this
document set repeatedly rules out. They're designed here so Phase 5 starts
from a validated target instead of a blank page.
