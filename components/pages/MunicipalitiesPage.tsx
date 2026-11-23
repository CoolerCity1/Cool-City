import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import { isFactPublished } from "@/lib/content";
import { PageHero, SectionHead, CtaBand, Faq, VizImage } from "@/components/ui/Section";

export async function MunicipalitiesPage({ locale, d }: { locale: Locale; d: Dictionary }) {
  const m = d.municipalities;
  const price = await isFactPublished("price", locale);
  const requestHref = `${href(locale, "request")}?typ=municipality`;

  return (
    <>
      <PageHero eyebrow={m.hero.eyebrow} title={m.hero.title} text={m.hero.text}>
        <Link href={requestHref} className="btn btn-primary">{m.hero.primary}</Link>
        <Link href={href(locale, "webinars")} className="btn btn-secondary">{m.hero.secondary}</Link>
      </PageHero>

      <section className="pb-20 md:pb-28">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead eyebrow={m.useCases.eyebrow} title={m.useCases.title} />
            <ul className="mt-10 divide-y divide-line border-y border-line">
              {m.useCases.items.map((u) => (
                <li key={u.title} className="py-5">
                  <h3 className="text-lg font-extrabold">{u.title}</h3>
                  <p className="mt-1 text-slate-soft">{u.text}</p>
                </li>
              ))}
            </ul>
          </div>
          <VizImage name="plaza-overview" alt={d.home.hero.videoAlt} label={d.common.visualization} sizes="(min-width: 1024px) 58vw, 100vw" className="aspect-[4/3] rounded-[1.5rem] lg:col-span-7 lg:aspect-auto" />
        </div>
      </section>

      <section className="bg-concrete py-20 md:py-28">
        <div className="wrap">
          <SectionHead eyebrow={m.comparison.eyebrow} title={m.comparison.title} text={m.comparison.text} />
          <div className="mt-12 overflow-x-auto rounded-[1.5rem] border border-line bg-white">
            <table className="w-full min-w-[40rem] text-left">
              <thead>
                <tr className="border-b border-line">
                  {m.comparison.headers.map((h, i) => (
                    <th key={i} scope="col" className={`p-5 text-sm font-extrabold uppercase tracking-wide ${i === 1 ? "bg-forest text-white" : "text-muted"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {m.comparison.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-line last:border-0">
                    <th scope="row" className="p-5 font-extrabold">{row[0]}</th>
                    <td className="bg-forest-soft/50 p-5">{row[1]}</td>
                    <td className="p-5 text-slate-soft">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow={m.scope.eyebrow} title={m.scope.title} text={m.scope.text} />
            <ol className="mt-10 grid grid-cols-2 gap-3">
              {m.scope.items.map((s, i) => (
                <li key={s} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 font-bold">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-soft text-sm text-forest">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="self-end rounded-[1.5rem] bg-forest-dark p-8 text-white md:p-10">
            <p className="eyebrow eyebrow-light">{m.price.title}</p>
            {price ? (
              <>
                <p className="mt-5 text-[2.6rem] font-extrabold leading-none tracking-tight">{price}</p>
                <p className="mt-5 text-white/75">{m.price.note}</p>
              </>
            ) : (
              <p className="mt-5 text-lg leading-relaxed text-white/85">{m.price.pending}</p>
            )}
            <Link href={requestHref} className="btn btn-light mt-8">{m.hero.primary}</Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-20 md:py-28">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-h2">{m.faqTitle}</h2>
            <Link href={href(locale, "faq")} className="link mt-6 inline-block">{m.allFaq}</Link>
          </div>
          <div className="lg:col-span-8">
            <Faq items={d.faq.municipalities.items} />
          </div>
        </div>
      </section>

      <CtaBand title={m.cta.title} text={m.cta.text} primary={{ href: requestHref, label: m.cta.button }} secondary={{ href: href(locale, "webinars"), label: m.hero.secondary }} />
    </>
  );
}
