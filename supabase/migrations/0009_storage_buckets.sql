-- Storage bucket for CMS media. Public (served directly, matching the
-- `media` table's own public-read RLS in 0003) — see docs/architecture/
-- 05-deployment.md's storage section. A `private` bucket is reserved for
-- Phase 6+ customer documents and isn't created until something needs it.

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media_bucket_select" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

create policy "media_bucket_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.has_permission((select auth.uid()), 'media.manage'));

create policy "media_bucket_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.has_permission((select auth.uid()), 'media.manage'))
  with check (bucket_id = 'media' and public.has_permission((select auth.uid()), 'media.manage'));

create policy "media_bucket_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.has_permission((select auth.uid()), 'media.manage'));
