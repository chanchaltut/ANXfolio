import type { Brand, Faq, PricingTier, Service, Settings, Testimonial } from "./types";

/** Fixed identity. Everything that changes over time lives in Settings and is edited in the admin. */
export const site = {
  name: "ANX",
  person: "Ayush Nayak",
  jobTitle: "Video Editor",
  tagline: "Every frame earns the next.",
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  ).replace(/\/$/, ""),
};

export const seedSettings: Settings = {
  email: "",
  totalViews: "45M+",
  topVideoViews: "40M+",
  topVideoLabel: "on a single American Tourister reel",
  city: "",
  socials: {
    instagram: "",
    youtube: "https://www.youtube.com/@Anx.Production",
    linkedin: "",
    behance: "",
    x: "",
  },
  /** Bright thumbnails for the hero wall. Dark frames make the ANX letters hard to read. */
  heroWall: [
    "EQcCVUG0yqY", "-ERgKcd_vMs", "C4qUAkBf1Mo", "IwUi-7fm8lA", "AyFbZZNbOEU", "Ct68CD8aohs",
    "mrXL3Uaj5Ms", "wbR4IvgjhYE", "MFCIZHKOPKw", "LNp7c_0bB6c", "q01dt3uT9eo", "IE98guOIyFM",
    "Rb0oOPMf_ww", "YNTZkkoSYns", "shyBsW9wE_s", "2VqZIGtrMho", "YUETzoTPXiU", "9RltP_ZSllQ",
  ],
};

export function describe(settings: Settings) {
  const reach = settings.totalViews ? `, with ${settings.totalViews} views across Instagram` : "";
  return `${site.person} (ANX) is a video editor for brands and creators, cutting brand promos, fashion films, jewellery, food and beverage reels and long-form stories${reach}.`;
}

/** Profile links for the Person schema and the footer. Empty entries are skipped. */
export function profileLinks(settings: Settings) {
  const labels: Record<keyof Settings["socials"], string> = {
    instagram: "Instagram",
    youtube: "YouTube",
    linkedin: "LinkedIn",
    behance: "Behance",
    x: "X",
  };
  return (Object.keys(labels) as (keyof Settings["socials"])[])
    .filter((key) => settings.socials[key])
    .map((key) => ({ key, label: labels[key], href: settings.socials[key] }));
}

export const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Testimonial", href: "#testimonial" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const manifesto =
  "Nobody owes your video their attention. So every cut has a job: hold the eye, move the story, and make the last second worth the first.";

export const services: Service[] = [
  {
    title: "Brand Promos",
    description: "Collaborations and product launches, cut so the message lands before the thumb moves.",
    categorySlug: "brand-promos",
    thumbnailId: "MFCIZHKOPKw",
  },
  {
    title: "Fashion Films",
    description: "Cinematic pacing and luxury visuals for labels, models and campaigns.",
    categorySlug: "fashion-films",
    thumbnailId: "pdQ4ykWxGG0",
  },
  {
    title: "Food & Beverage",
    description: "Restaurant, bar and drinks promos with rhythm you can almost taste.",
    categorySlug: "restaurant-beverage",
    thumbnailId: "7qcdOLCXpOg",
  },
  {
    title: "Jewellery & Luxury",
    description: "Slow, precise edits that let detail, texture and craft do the selling.",
    categorySlug: "jewellery-promotions",
    thumbnailId: "C4qUAkBf1Mo",
  },
  {
    title: "Long-Form Storytelling",
    description: "Narrative editing and pacing for vlogs and stories that run longer than a reel.",
    categorySlug: "long-form",
    thumbnailId: "10F6dxnZoZc",
  },
  {
    title: "Colour Grading & UGC",
    description: "Finishing looks and creator-style edits that feel native to the feed.",
    thumbnailId: "mrXL3Uaj5Ms",
  },
];

/** Drafts until real client quotes arrive. Drafts are hidden on the site. */
export const seedTestimonials: Testimonial[] = [
  {
    id: "draft-1",
    quote: "Client quote goes here: the brief, what changed after the edit, and why they would work together again.",
    author: "Client name",
    role: "Role, Brand",
    placeholder: true,
  },
  {
    id: "draft-2",
    quote: "Client quote goes here: how the process felt, how fast feedback moved, and what the audience did next.",
    author: "Client name",
    role: "Role, Brand",
    placeholder: true,
  },
  {
    id: "draft-3",
    quote: "Client quote goes here: a specific result, a number if there is one, and a line for the next brand reading.",
    author: "Client name",
    role: "Role, Brand",
    placeholder: true,
  },
];

/** Tiers describe scope only. Add real rates to `price` when they are confirmed. */
export const seedPricing: PricingTier[] = [
  {
    id: "single",
    name: "Single Cut",
    summary: "One reel or short, start to finish.",
    price: "Quote on brief",
    features: ["Vertical edit for Reels and Shorts", "Pacing, sound design and captions", "Colour pass included", "Revision round before delivery"],
  },
  {
    id: "retainer",
    name: "Monthly Editor",
    summary: "An ongoing editor for brands that post constantly.",
    price: "Quote on brief",
    features: ["Regular reels on a set schedule", "A consistent look across your feed", "Priority on your edits", "Format versions for each platform"],
    highlighted: true,
    badge: "Best for steady posting",
  },
  {
    id: "campaign",
    name: "Campaign & Long Form",
    summary: "Launches, fashion films and longer stories.",
    price: "Quote on brief",
    features: ["Long-form story edit", "Cut-downs for social", "Full colour grade", "Direct collaboration on the narrative"],
  },
];

export function buildFaqs(settings: Settings, brands: Brand[]): Faq[] {
  const reach = settings.totalViews ? `, with ${settings.totalViews} views across Instagram` : "";
  const brandList = brands.map((b) => b.name);
  const brandText =
    brandList.length > 1 ? `${brandList.slice(0, -1).join(", ")} and ${brandList[brandList.length - 1]}` : brandList[0];
  const channel = settings.socials.youtube.replace(/^https?:\/\/(www\.)?/, "");
  return [
    {
      question: "Who is Ayush Nayak?",
      answer: `Ayush Nayak is a video editor who works under the name ANX, with work published on the ANX Production YouTube channel. The portfolio spans brand promos, fashion films, jewellery, food and beverage reels, luxury lifestyle edits and long-form stories${reach}.`,
    },
    {
      question: "What kinds of videos does ANX edit?",
      answer:
        "ANX edits vertical short-form video and long-form video. Short-form genres include brand promos, fashion films, jewellery promotions, restaurant and beverage promos, and luxury and spiritual lifestyle content. Colour grading and UGC edits are also available.",
    },
    ...(brandText
      ? [{ question: "Which brands has ANX edited videos for?", answer: `The ANX portfolio includes videos for ${brandText}.` }]
      : []),
    ...(settings.totalViews
      ? [
          {
            question: "How many views have ANX edits received?",
            answer: `ANX edits have earned ${settings.totalViews} views across Instagram.${
              settings.topVideoViews ? ` Top result: ${settings.topVideoViews} views ${settings.topVideoLabel}.` : ""
            }`,
          },
        ]
      : []),
    {
      question: "How much does it cost to hire ANX as a video editor?",
      answer:
        "Pricing is quoted per project, based on the length of the video, the amount of footage and how many edits are needed. Send a brief through the contact form to get a quote.",
    },
    {
      question: "Can ANX edit both reels and long-form videos?",
      answer:
        "Yes. ANX edits vertical reels and shorts as well as long-form video, and can cut a long-form piece down into social clips for the same campaign.",
    },
    {
      question: "Where can I watch more of the work?",
      answer: `Every video on this site is embedded from the ANX Production YouTube channel${
        channel ? ` at ${channel}` : ""
      }, and the work is grouped by genre on this site.`,
    },
    {
      question: "How do I hire ANX?",
      answer:
        "Fill in the contact form with your brand, the type of video and a link to your footage or references. Mention the deadline if you have one.",
    },
  ];
}
