-- Scheduled publishing. Called only from app/api/cron/publish-scheduled/
-- route.ts, which validates the CRON_SECRET header first and calls this
-- using the server-only secret-key client. There is no "calling user" here
-- (this is a machine-triggered, not user-triggered, action) — the function
-- is security definer, executes as its owner, and is not granted to
-- anon/authenticated, so it's reachable only via a client holding the
-- secret key. See docs/architecture/02-auth.md#privilege-escalation.
--
-- Idempotent per §11: a page/post already flipped to 'published' no longer
-- matches the WHERE clause below, so running this twice (or every 5
-- minutes, whether or not anything was due) publishes each row exactly once.
create or replace function public.hostmap_publish_scheduled_content()
returns table (content_type text, id uuid, revision_number int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_page record;
  v_post record;
  v_revision public.hostmap_page_revisions;
  v_post_revision public.hostmap_blog_post_revisions;
begin
  for v_page in
    select p.id from public.hostmap_pages p
    where p.status = 'scheduled' and p.scheduled_at <= now()
  loop
    begin
      v_revision := public.hostmap_publish_page(v_page.id);
      content_type := 'page';
      id := v_page.id;
      revision_number := v_revision.revision_number;
      return next;
    exception when others then
      -- One bad row must not abort the whole batch; it stays 'scheduled'
      -- and is retried on the next Cron tick.
      insert into public.hostmap_audit_logs (actor_id, action, entity_type, entity_id, after)
      values ('system:scheduled-publish', 'page.publish_failed', 'page', v_page.id::text,
              jsonb_build_object('error', sqlerrm));
    end;
  end loop;

  for v_post in
    select p.id from public.hostmap_blog_posts p
    where p.status = 'scheduled' and p.scheduled_at <= now()
  loop
    begin
      v_post_revision := public.hostmap_publish_blog_post(v_post.id);
      content_type := 'blog_post';
      id := v_post.id;
      revision_number := v_post_revision.revision_number;
      return next;
    exception when others then
      insert into public.hostmap_audit_logs (actor_id, action, entity_type, entity_id, after)
      values ('system:scheduled-publish', 'blog_post.publish_failed', 'blog_post', v_post.id::text,
              jsonb_build_object('error', sqlerrm));
    end;
  end loop;

  return;
end;
$$;

revoke all on function public.hostmap_publish_scheduled_content() from public, anon, authenticated;
