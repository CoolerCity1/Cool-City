import type { Dictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import { getPublishedFacts } from "@/lib/content";
import { PageHero, SectionHead, CtaBand, VizImage } from "@/components/ui/Section";
import { ModuleDiagram } from "@/components/sections/ModuleDiagram";
import { FactsGrid } from "@/components/sections/FactsGrid";
import { factLabels } from "./HomePage";

export async function SystemPage({ locale, d }: { locale: Locale; d: Dictionary }) {
  const s = d.system;
  const facts = await getPublishedFacts(locale);

  return (
    <>
      <PageHero eyebrow={s.hero.eyebrow} title={s.hero.title} text={s.hero.text} />

      {/* Systemfilm */}
      <section className="pb-20 md:pb-28">
        <div className="wrap">
          <figure className="overflow-hidden rounded-[1.75rem] bg-[#f3f4f2] shadow-[0_30px_80px_-40px_rgba(11,48,40,.45)]">
            <div className="relative aspect-video">
              <video className="absolute inset-0 h-full w-full object-cover" controls preload="none" poster="/media/coolbase-system-poster.jpg" playsInline>
                <source src="/media/coolbase-system.mp4" type="video/mp4" />
              </video>
              <span className="viz-label pointer-events-none absolute left-3 top-3">{s.film.label}</span>
            </div>
            <figcaption className="flex flex-col gap-1 border-t border-line bg-white px-6 py-5 md:flex-row md:items-center md:justify-between">
              <span className="font-extrabold">{s.film.title}</span>
              <span className="text-slate-soft">{s.film.text}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Aufbau */}
      <section className="bg-concrete py-20 md:py-28">
        <div className="wrap">
          <SectionHead eyebrow={s.layers.eyebrow} title={s.layers.title} text={s.layers.text} />
          <div className="mt-12">
            <ModuleDiagram hotspots={d.hotspots} conceptLabel={d.common.concept} />
          </div>
        </div>
      </section>

      {/* Datenblatt */}
      <section className="py-20 md:py-28" id="datenblatt">
        <div className="wrap">
          <SectionHead eyebrow={s.datasheet.eyebrow} title={s.datasheet.title} text={s.datasheet.text} />
          <div className="mt-12">
            <FactsGrid facts={facts} empty={s.datasheet.empty} labels={factLabels(locale)} verifiedLabel={s.datasheet.verified} />
          </div>
        </div>
      </section>

      {/* Wasser & Sensorik */}
      <section className="bg-forest-dark py-20 text-white md:py-28">
        <div className="wrap grid items-center gap-12 lg:grid-cols-2">
          <SectionHead eyebrow={s.water.eyebrow} title={s.water.title} text={s.water.text} light />
          <Dashboard d={d} />
        </div>
      </section>

      {/* Standort */}
      <section className="py-20 md:py-28">
        <div className="wrap">
          <SectionHead eyebrow={s.site.eyebrow} title={s.site.title} />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.site.items.map((it, i) => (
              <li key={it.title} className="card p-7">
                <span className="text-sm font-extrabold text-water">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg font-extrabold">{it.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-soft">{it.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pflanzen */}
      <section className="pb-20 md:pb-28">
        <div className="wrap grid items-center gap-10 lg:grid-cols-2">
          <VizImage name="plaza-closeup" alt={d.home.hero.videoAlt} label={d.common.visualization} sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/3] rounded-[1.5rem]" />
          <div>
            <SectionHead eyebrow={s.plants.eyebrow} title={s.plants.title} text={s.plants.text} />
            <div className="mt-8 rounded-2xl border border-line bg-white p-6">
              <h3 className="font-extrabold">{s.claims.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-soft">{s.claims.text}</p>
            </div>
          </div>
        </div>
      </section>

      <CtaBand title={s.cta.title} text={s.cta.text} primary={{ href: `${href(locale, "request")}?typ=municipality`, label: s.cta.button }} />
    </>
  );
}

function Dashboard({ d }: { d: Dictionary }) {
  const w = d.system.water;
  const rows = [
    { id: "CB-01", moisture: 62, level: 78, ok: true },
    { id: "CB-02", moisture: 55, level: 64, ok: true },
    { id: "CB-03", moisture: 41, level: 22, ok: false },
    { id: "CB-04", moisture: 58, level: 71, ok: true },
  ];
  return (
    <figure className="rounded-[1.5rem] bg-white p-5 text-slate shadow-2xl md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-extrabold">{w.dashboardTitle}</p>
        <span className="rounded-full bg-[#f6e3da] px-3 py-1 text-xs font-bold uppercase tracking-wide text-signal">{d.common.example}</span>
      </div>
      <table className="mt-5 w-full text-left text-sm">
        <caption className="sr-only">{w.dashboardTitle} – {d.common.example}</caption>
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <th scope="col" className="py-2 font-bold">{w.modules}</th>
            <th scope="col" className="py-2 font-bold">{w.moisture}</th>
            <th scope="col" className="py-2 font-bold">{w.level}</th>
            <th scope="col" className="py-2 font-bold">{w.status}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0">
              <th scope="row" className="py-3 font-bold">{r.id}</th>
              <td className="py-3">
                <Bar value={r.moisture} color="bg-forest" />
              </td>
              <td className="py-3">
                <Bar value={r.level} color={r.ok ? "bg-water" : "bg-signal"} />
              </td>
              <td className="py-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${r.ok ? "text-forest" : "text-signal"}`}>
                  <span className={`h-2 w-2 rounded-full ${r.ok ? "bg-forest" : "bg-signal"}`} />
                  {r.ok ? w.ok : w.refill}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-2 w-16 overflow-hidden rounded-full bg-concrete sm:w-24" aria-hidden="true">
        <span className={`block h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </span>
      <span className="tabular-nums">{value} %</span>
    </span>
  );
}
