-- Redirect manager + 404 monitoring. See spec §70/§71.

create table public.hostmap_redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique,
  destination_path text not null,
  status_code smallint not null default 301 check (status_code in (301, 302)),
  is_active boolean not null default true,
  hit_count int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (source_path <> destination_path)
);

create index hostmap_redirects_source_path_active_idx on public.hostmap_redirects (source_path) where is_active;

create table public.hostmap_not_found_log (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  referrer text,
  hit_count int not null default 1,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index hostmap_not_found_log_last_seen_at_idx on public.hostmap_not_found_log (last_seen_at desc);

alter table public.hostmap_redirects enable row level security;
alter table public.hostmap_not_found_log enable row level security;

-- Anon needs to read active redirects for proxy.ts to resolve them for
-- anonymous visitors — not sensitive data (just path mappings).
create policy "redirects_select_active" on public.hostmap_redirects
  for select to anon, authenticated
  using (is_active);

create policy "redirects_select_staff" on public.hostmap_redirects
  for select to authenticated
  using (public.hostmap_has_permission((select auth.uid()), 'seo.manage'));

create policy "redirects_write" on public.hostmap_redirects
  for all to authenticated
  using (public.hostmap_has_permission((select auth.uid()), 'seo.manage'))
  with check (public.hostmap_has_permission((select auth.uid()), 'seo.manage'));

-- Staff-only: URLs/referrers of broken links aren't public information.
create policy "not_found_log_select_staff" on public.hostmap_not_found_log
  for select to authenticated
  using (public.hostmap_has_permission((select auth.uid()), 'seo.manage'));

create policy "not_found_log_delete_staff" on public.hostmap_not_found_log
  for delete to authenticated
  using (public.hostmap_has_permission((select auth.uid()), 'seo.manage'));

-- Anonymous visitors need to be able to log a 404/redirect hit, but not to
-- write the tables directly (that would need an INSERT/UPDATE RLS policy
-- open to anon on a table that also holds staff-only reads). Instead they
-- can only call these narrow, security-definer functions, which do exactly
-- one bounded thing each — the same pattern as has_permission()/
-- handle_new_user() above.
create or replace function public.hostmap_log_not_found(p_url text, p_referrer text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.hostmap_not_found_log (url, referrer, hit_count, last_seen_at)
  values (p_url, p_referrer, 1, now())
  on conflict (url) do update
    set hit_count = public.hostmap_not_found_log.hit_count + 1,
        last_seen_at = now(),
        referrer = coalesce(excluded.referrer, public.hostmap_not_found_log.referrer);
end;
$$;

create or replace function public.hostmap_increment_redirect_hit(p_redirect_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.hostmap_redirects set hit_count = hit_count + 1 where id = p_redirect_id;
$$;

grant execute on function public.hostmap_log_not_found(text, text) to anon, authenticated;
grant execute on function public.hostmap_increment_redirect_hit(uuid) to anon, authenticated;
