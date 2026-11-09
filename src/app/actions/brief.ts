"use server";

import { randomUUID } from "node:crypto";
import type { Brief } from "@/content/types";
import { getFreshContent } from "@/lib/content";
import { sendBriefEmail } from "@/lib/server/mail";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { store } from "@/lib/store";

export type BriefState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; message: string; fields?: Partial<Record<keyof Brief, string>> }
  /** Nothing could be stored or emailed, so the client falls back to the visitor's mail app. */
  | { status: "fallback"; email: string };

const LIMITS = { name: 120, email: 200, brand: 160, type: 80, plan: 80, link: 500, message: 5000 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function submitBrief(_prev: BriefState, form: FormData): Promise<BriefState> {
  const get = (key: keyof typeof LIMITS) => String(form.get(key) ?? "").trim().slice(0, LIMITS[key]);

  // Bots fill every field and submit instantly. People do neither.
  const startedAt = Number(form.get("started") ?? 0);
  if (String(form.get("website") ?? "") !== "" || (startedAt && Date.now() - startedAt < 2500)) {
    return { status: "sent" };
  }

  if (!rateLimit(`brief:${await clientIp()}`, 5, 10 * 60 * 1000)) {
    return { status: "error", message: "Too many briefs from this connection. Please try again in a few minutes." };
  }

  const brief: Brief = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name: get("name"),
    email: get("email"),
    brand: get("brand"),
    type: get("type"),
    plan: get("plan"),
    link: get("link"),
    message: get("message"),
  };

  const fields: Partial<Record<keyof Brief, string>> = {};
  if (!brief.name) fields.name = "Add your name.";
  if (!EMAIL.test(brief.email)) fields.email = "Add an email I can reply to.";
  if (brief.link && !/^https?:\/\/\S+$/i.test(brief.link)) fields.link = "Use a full link starting with https://";
  if (brief.message.length < 10) fields.message = "Tell me a little more about the project.";
  if (Object.keys(fields).length) return { status: "error", message: "Check the highlighted fields.", fields };

  let saved = false;
  try {
    await store.addBrief(brief);
    saved = true;
  } catch (error) {
    console.error("[brief] could not save", error);
  }

  let inbox = "";
  try {
    inbox = (await getFreshContent()).settings.email;
  } catch {
    // Settings unreachable. The email step is skipped and the saved brief still counts.
  }
  const emailed = await sendBriefEmail(brief, inbox);

  if (saved || emailed) return { status: "sent" };
  if (inbox) return { status: "fallback", email: inbox };
  return {
    status: "error",
    message: "The brief could not be delivered right now. Please try again shortly, or reach out on social.",
  };
}
