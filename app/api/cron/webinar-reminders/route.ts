import { rpc } from "@/lib/supabase/rpc";
import { sendMail } from "@/lib/email/send";
import { webinarConfirmation } from "@/lib/email/templates";
import { siteUrl } from "@/lib/site";
import { href, isLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

type Due = { registration_id: string; cancel_token: string; email: string; first_name: string | null; locale: string; webinar_id: string; title: string; starts_at: string; duration_minutes: number; meeting_url: string | null };

/** Täglich per Vercel Cron: Erinnerung an alle Anmeldungen, deren Webinar in den nächsten 30 Stunden beginnt.
 *  Doppelversand ist über den Idempotency-Key "webinar-reminder:<registration_id>" ausgeschlossen. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });

  const due = await rpc<Due[]>("due_webinar_reminders", { p_hours: 30 }, { secret: true });
  let sent = 0;
  for (const r of due) {
    const locale = isLocale(r.locale) ? r.locale : "de";
    const cancelUrl = `${siteUrl}${href(locale, "webinarCancel")}?token=${r.cancel_token}`;
    const mail = webinarConfirmation(locale, r.first_name, { title: r.title, starts_at: r.starts_at }, cancelUrl, true, r.meeting_url);
    const res = await sendMail({ key: `webinar-reminder:${r.registration_id}`, event: "webinar_reminder", to: r.email, ...mail, locale, template: "webinar_reminder" });
    if (res.ok && !res.skipped) sent++;
  }
  return Response.json({ due: due.length, sent });
}
