import { z } from "zod";
import Image from "next/image";
import { mediaRefSchema, emptyMediaRef, validateMediaRef } from "../../shared-schemas";

export const configSchema = z.object({
  image: mediaRefSchema.default(emptyMediaRef),
  caption: z.string().default(""),
});

export type Config = z.infer<typeof configSchema>;

export const defaultConfig: Config = { image: emptyMediaRef, caption: "" };

export function getIssues(config: Config) {
  return validateMediaRef(config.image, "Image block");
}

export default function Render({ config }: { config: Config }) {
  if (!config.image.url) return null;
  return (
    <figure className="mx-auto max-w-4xl px-6 py-8">
      <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: config.image.width && config.image.height ? `${config.image.width}/${config.image.height}` : "16/9" }}>
        <Image
          src={config.image.url}
          alt={config.image.isDecorative ? "" : config.image.alt}
          fill
          className="object-cover"
        />
      </div>
      {config.caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {config.caption}
        </figcaption>
      )}
    </figure>
  );
}
