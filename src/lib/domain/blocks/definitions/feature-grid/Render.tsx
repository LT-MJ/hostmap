import { z } from "zod";
import * as Icons from "lucide-react";
import type { HeadingNode } from "../../types";

const featureItemSchema = z.object({
  icon: z.string().default("Sparkles"),
  title: z.string().default(""),
  description: z.string().default(""),
});

export const configSchema = z.object({
  heading: z.string().default(""),
  items: z.array(featureItemSchema).default([]),
});

export type Config = z.infer<typeof configSchema>;
export type FeatureItem = z.infer<typeof featureItemSchema>;

export const defaultConfig: Config = { heading: "", items: [] };

export function getHeadingOutline(config: Config): HeadingNode[] {
  return config.heading ? [{ level: 2, text: config.heading }] : [];
}

function FeatureIcon({ name }: { name: string }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Sparkles;
  return <Icon className="size-6" aria-hidden="true" />;
}

export default function Render({ config }: { config: Config }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      {config.heading && (
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight">{config.heading}</h2>
      )}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {config.items.map((item, i) => (
          <div key={i} className="space-y-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FeatureIcon name={item.icon} />
            </div>
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
