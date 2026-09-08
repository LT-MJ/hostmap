import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import type { HeadingNode } from "../../types";

export const configSchema = z.object({
  heading: z.string().default("From the blog"),
  categorySlug: z.string().default(""),
  limit: z.number().int().min(1).max(12).default(3),
});

export type Config = z.infer<typeof configSchema>;

export const defaultConfig: Config = { heading: "From the blog", categorySlug: "", limit: 3 };

export type BlogGridPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
};

export function getHeadingOutline(config: Config): HeadingNode[] {
  return config.heading ? [{ level: 2, text: config.heading }] : [];
}

/**
 * The one block that renders genuinely live data (latest matching posts,
 * not what existed when the containing page was last published) rather
 * than authored config — `data` is resolved server-side by
 * render-page-blocks.tsx, never fetched by this component itself. See
 * docs/architecture/03-cms.md.
 */
export default function Render({ config, data }: { config: Config; data?: BlogGridPost[] }) {
  const posts = data ?? [];
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      {config.heading && (
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight">{config.heading}</h2>
      )}
      {posts.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">No published posts yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full overflow-hidden transition hover:shadow-md">
                {post.featuredImageUrl && (
                  <div className="relative aspect-video">
                    <Image src={post.featuredImageUrl} alt="" fill className="object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-medium">{post.title}</h3>
                  {post.excerpt && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
