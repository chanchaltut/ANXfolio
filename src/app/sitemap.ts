import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import type { Video } from "@/content/types";
import { getLiveCategories, getVideos } from "@/lib/content";
import { thumbnailUrl } from "@/lib/youtube";

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const newest = (videos: Video[]) =>
  videos.reduce((latest, v) => (v.uploadDate > latest ? v.uploadDate : latest), videos[0]?.uploadDate ?? "");

const videoEntry = (video: Video) => ({
  title: escapeXml(video.title),
  thumbnail_loc: thumbnailUrl(video),
  description: escapeXml(`${video.title}, edited by ${site.person} (ANX).`),
  player_loc: `https://www.youtube-nocookie.com/embed/${video.id}`,
  publication_date: video.uploadDate,
});

/** Rebuilt whenever the admin saves, through revalidatePath on the root layout. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, videos] = await Promise.all([getLiveCategories(), getVideos()]);
  return [
    { url: site.url, lastModified: newest(videos), changeFrequency: "weekly", priority: 1 },
    ...categories.map((category) => {
      const own = videos.filter((v) => v.category === category.slug);
      return {
        url: `${site.url}/work/${category.slug}`,
        lastModified: newest(own),
        changeFrequency: "monthly" as const,
        priority: 0.8,
        videos: own.map(videoEntry),
      };
    }),
  ];
}
