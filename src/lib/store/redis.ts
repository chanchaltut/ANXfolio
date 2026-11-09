import type { Brief, Content } from "@/content/types";
import { CONTENT_TAG, type Driver, type Media } from "./types";

const KEYS = {
  content: "anx:content",
  briefs: "anx:briefs",
  media: (id: string) => `anx:media:${id}`,
};

/** Upstash Redis over its REST API, so no client library or TCP connection is needed. */
export function redisDriver(baseUrl: string, token: string): Driver {
  const url = baseUrl.replace(/\/$/, "");
  const headers = { Authorization: `Bearer ${token}` };

  const command = async <T>(...args: (string | number)[]): Promise<T> => {
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    const json = (await res.json()) as { result?: T; error?: string };
    if (!res.ok || json.error) throw new Error(`Redis ${args[0]} failed: ${json.error ?? res.status}`);
    return json.result as T;
  };

  const parse = <T>(raw: string | null): T | null => (raw ? (JSON.parse(raw) as T) : null);

  return {
    name: "redis",
    async readContent(cached) {
      if (!cached) return parse<Content>(await command<string | null>("GET", KEYS.content));
      // Tagged so a save in the admin can expire it with updateTag.
      const res = await fetch(`${url}/get/${encodeURIComponent(KEYS.content)}`, {
        headers,
        cache: "force-cache",
        next: { tags: [CONTENT_TAG] },
      });
      if (!res.ok) throw new Error(`Redis GET failed: ${res.status}`);
      return parse<Content>(((await res.json()) as { result: string | null }).result);
    },
    async writeContent(content) {
      await command("SET", KEYS.content, JSON.stringify(content));
    },
    async listBriefs() {
      const flat = (await command<string[] | null>("HGETALL", KEYS.briefs)) ?? [];
      const list: Brief[] = [];
      for (let i = 1; i < flat.length; i += 2) list.push(JSON.parse(flat[i]) as Brief);
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async addBrief(brief) {
      await command("HSET", KEYS.briefs, brief.id, JSON.stringify(brief));
    },
    async updateBrief(id, patch) {
      const current = parse<Brief>(await command<string | null>("HGET", KEYS.briefs, id));
      if (current) await command("HSET", KEYS.briefs, id, JSON.stringify({ ...current, ...patch, id }));
    },
    async deleteBrief(id) {
      await command("HDEL", KEYS.briefs, id);
    },
    async putMedia(id, media) {
      await command("SET", KEYS.media(id), JSON.stringify({ type: media.type, data: media.data.toString("base64") }));
    },
    async getMedia(id) {
      const stored = parse<{ type: string; data: string }>(await command<string | null>("GET", KEYS.media(id)));
      return stored ? ({ type: stored.type, data: Buffer.from(stored.data, "base64") } satisfies Media) : null;
    },
    async deleteMedia(id) {
      await command("DEL", KEYS.media(id));
    },
  };
}
