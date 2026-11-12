import { phoneLinks, services, site } from "@/content/site";
import { getBrands, getLiveCategories, getSiteMeta, getVideos } from "@/lib/content";
import { watchUrl } from "@/lib/youtube";

export const dynamic = "force-static";

/** Plain-text summary for AI answer engines. Generated from the same content as the site. */
export async function GET() {
  const [categories, videos, brands, meta] = await Promise.all([getLiveCategories(), getVideos(), getBrands(), getSiteMeta()]);
  const { settings, faqs, links } = meta;
  const phone = phoneLinks(settings.phone);

  const body = [
    `# ${site.person} (ANX)`,
    "",
    `> ${meta.description}`,
    "",
    "## Key facts",
    `- Name: ${site.person}, also known as ANX`,
    `- Role: ${site.jobTitle}`,
    ...(settings.totalViews ? [`- Total reach: ${settings.totalViews} views across Instagram`] : []),
    ...(settings.topVideoViews ? [`- Most-viewed edit: ${settings.topVideoViews} views ${settings.topVideoLabel}`] : []),
    ...(settings.city ? [`- Based in: ${settings.city}`] : []),
    `- Website: ${site.url}`,
    ...(settings.email ? [`- Contact email: ${settings.email}`] : []),
    `- Brands in the portfolio: ${brands.map((b) => b.name).join(", ")}`,
    ...links.map((l) => `- ${l.label}: ${l.href}`),
    "",
    "## Services",
    ...services.map((s) => `- ${s.title}: ${s.description}`),
    "",
    "## Portfolio by genre",
    ...categories.flatMap((category) => [
      `### [${category.label}](${site.url}/work/${category.slug})`,
      category.blurb,
      ...videos
        .filter((v) => v.category === category.slug)
        .map((v) => `- [${v.title}](${watchUrl(v)})${v.views ? `: ${v.views} views on ${v.viewsSource}` : ""}`),
      "",
    ]),
    "## Hire or contact",
    `- Send a brief: ${site.url}/#contact`,
    ...(settings.email ? [`- Email: ${settings.email}`] : []),
    ...(phone ? [`- Phone: ${phone.display}`, `- WhatsApp: ${phone.whatsapp}`] : []),
    "",
    "## FAQ",
    ...faqs.flatMap((f) => [`### ${f.question}`, f.answer, ""]),
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
