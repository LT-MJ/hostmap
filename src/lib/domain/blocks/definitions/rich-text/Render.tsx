import { z } from "zod";
import ReactMarkdown from "react-markdown";
import { extractHeadings } from "../../markdown";
import type { HeadingNode } from "../../types";

export const configSchema = z.object({
  markdown: z.string().default(""),
});

export type Config = z.infer<typeof configSchema>;

export const defaultConfig: Config = { markdown: "" };

export function getHeadingOutline(config: Config): HeadingNode[] {
  return extractHeadings(config.markdown);
}

export default function Render({ config }: { config: Config }) {
  return (
    <div className="prose prose-neutral mx-auto max-w-3xl px-6 py-12 dark:prose-invert">
      <ReactMarkdown>{config.markdown}</ReactMarkdown>
    </div>
  );
}
