import type { AnyBlockDefinition } from "./types";

import * as hero from "./definitions/hero/Render";
import HeroEditor from "./definitions/hero/Editor";
import * as richText from "./definitions/rich-text/Render";
import RichTextEditor from "./definitions/rich-text/Editor";
import * as image from "./definitions/image/Render";
import ImageEditor from "./definitions/image/Editor";
import * as featureGrid from "./definitions/feature-grid/Render";
import FeatureGridEditor from "./definitions/feature-grid/Editor";
import * as pricingTable from "./definitions/pricing-table/Render";
import PricingTableEditor from "./definitions/pricing-table/Editor";
import * as testimonials from "./definitions/testimonials/Render";
import TestimonialsEditor from "./definitions/testimonials/Editor";
import * as faq from "./definitions/faq/Render";
import FaqEditor from "./definitions/faq/Editor";
import * as stats from "./definitions/stats/Render";
import StatsEditor from "./definitions/stats/Editor";
import * as cta from "./definitions/cta/Render";
import CtaEditor from "./definitions/cta/Editor";
import * as blogGrid from "./definitions/blog-grid/Render";
import BlogGridEditor from "./definitions/blog-grid/Editor";
import * as customHtml from "./definitions/custom-html/Render";
import CustomHtmlEditor from "./definitions/custom-html/Editor";

/**
 * The block-type registry (§15/§97): one entry per curated Phase 1 block.
 * See docs/architecture/03-cms.md for which blocks were deliberately left
 * out of this pass and why. Mirrored (key + label only) into
 * `block_definitions` by migration 0003 so `page_blocks.block_type` has a
 * real foreign key — this object, not that table, is where a block's
 * actual behavior lives.
 */
// Each entry below is cast through `unknown` to the type-erased
// `AnyBlockDefinition` — deliberate, narrow type-erasure at the one point
// where it's inherent to the design (a single map holding N block types,
// each with its own real Config type everywhere else in its own module).
// Not a workaround for an unrelated type error.
export const blockRegistry: Record<string, AnyBlockDefinition> = {
  hero: {
    key: "hero",
    label: "Hero",
    category: "layout",
    configSchema: hero.configSchema,
    defaultConfig: hero.defaultConfig,
    Editor: HeroEditor,
    Render: hero.default,
    getHeadingOutline: hero.getHeadingOutline,
    getIssues: hero.getIssues,
  } as unknown as AnyBlockDefinition,
  rich_text: {
    key: "rich_text",
    label: "Rich Text",
    category: "content",
    configSchema: richText.configSchema,
    defaultConfig: richText.defaultConfig,
    Editor: RichTextEditor,
    Render: richText.default,
    getHeadingOutline: richText.getHeadingOutline,
  } as unknown as AnyBlockDefinition,
  image: {
    key: "image",
    label: "Image",
    category: "content",
    configSchema: image.configSchema,
    defaultConfig: image.defaultConfig,
    Editor: ImageEditor,
    Render: image.default,
    getIssues: image.getIssues,
  } as unknown as AnyBlockDefinition,
  feature_grid: {
    key: "feature_grid",
    label: "Feature Grid",
    category: "content",
    configSchema: featureGrid.configSchema,
    defaultConfig: featureGrid.defaultConfig,
    Editor: FeatureGridEditor,
    Render: featureGrid.default,
    getHeadingOutline: featureGrid.getHeadingOutline,
  } as unknown as AnyBlockDefinition,
  pricing_table: {
    key: "pricing_table",
    label: "Pricing Table",
    category: "commerce-display",
    configSchema: pricingTable.configSchema,
    defaultConfig: pricingTable.defaultConfig,
    Editor: PricingTableEditor,
    Render: pricingTable.default,
    getHeadingOutline: pricingTable.getHeadingOutline,
  } as unknown as AnyBlockDefinition,
  testimonials: {
    key: "testimonials",
    label: "Testimonials",
    category: "content",
    configSchema: testimonials.configSchema,
    defaultConfig: testimonials.defaultConfig,
    Editor: TestimonialsEditor,
    Render: testimonials.default,
    getHeadingOutline: testimonials.getHeadingOutline,
    getIssues: testimonials.getIssues,
  } as unknown as AnyBlockDefinition,
  faq: {
    key: "faq",
    label: "FAQ",
    category: "content",
    configSchema: faq.configSchema,
    defaultConfig: faq.defaultConfig,
    Editor: FaqEditor,
    Render: faq.default,
    getHeadingOutline: faq.getHeadingOutline,
  } as unknown as AnyBlockDefinition,
  stats: {
    key: "stats",
    label: "Stats",
    category: "content",
    configSchema: stats.configSchema,
    defaultConfig: stats.defaultConfig,
    Editor: StatsEditor,
    Render: stats.default,
    getHeadingOutline: stats.getHeadingOutline,
  } as unknown as AnyBlockDefinition,
  cta: {
    key: "cta",
    label: "CTA",
    category: "content",
    configSchema: cta.configSchema,
    defaultConfig: cta.defaultConfig,
    Editor: CtaEditor,
    Render: cta.default,
    getHeadingOutline: cta.getHeadingOutline,
  } as unknown as AnyBlockDefinition,
  blog_grid: {
    key: "blog_grid",
    label: "Blog Grid",
    category: "content",
    configSchema: blogGrid.configSchema,
    defaultConfig: blogGrid.defaultConfig,
    Editor: BlogGridEditor,
    Render: blogGrid.default,
    getHeadingOutline: blogGrid.getHeadingOutline,
  } as unknown as AnyBlockDefinition,
  custom_html: {
    key: "custom_html",
    label: "Custom HTML",
    category: "advanced",
    configSchema: customHtml.configSchema,
    defaultConfig: customHtml.defaultConfig,
    Editor: CustomHtmlEditor,
    Render: customHtml.default,
    requiresPermission: "pages.custom_html",
  } as unknown as AnyBlockDefinition,
};

export const blockList = Object.values(blockRegistry);
