import type { Brief, Content } from "@/content/types";

export type Media = { type: string; data: Buffer };

export interface Driver {
  name: "redis" | "file";
  /** `cached` lets the public site serve the stored copy from the Next.js data cache. */
  readContent(cached: boolean): Promise<Content | null>;
  writeContent(content: Content): Promise<void>;
  listBriefs(): Promise<Brief[]>;
  addBrief(brief: Brief): Promise<void>;
  updateBrief(id: string, patch: Partial<Brief>): Promise<void>;
  deleteBrief(id: string): Promise<void>;
  putMedia(id: string, media: Media): Promise<void>;
  getMedia(id: string): Promise<Media | null>;
  deleteMedia(id: string): Promise<void>;
}

export const CONTENT_TAG = "anx-content";
