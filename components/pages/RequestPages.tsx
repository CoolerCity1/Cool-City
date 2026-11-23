import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import { company } from "@/lib/site";
import { MunicipalityForm } from "@/components/forms/MunicipalityForm";
import { LeadForm } from "@/components/forms/LeadForm";

const aliases: Record<string, "municipality" | "investor" | "partner" | "supplier"> = {
  municipality: "municipality", kommune: "municipality", investor: "investor", investoren: "investor",
  partner: "partner", supplier: "supplier", lieferant: "supplier",
};

export function RequestPage({ locale, d, type, source }: { locale: Locale; d: Dictionary; type?: string; source?: string }) {
  const active = aliases[type ?? ""] ?? "municipality";
  const base = href(locale, "request");
  const privacyHref = href(locale, "privacy");
  const ts = Date.now();
  const tabs = (["municipality", "investor", "partner", "supplier"] as const).map((t) => ({ t, label: d.request.tabs[t] }));
  const aside =
    active === "investor" ? d.investors.deck : active === "partner" ? { title: d.partners.hero.title, text: d.partners.note } : active === "supplier" ? d.partners.suppliers : { title: d.municipalities.hero.title, text: d.municipalities.cta.text };

  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 grid-lines opacity-60" aria-hidden="true" />
      <div className="wrap relative grid gap-12 py-14 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">{d.request.eyebrow}</p>
          <h1 className="mt-4 text-h1">{d.request.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-soft">{d.request.text}</p>
          <div className="mt-10 rounded-2xl bg-forest-dark p-6 text-white">
            <p className="text-lg font-extrabold">{aside.title}</p>
            <p className="mt-2 text-white/80">{aside.text}</p>
          </div>
        </div>
        <div className="lg:col-span-8">
          <nav aria-label={d.request.eyebrow} className="-mx-1 mb-8 flex gap-1 overflow-x-auto rounded-full border border-line bg-white p-1">
            {tabs.map(({ t, label }) => (
              <Link
                key={t}
                href={`${base}?typ=${t}`}
                scroll={false}
                aria-current={t === active ? "page" : undefined}
                className={`flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm font-bold transition-colors ${t === active ? "bg-forest text-white" : "text-slate hover:bg-concrete"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="card p-6 md:p-10">
            {active === "municipality" ? (
              <MunicipalityForm f={d.forms} locale={locale} privacyHref={privacyHref} ts={ts} source={source} />
            ) : (
              <LeadForm key={active} type={active} f={d.forms} locale={locale} privacyHref={privacyHref} ts={ts} source={source} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactPage({ locale, d }: { locale: Locale; d: Dictionary }) {
  return (
    <section className="wrap grid gap-12 py-14 md:py-20 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <p className="eyebrow">{d.contact.eyebrow}</p>
        <h1 className="mt-4 text-h1">{d.contact.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-soft">{d.contact.text}</p>
        {company.email && (
          <div className="mt-10">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted">{d.contact.direct}</p>
            <a href={`mailto:${company.email}`} className="link mt-2 inline-block text-lg">{company.email}</a>
          </div>
        )}
      </div>
      <div className="card p-6 md:p-10 lg:col-span-8">
        <LeadForm type="contact" f={d.forms} locale={locale} privacyHref={href(locale, "privacy")} ts={Date.now()} />
      </div>
    </section>
  );
}
