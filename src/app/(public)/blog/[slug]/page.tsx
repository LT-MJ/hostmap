import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedPostBySlug } from "@/lib/domain/blog";
import { renderPageBlocks } from "@/lib/domain/blocks/render-page-blocks";
import { buildMetadata, absoluteUrl } from "@/lib/domain/seo/metadata";
import { toJsonLd } from "@/lib/domain/seo/json-ld";
import { getNonce } from "@/lib/domain/seo/nonce";

type Props = PageProps<"/blog/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPublishedPostBySlug(slug);
  if (!content) return {};
  const seo = content.seo as Record<string, unknown>;
  return buildMetadata({
    title: (seo.seo_title as string) || content.post.title,
    description: (seo.meta_description as string) || content.post.excerpt,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const content = await getPublishedPostBySlug(slug);
  if (!content) notFound();

  const [rendered, nonce] = await Promise.all([renderPageBlocks(content.blocks), getNonce()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: content.post.title,
    description: content.post.excerpt ?? undefined,
    datePublished: content.post.published_at ?? undefined,
    url: absoluteUrl(`/blog/${slug}`),
  };

  return (
    <article>
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }} />
      <header className="mx-auto max-w-3xl px-6 pt-16">
        <h1 className="text-4xl font-semibold tracking-tight">{content.post.title}</h1>
        <div className="mt-3 flex gap-3 text-sm text-muted-foreground">
          {content.post.published_at && (
            <time dateTime={content.post.published_at}>
              {new Date(content.post.published_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          {content.post.reading_time_minutes && <span>· {content.post.reading_time_minutes} min read</span>}
        </div>
      </header>
      {rendered}
    </article>
  );
}
