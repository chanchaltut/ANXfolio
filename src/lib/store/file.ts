import { promises as fs } from "node:fs";
import path from "node:path";
import type { Brief, Content } from "@/content/types";
import type { Driver, Media } from "./types";

const MAX_BRIEFS = 1000;

/** JSON files on disk. Writes go through one queue and land atomically, so a crash never leaves half a file. */
export function fileDriver(): Driver {
  // The data folder is runtime state, not source, so it is kept out of build file tracing.
  const dir = process.env.ANX_DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), ".data");
  const file = (name: string) => path.join(/*turbopackIgnore: true*/ dir, name);
  let queue: Promise<unknown> = Promise.resolve();

  const serial = <T>(task: () => Promise<T>): Promise<T> => {
    const next = queue.then(task, task);
    queue = next.catch(() => undefined);
    return next;
  };

  const readJson = async <T>(name: string): Promise<T | null> => {
    try {
      return JSON.parse(await fs.readFile(file(name), "utf8")) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  };

  const writeJson = async (name: string, value: unknown) => {
    const target = file(name);
    await fs.mkdir(path.dirname(target), { recursive: true });
    const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(value, null, 2));
    await fs.rename(tmp, target);
  };

  const briefs = async () => (await readJson<Brief[]>("briefs.json")) ?? [];
  const mediaName = (id: string) => `media/${id.replace(/[^\w-]/g, "")}.json`;

  return {
    name: "file",
    readContent: () => readJson<Content>("content.json"),
    writeContent: (content) => serial(() => writeJson("content.json", content)),
    listBriefs: briefs,
    addBrief: (brief) => serial(async () => writeJson("briefs.json", [brief, ...(await briefs())].slice(0, MAX_BRIEFS))),
    updateBrief: (id, patch) =>
      serial(async () => writeJson("briefs.json", (await briefs()).map((b) => (b.id === id ? { ...b, ...patch, id } : b)))),
    deleteBrief: (id) => serial(async () => writeJson("briefs.json", (await briefs()).filter((b) => b.id !== id))),
    putMedia: (id, media) =>
      serial(() => writeJson(mediaName(id), { type: media.type, data: media.data.toString("base64") })),
    getMedia: async (id) => {
      const stored = await readJson<{ type: string; data: string }>(mediaName(id));
      return stored ? ({ type: stored.type, data: Buffer.from(stored.data, "base64") } satisfies Media) : null;
    },
    deleteMedia: (id) =>
      serial(async () => {
        await fs.rm(file(mediaName(id)), { force: true });
      }),
  };
}
