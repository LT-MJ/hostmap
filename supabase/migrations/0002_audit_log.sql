-- Append-only audit log. Created early so every later domain function
-- (publish, promote_to_staff, settings updates, ...) can write to it in the
-- same transaction as the mutation it describes. See docs/architecture/
-- 01-database.md's "Key relational decisions" for why actor_id is a plain
-- string rather than a foreign key.

create table public.hostmap_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id text not null,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before jsonb,
  after jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index hostmap_audit_logs_entity_idx on public.hostmap_audit_logs (entity_type, entity_id);
create index hostmap_audit_logs_created_at_idx on public.hostmap_audit_logs (created_at desc);

alter table public.hostmap_audit_logs enable row level security;

-- Insert-only from server-side code, gated by a permission (the same one
-- the mutation itself required — a caller who was allowed to make the
-- change is allowed to record that they made it). No UPDATE/DELETE policy
-- exists at all: immutability enforced by the absence of a policy, not by
-- application discipline.
create policy "audit_logs_insert" on public.hostmap_audit_logs
  for insert to authenticated
  with check (public.hostmap_is_staff((select auth.uid())));

create policy "audit_logs_select" on public.hostmap_audit_logs
  for select to authenticated
  using (
    public.hostmap_has_permission((select auth.uid()), 'users.manage')
    or public.hostmap_has_permission((select auth.uid()), 'reports.view')
  );
