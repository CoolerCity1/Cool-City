import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { company } from "@/lib/site";

function Shell({ title, notice, children }: { title: string; notice?: string; children: React.ReactNode }) {
  return (
    <section className="wrap max-w-4xl py-14 md:py-20">
      <h1 className="text-h1">{title}</h1>
      {notice && <p className="mt-6 rounded-2xl border-l-4 border-water bg-water-soft p-5 font-semibold">{notice}</p>}
      <div className="prose-cc mt-10">{children}</div>
    </section>
  );
}

export function PrivacyPage({ d }: { locale: Locale; d: Dictionary }) {
  return (
    <Shell title={d.legal.privacy.title} notice={d.legal.draftNotice}>
      {d.legal.privacy.sections.map((s) => (
        <div key={s.h}>
          <h2>{s.h}</h2>
          <p>{s.p}</p>
        </div>
      ))}
    </Shell>
  );
}

export function ImprintPage({ locale, d }: { locale: Locale; d: Dictionary }) {
  const i = d.legal.imprint;
  let country = company.country;
  try {
    if (company.country) country = new Intl.DisplayNames([locale], { type: "region" }).of(company.country) ?? company.country;
  } catch {}
  const rows: [string, string | null][] = [
    [i.provider, [company.legalName, company.street, company.postalCity, country].filter(Boolean).join(", ") || null],
    [i.represented, company.representative],
    [i.contact, [company.imprintEmail ?? company.email, company.phone].filter(Boolean).join(" · ") || null],
    [i.register, company.register],
    [i.vat, company.vatId],
    [i.responsible, company.responsibleForContent],
  ];
  const incomplete = rows.some(([, v]) => !v);
  return (
    <Shell title={i.title} notice={incomplete ? d.legal.draftNotice : undefined}>
      {company.isLabelOfProvider && company.legalName && <p>{i.labelOf.replace("{brand}", company.brand).replace("{company}", company.legalName)}</p>}
      <dl className="not-prose grid gap-px overflow-hidden rounded-2xl border border-line bg-line">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 bg-white p-5 sm:grid-cols-[14rem_1fr]">
            <dt className="font-bold">{k}</dt>
            <dd className={v ? "" : "text-muted italic"}>{v ?? i.pending}</dd>
          </div>
        ))}
      </dl>
    </Shell>
  );
}

export function AccessibilityPage({ d }: { locale: Locale; d: Dictionary }) {
  return (
    <Shell title={d.legal.accessibility.title}>
      <p>{d.legal.accessibility.text}</p>
      {company.email && <p><a href={`mailto:${company.email}`}>{company.email}</a></p>}
    </Shell>
  );
}
