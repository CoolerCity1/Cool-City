import "server-only";
import { rpc } from "../supabase/rpc";

type Attachment = { filename: string; content: string; contentType?: string };
export type MailInput = {
  key: string; // Idempotency-Key, z. B. "lead-confirmation:<lead_id>"
  event: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  locale: string;
  template: string;
  contactId?: string | null;
  attachments?: Attachment[];
  replyTo?: string;
};

/**
 * Versand über die Resend-API. Jede Mail wird vorher in email_events reserviert (Idempotenz),
 * danach mit Status und Resend-ID aktualisiert. Fehler werden protokolliert, nie an Besucher durchgereicht.
 */
export async function sendMail(m: MailInput): Promise<{ ok: boolean; skipped?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { ok: false, skipped: "resend_not_configured" };

  let claimed = false;
  try {
    claimed = await rpc<boolean>(
      "claim_email",
      { p_key: m.key, p_event: m.event, p_recipient: m.to, p_template: m.template, p_locale: m.locale, p_contact: m.contactId ?? null },
      { secret: true },
    );
  } catch (e) {
    console.error("[mail] claim failed", m.event, (e as Error).message);
    return { ok: false, skipped: "claim_failed" };
  }
  if (!claimed) return { ok: true, skipped: "duplicate" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": m.key.slice(0, 256) },
      body: JSON.stringify({
        from,
        to: [m.to],
        subject: m.subject,
        html: m.html,
        text: m.text,
        reply_to: m.replyTo ?? process.env.EMAIL_REPLY_TO ?? undefined,
        attachments: m.attachments?.map((a) => ({ filename: a.filename, content: a.content, content_type: a.contentType })),
        tags: [{ name: "event", value: m.event.replace(/[^a-zA-Z0-9_-]/g, "_") }],
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      await rpc("complete_email", { p_key: m.key, p_status: "failed", p_resend_id: null, p_error: json.message ?? String(res.status) }, { secret: true });
      console.error("[mail] resend error", m.event, res.status);
      return { ok: false };
    }
    await rpc("complete_email", { p_key: m.key, p_status: "sent", p_resend_id: json.id ?? null, p_error: null }, { secret: true });
    return { ok: true };
  } catch (e) {
    await rpc("complete_email", { p_key: m.key, p_status: "failed", p_resend_id: null, p_error: (e as Error).message }, { secret: true }).catch(() => {});
    console.error("[mail] send exception", m.event);
    return { ok: false };
  }
}
