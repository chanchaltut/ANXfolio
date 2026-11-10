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

/**
 * One-off updates for copies saved in the admin before a content change shipped in code.
 * Each runs on read until the admin's next save stores its id, so it never undoes a later edit.
 */
const MIGRATIONS: { id: string; apply: (content: Content) => void }[] = [
  {
    // Brief revision of 2026-11-10: Colour Grading goes live, Fashion Films 01 replaced, Unicorn logo.
    id: "2026-11-colour-grading",
    apply: (content) => {
      const seedGenre = seedContent.categories.find((c) => c.slug === "colour-grading")!;
      const genre = content.categories.find((c) => c.slug === seedGenre.slug);
      if (genre) Object.assign(genre, { ...seedGenre, label: genre.label, comingSoon: undefined });
      else content.categories.push(clone(seedGenre));

      const have = new Set(content.videos.map((v) => v.id));
      const replaced = content.videos.findIndex((v) => v.id === "pdQ4ykWxGG0");
      const fashion = seedContent.videos.find((v) => v.id === "7z1UyOleNJ0")!;
      if (replaced >= 0 && !have.has(fashion.id)) content.videos[replaced] = clone(fashion);
      for (const video of seedContent.videos)
        if (video.category === seedGenre.slug && !have.has(video.id)) content.videos.push(clone(video));

      const unicorn = content.brands.find((b) => b.id === "unicorn");
      const seedUnicorn = seedContent.brands.find((b) => b.id === "unicorn");
      if (unicorn && !unicorn.logo && seedUnicorn?.logo) unicorn.logo = { ...seedUnicorn.logo };
    },
  },
];

function migrate(content: Content): Content {
  const done = new Set(content.migrations ?? []);
  for (const migration of MIGRATIONS) {
    if (done.has(migration.id)) continue;
    migration.apply(content);
    done.add(migration.id);
  }
  content.migrations = [...done];
  return content;
}

/** Fills fields added after content was first saved, so older stored copies keep working. */
export function normalize(stored: Content | null): Content {
  if (!stored) return { ...clone(seedContent), migrations: MIGRATIONS.map((m) => m.id) };
  const settings: Settings = {
    ...seedContent.settings,
    ...stored.settings,
    socials: { ...seedContent.settings.socials, ...stored.settings?.socials },
  };
  return migrate({
    settings,
    categories: clone(stored.categories ?? seedContent.categories),
    videos: clone(stored.videos ?? seedContent.videos),
    brands: clone(stored.brands ?? seedContent.brands),
    testimonials: stored.testimonials ?? clone(seedContent.testimonials),
    pricing: stored.pricing ?? clone(seedContent.pricing),
    updatedAt: stored.updatedAt,
    migrations: stored.migrations,
  });
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
