import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toJsonLd } from "@/lib/domain/seo/json-ld";
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

export default function Render({ config }: { config: Config }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.items
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      {config.items.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }} />
      )}
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
