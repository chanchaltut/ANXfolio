import type { Brief } from "@/content/types";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const mailConfigured = () => Boolean(process.env.RESEND_API_KEY);

/**
 * Sends the brief through Resend's HTTP API. Returns false instead of throwing, because the
 * brief is already saved to the inbox and the visitor should still see a success message.
 */
export async function sendBriefEmail(brief: Brief, to: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return false;
  const rows: [string, string][] = [
    ["Name", brief.name],
    ["Email", brief.email],
    ["Brand", brief.brand || "-"],
    ["Project", brief.type || "-"],
    ["Plan", brief.plan || "-"],
    ["Footage or references", brief.link || "-"],
  ];
  const text = [...rows.map(([k, v]) => `${k}: ${v}`), "", brief.message].join("\n");
  const html = `<table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:15px">${rows
    .map(([k, v]) => `<tr><td style="color:#667">${k}</td><td><b>${escapeHtml(v)}</b></td></tr>`)
    .join("")}</table><p style="font-family:system-ui,sans-serif;font-size:15px;white-space:pre-wrap">${escapeHtml(
    brief.message,
  )}</p>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || "ANX Portfolio <onboarding@resend.dev>",
        to: [to],
        reply_to: brief.email,
        subject: `New brief: ${brief.brand || brief.name}`,
        text,
        html,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[mail] Resend rejected the brief", res.status, await res.text());
    return res.ok;
  } catch (error) {
    console.error("[mail] send failed", error);
    return false;
  }
}
