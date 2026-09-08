import { z } from "zod";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { mediaRefSchema, emptyMediaRef, validateMediaRef } from "../../shared-schemas";
import type { HeadingNode } from "../../types";

const testimonialSchema = z.object({
  quote: z.string().default(""),
  authorName: z.string().default(""),
  authorRole: z.string().default(""),
  avatar: mediaRefSchema.default(emptyMediaRef),
});

export const configSchema = z.object({
  heading: z.string().default(""),
  items: z.array(testimonialSchema).default([]),
});

export type Config = z.infer<typeof configSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;

export const defaultConfig: Config = { heading: "", items: [] };

export function getHeadingOutline(config: Config): HeadingNode[] {
  return config.heading ? [{ level: 2, text: config.heading }] : [];
}

export function getIssues(config: Config) {
  return config.items.flatMap((item, i) => validateMediaRef(item.avatar, `Testimonial ${i + 1} avatar`));
}

export default function Render({ config }: { config: Config }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      {config.heading && (
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight">{config.heading}</h2>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {config.items.map((item, i) => (
          <Card key={i} className="flex flex-col gap-4 p-6">
            <p className="flex-1 text-sm text-muted-foreground">&ldquo;{item.quote}&rdquo;</p>
            <div className="flex items-center gap-3">
              {item.avatar.url && (
                <div className="relative size-10 overflow-hidden rounded-full">
                  <Image src={item.avatar.url} alt={item.avatar.isDecorative ? "" : item.avatar.alt} fill className="object-cover" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{item.authorName}</p>
                <p className="text-xs text-muted-foreground">{item.authorRole}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
