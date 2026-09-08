-- Identity + RBAC foundation.
-- See docs/architecture/01-database.md and 02-auth.md for the design.

create type public.user_type as enum ('staff', 'customer');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  user_type public.user_type not null default 'customer',
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  category text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create index user_roles_user_id_idx on public.user_roles (user_id);
create index role_permissions_permission_id_idx on public.role_permissions (permission_id);

-- Shared updated_at trigger, reused by every table below (and by later
-- migrations) that has an updated_at column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- One profiles row per auth.users row, created by the database, never by
-- application code — this can never drift out of sync with Supabase Auth.
-- New users default to user_type='customer'; the staff-creation action
-- (an already-authenticated super_admin/admin action) flips it to 'staff'
-- and inserts user_roles rows immediately after, via the security-definer
-- promote_to_staff() function below (never a direct UPDATE, since the
-- column-level grants below intentionally don't allow one).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Authorization primitives, used by RLS policies (here and in every later
-- migration) and by the app-level requirePermission()/is_staff() checks —
-- one definition of "can this user do X," enforced at both layers.
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

create or replace function public.is_staff(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = p_user_id and r.key <> 'customer'
  );
$$;

-- Promotes an existing auth.users/profiles row to staff and assigns roles,
-- in one transaction. Callable only by an already-authorized admin action
-- (application code checks users.manage before calling this RPC) — it is
-- security definer so it can update profiles.user_type, which ordinary
-- authenticated grants deliberately cannot (see column grants below).
create or replace function public.promote_to_staff(p_user_id uuid, p_role_keys text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set user_type = 'staff' where id = p_user_id;

  insert into public.user_roles (user_id, role_id)
  select p_user_id, r.id
  from public.roles r
  where r.key = any(p_role_keys)
  on conflict do nothing;
end;
$$;

-- Row Level Security -----------------------------------------------------

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;

-- profiles: everyone can read their own row; staff with users.manage can
-- read every row (needed for the staff directory / customer lookup UIs).
-- No UPDATE policy grants changing user_type — see column grants below.
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles_select_staff" on public.profiles
  for select to authenticated
  using (public.has_permission((select auth.uid()), 'users.manage'));

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Column-level grant restricts what "own row" UPDATE can actually touch —
-- a customer can rename themselves but cannot self-promote to staff by
-- crafting an UPDATE, even though the RLS policy above would otherwise
-- allow the row. user_type only ever changes via promote_to_staff().
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- roles/permissions/role_permissions: reference data. Any authenticated
-- user can read it (needed for e.g. displaying a role name); only
-- users.manage can write it.
create policy "roles_select" on public.roles
  for select to authenticated
  using (true);

create policy "roles_write" on public.roles
  for all to authenticated
  using (public.has_permission((select auth.uid()), 'users.manage'))
  with check (public.has_permission((select auth.uid()), 'users.manage'));

create policy "permissions_select" on public.permissions
  for select to authenticated
  using (true);

create policy "permissions_write" on public.permissions
  for all to authenticated
  using (public.has_permission((select auth.uid()), 'users.manage'))
  with check (public.has_permission((select auth.uid()), 'users.manage'));

create policy "role_permissions_select" on public.role_permissions
  for select to authenticated
  using (true);

create policy "role_permissions_write" on public.role_permissions
  for all to authenticated
  using (public.has_permission((select auth.uid()), 'users.manage'))
  with check (public.has_permission((select auth.uid()), 'users.manage'));

-- user_roles: a user can see their own role assignments; users.manage can
-- see/change anyone's.
create policy "user_roles_select_own" on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "user_roles_manage_staff" on public.user_roles
  for all to authenticated
  using (public.has_permission((select auth.uid()), 'users.manage'))
  with check (public.has_permission((select auth.uid()), 'users.manage'));

-- Seed reference data ------------------------------------------------------
-- Fixed catalog, not demo data — kept in sync by hand with
-- src/lib/domain/rbac.ts's ROLE_KEYS/PERMISSION_KEYS.

insert into public.roles (key, name, description) values
  ('super_admin', 'Super Admin', 'Full access, including staff/role management'),
  ('admin', 'Admin', 'Full operational access, excluding staff/role management'),
  ('billing', 'Billing', 'Orders, invoices, and payments'),
  ('support', 'Support', 'Support tickets'),
  ('content_editor', 'Content Editor', 'Can create and edit content; cannot publish'),
  ('seo_manager', 'SEO Manager', 'SEO metadata and reporting'),
  ('customer', 'Customer', 'Client portal access to their own data only')
on conflict (key) do nothing;

insert into public.permissions (key, category, description) values
  ('pages.view', 'content', 'View pages in the admin'),
  ('pages.create', 'content', 'Create pages'),
  ('pages.update', 'content', 'Edit page content'),
  ('pages.delete', 'content', 'Delete/archive pages'),
  ('pages.publish', 'content', 'Publish/schedule/unpublish pages'),
  ('pages.custom_html', 'content', 'Add or edit Custom HTML blocks'),
  ('blog.view', 'content', 'View blog posts in the admin'),
  ('blog.create', 'content', 'Create blog posts'),
  ('blog.update', 'content', 'Edit blog posts'),
  ('blog.publish', 'content', 'Publish/schedule/unpublish blog posts'),
  ('media.manage', 'content', 'Upload and manage media'),
  ('navigation.manage', 'content', 'Manage navigation menus and footer'),
  ('users.manage', 'system', 'Manage staff, roles, and permissions'),
  ('settings.manage', 'system', 'Manage site/branding/SEO/theme settings'),
  ('seo.manage', 'seo', 'Manage SEO metadata and redirects'),
  ('reports.view', 'system', 'View analytics/reports'),
  ('products.manage', 'commerce', 'Reserved for Phase 5'),
  ('domains.manage', 'commerce', 'Reserved for Phase 5'),
  ('orders.manage', 'commerce', 'Reserved for Phase 5'),
  ('invoices.manage', 'commerce', 'Reserved for Phase 5'),
  ('payments.manage', 'commerce', 'Reserved for Phase 5'),
  ('tickets.manage', 'support', 'Reserved for Phase 7')
on conflict (key) do nothing;

-- super_admin: every permission.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.key = 'super_admin'
on conflict do nothing;

-- admin: every permission except users.manage.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.key = 'admin' and p.key <> 'users.manage'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p
  on p.key in ('orders.manage', 'invoices.manage', 'payments.manage', 'reports.view')
where r.key = 'billing'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p
  on p.key in ('tickets.manage', 'reports.view')
where r.key = 'support'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p
  on p.key in ('pages.view', 'pages.create', 'pages.update', 'blog.view', 'blog.create', 'blog.update', 'media.manage')
where r.key = 'content_editor'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p
  on p.key in ('pages.view', 'blog.view', 'seo.manage', 'reports.view')
where r.key = 'seo_manager'
on conflict do nothing;

-- customer: no admin permissions — its data access is row-ownership based
-- (see Phase 6 in docs/architecture/01-database.md), not permission based.
