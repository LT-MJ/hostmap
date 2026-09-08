-- Navigation menus (header/footer). See docs/architecture/01-database.md.

create table public.navigation_menus (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null
);

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.navigation_menus (id) on delete cascade,
  parent_id uuid references public.navigation_items (id) on delete cascade,
  label text not null,
  url text,
  page_id uuid references public.pages (id) on delete set null,
  position double precision not null default 0,
  open_in_new_tab boolean not null default false,
  created_at timestamptz not null default now(),
  check (url is not null or page_id is not null)
);

create index navigation_items_menu_id_position_idx on public.navigation_items (menu_id, position);
create index navigation_items_parent_id_idx on public.navigation_items (parent_id);

insert into public.navigation_menus (key, name) values
  ('primary', 'Primary Navigation'),
  ('footer', 'Footer Navigation')
on conflict (key) do nothing;

alter table public.navigation_menus enable row level security;
alter table public.navigation_items enable row level security;

create policy "navigation_menus_select" on public.navigation_menus
  for select to anon, authenticated
  using (true);

create policy "navigation_menus_write" on public.navigation_menus
  for all to authenticated
  using (public.has_permission((select auth.uid()), 'navigation.manage'))
  with check (public.has_permission((select auth.uid()), 'navigation.manage'));

create policy "navigation_items_select" on public.navigation_items
  for select to anon, authenticated
  using (true);

create policy "navigation_items_write" on public.navigation_items
  for all to authenticated
  using (public.has_permission((select auth.uid()), 'navigation.manage'))
  with check (public.has_permission((select auth.uid()), 'navigation.manage'));
