import { getWebinar } from "@/lib/content";
import { buildIcs } from "@/lib/ics";
import { siteUrl } from "@/lib/site";
import { href } from "@/lib/i18n/config";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const w = await getWebinar(id);
  if (!w) return new Response("Not found", { status: 404 });
  const ics = buildIcs({
    uid: `webinar-${w.id}`,
    title: w.title,
    description: w.description,
    start: w.starts_at,
    durationMinutes: w.duration_minutes,
    url: `${siteUrl}${href(w.locale, "webinars", w.id)}`,
    status: w.status === "cancelled" ? "CANCELLED" : "CONFIRMED",
  });
  return new Response(ics, {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="cool-city-webinar.ics"`, "Cache-Control": "public, max-age=300" },
  });
}
