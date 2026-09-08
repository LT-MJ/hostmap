import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedPageBySlug } from "@/lib/domain/pages";
import { renderPageBlocks } from "@/lib/domain/blocks/render-page-blocks";
import { buildMetadata } from "@/lib/domain/seo/metadata";

// Convention: the page with slug "home" is the site's homepage. A
// dedicated "which page is the homepage" settings field is one line to add
// later if a business ever needs a homepage slug other than "home"; not
// worth a singleton-table field for a value that's fixed today.
const HOMEPAGE_SLUG = "home";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedPageBySlug(HOMEPAGE_SLUG);
  if (!content) return {};
  const seo = content.seo as Record<string, unknown>;
  return buildMetadata({
    title: (seo.seo_title as string) || content.page.title,
    description: seo.meta_description as string | undefined,
    path: "/",
  });
}

export default async function HomePage() {
  const content = await getPublishedPageBySlug(HOMEPAGE_SLUG);
  if (!content) notFound();

  const rendered = await renderPageBlocks(content.blocks);
  return <>{rendered}</>;
}
