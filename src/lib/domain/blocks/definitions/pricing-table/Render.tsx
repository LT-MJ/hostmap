import { z } from "zod";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HeadingNode } from "../../types";

const planSchema = z.object({
  name: z.string().default(""),
  priceLabel: z.string().default(""),
  billingPeriodLabel: z.string().default("/mo"),
  features: z.array(z.string()).default([]),
  ctaLabel: z.string().default("Get started"),
  ctaHref: z.string().default("/pricing"),
  highlighted: z.boolean().default(false),
});

export const configSchema = z.object({
  heading: z.string().default(""),
  plans: z.array(planSchema).default([]),
});

export type Config = z.infer<typeof configSchema>;
export type Plan = z.infer<typeof planSchema>;

export const defaultConfig: Config = { heading: "", plans: [] };

export function getHeadingOutline(config: Config): HeadingNode[] {
  return config.heading ? [{ level: 2, text: config.heading }] : [];
}

export default function Render({ config }: { config: Config }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      {config.heading && (
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight">{config.heading}</h2>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {config.plans.map((plan, i) => (
          <Card key={i} className={`relative flex flex-col p-6 ${plan.highlighted ? "border-primary shadow-lg" : ""}`}>
            {plan.highlighted && <Badge className="absolute -top-3 left-6">Most popular</Badge>}
            <h3 className="text-lg font-medium">{plan.name}</h3>
            <p className="mt-2 text-3xl font-semibold">
              {plan.priceLabel}
              <span className="text-base font-normal text-muted-foreground">{plan.billingPeriodLabel}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm">
              {plan.features.map((feature, fi) => (
                <li key={fi} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6"
              variant={plan.highlighted ? "default" : "outline"}
              render={<Link href={plan.ctaHref} />}
            >
              {plan.ctaLabel}
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
