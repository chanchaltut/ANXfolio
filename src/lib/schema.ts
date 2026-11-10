import portrait from "@/assets/ayush/ayush-nayak-video-editor.webp";
import { services, site } from "@/content/site";
import type { Brand, Category, Faq, Video } from "@/content/types";
import { embedUrl, thumbnailUrl, watchUrl } from "./youtube";

const personId = () => `${site.url}/#person`;
const websiteId = () => `${site.url}/#website`;
const serviceId = () => `${site.url}/#service`;

export function videoObject(video: Video, brand?: Brand) {
  return {
    "@type": "VideoObject",
    "@id": `${site.url}/#video-${video.id}`,
    name: video.title,
    description: brand
      ? `${video.title}, edited by ${site.person} (ANX) for ${brand.name}.`
      : `${video.title}, edited by ${site.person} (ANX).`,
    thumbnailUrl: thumbnailUrl(video),
    uploadDate: video.uploadDate,
    embedUrl: embedUrl(video.id),
    url: watchUrl(video),
    creator: { "@id": personId() },
  };
}

type Meta = { description: string; sameAs: string[]; city?: string };

export function coreGraph(allBrands: Brand[], meta: Meta) {
  return [
    {
      "@type": "WebSite",
      "@id": websiteId(),
      url: site.url,
      name: `${site.person} (${site.name}) | ${site.jobTitle}`,
      description: meta.description,
      inLanguage: "en",
      publisher: { "@id": personId() },
    },
    {
      "@type": "Person",
      "@id": personId(),
      name: site.person,
      alternateName: ["ANX", "ANX Production"],
      jobTitle: site.jobTitle,
      image: `${site.url}${portrait.src}`,
      url: site.url,
      description: meta.description,
      sameAs: meta.sameAs,
      ...(meta.city ? { address: { "@type": "PostalAddress", addressLocality: meta.city } } : {}),
      knowsAbout: [
        "Video editing",
        "Short-form video",
        "Long-form video",
        "Brand promos",
        "Fashion films",
        "Colour grading",
        "UGC video",
        "Instagram Reels",
        "YouTube Shorts",
      ],
      brand: allBrands.map((b) => ({ "@type": "Brand", name: b.name })),
    },
    {
      "@type": "ProfessionalService",
      "@id": serviceId(),
      name: "ANX Video Editing",
      url: site.url,
      description: meta.description,
      founder: { "@id": personId() },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Video editing services",
        itemListElement: services.map((s) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: s.title, description: s.description },
        })),
      },
    },
  ];
}

export function faqGraph(faqs: Faq[]) {
  return {
    "@type": "FAQPage",
    "@id": `${site.url}/#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function videoListGraph(videos: Video[], brandOf: (id?: string) => Brand | undefined, id = "portfolio") {
  return {
    "@type": "ItemList",
    "@id": `${site.url}/#${id}`,
    name: "ANX video editing portfolio",
    numberOfItems: videos.length,
    itemListElement: videos.map((video, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: videoObject(video, brandOf(video.brandId)),
    })),
  };
}

export function breadcrumbGraph(category: Category) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Work", item: `${site.url}/#work` },
      { "@type": "ListItem", position: 3, name: category.label, item: `${site.url}/work/${category.slug}` },
    ],
  };
}

export function jsonLd(graph: unknown[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}
