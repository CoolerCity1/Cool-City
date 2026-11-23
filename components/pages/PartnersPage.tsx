import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import { PageHero, SectionHead, CtaBand, Check } from "@/components/ui/Section";

export function PartnersPage({ locale, d }: { locale: Locale; d: Dictionary }) {
  const p = d.partners;
  const partnerHref = `${href(locale, "request")}?typ=partner`;
  return (
    <>
      <PageHero eyebrow={p.hero.eyebrow} title={p.hero.title} text={p.hero.text}>
        <Link href={partnerHref} className="btn btn-primary">{p.hero.primary}</Link>
      </PageHero>

      <section className="pb-20 md:pb-28">
        <div className="wrap">
          <SectionHead eyebrow={p.roles.eyebrow} title={p.roles.title} />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[p.roles.central, p.roles.local].map((r, i) => (
              <div key={r.title} className={`rounded-[1.5rem] p-8 md:p-10 ${i === 0 ? "bg-forest-dark text-white" : "card"}`}>
                <h3 className={`text-h3 ${i === 0 ? "text-white" : ""}`}>{r.title}</h3>
                <ul className="mt-6 space-y-3">
                  {r.items.map((it) => (
                    <li key={it} className="flex items-start gap-3 font-semibold"><Check className={`mt-0.5 h-5 w-5 ${i === 0 ? "text-[#9fd6bf]" : "text-forest"}`} />{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-concrete py-20 md:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow={p.requirements.eyebrow} title={p.requirements.title} />
            <ul className="mt-10 space-y-3">
              {p.requirements.items.map((r) => (
                <li key={r} className="flex items-start gap-3 rounded-2xl bg-white p-5 font-semibold"><Check className="mt-0.5 h-5 w-5 text-forest" />{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHead eyebrow={p.process.eyebrow} title={p.process.title} />
            <ol className="mt-10 space-y-3">
              {p.process.steps.map((s, i) => (
                <li key={s} className="flex items-center gap-4 rounded-2xl bg-white p-5 font-bold">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-white">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm leading-relaxed text-slate-soft">{p.note}</p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="wrap">
          <div className="card flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <div className="max-w-2xl">
              <h2 className="text-h3">{p.suppliers.title}</h2>
              <p className="mt-3 leading-relaxed text-slate-soft">{p.suppliers.text}</p>
            </div>
            <Link href={`${href(locale, "request")}?typ=supplier`} className="btn btn-secondary shrink-0">{p.suppliers.button}</Link>
          </div>
        </div>
      </section>

      <CtaBand title={p.hero.title} primary={{ href: partnerHref, label: p.hero.primary }} />
    </>
  );
}
