/**
 * Development/demo seed script. Run with: npm run db:seed
 *
 * Idempotent: every insert is an upsert or checks for an existing row
 * first, so running this twice against the same project doesn't create
 * duplicates or fail on unique-constraint violations (§76).
 *
 * Everything this creates is clearly demo content, not fake statistics
 * presented as real (§48/§80) — generic marketing copy an admin is
 * expected to replace, no fabricated testimonials, review counts, or
 * customer numbers.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

if (!SUPABASE_URL || !SECRET_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set (see .env.example).");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function upsertAdminUser(): Promise<string> {
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users.find((u) => u.email === ADMIN_EMAIL);
  if (existing) {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Admin" },
  });
  if (error || !data.user) throw new Error(`Could not create admin user: ${error?.message}`);

  const { error: promoteError } = await supabase.rpc("promote_to_staff", {
    p_user_id: data.user.id,
    p_role_keys: ["super_admin"],
  });
  if (promoteError) throw new Error(`Could not promote admin user: ${promoteError.message}`);

  console.log(`Created admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  return data.user.id;
}

async function seedSettings() {
  await supabase.from("site_settings").upsert({
    id: 1,
    site_name: "hostmap",
    tagline: "Reliable hosting for growing businesses",
    default_currency: "USD",
    contact_email: "hello@example.com",
    seo_title_separator: "|",
    robots_default: "index, follow",
  });
  await supabase.from("theme_settings").upsert({ id: 1, tokens: {}, dark_mode_enabled: true });
  console.log("Seeded site/theme settings");
}

async function seedNavigation() {
  const { data: primary } = await supabase.from("navigation_menus").select("id").eq("key", "primary").single();
  const { data: footer } = await supabase.from("navigation_menus").select("id").eq("key", "footer").single();
  if (!primary || !footer) throw new Error("Navigation menus not found — did migrations run?");

  const { count } = await supabase.from("navigation_items").select("id", { count: "exact", head: true });
  if (count && count > 0) {
    console.log("Navigation already seeded, skipping");
    return;
  }

  await supabase.from("navigation_items").insert([
    { menu_id: primary.id, label: "Home", url: "/", position: 0 },
    { menu_id: primary.id, label: "Blog", url: "/blog", position: 1 },
    { menu_id: primary.id, label: "About", url: "/about", position: 2 },
    { menu_id: primary.id, label: "Contact", url: "/contact", position: 3 },
    { menu_id: footer.id, label: "Privacy Policy", url: "/privacy", position: 0 },
    { menu_id: footer.id, label: "Terms of Service", url: "/terms", position: 1 },
  ]);
  console.log("Seeded navigation");
}

async function publishPageWithBlocks(
  adminUserId: string,
  slug: string,
  title: string,
  blocks: Array<{ block_type: string; config: unknown }>,
) {
  const { data: existing } = await supabase.from("pages").select("id, status").eq("slug", slug).maybeSingle();
  if (existing?.status === "published") {
    console.log(`Page "${slug}" already published, skipping`);
    return;
  }

  const pageId =
    existing?.id ??
    (
      await supabase
        .from("pages")
        .insert({ slug, title, author_id: adminUserId })
        .select("id")
        .single()
    ).data?.id;
  if (!pageId) throw new Error(`Could not create page "${slug}"`);

  await supabase.from("page_blocks").delete().eq("page_id", pageId);
  await supabase.from("page_blocks").insert(
    blocks.map((b, i) => ({ page_id: pageId, position: i, block_type: b.block_type, config: b.config })),
  );

  const { error } = await supabase.rpc("publish_page", { p_page_id: pageId });
  if (error) throw new Error(`Could not publish page "${slug}": ${error.message}`);
  console.log(`Seeded + published page: /${slug === "home" ? "" : slug}`);
}

async function seedPages(adminUserId: string) {
  await publishPageWithBlocks(adminUserId, "home", "Home", [
    {
      block_type: "hero",
      config: {
        headline: "Reliable hosting for growing businesses",
        subheadline: "Fast, secure, and fully managed — so you can focus on what you build.",
        alignment: "center",
        primaryCtaLabel: "View plans",
        primaryCtaHref: "/pricing",
        secondaryCtaLabel: "Contact us",
        secondaryCtaHref: "/contact",
        background: { mediaId: null, url: "", alt: "", isDecorative: false, width: null, height: null },
      },
    },
    {
      block_type: "feature_grid",
      config: {
        heading: "Why host with us",
        items: [
          { icon: "ShieldCheck", title: "Secure by default", description: "Free SSL, automatic backups, and proactive monitoring on every plan." },
          { icon: "Zap", title: "Fast infrastructure", description: "SSD storage and modern hardware for consistently quick load times." },
          { icon: "LifeBuoy", title: "Real support", description: "Reach a real person when something needs attention." },
        ],
      },
    },
    {
      block_type: "faq",
      config: {
        heading: "Frequently asked questions",
        items: [
          { question: "Can I change plans later?", answer: "Yes — you can upgrade or downgrade at any time from your account." },
          { question: "Do you offer a money-back guarantee?", answer: "Contact support within your first 30 days for details." },
        ],
      },
    },
    {
      block_type: "cta",
      config: {
        heading: "Ready to get started?",
        subtext: "Contact us and we'll help you find the right plan.",
        buttonLabel: "Contact us",
        buttonHref: "/contact",
      },
    },
  ]);

  await publishPageWithBlocks(adminUserId, "about", "About", [
    { block_type: "hero", config: { headline: "About us", subheadline: "", alignment: "center", primaryCtaLabel: "", primaryCtaHref: "", secondaryCtaLabel: "", secondaryCtaHref: "", background: { mediaId: null, url: "", alt: "", isDecorative: false, width: null, height: null } } },
    { block_type: "rich_text", config: { markdown: "Replace this with your company's story — who you are, what you believe, and why customers should trust you." } },
  ]);

  await publishPageWithBlocks(adminUserId, "contact", "Contact", [
    { block_type: "hero", config: { headline: "Contact us", subheadline: "We'd love to hear from you.", alignment: "center", primaryCtaLabel: "", primaryCtaHref: "", secondaryCtaLabel: "", secondaryCtaHref: "", background: { mediaId: null, url: "", alt: "", isDecorative: false, width: null, height: null } } },
    { block_type: "rich_text", config: { markdown: "A contact form is planned for a later phase — for now, list an email or phone number here." } },
  ]);

  await publishPageWithBlocks(adminUserId, "privacy", "Privacy Policy", [
    { block_type: "rich_text", config: { markdown: "# Privacy Policy\n\nReplace this with your actual privacy policy before launch." } },
  ]);

  await publishPageWithBlocks(adminUserId, "terms", "Terms of Service", [
    { block_type: "rich_text", config: { markdown: "# Terms of Service\n\nReplace this with your actual terms before launch." } },
  ]);
}

async function seedBlog(adminUserId: string) {
  const { data: existingCategory } = await supabase
    .from("blog_categories")
    .select("id")
    .eq("slug", "news")
    .maybeSingle();
  const categoryId =
    existingCategory?.id ??
    (await supabase.from("blog_categories").insert({ name: "News", slug: "news" }).select("id").single()).data?.id;

  const { data: existingPost } = await supabase.from("blog_posts").select("id, status").eq("slug", "welcome").maybeSingle();
  if (existingPost?.status === "published") {
    console.log("Blog already seeded, skipping");
    return;
  }

  const postId =
    existingPost?.id ??
    (
      await supabase
        .from("blog_posts")
        .insert({ slug: "welcome", title: "Welcome to our new site", author_id: adminUserId, category_id: categoryId, excerpt: "A quick introduction to what's new." })
        .select("id")
        .single()
    ).data?.id;
  if (!postId) throw new Error("Could not create blog post");

  await supabase.from("blog_post_blocks").delete().eq("post_id", postId);
  await supabase.from("blog_post_blocks").insert([
    {
      post_id: postId,
      position: 0,
      block_type: "rich_text",
      config: { markdown: "## Welcome\n\nThis is a sample post — edit or delete it from the admin Blog section." },
    },
  ]);

  const { error } = await supabase.rpc("publish_blog_post", { p_post_id: postId });
  if (error) throw new Error(`Could not publish blog post: ${error.message}`);
  console.log("Seeded + published blog post: /blog/welcome");
}

async function main() {
  console.log("Seeding hostmap demo data...\n");
  const adminUserId = await upsertAdminUser();
  await seedSettings();
  await seedNavigation();
  await seedPages(adminUserId);
  await seedBlog(adminUserId);
  console.log("\nDone. This is demo content — replace it before launch.");
  console.log(`Admin login: /admin/login — ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} (change this password immediately).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
