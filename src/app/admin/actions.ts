"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { Brand, Category, Content, PricingTier, Testimonial, Video } from "@/content/types";
import { getFreshContent, normalize } from "@/lib/content";
import { endSession, passwordMatches, requireAdmin, startSession } from "@/lib/server/auth";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { lookupYouTube } from "@/lib/server/youtube-lookup";
import { CONTENT_TAG, store } from "@/lib/store";
import { parseYouTubeId } from "@/lib/youtube";

export type Result = { ok: boolean; message: string; at?: number } | null;

const ok = (message: string): Result => ({ ok: true, message, at: Date.now() });
const fail = (message: string): Result => ({ ok: false, message, at: Date.now() });

const text = (form: FormData, key: string, max = 300) => String(form.get(key) ?? "").trim().slice(0, max);
const flag = (form: FormData, key: string) => form.get(key) === "on" || form.get(key) === "true";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

const isUrl = (value: string) => /^https:\/\/[^\s]+\.[^\s]+$/i.test(value);

/** Expires the cached content and every statically rendered page, so the site shows the change on the next visit. */
function publish() {
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

/**
 * Read, change and save the latest content. The callback returns an error message to abort.
 * Every admin mutation goes through here, so every one of them is authenticated.
 */
async function mutate(change: (content: Content) => string | void, success: string): Promise<Result> {
  await requireAdmin();
  try {
    const content = await getFreshContent();
    const error = change(content);
    if (error) return fail(error);
    content.updatedAt = new Date().toISOString();
    await store.writeContent(content);
  } catch (error) {
    console.error("[admin] save failed", error);
    return fail("Could not save. Check the storage settings for this host.");
  }
  publish();
  return ok(success);
}

/** Moves an item one step within the items that share its group. */
function shift<T>(list: T[], index: number, dir: number, sameGroup: (a: T) => boolean = () => true) {
  let target = index + dir;
  while (target >= 0 && target < list.length && !sameGroup(list[target])) target += dir;
  if (target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]];
}

/* ---------- Session ---------- */

export async function login(_prev: Result, form: FormData): Promise<Result> {
  if (!rateLimit(`login:${await clientIp()}`, 8, 15 * 60 * 1000)) {
    return fail("Too many attempts. Wait 15 minutes and try again.");
  }
  if (!passwordMatches(String(form.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 500));
    return fail("That password is not right.");
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* ---------- Videos ---------- */

export async function addVideo(_prev: Result, form: FormData): Promise<Result> {
  await requireAdmin();
  const id = parseYouTubeId(text(form, "url", 500));
  if (!id) return fail("Paste a YouTube link, for example https://youtube.com/shorts/…");

  const current = await getFreshContent();
  const category = current.categories.find((c) => c.slug === text(form, "category"));
  if (!category) return fail("Pick a genre.");
  const existing = current.videos.find((v) => v.id === id);
  if (existing) return fail(`That video is already on the site as “${existing.title}”.`);

  const lookup = await lookupYouTube(id, category.format);
  if (!lookup.ok) return fail(lookup.message);

  const video: Video = {
    id,
    format: category.format,
    category: category.slug,
    title: text(form, "title", 160) || lookup.title || "Untitled edit",
    uploadDate: lookup.uploadDate,
    ...(lookup.thumb ? { thumb: lookup.thumb } : {}),
    ...(text(form, "brandId") ? { brandId: text(form, "brandId") } : {}),
    ...(text(form, "views", 20) ? { views: text(form, "views", 20), viewsSource: text(form, "viewsSource", 40) || "Instagram" } : {}),
  };

  const result = await mutate((content) => {
    if (content.videos.some((v) => v.id === id)) return "That video was just added.";
    // New videos go to the front of their genre, where they are seen first.
    const firstOfGenre = content.videos.findIndex((v) => v.category === video.category);
    content.videos.splice(firstOfGenre === -1 ? content.videos.length : firstOfGenre, 0, video);
    if (flag(form, "hero") && video.format === "short") content.settings.heroWall.unshift(video.id);
  }, `Added “${video.title}” to ${category.label}.`);
  if (result?.ok && lookup.uploadDateGuessed) {
    return ok(`${result.message} YouTube did not share the upload date, so today's date was used.`);
  }
  return result;
}

export async function updateVideo(_prev: Result, form: FormData): Promise<Result> {
  const id = text(form, "id");
  return mutate((content) => {
    const video = content.videos.find((v) => v.id === id);
    if (!video) return "That video no longer exists.";
    const category = content.categories.find((c) => c.slug === text(form, "category"));
    if (!category) return "Pick a genre.";
    if (category.format !== video.format)
      return `${category.label} holds ${category.format === "long" ? "long-form" : "vertical"} videos. Delete this one and add it again there.`;
    const title = text(form, "title", 160);
    if (!title) return "Give the video a title.";

    const moved = video.category !== category.slug;
    video.title = title;
    video.category = category.slug;
    video.brandId = text(form, "brandId") || undefined;
    video.views = text(form, "views", 20) || undefined;
    video.viewsSource = video.views ? text(form, "viewsSource", 40) || "Instagram" : undefined;

    if (moved) {
      // Keep each genre's videos together, with the moved one first.
      content.videos = content.videos.filter((v) => v.id !== id);
      const at = content.videos.findIndex((v) => v.category === category.slug);
      content.videos.splice(at === -1 ? content.videos.length : at, 0, video);
    }

    const wall = content.settings.heroWall;
    const onWall = wall.includes(id);
    if (flag(form, "hero") && !onWall && video.format === "short") wall.push(id);
    if (!flag(form, "hero") && onWall) content.settings.heroWall = wall.filter((w) => w !== id);
  }, "Video saved.");
}

export async function moveVideo(_prev: Result, form: FormData): Promise<Result> {
  const id = text(form, "id");
  const dir = Number(form.get("dir")) < 0 ? -1 : 1;
  return mutate((content) => {
    const index = content.videos.findIndex((v) => v.id === id);
    if (index === -1) return "That video no longer exists.";
    const genre = content.videos[index].category;
    shift(content.videos, index, dir, (v) => v.category === genre);
  }, "Order saved.");
}

export async function deleteVideo(_prev: Result, form: FormData): Promise<Result> {
  const id = text(form, "id");
  return mutate((content) => {
    if (!content.videos.some((v) => v.id === id)) return "That video no longer exists.";
    content.videos = content.videos.filter((v) => v.id !== id);
    content.settings.heroWall = content.settings.heroWall.filter((w) => w !== id);
  }, "Video removed from the site. It is still on YouTube.");
}

/* ---------- Genres ---------- */

export async function addGenre(_prev: Result, form: FormData): Promise<Result> {
  const label = text(form, "label", 60);
  const slug = slugify(label);
  return mutate((content) => {
    if (!label || !slug) return "Give the genre a name.";
    if (content.categories.some((c) => c.slug === slug)) return "A genre with that name already exists.";
    const format = form.get("format") === "long" ? "long" : "short";
    const blurb = text(form, "blurb", 240) || `${label} edited by ANX.`;
    const genre: Category = {
      slug,
      label,
      blurb,
      seoTitle: `${label} Video Editor`,
      seoDescription: `${label} edited by Ayush Nayak (ANX). ${blurb}`.slice(0, 160),
      format,
      comingSoon: true,
    };
    content.categories.push(genre);
  }, `Added ${label}. It shows as “In the edit” until it has videos and you set it live.`);
}

export async function updateGenre(_prev: Result, form: FormData): Promise<Result> {
  const slug = text(form, "slug");
  return mutate((content) => {
    const genre = content.categories.find((c) => c.slug === slug);
    if (!genre) return "That genre no longer exists.";
    const label = text(form, "label", 60);
    if (!label) return "Give the genre a name.";
    genre.label = label;
    genre.blurb = text(form, "blurb", 240);
    genre.seoTitle = text(form, "seoTitle", 70) || `${label} Video Editor`;
    genre.seoDescription = text(form, "seoDescription", 170) || genre.blurb;
    const live = flag(form, "live");
    if (live && !content.videos.some((v) => v.category === slug)) return "Add at least one video before setting this genre live.";
    genre.comingSoon = live ? undefined : true;
  }, "Genre saved.");
}

export async function moveGenre(_prev: Result, form: FormData): Promise<Result> {
  const slug = text(form, "slug");
  const dir = Number(form.get("dir")) < 0 ? -1 : 1;
  return mutate((content) => {
    const index = content.categories.findIndex((c) => c.slug === slug);
    if (index === -1) return "That genre no longer exists.";
    shift(content.categories, index, dir);
  }, "Order saved.");
}

export async function deleteGenre(_prev: Result, form: FormData): Promise<Result> {
  const slug = text(form, "slug");
  return mutate((content) => {
    const count = content.videos.filter((v) => v.category === slug).length;
    if (count) return `Move or delete its ${count} video${count > 1 ? "s" : ""} first.`;
    content.categories = content.categories.filter((c) => c.slug !== slug);
  }, "Genre deleted.");
}

/* ---------- Brands ---------- */

const LOGO_MAX_BYTES = 300 * 1024;

/** Reads the logo's intrinsic size so it can be laid out without a shift. SVG and PNG only. */
async function readLogo(file: File): Promise<{ data: Buffer; type: string; width: number; height: number } | string> {
  if (file.size > LOGO_MAX_BYTES) return "Logos must be under 300 KB.";
  const data = Buffer.from(await file.arrayBuffer());
  const isPng = data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (isPng) return { data, type: "image/png", width: data.readUInt32BE(16), height: data.readUInt32BE(20) };

  const svg = data.toString("utf8");
  if (!/<svg[\s>]/i.test(svg)) return "Upload the logo as an SVG or PNG file.";
  const viewBox = svg.match(/viewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  const width = Number(viewBox?.[1] ?? svg.match(/<svg[^>]*\swidth=["']([\d.]+)/i)?.[1]);
  const height = Number(viewBox?.[2] ?? svg.match(/<svg[^>]*\sheight=["']([\d.]+)/i)?.[1]);
  if (!width || !height) return "That SVG has no viewBox or size, so it cannot be scaled. Export it again with a viewBox.";
  return { data, type: "image/svg+xml", width, height };
}

async function saveLogo(brandId: string, form: FormData): Promise<Brand["logo"] | string | undefined> {
  const file = form.get("logo");
  if (!(file instanceof File) || file.size === 0) return undefined;
  const logo = await readLogo(file);
  if (typeof logo === "string") return logo;
  const mediaId = `brand-${brandId}`;
  await store.putMedia(mediaId, { type: logo.type, data: logo.data });
  const version = createHash("sha1").update(logo.data).digest("hex").slice(0, 10);
  return { src: `/media/${mediaId}?v=${version}`, width: Math.round(logo.width), height: Math.round(logo.height) };
}

export async function addBrand(_prev: Result, form: FormData): Promise<Result> {
  await requireAdmin();
  const name = text(form, "name", 80);
  const id = slugify(name);
  if (!name || !id) return fail("Give the brand a name.");
  const current = await getFreshContent();
  if (current.brands.some((b) => b.id === id)) return fail("That brand is already listed.");
  let logo: Brand["logo"] | string | undefined;
  try {
    logo = await saveLogo(id, form);
  } catch {
    return fail("Could not store the logo. Check the storage settings for this host.");
  }
  if (typeof logo === "string") return fail(logo);
  return mutate((content) => {
    content.brands.push({ id, name, ...(logo ? { logo } : {}) });
  }, `Added ${name}.`);
}

export async function updateBrand(_prev: Result, form: FormData): Promise<Result> {
  await requireAdmin();
  const id = text(form, "id");
  const name = text(form, "name", 80);
  if (!name) return fail("Give the brand a name.");
  let logo: Brand["logo"] | string | undefined;
  try {
    logo = await saveLogo(id, form);
  } catch {
    return fail("Could not store the logo. Check the storage settings for this host.");
  }
  if (typeof logo === "string") return fail(logo);
  const removeLogo = flag(form, "removeLogo");
  if (removeLogo && !logo) await store.deleteMedia(`brand-${id}`).catch(() => undefined);
  return mutate((content) => {
    const brand = content.brands.find((b) => b.id === id);
    if (!brand) return "That brand no longer exists.";
    brand.name = name;
    if (logo) brand.logo = logo;
    else if (removeLogo) delete brand.logo;
  }, "Brand saved.");
}

export async function moveBrand(_prev: Result, form: FormData): Promise<Result> {
  const id = text(form, "id");
  const dir = Number(form.get("dir")) < 0 ? -1 : 1;
  return mutate((content) => {
    const index = content.brands.findIndex((b) => b.id === id);
    if (index === -1) return "That brand no longer exists.";
    shift(content.brands, index, dir);
  }, "Order saved.");
}

export async function deleteBrand(_prev: Result, form: FormData): Promise<Result> {
  const id = text(form, "id");
  const result = await mutate((content) => {
    const count = content.videos.filter((v) => v.brandId === id).length;
    if (count) return `${count} video${count > 1 ? "s use" : " uses"} this brand. Change ${count > 1 ? "them" : "it"} first.`;
    content.brands = content.brands.filter((b) => b.id !== id);
  }, "Brand deleted.");
  if (result?.ok) await store.deleteMedia(`brand-${id}`).catch(() => undefined);
  return result;
}

/* ---------- Testimonials ---------- */

function readTestimonial(form: FormData): Omit<Testimonial, "id"> | string {
  const quote = text(form, "quote", 800);
  const author = text(form, "author", 80);
  if (!quote || !author) return "Add the quote and who said it.";
  return { quote, author, role: text(form, "role", 120), placeholder: flag(form, "draft") || undefined };
}

export async function addTestimonial(_prev: Result, form: FormData): Promise<Result> {
  const fields = readTestimonial(form);
  return mutate((content) => {
    if (typeof fields === "string") return fields;
    content.testimonials.push({ id: randomUUID().slice(0, 8), ...fields });
  }, typeof fields !== "string" && fields.placeholder ? "Saved as a draft. It stays hidden on the site." : "Testimonial published.");
}

export async function updateTestimonial(_prev: Result, form: FormData): Promise<Result> {
  const id = text(form, "id");
  const fields = readTestimonial(form);
  return mutate((content) => {
    if (typeof fields === "string") return fields;
    const index = content.testimonials.findIndex((t) => t.id === id);
    if (index === -1) return "That testimonial no longer exists.";
    content.testimonials[index] = { id, ...fields };
  }, "Testimonial saved.");
}

export async function moveTestimonial(_prev: Result, form: FormData): Promise<Result> {
  const id = text(form, "id");
  const dir = Number(form.get("dir")) < 0 ? -1 : 1;
  return mutate((content) => {
    const index = content.testimonials.findIndex((t) => t.id === id);
    if (index === -1) return "That testimonial no longer exists.";
    shift(content.testimonials, index, dir);
  }, "Order saved.");
}

export async function deleteTestimonial(_prev: Result, form: FormData): Promise<Result> {
  const id = text(form, "id");
  return mutate((content) => {
    content.testimonials = content.testimonials.filter((t) => t.id !== id);
  }, "Testimonial deleted.");
}

/* ---------- Pricing ---------- */

function readTier(form: FormData): Omit<PricingTier, "id"> | string {
  const name = text(form, "name", 60);
  if (!name) return "Give the plan a name.";
  return {
    name,
    summary: text(form, "summary", 160),
    price: text(form, "price", 60) || "Quote on brief",
    features: text(form, "features", 2000)
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean)
      .slice(0, 12),
    highlighted: flag(form, "highlighted") || undefined,
    badge: text(form, "badge", 40) || undefined,
  };
}

export async function addTier(_prev: Result, form: FormData): Promise<Result> {
  const fields = readTier(form);
  return mutate((content) => {
    if (typeof fields === "string") return fields;
    content.pricing.push({ id: randomUUID().slice(0, 8), ...fields });
  }, "Plan added.");
}

export async function updateTier(_prev: Result, form: FormData): Promise<Result> {
  const id = text(form, "id");
  const fields = readTier(form);
  return mutate((content) => {
    if (typeof fields === "string") return fields;
    const index = content.pricing.findIndex((p) => p.id === id);
    if (index === -1) return "That plan no longer exists.";
    content.pricing[index] = { id, ...fields };
  }, "Plan saved.");
}

export async function moveTier(_prev: Result, form: FormData): Promise<Result> {
  const id = text(form, "id");
  const dir = Number(form.get("dir")) < 0 ? -1 : 1;
  return mutate((content) => {
    const index = content.pricing.findIndex((p) => p.id === id);
    if (index === -1) return "That plan no longer exists.";
    shift(content.pricing, index, dir);
  }, "Order saved.");
}

export async function deleteTier(_prev: Result, form: FormData): Promise<Result> {
  const id = text(form, "id");
  return mutate((content) => {
    content.pricing = content.pricing.filter((p) => p.id !== id);
  }, "Plan deleted.");
}

/* ---------- Settings ---------- */

export async function updateSettings(_prev: Result, form: FormData): Promise<Result> {
  return mutate((content) => {
    const email = text(form, "email", 200);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "That email address does not look right.";
    const socials = { ...content.settings.socials };
    for (const key of Object.keys(socials) as (keyof typeof socials)[]) {
      const value = text(form, key, 300);
      if (value && !isUrl(value)) return `The ${key} link must be a full https:// address.`;
      socials[key] = value;
    }
    content.settings = {
      ...content.settings,
      email,
      totalViews: text(form, "totalViews", 20),
      topVideoViews: text(form, "topVideoViews", 20),
      topVideoLabel: text(form, "topVideoLabel", 80),
      city: text(form, "city", 80),
      about: text(form, "about", 900),
      socials,
    };
  }, "Settings saved.");
}

/* ---------- Inbox ---------- */

export async function setBriefRead(_prev: Result, form: FormData): Promise<Result> {
  await requireAdmin();
  try {
    await store.updateBrief(text(form, "id"), { read: flag(form, "read") });
  } catch {
    return fail("Could not update the brief.");
  }
  revalidatePath("/admin", "layout");
  return ok("Updated.");
}

export async function deleteBrief(_prev: Result, form: FormData): Promise<Result> {
  await requireAdmin();
  try {
    await store.deleteBrief(text(form, "id"));
  } catch {
    return fail("Could not delete the brief.");
  }
  revalidatePath("/admin", "layout");
  return ok("Brief deleted.");
}

/* ---------- Backup ---------- */

export async function importContent(_prev: Result, form: FormData): Promise<Result> {
  await requireAdmin();
  const file = form.get("backup");
  if (!(file instanceof File) || file.size === 0) return fail("Choose a backup file first.");
  if (file.size > 2 * 1024 * 1024) return fail("That file is too large to be a backup from this site.");
  let parsed: { content?: Content } & Partial<Content>;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    return fail("That file is not valid JSON.");
  }
  const incoming = parsed.content ?? parsed;
  if (!Array.isArray(incoming.videos) || !Array.isArray(incoming.categories) || !incoming.settings) {
    return fail("That file is not a backup from this site.");
  }
  const restored = normalize(incoming as Content);
  const bad = restored.videos.find((v) => !/^[\w-]{11}$/.test(v.id) || !v.category || !v.title);
  if (bad) return fail("The backup has a video with a missing ID, genre or title.");
  return mutate((content) => {
    Object.assign(content, restored);
  }, `Restored ${restored.videos.length} videos, ${restored.categories.length} genres and ${restored.brands.length} brands.`);
}
