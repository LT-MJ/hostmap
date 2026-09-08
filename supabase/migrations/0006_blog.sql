-- Blog: mirrors the pages content model (see docs/architecture/01-database.md
-- for why this is a parallel structure rather than a shared/polymorphic one).

create table public.hostmap_blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table public.hostmap_blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table public.hostmap_blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  excerpt text,
  status public.hostmap_content_status not null default 'draft',
  author_id uuid references auth.users (id) on delete set null,
  category_id uuid references public.hostmap_blog_categories (id) on delete set null,
  featured_media_id uuid references public.hostmap_media (id) on delete set null,
  published_revision_id uuid, -- FK added below
  seo_title text,
  meta_description text,
  canonical_url text,
  robots_directive text,
  og_title text,
  og_description text,
  og_image_media_id uuid references public.hostmap_media (id) on delete set null,
  reading_time_minutes int,
  scheduled_at timestamptz,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index hostmap_blog_posts_slug_active_key on public.hostmap_blog_posts (slug) where deleted_at is null;
create index hostmap_blog_posts_status_published_at_idx on public.hostmap_blog_posts (status, published_at desc);
create index hostmap_blog_posts_category_id_idx on public.hostmap_blog_posts (category_id);

create trigger set_blog_posts_updated_at
  before update on public.hostmap_blog_posts
  for each row execute function public.hostmap_set_updated_at();

create table public.hostmap_blog_post_blocks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.hostmap_blog_posts (id) on delete cascade,
  position double precision not null,
  block_type text not null references public.hostmap_block_definitions (key),
  config jsonb not null default '{}'::jsonb,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index hostmap_blog_post_blocks_post_id_position_idx on public.hostmap_blog_post_blocks (post_id, position);

create trigger set_blog_post_blocks_updated_at
  before update on public.hostmap_blog_post_blocks
  for each row execute function public.hostmap_set_updated_at();

create table public.hostmap_blog_post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.hostmap_blog_posts (id) on delete cascade,
  revision_number int not null,
  title text not null,
  blocks_snapshot jsonb not null,
  seo_snapshot jsonb not null default '{}'::jsonb,
  author_id uuid references auth.users (id) on delete set null,
  change_note text,
  created_at timestamptz not null default now(),
  unique (post_id, revision_number)
);

create index hostmap_blog_post_revisions_post_id_idx on public.hostmap_blog_post_revisions (post_id);

alter table public.hostmap_blog_posts
  add constraint hostmap_blog_posts_published_revision_id_fkey
  foreign key (published_revision_id) references public.hostmap_blog_post_revisions (id) on delete set null;

create table public.hostmap_blog_post_tags (
  post_id uuid not null references public.hostmap_blog_posts (id) on delete cascade,
  tag_id uuid not null references public.hostmap_blog_tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

-- Row Level Security -----------------------------------------------------

alter table public.hostmap_blog_categories enable row level security;
alter table public.hostmap_blog_tags enable row level security;
alter table public.hostmap_blog_posts enable row level security;
alter table public.hostmap_blog_post_blocks enable row level security;
alter table public.hostmap_blog_post_revisions enable row level security;
alter table public.hostmap_blog_post_tags enable row level security;

create policy "blog_categories_select" on public.hostmap_blog_categories
  for select to anon, authenticated using (true);
create policy "blog_categories_write" on public.hostmap_blog_categories
  for all to authenticated
  using (public.hostmap_has_permission((select auth.uid()), 'blog.update'))
  with check (public.hostmap_has_permission((select auth.uid()), 'blog.update'));

create policy "blog_tags_select" on public.hostmap_blog_tags
  for select to anon, authenticated using (true);
create policy "blog_tags_write" on public.hostmap_blog_tags
  for all to authenticated
  using (public.hostmap_has_permission((select auth.uid()), 'blog.update'))
  with check (public.hostmap_has_permission((select auth.uid()), 'blog.update'));

create policy "blog_posts_select_published" on public.hostmap_blog_posts
  for select to anon, authenticated
  using (status = 'published' and deleted_at is null);
create policy "blog_posts_select_staff" on public.hostmap_blog_posts
  for select to authenticated
  using (public.hostmap_has_permission((select auth.uid()), 'blog.view'));
create policy "blog_posts_insert" on public.hostmap_blog_posts
  for insert to authenticated
  with check (public.hostmap_has_permission((select auth.uid()), 'blog.create'));
create policy "blog_posts_update_content" on public.hostmap_blog_posts
  for update to authenticated
  using (public.hostmap_has_permission((select auth.uid()), 'blog.update'))
  with check (public.hostmap_has_permission((select auth.uid()), 'blog.update'));

-- Column grant excludes status/published_revision_id/published_at/
-- scheduled_at/deleted_at, same reasoning as pages in 0004_pages.sql — those
-- transitions only happen through the security-definer functions below.
revoke update on public.hostmap_blog_posts from authenticated;
grant update (
  slug, title, excerpt, author_id, category_id, featured_media_id,
  seo_title, meta_description, canonical_url, robots_directive,
  og_title, og_description, og_image_media_id, reading_time_minutes
) on public.hostmap_blog_posts to authenticated;

create policy "blog_post_blocks_select" on public.hostmap_blog_post_blocks
  for select to authenticated
  using (public.hostmap_has_permission((select auth.uid()), 'blog.view'));
create policy "blog_post_blocks_write" on public.hostmap_blog_post_blocks
  for all to authenticated
  using (public.hostmap_has_permission((select auth.uid()), 'blog.update'))
  with check (
    public.hostmap_has_permission((select auth.uid()), 'blog.update')
    and (block_type <> 'custom_html' or public.hostmap_has_permission((select auth.uid()), 'pages.custom_html'))
  );

create policy "blog_post_revisions_select_published" on public.hostmap_blog_post_revisions
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.hostmap_blog_posts p
      where p.published_revision_id = hostmap_blog_post_revisions.id and p.status = 'published'
    )
  );
create policy "blog_post_revisions_select_staff" on public.hostmap_blog_post_revisions
  for select to authenticated
  using (public.hostmap_has_permission((select auth.uid()), 'blog.view'));
create policy "blog_post_revisions_insert" on public.hostmap_blog_post_revisions
  for insert to authenticated
  with check (public.hostmap_has_permission((select auth.uid()), 'blog.publish'));

create policy "blog_post_tags_select" on public.hostmap_blog_post_tags
  for select to anon, authenticated using (true);
create policy "blog_post_tags_write" on public.hostmap_blog_post_tags
  for all to authenticated
  using (public.hostmap_has_permission((select auth.uid()), 'blog.update'))
  with check (public.hostmap_has_permission((select auth.uid()), 'blog.update'));

-- Domain functions (mirrors publish_page/schedule_page/unpublish_page) ----

create or replace function public.hostmap_publish_blog_post(p_post_id uuid, p_change_note text default null)
returns public.hostmap_blog_post_revisions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post public.hostmap_blog_posts;
  v_next_revision int;
  v_blocks jsonb;
  v_revision public.hostmap_blog_post_revisions;
begin
  if (select auth.uid()) is not null
     and not public.hostmap_has_permission((select auth.uid()), 'blog.publish') then
    raise exception 'Missing permission: blog.publish';
  end if;

  select * into v_post from public.hostmap_blog_posts where id = p_post_id for update;
  if not found then
    raise exception 'Blog post % not found', p_post_id;
  end if;

  select coalesce(max(revision_number), 0) + 1 into v_next_revision
  from public.hostmap_blog_post_revisions where post_id = p_post_id;

  select coalesce(jsonb_agg(to_jsonb(b) order by b.position), '[]'::jsonb) into v_blocks
  from public.hostmap_blog_post_blocks b where b.post_id = p_post_id and not b.is_hidden;

  insert into public.hostmap_blog_post_revisions (post_id, revision_number, title, blocks_snapshot, seo_snapshot, author_id, change_note)
  values (
    p_post_id, v_next_revision, v_post.title, v_blocks,
    jsonb_build_object(
      'seo_title', v_post.seo_title, 'meta_description', v_post.meta_description,
      'canonical_url', v_post.canonical_url, 'robots_directive', v_post.robots_directive,
      'og_title', v_post.og_title, 'og_description', v_post.og_description,
      'og_image_media_id', v_post.og_image_media_id
    ),
    (select auth.uid()), p_change_note
  )
  returning * into v_revision;

  update public.hostmap_blog_posts
  set status = 'published', published_revision_id = v_revision.id, published_at = now(), scheduled_at = null
  where id = p_post_id;

  insert into public.hostmap_audit_logs (actor_id, actor_email, action, entity_type, entity_id, after)
  values (coalesce((select auth.uid())::text, 'system:scheduled-publish'), (select auth.jwt() ->> 'email'), 'blog_post.publish', 'blog_post', p_post_id::text,
          jsonb_build_object('revision_number', v_next_revision));

  return v_revision;
end;
$$;

create or replace function public.hostmap_schedule_blog_post(p_post_id uuid, p_scheduled_at timestamptz)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.hostmap_has_permission((select auth.uid()), 'blog.publish') then
    raise exception 'Missing permission: blog.publish';
  end if;
  if p_scheduled_at <= now() then
    raise exception 'scheduled_at must be in the future';
  end if;
  update public.hostmap_blog_posts set status = 'scheduled', scheduled_at = p_scheduled_at where id = p_post_id;
  insert into public.hostmap_audit_logs (actor_id, actor_email, action, entity_type, entity_id, after)
  values (coalesce((select auth.uid())::text, 'system:scheduled-publish'), (select auth.jwt() ->> 'email'), 'blog_post.schedule', 'blog_post', p_post_id::text,
          jsonb_build_object('scheduled_at', p_scheduled_at));
end;
$$;

create or replace function public.hostmap_unpublish_blog_post(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.hostmap_has_permission((select auth.uid()), 'blog.publish') then
    raise exception 'Missing permission: blog.publish';
  end if;
  update public.hostmap_blog_posts set status = 'draft' where id = p_post_id;
  insert into public.hostmap_audit_logs (actor_id, actor_email, action, entity_type, entity_id)
  values (coalesce((select auth.uid())::text, 'system:scheduled-publish'), (select auth.jwt() ->> 'email'), 'blog_post.unpublish', 'blog_post', p_post_id::text);
end;
$$;

create or replace function public.hostmap_delete_blog_post(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.hostmap_has_permission((select auth.uid()), 'blog.update') then
    raise exception 'Missing permission: blog.update';
  end if;
  update public.hostmap_blog_posts set deleted_at = now() where id = p_post_id;
  insert into public.hostmap_audit_logs (actor_id, actor_email, action, entity_type, entity_id)
  values ((select auth.uid())::text, (select auth.jwt() ->> 'email'), 'blog_post.delete', 'blog_post', p_post_id::text);
end;
$$;

create or replace function public.hostmap_restore_blog_post(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.hostmap_has_permission((select auth.uid()), 'blog.update') then
    raise exception 'Missing permission: blog.update';
  end if;
  update public.hostmap_blog_posts set deleted_at = null where id = p_post_id;
  insert into public.hostmap_audit_logs (actor_id, actor_email, action, entity_type, entity_id)
  values ((select auth.uid())::text, (select auth.jwt() ->> 'email'), 'blog_post.restore', 'blog_post', p_post_id::text);
end;
$$;
