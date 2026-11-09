import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/** Search and AI answer engines are named explicitly so the portfolio can be cited. */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/media/"] },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: ["/admin", "/media/"] },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
