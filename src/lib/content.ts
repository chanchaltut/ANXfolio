/**
 * Single read path for all site content. The admin writes to the store; the public site
 * reads the cached copy here and falls back to the seed files until the first save.
 */
import { cache } from "react";
import { seedContent } from "@/content/seed";
import { buildFaqs, describe, profileLinks } from "@/content/site";
import type { Brand, Category, Content, Settings, Video } from "@/content/types";
import { store } from "@/lib/store";

const clone = <T,>(value: T): T => structuredClone(value);

/** Fills fields added after content was first saved, so older stored copies keep working. */
export function normalize(stored: Content | null): Content {
  if (!stored) return clone(seedContent);
  const settings: Settings = {
    ...seedContent.settings,
    ...stored.settings,
    socials: { ...seedContent.settings.socials, ...stored.settings?.socials },
  };
  return {
    settings,
    categories: stored.categories ?? clone(seedContent.categories),
    videos: stored.videos ?? clone(seedContent.videos),
    brands: stored.brands ?? clone(seedContent.brands),
    testimonials: stored.testimonials ?? clone(seedContent.testimonials),
    pricing: stored.pricing ?? clone(seedContent.pricing),
    updatedAt: stored.updatedAt,
  };
}

/** Deduplicated per request. A storage outage falls back to the seed instead of taking the site down. */
export const getContent = cache(async (): Promise<Content> => {
  try {
    return normalize(await store.readContent(true));
  } catch (error) {
    console.error("[content] read failed, serving seed content", error);
    return clone(seedContent);
  }
});

/** Uncached read for the admin, so it always edits the latest copy. */
export async function getFreshContent(): Promise<Content> {
  return normalize(await store.readContent(false));
}

/** A genre is live when it is not marked as coming soon and has at least one video. */
export function isLive(category: Category, videos: Video[]) {
  return !category.comingSoon && videos.some((v) => v.category === category.slug);
}

export function brandLookup(brands: Brand[]) {
  const map = new Map(brands.map((b) => [b.id, b]));
  return (id?: string) => (id ? map.get(id) : undefined);
}

export async function getSettings(): Promise<Settings> {
  return (await getContent()).settings;
}

export async function getCategories(): Promise<Category[]> {
  return (await getContent()).categories;
}

export async function getLiveCategories(): Promise<Category[]> {
  const { categories, videos } = await getContent();
  return categories.filter((c) => isLive(c, videos));
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return (await getContent()).categories.find((c) => c.slug === slug);
}

export async function getVideos(): Promise<Video[]> {
  return (await getContent()).videos;
}

export async function getVideosByCategory(slug: string): Promise<Video[]> {
  return (await getContent()).videos.filter((v) => v.category === slug);
}

export async function getBrands(): Promise<Brand[]> {
  return (await getContent()).brands;
}

export async function getPricing() {
  return (await getContent()).pricing;
}

/** Drafts never reach the site. */
export async function getTestimonials() {
  return (await getContent()).testimonials.filter((t) => !t.placeholder && t.quote.trim());
}

export async function getSiteMeta() {
  const { settings, brands } = await getContent();
  return {
    settings,
    description: describe(settings),
    faqs: buildFaqs(settings, brands),
    links: profileLinks(settings),
    sameAs: profileLinks(settings).map((l) => l.href),
  };
}
