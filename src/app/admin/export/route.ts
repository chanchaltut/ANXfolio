import { getFreshContent } from "@/lib/content";
import { isAdmin } from "@/lib/server/auth";
import { store } from "@/lib/store";

/** Full backup of the site content and the inbox, as one JSON file. */
export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const [content, briefs] = await Promise.all([getFreshContent(), store.listBriefs().catch(() => [])]);
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), content, briefs }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="anx-backup-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
