import { seedPricing, seedSettings, seedTestimonials } from "./site";
import type { Content } from "./types";
import { brands, categories, videos } from "./videos";

/** What the site shows until the admin saves its first change. */
export const seedContent: Content = {
  settings: seedSettings,
  categories,
  videos,
  brands,
  testimonials: seedTestimonials,
  pricing: seedPricing,
};
