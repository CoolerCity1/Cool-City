import "server-only";
import { rpc } from "@/lib/supabase/rpc";
import { siteUrl } from "@/lib/site";
import { href, isLocale } from "@/lib/i18n/config";
import { gateEnabled } from "@/lib/gate";
import { postToX, xConfigured, xText } from "./x";
import { postToLinkedIn, linkedinConfigured } from "./linkedin";

type Job = { id: string; channel: "x" | "linkedin"; attempts: number; slug: string; locale: string; title: string; teaser: string | null };

export function socialAutopostActive(): { active: boolean; reason?: string } {
  if (process.env.SOCIAL_AUTOPOST !== "true") return { active: false, reason: "SOCIAL_AUTOPOST ist nicht auf true gesetzt" };
  if (gateEnabled()) return { active: false, reason: "Website ist noch passwortgeschützt" };
  return { active: true };
}

/** Arbeitet die Warteschlange ab. Läuft nach dem Veröffentlichen, per Admin-Button und täglich per Cron. */
export async function processSocialQueue(): Promise<{ processed: number; sent: number; skipped?: string }> {
  const state = socialAutopostActive();
  if (!state.active) return { processed: 0, sent: 0, skipped: state.reason };
  const jobs = await rpc<Job[]>("social_claim", { p_limit: 10 }, { secret: true });
  let sent = 0;
  for (const j of jobs) {
    const locale = isLocale(j.locale) ? j.locale : "de";
    const url = `${siteUrl}${href(locale, "insights", j.slug)}`;
    try {
      if (j.channel === "x") {
        if (!xConfigured()) {
          await rpc("social_complete", { p_id: j.id, p_ok: false, p_skip: true, p_error: "X-Zugangsdaten fehlen" }, { secret: true });
          continue;
        }
        const r = await postToX(xText(j.title, j.teaser, url));
        await rpc("social_complete", { p_id: j.id, p_ok: true, p_external_id: r.id }, { secret: true });
      } else {
        if (!linkedinConfigured()) {
          await rpc("social_complete", { p_id: j.id, p_ok: false, p_skip: true, p_error: "LinkedIn-Zugangsdaten fehlen" }, { secret: true });
          continue;
        }
        const r = await postToLinkedIn({ title: j.title, teaser: j.teaser, url });
        await rpc("social_complete", { p_id: j.id, p_ok: true, p_external_id: r.id }, { secret: true });
      }
      sent++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[social]", j.channel, msg);
      await rpc("social_complete", { p_id: j.id, p_ok: false, p_error: msg }, { secret: true }).catch(() => undefined);
    }
  }
  return { processed: jobs.length, sent };
}
