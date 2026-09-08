import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { HeadingNode } from "../../types";

export const configSchema = z.object({
  heading: z.string().default(""),
  subtext: z.string().default(""),
  buttonLabel: z.string().default(""),
  buttonHref: z.string().default(""),
});

export type Config = z.infer<typeof configSchema>;

export const defaultConfig: Config = { heading: "", subtext: "", buttonLabel: "", buttonHref: "" };

export function getHeadingOutline(config: Config): HeadingNode[] {
  return config.heading ? [{ level: 2, text: config.heading }] : [];
}

export default function Render({ config }: { config: Config }) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-center">
      <div className="rounded-2xl bg-primary px-8 py-12 text-primary-foreground">
        {config.heading && <h2 className="text-3xl font-semibold tracking-tight">{config.heading}</h2>}
        {config.subtext && <p className="mt-3 text-primary-foreground/80">{config.subtext}</p>}
        {config.buttonLabel && (
          <Button size="lg" variant="secondary" className="mt-6" render={<Link href={config.buttonHref || "#"} />}>
            {config.buttonLabel}
          </Button>
        )}
      </div>
    </section>
  );
}
