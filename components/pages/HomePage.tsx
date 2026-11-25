import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { href, dateLocale, type Locale } from "@/lib/i18n/config";
import { getArticles, getPublishedFacts, getWebinars } from "@/lib/content";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { ModuleDiagram } from "@/components/sections/ModuleDiagram";
import { SectionHead, VizImage, CtaBand, Check } from "@/components/ui/Section";
import { FactsGrid } from "@/components/sections/FactsGrid";
import { WebinarList } from "@/components/sections/WebinarList";

const benefitIcons = [
  <path key="a" d="M4 20h16M7 20V9l5-5 5 5v11M10 20v-5h4v5" />,
  <path key="b" d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />,
  <path key="c" d="M4 19V5m0 14h16M8 15l3-4 3 2 5-6" />,
];

export async function HomePage({ locale, d }: { locale: Locale; d: Dictionary }) {
  const h = d.home;
  const [facts, articles, webinars] = await Promise.all([getPublishedFacts(locale), getArticles(locale, 3), getWebinars()]);
  const requestHref = `${href(locale, "request")}?typ=municipality`;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate -mt-px overflow-hidden bg-forest-dark text-white">
        <div className="absolute inset-0 -z-10">
          <HeroVideo label={d.common.visualization} alt={h.hero.videoAlt} pauseLabel={h.hero.pause} playLabel={h.hero.play} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,48,40,.92)_0%,rgba(11,48,40,.72)_42%,rgba(11,48,40,.12)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-forest-dark/70 to-transparent" />
        </div>
        <div className="wrap flex min-h-[calc(100svh-4.5rem)] flex-col justify-center py-24 md:min-h-[44rem]">
          <p className="eyebrow eyebrow-light">{h.hero.eyebrow}</p>
          <h1 className="mt-6 max-w-4xl text-display font-extrabold text-white">{h.hero.title}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">{h.hero.subline}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={requestHref} className="btn btn-light">{h.hero.primary}</Link>
            <Link href={href(locale, "system")} className="btn btn-ghost-light">{h.hero.secondary}</Link>
          </div>
        </div>
      </section>

      {/* Problem & Lösung */}
      <section className="py-20 md:py-28">
        <div className="wrap">
          <SectionHead eyebrow={h.problem.eyebrow} title={h.problem.title} text={h.problem.text} />
          <ul className="mt-14 grid gap-4 md:grid-cols-3">
            {h.problem.benefits.map((b, i) => (
              <li key={b.title} className="card p-7 md:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-soft text-forest">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{benefitIcons[i]}</svg>
                </span>
                <h3 className="mt-6 text-h3">{b.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-soft">{b.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Visualisierungen */}
      <section className="pb-20 md:pb-28" aria-label={d.common.visualization}>
        <div className="wrap grid gap-4 md:grid-cols-5">
          <VizImage name="plaza-overview" alt={h.hero.videoAlt} label={d.common.visualization} sizes="(min-width: 768px) 60vw, 100vw" className="aspect-[16/10] rounded-[1.5rem] md:col-span-3" />
          <VizImage name="plaza-closeup" alt={h.hero.videoAlt} label={d.common.visualization} sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[16/10] rounded-[1.5rem] md:col-span-2 md:aspect-auto" />
        </div>
      </section>

      {/* Ablauf */}
      <section className="bg-concrete py-20 md:py-28">
        <div className="wrap">
          <SectionHead eyebrow={h.process.eyebrow} title={h.process.title} />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line md:grid-cols-5">
            {h.process.steps.map((s, i) => (
              <li key={s.title} className="relative bg-white p-7">
                <span className="text-5xl font-extrabold tracking-tight text-forest/15" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-lg font-extrabold">
                  <span className="sr-only">{i + 1}. </span>
                  {s.title}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-slate-soft">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Modul */}
      <section className="py-20 md:py-28">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHead eyebrow={h.module.eyebrow} title={h.module.title} text={h.module.text} />
            <Link href={href(locale, "system")} className="btn btn-secondary shrink-0">{h.module.cta}</Link>
          </div>
          <div className="mt-12">
            <ModuleDiagram hotspots={d.hotspots} conceptLabel={d.common.concept} />
          </div>
        </div>
      </section>

      {/* Zielgruppen */}
      <section className="bg-concrete py-20 md:py-28">
        <div className="wrap">
          <SectionHead eyebrow={h.audiences.eyebrow} title={h.audiences.title} />
          <div className="mt-14 grid gap-4 lg:grid-cols-12">
            <AudienceCard featured className="lg:col-span-6 lg:row-span-2" data={h.audiences.municipalities} primary={requestHref} secondary={href(locale, "system")} />
            <AudienceCard className="lg:col-span-6" data={h.audiences.investors} primary={`${href(locale, "request")}?typ=investor`} secondary={href(locale, "investors")} />
            <AudienceCard className="lg:col-span-6" data={h.audiences.partners} primary={`${href(locale, "request")}?typ=partner`} secondary={href(locale, "partners")} />
          </div>
        </div>
      </section>

      {/* Fakten */}
      <section className="py-20 md:py-28">
        <div className="wrap">
          <SectionHead eyebrow={h.facts.eyebrow} title={h.facts.title} />
          <div className="mt-12">
            <FactsGrid facts={facts} empty={h.facts.empty} labels={factLabels(locale)} />
          </div>
        </div>
      </section>

      {/* Insights & Webinare */}
      <section className="border-t border-line py-20 md:py-28">
        <div className="wrap">
          <SectionHead eyebrow={h.insights.eyebrow} title={h.insights.title} />
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <div>
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-h3">{h.insights.articles}</h3>
                <Link href={href(locale, "insights")} className="link text-sm">{h.insights.allArticles}</Link>
              </div>
              {articles.length ? (
                <ul className="mt-6 divide-y divide-line border-y border-line">
                  {articles.map((a) => (
                    <li key={a.id}>
                      <Link href={href(locale, "insights", a.slug)} className="group block py-5">
                        {a.published_at && <p className="text-sm text-muted">{new Intl.DateTimeFormat(dateLocale[locale], { dateStyle: "long" }).format(new Date(a.published_at))}</p>}
                        <p className="mt-1 text-lg font-bold group-hover:text-forest">{a.title}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 rounded-2xl border border-dashed border-line p-6 text-slate-soft">{h.insights.emptyArticles}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-h3">{h.insights.webinars}</h3>
                <Link href={href(locale, "webinars")} className="link text-sm">{h.insights.allWebinars}</Link>
              </div>
              <div className="mt-6">
                <WebinarList locale={locale} d={d} webinars={webinars.slice(0, 2)} empty={h.insights.emptyWebinars} compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand title={h.final.title} primary={{ href: requestHref, label: h.final.cta }} secondary={{ href: href(locale, "contact"), label: h.final.secondary }} />
    </>
  );
}

function AudienceCard({ data, primary, secondary, featured = false, className = "" }: { data: { title: string; text: string; benefits: string[]; primary: string; secondary: string }; primary: string; secondary: string; featured?: boolean; className?: string }) {
  return (
    <article className={`flex flex-col rounded-[1.5rem] p-8 md:p-10 ${featured ? "bg-forest text-white" : "card"} ${className}`}>
      <h3 className={`font-extrabold tracking-tight ${featured ? "text-h2 text-white" : "text-h3"}`}>{data.title}</h3>
      <p className={`mt-4 max-w-xl text-lg leading-relaxed ${featured ? "text-white/85" : "text-slate-soft"}`}>{data.text}</p>
      <ul className="mt-6 space-y-3">
        {data.benefits.map((b) => (
          <li key={b} className={`flex items-start gap-3 font-semibold ${featured ? "text-white" : "text-slate"}`}>
            <Check className={`mt-0.5 h-5 w-5 ${featured ? "text-[#9fd6bf]" : "text-forest"}`} />
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap gap-3 pt-9">
        <Link href={primary} className={`btn ${featured ? "btn-light" : "btn-primary"}`}>{data.primary}</Link>
        <Link href={secondary} className={`btn ${featured ? "btn-ghost-light" : "btn-secondary"}`}>{data.secondary}</Link>
      </div>
    </article>
  );
}

export function factLabels(locale: Locale): Record<string, string> {
  const labels: Record<Locale, Record<string, string>> = {
    de: { footprint: "Stellfläche", height: "Höhe", water_tank: "Wassertank", weight: "Gewicht gefüllt", season: "Saison", price: "Richtpreis" },
    en: { footprint: "Footprint", height: "Height", water_tank: "Water tank", weight: "Weight when full", season: "Season", price: "Guide price" },
    es: { footprint: "Superficie", height: "Altura", water_tank: "Depósito de agua", weight: "Peso lleno", season: "Temporada", price: "Precio orientativo" },
    it: { footprint: "Ingombro", height: "Altezza", water_tank: "Serbatoio", weight: "Peso a pieno carico", season: "Stagione", price: "Prezzo indicativo" },
    fr: { footprint: "Emprise", height: "Hauteur", water_tank: "Réserve d'eau", weight: "Poids rempli", season: "Saison", price: "Prix indicatif" },
    pt: { footprint: "Área ocupada", height: "Altura", water_tank: "Depósito de água", weight: "Peso cheio", season: "Época", price: "Preço indicativo" },
  };
  return labels[locale];
}
