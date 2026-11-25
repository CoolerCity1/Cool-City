import type { Dictionary } from "@/lib/i18n";
import { dateLocale, type Locale } from "@/lib/i18n/config";
import type { PublicEvent } from "@/lib/content";

/** Öffentliche Branchentermine (Messen, Kongresse, Ausstellungen) – Verweise auf Fremdveranstaltungen. */
export function EventList({ locale, d, events }: { locale: Locale; d: Dictionary; events: PublicEvent[] }) {
  const e = d.webinars.events;
  if (!events.length) {
    return <p className="rounded-[1.5rem] border border-dashed border-line p-8 text-lg text-slate-soft">{e.empty}</p>;
  }
  const fmt = new Intl.DateTimeFormat(dateLocale[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const day = (iso: string) => new Date(`${iso}T12:00:00Z`);
  let regions: Intl.DisplayNames | null = null;
  try {
    regions = new Intl.DisplayNames([dateLocale[locale]], { type: "region" });
  } catch {
    regions = null;
  }
  const range = (a: string, b: string) => (a === b ? fmt.format(day(a)) : fmt.formatRange(day(a), day(b)));

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {events.map((ev) => {
        const country = ev.country ? regions?.of(ev.country) ?? ev.country : "";
        return (
          <li key={ev.slug} className="card flex flex-col p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className={`rounded-full px-3 py-1 font-bold ${ev.category === "congress" ? "bg-water-soft text-water-dark" : ev.category === "exhibition" ? "bg-[#f1eee3] text-slate" : "bg-forest-soft text-forest"}`}>
                {e.categories[ev.category]}
              </span>
              <time dateTime={ev.starts} className="font-semibold text-slate">{range(ev.starts, ev.ends)}</time>
            </div>
            <h3 className="mt-4 text-h3">{ev.title}</h3>
            <p className="mt-1 font-semibold text-slate-soft">{[ev.city, country].filter(Boolean).join(", ")}</p>
            {ev.description && <p className="mt-3 leading-relaxed text-slate-soft">{ev.description}</p>}
            {ev.url && (
              <a href={ev.url} target="_blank" rel="noopener noreferrer" className="link mt-auto inline-flex min-h-11 items-center pt-5 text-sm">
                {e.website}
                <span className="sr-only"> ({ev.title}, {e.external})</span>
                <span aria-hidden="true"> ↗</span>
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
