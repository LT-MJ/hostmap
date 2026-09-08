import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/domain/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: pages }, { data: posts }] = await Promise.all([
    supabase.from("hostmap_pages").select("slug, updated_at").eq("status", "published").is("deleted_at", null),
    supabase.from("hostmap_blog_posts").select("slug, updated_at").eq("status", "published").is("deleted_at", null),
  ]);

  const pageEntries: MetadataRoute.Sitemap = (pages ?? []).map((page) => ({
    url: page.slug === "home" ? absoluteUrl("/") : absoluteUrl(`/${page.slug}`),
    lastModified: page.updated_at,
    changeFrequency: "monthly",
  }));

  const postEntries: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updated_at,
    changeFrequency: "weekly",
  }));

  const blogIndex: MetadataRoute.Sitemap =
    (posts ?? []).length > 0 ? [{ url: absoluteUrl("/blog"), changeFrequency: "weekly" }] : [];

  return [...pageEntries, ...blogIndex, ...postEntries];
}
