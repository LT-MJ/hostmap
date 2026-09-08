import { z } from "zod";
import type { HeadingNode } from "../../types";

const statItemSchema = z.object({
  value: z.string().default(""),
  label: z.string().default(""),
});

export const configSchema = z.object({
  heading: z.string().default(""),
  items: z.array(statItemSchema).default([]),
});

export type Config = z.infer<typeof configSchema>;
export type StatItem = z.infer<typeof statItemSchema>;

export const defaultConfig: Config = { heading: "", items: [] };

export function getHeadingOutline(config: Config): HeadingNode[] {
  return config.heading ? [{ level: 2, text: config.heading }] : [];
}

export default function Render({ config }: { config: Config }) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      {config.heading && (
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight">{config.heading}</h2>
      )}
      <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
        {config.items.map((item, i) => (
          <div key={i}>
            <p className="text-4xl font-semibold tracking-tight">{item.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
