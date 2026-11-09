export type VideoFormat = "short" | "long";

export type Brand = {
  id: string;
  name: string;
  /** Path under /public or a /media URL. Without one, the brand renders as a typed wordmark. */
  logo?: { src: string; width: number; height: number };
};

export type Video = {
  /** YouTube video ID. */
  id: string;
  format: VideoFormat;
  category: string;
  title: string;
  brandId?: string;
  /** Display string such as "40M+". Leave undefined until a verified figure exists. */
  views?: string;
  viewsSource?: string;
  /** ISO timestamp from YouTube. Required by Google for VideoObject rich results. */
  uploadDate: string;
  /** Thumbnail file on i.ytimg.com when the default for the format does not exist, e.g. "hqdefault.jpg". */
  thumb?: string;
};

export type Category = {
  slug: string;
  label: string;
  blurb: string;
  seoTitle: string;
  seoDescription: string;
  format: VideoFormat;
  /** Listed in the "in the edit" row until videos are added. */
  comingSoon?: boolean;
};

export type Service = {
  title: string;
  description: string;
  categorySlug?: string;
  thumbnailId?: string;
};

export type PricingTier = {
  id: string;
  name: string;
  summary: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  /** Label on a highlighted plan, e.g. "Best for steady posting". */
  badge?: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  /** Drafts stay in the admin and are never shown on the site or in structured data. */
  placeholder?: boolean;
};

export type Faq = { question: string; answer: string };

export type Socials = {
  instagram: string;
  youtube: string;
  linkedin: string;
  behance: string;
  x: string;
};

/** Everything Ayush can change from the admin without touching code. */
export type Settings = {
  /** Inbox for briefs. Used for email notifications and the mail-app fallback. */
  email: string;
  totalViews: string;
  topVideoViews: string;
  /** Finishes the sentence "40M+ ...", e.g. "on a single American Tourister reel". */
  topVideoLabel: string;
  city: string;
  socials: Socials;
  /** Short video IDs for the hero wall, brightest first. */
  heroWall: string[];
};

export type Content = {
  settings: Settings;
  categories: Category[];
  videos: Video[];
  brands: Brand[];
  testimonials: Testimonial[];
  pricing: PricingTier[];
  updatedAt?: string;
};

export type Brief = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  brand: string;
  type: string;
  plan: string;
  link: string;
  message: string;
  read?: boolean;
};
