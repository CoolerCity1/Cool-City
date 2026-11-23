import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import { PageHero, CtaBand } from "@/components/ui/Section";
import { LogoMark } from "@/components/layout/Logo";

export function CompanyPage({ locale, d }: { locale: Locale; d: Dictionary }) {
  const c = d.company;
  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} text={c.text} />
      <section className="pb-20 md:pb-28">
        <div className="wrap grid gap-4 md:grid-cols-3">
          {[c.vision, c.status, c.structure].map((b, i) => (
            <div key={b.title} className={`rounded-[1.5rem] p-8 ${i === 0 ? "bg-forest text-white" : "card"}`}>
              <h2 className={`text-h3 ${i === 0 ? "text-white" : ""}`}>{b.title}</h2>
              <p className={`mt-3 leading-relaxed ${i === 0 ? "text-white/85" : "text-slate-soft"}`}>{b.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-concrete py-20 md:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-h2">{c.values.title}</h2>
            <ul className="mt-10 space-y-6">
              {c.values.items.map((v) => (
                <li key={v.title} className="border-l-4 border-forest pl-5">
                  <h3 className="text-lg font-extrabold">{v.title}</h3>
                  <p className="mt-1 text-slate-soft">{v.text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="card flex flex-col items-start p-8 md:p-10">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-concrete" aria-hidden="true">
              <LogoMark className="h-14 w-14 opacity-40 grayscale" />
            </div>
            <h2 className="mt-6 text-h3">{c.founder.title}</h2>
            <p className="mt-2 text-slate-soft">{c.founder.text}</p>
            <Link href={href(locale, "contact")} className="link mt-6">{d.footer.contact}</Link>
          </div>
        </div>
      </section>
      <CtaBand title={d.home.final.title} primary={{ href: `${href(locale, "request")}?typ=municipality`, label: d.nav.cta }} secondary={{ href: href(locale, "contact"), label: d.footer.contact }} />
    </>
  );
}
