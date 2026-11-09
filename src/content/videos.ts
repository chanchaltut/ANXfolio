import type { Brand, Category, Video } from "./types";

/** Seed data. Once the admin saves, the stored copy replaces this. */

export const brands: Brand[] = [
  {
    id: "american-tourister",
    name: "American Tourister",
    logo: { src: "/brands/american-tourister.svg", width: 595, height: 165 },
  },
  { id: "goibibo", name: "goibibo", logo: { src: "/brands/goibibo.svg", width: 450, height: 136 } },
  {
    id: "johnnie-walker",
    name: "Johnnie Walker",
    logo: { src: "/brands/johnnie-walker.svg", width: 381, height: 39 },
  },
  { id: "smirnoff", name: "Smirnoff" },
  { id: "black-white", name: "Black & White" },
  { id: "hapusa", name: "HAPUSA" },
  { id: "unicorn", name: "Unicorn Store × iPhone" },
  { id: "code-hyphen", name: "Code Hyphen" },
];

export const categories: Category[] = [
  {
    slug: "brand-promos",
    label: "Brand Promos",
    blurb: "Promotional videos and brand collaborations.",
    seoTitle: "Brand Promo Video Editor",
    seoDescription:
      "Brand promo and collaboration reels edited by Ayush Nayak (ANX) for American Tourister, goibibo and more, including one reel with 40M+ Instagram views.",
    format: "short",
  },
  {
    slug: "fashion-films",
    label: "Fashion Films",
    blurb: "Cinematic fashion edits and luxury brand visuals.",
    seoTitle: "Fashion Film Video Editor",
    seoDescription:
      "Cinematic fashion films and luxury brand visuals edited by Ayush Nayak (ANX). Watch the vertical fashion edits.",
    format: "short",
  },
  {
    slug: "long-form",
    label: "Long Form",
    blurb: "Cinematic storytelling and long-form video content, showcasing narrative editing, pacing and cinematic visuals.",
    seoTitle: "Long-Form Video Editor",
    seoDescription:
      "Long-form video editing by Ayush Nayak (ANX): narrative editing, pacing and cinematic visuals for stories that run longer than a reel.",
    format: "long",
  },
  {
    slug: "jewellery-promotions",
    label: "Jewellery Promotions",
    blurb: "Close-up detail and polished motion for jewellery brands.",
    seoTitle: "Jewellery Promotion Video Editor",
    seoDescription:
      "Jewellery promotion reels edited by Ayush Nayak (ANX), with close-up detail and polished motion for jewellery brands.",
    format: "short",
  },
  {
    slug: "restaurant-beverage",
    label: "Restaurant & Beverage",
    blurb: "Food, beverage and hospitality promotional videos.",
    seoTitle: "Restaurant & Beverage Promo Video Editor",
    seoDescription:
      "Food, beverage and hospitality promos edited by Ayush Nayak (ANX) for Smirnoff, Johnnie Walker, Black & White and HAPUSA.",
    format: "short",
  },
  {
    slug: "luxury-spiritual-lifestyle",
    label: "Luxury & Spiritual Lifestyle",
    blurb: "Slow, considered edits for luxury and spiritual lifestyle products.",
    seoTitle: "Luxury & Lifestyle Video Editor",
    seoDescription:
      "Luxury and spiritual lifestyle reels edited by Ayush Nayak (ANX), paced to feel calm, tactile and considered.",
    format: "short",
  },
  {
    slug: "colour-grading",
    label: "Colour Grading",
    blurb: "Looks, tone and mood, shot by shot.",
    seoTitle: "Colour Grading",
    seoDescription: "Colour grading work by Ayush Nayak (ANX).",
    format: "short",
    comingSoon: true,
  },
  {
    slug: "ugc-edits",
    label: "UGC Edits",
    blurb: "Creator-style edits that still feel native to the feed.",
    seoTitle: "UGC Video Editor",
    seoDescription: "UGC video edits by Ayush Nayak (ANX).",
    format: "short",
    comingSoon: true,
  },
];

const INSTAGRAM = "Instagram";

export const videos: Video[] = [
  // Long form
  {
    id: "10F6dxnZoZc",
    format: "long",
    category: "long-form",
    title: "Kya jo Instagram pe dikhta hai, actual me vese hota hai? Behind the scenes travel vlog",
    uploadDate: "2026-10-31T08:07:54-07:00",
  },
  {
    id: "3VlOsjb8ddk",
    format: "long",
    category: "long-form",
    title: "Long-form story edit",
    uploadDate: "2026-09-01T11:52:26-07:00",
  },

  // Brand promos, strongest proof first
  {
    id: "MFCIZHKOPKw",
    format: "short",
    category: "brand-promos",
    title: "American Tourister brand reel",
    brandId: "american-tourister",
    views: "40M+",
    viewsSource: INSTAGRAM,
    uploadDate: "2026-11-04T22:14:40-08:00",
  },
  {
    id: "shyBsW9wE_s",
    format: "short",
    category: "brand-promos",
    title: "American Tourister promo reel",
    brandId: "american-tourister",
    views: "472K+",
    viewsSource: INSTAGRAM,
    uploadDate: "2026-11-04T22:20:24-08:00",
  },
  {
    id: "IwUi-7fm8lA",
    format: "short",
    category: "brand-promos",
    title: "American Tourister Trento reel",
    brandId: "american-tourister",
    views: "331K+",
    viewsSource: INSTAGRAM,
    uploadDate: "2026-11-02T21:53:57-08:00",
  },
  {
    id: "AyFbZZNbOEU",
    format: "short",
    category: "brand-promos",
    title: "goibibo brand collaboration reel",
    brandId: "goibibo",
    views: "208K+",
    viewsSource: INSTAGRAM,
    uploadDate: "2026-11-02T21:44:08-08:00",
  },
  {
    id: "IE98guOIyFM",
    format: "short",
    category: "brand-promos",
    title: "Unicorn Store and iPhone brand reel",
    brandId: "unicorn",
    uploadDate: "2026-11-02T21:37:13-08:00",
  },
  {
    id: "Ct68CD8aohs",
    format: "short",
    category: "brand-promos",
    title: "Code Hyphen brand reel",
    brandId: "code-hyphen",
    uploadDate: "2026-11-02T21:49:09-08:00",
  },

  // Fashion films
  {
    id: "pdQ4ykWxGG0",
    format: "short",
    category: "fashion-films",
    title: "Fashion film edit 01",
    uploadDate: "2026-08-31T23:41:14-07:00",
  },
  {
    id: "6dlD_IiXGdk",
    format: "short",
    category: "fashion-films",
    title: "Fashion film edit 02",
    uploadDate: "2026-08-31T23:34:13-07:00",
  },
  {
    id: "YNTZkkoSYns",
    format: "short",
    category: "fashion-films",
    title: "Fashion film edit 03",
    uploadDate: "2026-11-02T21:51:43-08:00",
  },
  {
    id: "vF01CkGLwds",
    format: "short",
    category: "fashion-films",
    title: "Fashion film edit 04",
    uploadDate: "2026-09-01T11:55:01-07:00",
  },

  // Jewellery promotions
  {
    id: "Rb0oOPMf_ww",
    format: "short",
    category: "jewellery-promotions",
    title: "Jewellery promotion edit 01",
    uploadDate: "2026-09-01T11:10:13-07:00",
  },
  {
    id: "q01dt3uT9eo",
    format: "short",
    category: "jewellery-promotions",
    title: "Jewellery promotion edit 02",
    uploadDate: "2026-09-01T11:04:56-07:00",
  },
  {
    id: "C4qUAkBf1Mo",
    format: "short",
    category: "jewellery-promotions",
    title: "Jewellery promotion edit 03",
    uploadDate: "2026-09-01T11:15:16-07:00",
  },
  {
    id: "LNp7c_0bB6c",
    format: "short",
    category: "jewellery-promotions",
    title: "Jewellery promotion edit 04",
    uploadDate: "2026-11-04T23:25:59-08:00",
  },

  // Restaurant and beverage
  {
    id: "2VqZIGtrMho",
    format: "short",
    category: "restaurant-beverage",
    title: "HAPUSA dry gin promo",
    brandId: "hapusa",
    uploadDate: "2026-08-29T00:37:35-07:00",
  },
  {
    id: "YUETzoTPXiU",
    format: "short",
    category: "restaurant-beverage",
    title: "Smirnoff Minty Jamun golas promo",
    brandId: "smirnoff",
    uploadDate: "2026-08-28T22:26:59-07:00",
  },
  {
    id: "7qcdOLCXpOg",
    format: "short",
    category: "restaurant-beverage",
    title: "Johnnie Walker Blonde promo 01",
    brandId: "johnnie-walker",
    uploadDate: "2026-11-02T21:49:50-08:00",
  },
  {
    id: "rVMgKG0XHyc",
    format: "short",
    category: "restaurant-beverage",
    title: "Smirnoff Minty Jamun pani puri promo",
    brandId: "smirnoff",
    uploadDate: "2026-08-28T22:28:37-07:00",
  },
  {
    id: "wbR4IvgjhYE",
    format: "short",
    category: "restaurant-beverage",
    title: "Johnnie Walker Blonde promo 02",
    brandId: "johnnie-walker",
    uploadDate: "2026-11-02T21:50:37-08:00",
  },
  {
    id: "EQcCVUG0yqY",
    format: "short",
    category: "restaurant-beverage",
    title: "Black & White whisky promo",
    brandId: "black-white",
    uploadDate: "2026-08-28T22:25:17-07:00",
  },

  // Luxury and spiritual lifestyle
  {
    id: "mrXL3Uaj5Ms",
    format: "short",
    category: "luxury-spiritual-lifestyle",
    title: "Luxury lifestyle edit 01",
    uploadDate: "2026-11-04T22:35:23-08:00",
  },
  {
    id: "9RltP_ZSllQ",
    format: "short",
    category: "luxury-spiritual-lifestyle",
    title: "Kanchivaram filter coffee candle edit",
    uploadDate: "2026-11-02T21:58:10-08:00",
  },
  {
    id: "JpGMvSg6TKo",
    format: "short",
    category: "luxury-spiritual-lifestyle",
    title: "Sleep ritual box edit",
    uploadDate: "2026-11-02T21:56:57-08:00",
  },
  {
    id: "-ERgKcd_vMs",
    format: "short",
    category: "luxury-spiritual-lifestyle",
    title: "Filter coffee candle set edit",
    uploadDate: "2026-11-02T21:57:50-08:00",
  },
];
