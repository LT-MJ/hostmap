import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { mediaPublicUrl } from "@/lib/domain/media";
import { buildMetadata } from "@/lib/domain/seo/metadata";
import { Card } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: "Blog", path: "/blog" });
}

export default async function BlogIndexPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hostmap_blog_posts")
    .select("slug, title, excerpt, published_at, media:featured_media_id(bucket, storage_path)")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false });

  const posts = (data ?? []).map((row) => {
    const media = row.media as unknown as { bucket: string; storage_path: string } | null;
    return { ...row, imageUrl: media ? mediaPublicUrl(media) : null };
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Blog</h1>
      {posts.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No posts published yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full overflow-hidden transition hover:shadow-md">
                {post.imageUrl && (
                  <div className="relative aspect-video">
                    <Image src={post.imageUrl} alt="" fill className="object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-medium">{post.title}</h2>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
