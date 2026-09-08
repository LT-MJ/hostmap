-- Media metadata, site/theme settings, and the block-type registry.
-- See docs/architecture/01-database.md and 03-cms.md.

create table public.media_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references public.media_folders (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'media',
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  width int,
  height int,
  alt_text text,
  title text,
  caption text,
  description text,
  folder_id uuid references public.media_folders (id) on delete set null,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (bucket, storage_path)
);

create index media_folder_id_idx on public.media (folder_id);
create index media_created_at_idx on public.media (created_at desc);

-- Singleton tables: exactly one row, id pinned to 1. Populated by the seed
-- script (not this migration — starting values are demo/business data, not
-- schema), so no default row is inserted here.
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null default '',
  tagline text not null default '',
  default_currency text not null default 'USD',
  contact_email text,
  contact_phone text,
  address text,
  logo_media_id uuid references public.media (id) on delete set null,
  logo_dark_media_id uuid references public.media (id) on delete set null,
  favicon_media_id uuid references public.media (id) on delete set null,
  seo_title_separator text not null default '|',
  robots_default text not null default 'index, follow',
  updated_at timestamptz not null default now()
);

create table public.theme_settings (
  id smallint primary key default 1 check (id = 1),
  tokens jsonb not null default '{}'::jsonb,
  dark_mode_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create trigger set_theme_settings_updated_at
  before update on public.theme_settings
  for each row execute function public.set_updated_at();

-- Block-type registry: metadata mirror of src/lib/domain/blocks/registry.ts.
-- Block types are defined in code (one Zod schema + React component each);
-- this table exists so `page_blocks.block_type`/`blog_post_blocks.block_type`
-- can have a real foreign key and the "add block" UI has something to query,
-- not to support admin-authored block types. Immutable — no RLS write
-- policy at all, managed only by migrations.
create table public.block_definitions (
  key text primary key,
  label text not null,
  category text not null,
  requires_permission text references public.permissions (key),
  created_at timestamptz not null default now()
);

insert into public.block_definitions (key, label, category, requires_permission) values
  ('hero', 'Hero', 'layout', null),
  ('rich_text', 'Rich Text', 'content', null),
  ('image', 'Image', 'content', null),
  ('feature_grid', 'Feature Grid', 'content', null),
  ('pricing_table', 'Pricing Table', 'commerce-display', null),
  ('testimonials', 'Testimonials', 'content', null),
  ('faq', 'FAQ', 'content', null),
  ('stats', 'Stats', 'content', null),
  ('cta', 'CTA', 'content', null),
  ('blog_grid', 'Blog Grid', 'content', null),
  ('custom_html', 'Custom HTML', 'advanced', 'pages.custom_html')
on conflict (key) do nothing;

-- Row Level Security -----------------------------------------------------

alter table public.media_folders enable row level security;
alter table public.media enable row level security;
alter table public.site_settings enable row level security;
alter table public.theme_settings enable row level security;
alter table public.block_definitions enable row level security;

-- Media metadata isn't sensitive on its own (it's the alt text/dimensions
-- for images that appear on public pages) — readable by anyone, writable
-- only by media.manage.
create policy "media_folders_select" on public.media_folders
  for select to anon, authenticated
  using (true);

create policy "media_folders_write" on public.media_folders
  for all to authenticated
  using (public.has_permission((select auth.uid()), 'media.manage'))
  with check (public.has_permission((select auth.uid()), 'media.manage'));

create policy "media_select" on public.media
  for select to anon, authenticated
  using (true);

create policy "media_write" on public.media
  for all to authenticated
  using (public.has_permission((select auth.uid()), 'media.manage'))
  with check (public.has_permission((select auth.uid()), 'media.manage'));

-- Site/theme settings drive every public page's header/footer/branding —
-- readable by anyone, writable only by settings.manage. INSERT is not
-- granted: the single row is created once by the seed script's initial
-- UPDATE-or-insert; ordinary operation is UPDATE only.
create policy "site_settings_select" on public.site_settings
  for select to anon, authenticated
  using (true);

create policy "site_settings_write" on public.site_settings
  for update to authenticated
  using (public.has_permission((select auth.uid()), 'settings.manage'))
  with check (public.has_permission((select auth.uid()), 'settings.manage'));

create policy "site_settings_insert" on public.site_settings
  for insert to authenticated
  with check (public.has_permission((select auth.uid()), 'settings.manage'));

create policy "theme_settings_select" on public.theme_settings
  for select to anon, authenticated
  using (true);

create policy "theme_settings_write" on public.theme_settings
  for update to authenticated
  using (public.has_permission((select auth.uid()), 'settings.manage'))
  with check (public.has_permission((select auth.uid()), 'settings.manage'));

create policy "theme_settings_insert" on public.theme_settings
  for insert to authenticated
  with check (public.has_permission((select auth.uid()), 'settings.manage'));

-- block_definitions: staff-only read (used by the editor's "add block"
-- picker); no write policy exists at all — immutable via RLS, changed only
-- by a migration.
create policy "block_definitions_select" on public.block_definitions
  for select to authenticated
  using (true);
