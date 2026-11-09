import { store } from "@/lib/store";

/** Serves logos uploaded in the admin. URLs carry a content hash, so they can be cached forever. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[\w-]{1,80}$/.test(id)) return new Response("Not found", { status: 404 });
  const media = await store.getMedia(id).catch(() => null);
  if (!media) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(media.data), {
    headers: {
      "Content-Type": media.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      // Uploaded SVGs are treated as images only. Scripts inside them can never run.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
