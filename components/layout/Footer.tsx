import Link from "next/link";
import { Wordmark } from "./Logo";
import type { Dictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import { company } from "@/lib/site";

export function Footer({ locale, d }: { locale: Locale; d: Dictionary }) {
  const col = (title: string, links: { href: string; label: string }[]) => (
    <div>
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#9fc7b6]">{title}</h2>
      <ul className="space-y-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-flex min-h-10 items-center text-[0.95rem] text-white/85 hover:text-white">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <footer className="bg-forest-dark text-white">
      <div className="wrap grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Wordmark light />
          <p className="mt-5 max-w-xs text-lg font-semibold leading-snug text-white/90">{d.footer.claim}</p>
          {company.email && (
            <a href={`mailto:${company.email}`} className="mt-6 inline-flex min-h-10 items-center text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">{company.email}</a>
          )}
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-8">
          {col(d.footer.explore, [
            { href: href(locale, "system"), label: d.nav.system },
            { href: href(locale, "insights"), label: d.nav.insights },
            { href: href(locale, "webinars"), label: d.nav.webinars },
            { href: href(locale, "faq"), label: d.footer.faq },
          ])}
          {col(d.footer.audiences, [
            { href: href(locale, "municipalities"), label: d.nav.municipalities },
            { href: href(locale, "investors"), label: d.nav.investors },
            { href: href(locale, "partners"), label: d.nav.partners },
          ])}
          {col(d.footer.company, [
            { href: href(locale, "company"), label: d.nav.company },
            { href: href(locale, "contact"), label: d.footer.contact },
            { href: href(locale, "imprint"), label: d.footer.imprint },
            { href: href(locale, "privacy"), label: d.footer.privacy },
            { href: href(locale, "accessibility"), label: d.footer.accessibility },
          ])}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-3 py-6 text-sm text-white/65 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Cool City. {d.footer.rights}</p>
          <p className="max-w-xl md:text-right">{d.footer.note}</p>
        </div>
      </div>
    </footer>
  );
}
