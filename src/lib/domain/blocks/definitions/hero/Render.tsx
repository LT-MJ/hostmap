import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { mediaRefSchema, emptyMediaRef, validateMediaRef } from "../../shared-schemas";
import type { HeadingNode } from "../../types";

export const configSchema = z.object({
  headline: z.string().min(1, "Headline is required"),
  subheadline: z.string().default(""),
  alignment: z.enum(["left", "center"]).default("center"),
  primaryCtaLabel: z.string().default(""),
  primaryCtaHref: z.string().default(""),
  secondaryCtaLabel: z.string().default(""),
  secondaryCtaHref: z.string().default(""),
  background: mediaRefSchema.default(emptyMediaRef),
});

export type Config = z.infer<typeof configSchema>;

export const defaultConfig: Config = {
  headline: "",
  subheadline: "",
  alignment: "center",
  primaryCtaLabel: "",
  primaryCtaHref: "",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
  background: emptyMediaRef,
};

export function getHeadingOutline(config: Config): HeadingNode[] {
  return config.headline ? [{ level: 1, text: config.headline }] : [];
}

export function getIssues(config: Config) {
  return validateMediaRef(config.background, "Hero background");
}

export default function Render({ config }: { config: Config }) {
  const align = config.alignment === "left" ? "items-start text-left" : "items-center text-center";
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-32">
      {config.background.url && (
        <Image
          src={config.background.url}
          alt={config.background.isDecorative ? "" : config.background.alt}
          fill
          priority
          className="object-cover -z-10"
        />
      )}
      {config.background.url && <div className="absolute inset-0 -z-10 bg-black/40" />}
      <div className={`mx-auto flex max-w-3xl flex-col gap-6 px-6 ${align}`}>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">{config.headline}</h1>
        {config.subheadline && (
          <p className="text-lg text-muted-foreground sm:text-xl">{config.subheadline}</p>
        )}
        {(config.primaryCtaLabel || config.secondaryCtaLabel) && (
          <div className="flex flex-wrap gap-3">
            {config.primaryCtaLabel && (
              <Button size="lg" render={<Link href={config.primaryCtaHref || "#"} />}>
                {config.primaryCtaLabel}
              </Button>
            )}
            {config.secondaryCtaLabel && (
              <Button size="lg" variant="outline" render={<Link href={config.secondaryCtaHref || "#"} />}>
                {config.secondaryCtaLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
