import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "anx_admin";
const SESSION_DAYS = 14;

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

/** Changing ADMIN_PASSWORD changes the secret too, which signs everyone out. */
function secret() {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return process.env.ADMIN_SESSION_SECRET || createHash("sha256").update(`anx-session:${password}`).digest("hex");
}

const sign = (payload: string) => createHmac("sha256", secret()).update(`v1.${payload}`).digest("base64url");

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(input, expected!);
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [exp, mac] = token.split(".");
  if (!exp || !mac || Number(exp) < Date.now()) return false;
  return safeEqual(mac, sign(exp));
}

/** Call at the top of every admin page and every admin server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** Secure everywhere except plain-http localhost, where Safari would refuse to store the cookie. */
async function secureCookie() {
  const host = (await headers()).get("host") ?? "";
  return process.env.NODE_ENV === "production" && !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
}

export async function startSession() {
  const exp = String(Date.now() + SESSION_DAYS * 864e5);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: await secureCookie(),
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).set(COOKIE, "", { path: "/admin", maxAge: 0 });
}
