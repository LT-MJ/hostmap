import { notFound, redirect, permanentRedirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { getPublishedPageBySlug } from "@/lib/domain/pages";
import { renderPageBlocks } from "@/lib/domain/blocks/render-page-blocks";
import { buildMetadata } from "@/lib/domain/seo/metadata";
import { findRedirect, recordNotFound } from "@/lib/domain/redirects";

type Props = PageProps<"/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPublishedPageBySlug(slug);
  if (!content) return {};
  const seo = content.seo as Record<string, unknown>;
  return buildMetadata({
    title: (seo.seo_title as string) || content.page.title,
    description: seo.meta_description as string | undefined,
    path: `/${slug}`,
  });
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const content = await getPublishedPageBySlug(slug);

  if (!content) {
    const path = `/${slug}`;
    const match = await findRedirect(path);
    if (match) {
      // next/navigation's redirect()/permanentRedirect() emit 307/308, not
      // literal 301/302 — Google treats these pairs as SEO-equivalent
      // (permanent vs. temporary), and the method-preserving behavior
      // 307/308 add over 301/302 doesn't matter for a GET page navigation.
      // Getting the exact configured status byte-for-byte would mean
      // resolving redirects in proxy.ts instead, at the cost of a DB call
      // on every request rather than only on a CMS-page cache miss — not
      // worth it for Phase 1's redirect volume. status_code is still
      // stored and shown in the admin for the business's own records.
      if (match.status_code === 301) permanentRedirect(match.destination_path);
      redirect(match.destination_path);
    }

    const requestHeaders = await headers();
    await recordNotFound(path, requestHeaders.get("referer"));
    notFound();
  }

  const rendered = await renderPageBlocks(content.blocks);
  return <>{rendered}</>;
}
