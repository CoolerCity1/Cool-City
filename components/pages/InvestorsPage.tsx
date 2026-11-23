import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { href, dateLocale, type Locale } from "@/lib/i18n/config";
import { PageHero, SectionHead, CtaBand, Faq } from "@/components/ui/Section";
import { UnitCalculator } from "@/components/sections/UnitCalculator";

export function InvestorsPage({ locale, d }: { locale: Locale; d: Dictionary }) {
  const v = d.investors;
  const deckHref = `${href(locale, "request")}?typ=investor`;
  return (
    <>
      <PageHero tone="forest" eyebrow={v.hero.eyebrow} title={v.hero.title} text={v.hero.text}>
        <Link href={deckHref} className="btn btn-light">{v.hero.primary}</Link>
        <Link href={`${deckHref}&src=call`} className="btn btn-ghost-light">{v.hero.secondary}</Link>
      </PageHero>

      <section className="py-20 md:py-28">
        <div className="wrap">
          <ol className="grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {v.sections.map((s, i) => (
              <li key={s.title} className="bg-white p-8">
                <span className="text-sm font-extrabold text-water">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="mt-3 text-h3">{s.title}</h2>
                <p className="mt-3 leading-relaxed text-slate-soft">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-concrete py-20 md:py-28" id="unit-economics">
        <div className="wrap">
          <SectionHead eyebrow={v.economics.eyebrow} title={v.economics.title} text={v.economics.text} />
          <div className="mt-12">
            <UnitCalculator labels={v.economics} numberLocale={dateLocale[locale]} />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="wrap grid gap-10 lg:grid-cols-3">
          <div className="card p-8">
            <h2 className="text-h3">{v.risks.title}</h2>
            <ul className="mt-5 space-y-3">
              {v.risks.items.map((r) => (
                <li key={r} className="flex gap-3 leading-relaxed text-slate-soft"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />{r}</li>
              ))}
            </ul>
          </div>
          <div className="card p-8">
            <h2 className="text-h3">{v.roadmap.title}</h2>
            <ol className="mt-5 space-y-4 border-l-2 border-forest-soft pl-5">
              {v.roadmap.items.map((r) => (
                <li key={r.phase}>
                  <p className="text-sm font-extrabold uppercase tracking-wide text-forest">{r.phase}</p>
                  <p className="text-slate-soft">{r.text}</p>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-sm text-muted">{v.roadmap.note}</p>
          </div>
          <div className="flex flex-col rounded-[1.25rem] bg-forest p-8 text-white">
            <h2 className="text-h3 text-white">{v.deck.title}</h2>
            <p className="mt-3 leading-relaxed text-white/85">{v.deck.text}</p>
            <h3 className="mt-8 font-extrabold">{v.team.title}</h3>
            <p className="mt-2 text-white/80">{v.team.text}</p>
            <Link href={deckHref} className="btn btn-light mt-auto self-start">{v.hero.primary}</Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-20 md:py-28">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <h2 className="text-h2 lg:col-span-4">{v.faqTitle}</h2>
          <div className="lg:col-span-8"><Faq items={d.faq.investors.items} /></div>
        </div>
      </section>

      <CtaBand title={v.hero.title} primary={{ href: deckHref, label: v.hero.primary }} secondary={{ href: `${deckHref}&src=call`, label: v.hero.secondary }} />
    </>
  );
}
