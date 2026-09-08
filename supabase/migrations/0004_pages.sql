-- Pages: draft/published separation, blocks, revisions. See
-- docs/architecture/03-cms.md for the workflow this schema implements.

create type public.content_status as enum ('draft', 'scheduled', 'published', 'archived');

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  status public.content_status not null default 'draft',
  template text not null default 'default',
  excerpt text,
  featured_media_id uuid references public.media (id) on delete set null,
  author_id uuid references auth.users (id) on delete set null,
  published_revision_id uuid, -- FK added below, after page_revisions exists
  seo_title text,
  meta_description text,
  canonical_url text,
  robots_directive text,
  og_title text,
  og_description text,
  og_image_media_id uuid references public.media (id) on delete set null,
  custom_fields jsonb not null default '{}'::jsonb,
  scheduled_at timestamptz,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Partial unique index, not a column constraint: a soft-deleted page frees
-- its slug for reuse (§14's soft-deletion requirement would be pointless if
-- the slug stayed permanently locked).
create unique index pages_slug_active_key on public.pages (slug) where deleted_at is null;
create index pages_status_published_at_idx on public.pages (status, published_at desc);
create index pages_deleted_at_null_idx on public.pages (id) where deleted_at is null;

create trigger set_pages_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

-- Live/editable draft copy. Public routes never read this directly — see
-- page_revisions below.
create table public.page_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  position double precision not null,
  block_type text not null references public.block_definitions (key),
  config jsonb not null default '{}'::jsonb,
  is_hidden boolean not null default false,
  visibility jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index page_blocks_page_id_position_idx on public.page_blocks (page_id, position);

create trigger set_page_blocks_updated_at
  before update on public.page_blocks
  for each row execute function public.set_updated_at();

-- Immutable snapshots. A page's public content is whatever
-- pages.published_revision_id points at, never the live page_blocks.
create table public.page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  revision_number int not null,
  title text not null,
  blocks_snapshot jsonb not null,
  seo_snapshot jsonb not null default '{}'::jsonb,
  author_id uuid references auth.users (id) on delete set null,
  change_note text,
  created_at timestamptz not null default now(),
  unique (page_id, revision_number)
);

create index page_revisions_page_id_idx on public.page_revisions (page_id);

alter table public.pages
  add constraint pages_published_revision_id_fkey
  foreign key (published_revision_id) references public.page_revisions (id) on delete set null;

-- Row Level Security -----------------------------------------------------

alter table public.pages enable row level security;
alter table public.page_blocks enable row level security;
alter table public.page_revisions enable row level security;

create policy "pages_select_published" on public.pages
  for select to anon, authenticated
  using (status = 'published' and deleted_at is null);

create policy "pages_select_staff" on public.pages
  for select to authenticated
  using (public.has_permission((select auth.uid()), 'pages.view'));

create policy "pages_insert" on public.pages
  for insert to authenticated
  with check (public.has_permission((select auth.uid()), 'pages.create'));

-- Ordinary field edits need pages.update. A USING/WITH CHECK policy alone
-- is NOT enough to keep "can edit title" and "can make it live" separate
-- permissions: RLS restricts which ROWS are touched, not which COLUMNS —
-- an UPDATE that only satisfies pages.update could otherwise still set
-- status/deleted_at in the same statement. So those state-transition
-- columns are excluded from the column-level GRANT below entirely, and are
-- reachable only through the security-definer functions further down,
-- which check the relevant permission (pages.publish/pages.delete)
-- themselves. This mirrors profiles.user_type's column-grant + definer-
-- function pattern in 0001.
create policy "pages_update_content" on public.pages
  for update to authenticated
  using (public.has_permission((select auth.uid()), 'pages.update'))
  with check (public.has_permission((select auth.uid()), 'pages.update'));

revoke update on public.pages from authenticated;
grant update (
  slug, title, template, excerpt, featured_media_id, author_id,
  seo_title, meta_description, canonical_url, robots_directive,
  og_title, og_description, og_image_media_id, custom_fields
) on public.pages to authenticated;

create policy "page_blocks_select" on public.page_blocks
  for select to authenticated
  using (public.has_permission((select auth.uid()), 'pages.view'));

create policy "page_blocks_write" on public.page_blocks
  for all to authenticated
  using (public.has_permission((select auth.uid()), 'pages.update'))
  with check (
    public.has_permission((select auth.uid()), 'pages.update')
    and (
      block_type <> 'custom_html'
      or public.has_permission((select auth.uid()), 'pages.custom_html')
    )
  );

-- Public can read revisions only via the published pointer (pages RLS
-- already filters to published pages; this policy additionally requires
-- the revision be the one currently pointed at, so an old unpublished
-- revision of a since-edited page can't be fetched by guessing its id).
create policy "page_revisions_select_published" on public.page_revisions
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.pages p
      where p.published_revision_id = page_revisions.id and p.status = 'published'
    )
  );

create policy "page_revisions_select_staff" on public.page_revisions
  for select to authenticated
  using (public.has_permission((select auth.uid()), 'pages.view'));

-- Insert-only from publish_page()/schedule_page(), gated by pages.publish.
-- No UPDATE/DELETE policy — revisions are immutable, period.
create policy "page_revisions_insert" on public.page_revisions
  for insert to authenticated
  with check (public.has_permission((select auth.uid()), 'pages.publish'));

-- Domain functions --------------------------------------------------------
-- security definer: these touch columns (status, published_revision_id,
-- published_at, scheduled_at, deleted_at) deliberately excluded from
-- authenticated's column grant above, so they must run with the owner's
-- privileges — which is exactly why each one starts by checking the
-- relevant permission itself instead of relying on RLS/grants to do it.

create or replace function public.publish_page(p_page_id uuid, p_change_note text default null)
returns public.page_revisions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_page public.pages;
  v_next_revision int;
  v_blocks jsonb;
  v_revision public.page_revisions;
begin
  -- A null auth.uid() means this is a system call (publish_scheduled_content
  -- has no calling user to check) — only a real, permission-less user is
  -- rejected.
  if (select auth.uid()) is not null
     and not public.has_permission((select auth.uid()), 'pages.publish') then
    raise exception 'Missing permission: pages.publish';
  end if;

  select * into v_page from public.pages where id = p_page_id for update;
  if not found then
    raise exception 'Page % not found', p_page_id;
  end if;

  select coalesce(max(revision_number), 0) + 1 into v_next_revision
  from public.page_revisions where page_id = p_page_id;

  select coalesce(jsonb_agg(to_jsonb(b) order by b.position), '[]'::jsonb) into v_blocks
  from public.page_blocks b where b.page_id = p_page_id and not b.is_hidden;

  insert into public.page_revisions (page_id, revision_number, title, blocks_snapshot, seo_snapshot, author_id, change_note)
  values (
    p_page_id, v_next_revision, v_page.title, v_blocks,
    jsonb_build_object(
      'seo_title', v_page.seo_title, 'meta_description', v_page.meta_description,
      'canonical_url', v_page.canonical_url, 'robots_directive', v_page.robots_directive,
      'og_title', v_page.og_title, 'og_description', v_page.og_description,
      'og_image_media_id', v_page.og_image_media_id
    ),
    (select auth.uid()), p_change_note
  )
  returning * into v_revision;

  update public.pages
  set status = 'published', published_revision_id = v_revision.id, published_at = now(), scheduled_at = null
  where id = p_page_id;

  insert into public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, after)
  values (coalesce((select auth.uid())::text, 'system:scheduled-publish'), (select auth.jwt() ->> 'email'), 'page.publish', 'page', p_page_id::text,
          jsonb_build_object('revision_number', v_next_revision));

  return v_revision;
end;
$$;

create or replace function public.schedule_page(p_page_id uuid, p_scheduled_at timestamptz)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_permission((select auth.uid()), 'pages.publish') then
    raise exception 'Missing permission: pages.publish';
  end if;
  if p_scheduled_at <= now() then
    raise exception 'scheduled_at must be in the future';
  end if;
  update public.pages set status = 'scheduled', scheduled_at = p_scheduled_at where id = p_page_id;
  insert into public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, after)
  values (coalesce((select auth.uid())::text, 'system:scheduled-publish'), (select auth.jwt() ->> 'email'), 'page.schedule', 'page', p_page_id::text,
          jsonb_build_object('scheduled_at', p_scheduled_at));
end;
$$;

create or replace function public.unpublish_page(p_page_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_permission((select auth.uid()), 'pages.publish') then
    raise exception 'Missing permission: pages.publish';
  end if;
  update public.pages set status = 'draft' where id = p_page_id;
  insert into public.audit_logs (actor_id, actor_email, action, entity_type, entity_id)
  values (coalesce((select auth.uid())::text, 'system:scheduled-publish'), (select auth.jwt() ->> 'email'), 'page.unpublish', 'page', p_page_id::text);
end;
$$;

-- Soft delete/restore — deleted_at is excluded from authenticated's column
-- grant (see above) for the same reason status is: a permission boundary
-- narrower than "can edit this page" needs a narrower path than a raw
-- UPDATE, not just an RLS clause sharing the same statement as content edits.
create or replace function public.delete_page(p_page_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_permission((select auth.uid()), 'pages.delete') then
    raise exception 'Missing permission: pages.delete';
  end if;
  update public.pages set deleted_at = now() where id = p_page_id;
  insert into public.audit_logs (actor_id, actor_email, action, entity_type, entity_id)
  values ((select auth.uid())::text, (select auth.jwt() ->> 'email'), 'page.delete', 'page', p_page_id::text);
end;
$$;

create or replace function public.restore_page(p_page_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_permission((select auth.uid()), 'pages.delete') then
    raise exception 'Missing permission: pages.delete';
  end if;
  update public.pages set deleted_at = null where id = p_page_id;
  insert into public.audit_logs (actor_id, actor_email, action, entity_type, entity_id)
  values ((select auth.uid())::text, (select auth.jwt() ->> 'email'), 'page.restore', 'page', p_page_id::text);
end;
$$;

comment on function public.publish_page is
  'Snapshots page_blocks into a new page_revisions row and flips the
   published pointer, in one transaction. Row lock on pages serializes
   concurrent publishes of the same page so revision_number never races.
   Heading/alt-text validation happens in the application before this is
   called — it is a content-quality gate, not an access-control one, so it
   belongs in TypeScript (where the Markdown AST already lives) rather than
   reimplemented in plpgsql.';
