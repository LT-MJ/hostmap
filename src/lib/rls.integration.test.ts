/**
 * RLS allow/deny tests against a real Supabase project (§7/§56 — see
 * docs/architecture/06-testing.md). Requires live credentials, which this
 * repo doesn't have until docs/architecture ROADMAP's Supabase project is
 * provisioned — `describe.skipIf` keeps the suite green in the meantime
 * instead of failing on missing environment, and it starts running for
 * real the moment `.env`/CI secrets are configured. Point this at a
 * disposable dev project or branch, never production.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const canRun = Boolean(SUPABASE_URL && PUBLISHABLE_KEY && SECRET_KEY);

describe.skipIf(!canRun)("RLS policies", () => {
  // Deliberately NOT constructed at the top of the describe body: vitest
  // still executes that code during collection even when skipIf is true
  // (only the `it()` callbacks themselves are skipped), so a real client
  // constructor call there would throw on missing env vars in the exact
  // "not configured yet" case this skip exists to handle. beforeAll is
  // never invoked for a skipped suite.
  let admin: SupabaseClient;
  let publishedPageId: string;
  let draftPageId: string;
  let editorUserId: string;
  const editorEmail = `rls-test-editor-${Date.now()}@example.com`;
  const editorPassword = "Test-password-123!";
  let editorClient: SupabaseClient;
  let anonClient: SupabaseClient;

  beforeAll(async () => {
    admin = createSupabaseClient(SUPABASE_URL!, SECRET_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    anonClient = createSupabaseClient(SUPABASE_URL!, PUBLISHABLE_KEY!);

    const { data: published, error: publishedError } = await admin
      .from("pages")
      .insert({ slug: `rls-test-published-${Date.now()}`, title: "RLS test — published" })
      .select("id")
      .single();
    if (publishedError) throw publishedError;
    publishedPageId = published.id;
    const { error: publishError } = await admin.rpc("publish_page", { p_page_id: publishedPageId });
    if (publishError) throw publishError;

    const { data: draft, error: draftError } = await admin
      .from("pages")
      .insert({ slug: `rls-test-draft-${Date.now()}`, title: "RLS test — draft" })
      .select("id")
      .single();
    if (draftError) throw draftError;
    draftPageId = draft.id;

    const { data: created, error: createUserError } = await admin.auth.admin.createUser({
      email: editorEmail,
      password: editorPassword,
      email_confirm: true,
    });
    if (createUserError || !created.user) throw createUserError ?? new Error("createUser returned no user");
    editorUserId = created.user.id;

    const { data: role, error: roleError } = await admin.from("roles").select("id").eq("key", "content_editor").single();
    if (roleError) throw roleError;
    const { error: assignError } = await admin.from("user_roles").insert({ user_id: editorUserId, role_id: role.id });
    if (assignError) throw assignError;

    editorClient = createSupabaseClient(SUPABASE_URL!, PUBLISHABLE_KEY!);
    const { error: signInError } = await editorClient.auth.signInWithPassword({ email: editorEmail, password: editorPassword });
    if (signInError) throw signInError;
  });

  afterAll(async () => {
    await admin.from("pages").delete().in("id", [publishedPageId, draftPageId]);
    if (editorUserId) await admin.auth.admin.deleteUser(editorUserId);
  });

  it("anon can select a published page", async () => {
    const { data } = await anonClient.from("pages").select("id").eq("id", publishedPageId);
    expect(data).toHaveLength(1);
  });

  it("anon cannot see a draft page (filtered, not errored)", async () => {
    const { data, error } = await anonClient.from("pages").select("id").eq("id", draftPageId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("anon cannot insert a page", async () => {
    const { error } = await anonClient.from("pages").insert({ slug: `rls-test-anon-${Date.now()}`, title: "x" });
    expect(error).not.toBeNull();
  });

  it("content_editor (pages.update) can edit a page's title", async () => {
    const { error } = await editorClient.from("pages").update({ title: "Updated by content_editor" }).eq("id", draftPageId);
    expect(error).toBeNull();
    const { data } = await admin.from("pages").select("title").eq("id", draftPageId).single();
    expect(data?.title).toBe("Updated by content_editor");
  });

  it("content_editor cannot publish (has pages.update, not pages.publish)", async () => {
    const { error } = await editorClient.rpc("publish_page", { p_page_id: draftPageId });
    expect(error).not.toBeNull();
    const { data } = await admin.from("pages").select("status").eq("id", draftPageId).single();
    expect(data?.status).toBe("draft");
  });

  it("content_editor cannot add a Custom HTML block (requires pages.custom_html)", async () => {
    const { error } = await editorClient
      .from("page_blocks")
      .insert({ page_id: draftPageId, position: 0, block_type: "custom_html", config: { html: "<script>x</script>" } });
    expect(error).not.toBeNull();
  });

  it("no one can modify page_revisions directly (no UPDATE policy exists)", async () => {
    const { data: revisions } = await admin.from("page_revisions").select("id").eq("page_id", publishedPageId).limit(1);
    const revisionId = revisions?.[0]?.id;
    expect(revisionId).toBeTruthy();

    await editorClient.from("page_revisions").update({ change_note: "tampered" }).eq("id", revisionId);
    const { data: after } = await admin.from("page_revisions").select("change_note").eq("id", revisionId).single();
    expect(after?.change_note).not.toBe("tampered");
  });
});
