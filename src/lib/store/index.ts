/**
 * Storage for admin-managed content, briefs and uploaded logos.
 *
 * - Upstash Redis (REST) when UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN are set.
 *   Use this on Vercel and other serverless hosts, where the filesystem is read-only.
 * - Otherwise JSON files in ANX_DATA_DIR (default ./.data). Works on any Node host with a disk.
 */
import { fileDriver } from "./file";
import { redisDriver } from "./redis";

export { CONTENT_TAG } from "./types";
export type { Driver, Media } from "./types";
import type { Driver } from "./types";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const store: Driver = redisUrl && redisToken ? redisDriver(redisUrl, redisToken) : fileDriver();

/** On serverless hosts the file driver cannot persist anything, so the admin warns instead of failing silently. */
export const storageWarning =
  store.name === "file" && process.env.VERCEL
    ? "This host has a read-only filesystem. Connect Upstash Redis (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN) so changes and briefs are saved."
    : null;
