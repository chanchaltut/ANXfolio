import type { VideoFormat } from "@/content/types";
import { defaultThumb } from "@/lib/youtube";

export type Lookup =
  | { ok: true; title: string; uploadDate: string; thumb?: string; uploadDateGuessed: boolean }
  | { ok: false; message: string };

const TIMEOUT = 8000;

/**
 * Confirms a video is public and embeddable through YouTube's oEmbed endpoint, then reads the
 * upload date from the watch page (needed for Google's video rich results) and picks a thumbnail
 * that actually exists.
 */
export async function lookupYouTube(id: string, format: VideoFormat): Promise<Lookup> {
  const watch = `https://www.youtube.com/watch?v=${id}`;
  let title = "";
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (res.status === 401 || res.status === 403)
      return { ok: false, message: "This video has embedding turned off on YouTube, so it cannot play on the site." };
    if (!res.ok) return { ok: false, message: "YouTube could not find that video. Check it is public or unlisted, not private." };
    title = String(((await res.json()) as { title?: string }).title ?? "");
  } catch {
    return { ok: false, message: "Could not reach YouTube. Check the connection and try again." };
  }

  let uploadDate = "";
  try {
    const html = await (
      await fetch(watch, {
        cache: "no-store",
        headers: { "Accept-Language": "en", "User-Agent": "Mozilla/5.0 (compatible; ANX-Portfolio/1.0)" },
        signal: AbortSignal.timeout(TIMEOUT),
      })
    ).text();
    uploadDate =
      html.match(/"uploadDate":"([^"]+)"/)?.[1] ??
      html.match(/itemprop="uploadDate" content="([^"]+)"/)?.[1] ??
      html.match(/"publishDate":"([^"]+)"/)?.[1] ??
      "";
  } catch {
    // The date is optional for display. It falls back to today below.
  }

  const thumb = await pickThumb(id, format);
  return {
    ok: true,
    title,
    uploadDate: uploadDate || new Date().toISOString(),
    uploadDateGuessed: !uploadDate,
    thumb,
  };
}

/** Returns undefined when the format's default artwork exists, otherwise the best fallback. */
async function pickThumb(id: string, format: VideoFormat) {
  const candidates = [defaultThumb(format), "maxresdefault.jpg", "sddefault.jpg", "hqdefault.jpg"];
  for (const file of [...new Set(candidates)]) {
    try {
      const res = await fetch(`https://i.ytimg.com/vi/${id}/${file}`, {
        method: "HEAD",
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT),
      });
      if (res.ok) return file === defaultThumb(format) ? undefined : file;
    } catch {
      break;
    }
  }
  return "hqdefault.jpg";
}
