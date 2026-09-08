import "server-only";

import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/domain/settings";

/** §83: every absolute URL the app generates goes through this one function,
 * driven by NEXT_PUBLIC_SITE_URL — changing environments never means
 * touching a code file. */
export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}

export async function buildMetadata(input: {
  title: string;
  description?: string | null;
  path: string;
  ogImage?: string | null;
  robots?: string | null;
  canonical?: string | null;
}): Promise<Metadata> {
  const settings = await getSiteSettings();
  const separator = settings.seo_title_separator || "|";
  const fullTitle = settings.site_name ? `${input.title} ${separator} ${settings.site_name}` : input.title;
  const canonical = input.canonical || absoluteUrl(input.path);
  const description = input.description ?? settings.tagline ?? undefined;

  return {
    title: fullTitle,
    description,
    alternates: { canonical },
    robots: input.robots ?? settings.robots_default ?? undefined,
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: settings.site_name || undefined,
      images: input.ogImage ? [{ url: input.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: input.ogImage ? [input.ogImage] : undefined,
    },
  };
}

export function organizationJsonLd(settings: { site_name: string; contact_email: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.site_name,
    email: settings.contact_email ?? undefined,
    url: absoluteUrl("/"),
  };
}

export function websiteJsonLd(settings: { site_name: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.site_name,
    url: absoluteUrl("/"),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
