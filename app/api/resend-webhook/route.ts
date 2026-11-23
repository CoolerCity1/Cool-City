import { createHmac, timingSafeEqual } from "node:crypto";
import { rpc } from "@/lib/supabase/rpc";

/** Resend-Webhooks (Svix-Signatur) aktualisieren den Zustellstatus in email_events. */
export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return new Response("Not configured", { status: 503 });

  const id = req.headers.get("svix-id");
  const ts = req.headers.get("svix-timestamp");
  const sigHeader = req.headers.get("svix-signature");
  const body = await req.text();
  if (!id || !ts || !sigHeader) return new Response("Bad request", { status: 400 });
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return new Response("Stale", { status: 400 });

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest();
  const valid = sigHeader.split(" ").some((part) => {
    const sig = part.split(",")[1];
    if (!sig) return false;
    const buf = Buffer.from(sig, "base64");
    return buf.length === expected.length && timingSafeEqual(buf, expected);
  });
  if (!valid) return new Response("Invalid signature", { status: 401 });

  const event = JSON.parse(body) as { type?: string; data?: { email_id?: string } };
  const map: Record<string, string> = { "email.delivered": "delivered", "email.bounced": "bounced", "email.complained": "complained", "email.failed": "failed", "email.sent": "sent" };
  const status = event.type ? map[event.type] : undefined;
  if (status && event.data?.email_id) {
    await rpc("update_email_status", { p_resend_id: event.data.email_id, p_status: status }, { secret: true });
  }
  return new Response("ok");
}
