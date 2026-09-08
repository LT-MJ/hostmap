import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { HeadingNode } from "../../types";

const faqItemSchema = z.object({
  question: z.string().default(""),
  answer: z.string().default(""),
});

export const configSchema = z.object({
  heading: z.string().default("Frequently asked questions"),
  items: z.array(faqItemSchema).default([]),
});

export type Config = z.infer<typeof configSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;

export const defaultConfig: Config = { heading: "Frequently asked questions", items: [] };

export function getHeadingOutline(config: Config): HeadingNode[] {
  return config.heading ? [{ level: 2, text: config.heading }] : [];
}

/** Pure — see BlockDefinition.getJsonLd. Nonce-wrapping happens in
 * render-page-blocks.tsx, the one place that's actually server-only. */
export function getJsonLd(config: Config): object | null {
  const items = config.items.filter((item) => item.question && item.answer);
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export default function Render({ config }: { config: Config }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      {config.heading && <h2 className="mb-6 text-3xl font-semibold tracking-tight">{config.heading}</h2>}
      <Accordion>
        {config.items.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
