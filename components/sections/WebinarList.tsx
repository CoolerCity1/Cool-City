import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { href, dateLocale, type Locale } from "@/lib/i18n/config";
import type { PublicWebinar } from "@/lib/content";

export function WebinarList({ locale, d, webinars, empty, compact = false }: { locale: Locale; d: Dictionary; webinars: PublicWebinar[]; empty: string; compact?: boolean }) {
  if (!webinars.length) return <p className="rounded-2xl border border-dashed border-line p-6 text-slate-soft">{empty}</p>;
  const fmt = new Intl.DateTimeFormat(dateLocale[locale], { weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZoneName: "short", timeZone: "Europe/Berlin" });
  return (
    <ul className="space-y-3">
      {webinars.map((w) => {
        const fmtLabel = d.webinars.formats[w.webinar_type].label;
        const full = w.seats_left === 0;
        const cancelled = w.status === "cancelled";
        return (
          <li key={w.id}>
            <Link href={href(locale, "webinars", w.id)} className="card group flex flex-col gap-3 p-6 transition-colors hover:border-forest md:flex-row md:items-center md:justify-between">
              <div>
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${w.webinar_type === "municipality" ? "bg-forest-soft text-forest" : "bg-water-soft text-water-dark"}`}>{fmtLabel}</span>
                  <span className="rounded-full bg-concrete px-2.5 py-1 text-xs font-bold uppercase">{w.locale}</span>
                  {cancelled && <span className="rounded-full bg-[#f6e3da] px-2.5 py-1 text-xs font-bold text-signal">{d.webinars.cancelled}</span>}
                  {!cancelled && full && <span className="rounded-full bg-concrete px-2.5 py-1 text-xs font-bold">{d.webinars.full}</span>}
                </p>
                <p className="mt-2 text-lg font-bold group-hover:text-forest">{w.title}</p>
                <p className="mt-1 text-slate-soft"><time dateTime={w.starts_at} suppressHydrationWarning>{fmt.format(new Date(w.starts_at))}</time> · {w.duration_minutes} {d.common.minutes}</p>
              </div>
              {!compact && !cancelled && !full && <span className="btn btn-primary shrink-0">{d.webinars.register}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
