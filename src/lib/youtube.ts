import type { Video } from "@/content/types";

/** Accepts any YouTube URL form (watch, youtu.be, shorts, embed) or a bare ID. */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  const match = value.match(/(?:youtu\.be\/|\/shorts\/|\/embed\/|[?&]v=)([\w-]{11})/);
  return match ? match[1] : null;
}

export const defaultThumb = (format: Video["format"]) => (format === "short" ? "oar2.jpg" : "maxresdefault.jpg");

/** Portrait artwork for Shorts, widescreen for long form, unless the video stores its own fallback. */
export function thumbnailUrl(video: Pick<Video, "id" | "format" | "thumb">): string {
  return `https://i.ytimg.com/vi/${video.id}/${video.thumb ?? defaultThumb(video.format)}`;
}

export function watchUrl(video: Pick<Video, "id" | "format">): string {
  return video.format === "short"
    ? `https://www.youtube.com/shorts/${video.id}`
    : `https://www.youtube.com/watch?v=${video.id}`;
}

export function embedUrl(id: string, autoplay = false): string {
  const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1" });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}
