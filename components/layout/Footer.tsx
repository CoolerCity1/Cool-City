import Link from "next/link";
import { Wordmark } from "./Logo";
import type { Dictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import { company } from "@/lib/site";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

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
      <div className="border-b border-white/10">
        <div className="wrap grid gap-8 py-12 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <h2 className="text-xl font-extrabold">{d.newsletterSignup.footerTitle}</h2>
            <p className="mt-2 max-w-md text-white/75">{d.newsletterSignup.footerText}</p>
          </div>
          <div className="md:col-span-7">
            <NewsletterForm d={d.newsletterSignup} errors={d.forms.errors} locale={locale} privacyHref={href(locale, "privacy")} source="footer" tone="dark" />
          </div>
        </div>
      </div>
      <div className="wrap grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Wordmark light />
          <p className="mt-5 max-w-xs text-lg font-semibold leading-snug text-white/90">{d.footer.claim}</p>
          {company.email && (
            <a href={`mailto:${company.email}`} className="mt-6 inline-flex min-h-10 items-center text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">{company.email}</a>
          )}
          {(company.social.x || company.social.linkedin) && (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9fc7b6]">{d.footer.follow}</p>
              <ul className="mt-3 flex gap-3">
                {company.social.x && (
                  <li>
                    <a href={company.social.x} target="_blank" rel="noopener noreferrer me" aria-label={d.footer.followX} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white/10">
                      <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" focusable="false"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" /></svg>
                    </a>
                  </li>
                )}
                {company.social.linkedin && (
                  <li>
                    <a href={company.social.linkedin} target="_blank" rel="noopener noreferrer me" aria-label={d.footer.followLinkedIn} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white/10">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" /></svg>
                    </a>
                  </li>
                )}
              </ul>
            </div>
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
          <p>© {new Date().getFullYear()} Cooler City. {d.footer.rights}</p>
          <p className="max-w-xl md:text-right">{d.footer.note}</p>
        </div>
      </div>
    </footer>
  );
}
