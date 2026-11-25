import "server-only";
import { createHmac, randomBytes } from "node:crypto";

/** RFC 3986 Prozent-Kodierung, wie von OAuth 1.0a verlangt. */
const enc = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

export function xConfigured(): boolean {
  return !!(process.env.X_API_KEY && process.env.X_API_SECRET && process.env.X_ACCESS_TOKEN && process.env.X_ACCESS_TOKEN_SECRET);
}

/** Erstellt einen Post über die X API v2 (OAuth 1.0a User Context). */
export async function postToX(text: string): Promise<{ id: string }> {
  const url = "https://api.x.com/2/tweets";
  const oauth: Record<string, string> = {
    oauth_consumer_key: process.env.X_API_KEY!,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: process.env.X_ACCESS_TOKEN!,
    oauth_version: "1.0",
  };
  const paramString = Object.keys(oauth)
    .sort()
    .map((k) => `${enc(k)}=${enc(oauth[k])}`)
    .join("&");
  const base = ["POST", enc(url), enc(paramString)].join("&");
  const key = `${enc(process.env.X_API_SECRET!)}&${enc(process.env.X_ACCESS_TOKEN_SECRET!)}`;
  oauth.oauth_signature = createHmac("sha1", key).update(base).digest("base64");
  const header = "OAuth " + Object.keys(oauth).sort().map((k) => `${enc(k)}="${enc(oauth[k])}"`).join(", ");

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: header, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as { data?: { id?: string }; detail?: string; title?: string };
  if (!res.ok || !body.data?.id) throw new Error(`X ${res.status}: ${body.detail ?? body.title ?? res.statusText}`);
  return { id: body.data.id };
}

/** Text für X: Titel, wenn Platz ist Teaser, dann Link (Links zählen bei X pauschal 23 Zeichen). */
export function xText(title: string, teaser: string | null, url: string): string {
  const LINK = 23;
  const budget = 280 - LINK - 2;
  const t = title.length > budget ? `${title.slice(0, budget - 1)}…` : title;
  let text = t;
  if (teaser) {
    const room = budget - t.length - 2;
    if (room > 40) text = `${t}\n\n${teaser.length > room ? `${teaser.slice(0, room - 1)}…` : teaser}`;
  }
  return `${text}\n\n${url}`;
}
