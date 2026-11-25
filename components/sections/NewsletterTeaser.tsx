import type { Dictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

/** Newsletter-Teaser als eigener Abschnitt (Startseite, Insights). */
export function NewsletterTeaser({ locale, d, source }: { locale: Locale; d: Dictionary; source: string }) {
  const n = d.newsletterSignup;
  return (
    <section className="py-16 md:py-24" aria-labelledby={`nl-teaser-${source}`}>
      <div className="wrap">
        <div className="grid items-center gap-10 rounded-[2rem] bg-concrete p-8 md:p-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow">{n.eyebrow}</p>
            <h2 id={`nl-teaser-${source}`} className="mt-4 text-h2 font-extrabold">{n.title}</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-soft">{n.text}</p>
          </div>
          <NewsletterForm d={n} errors={d.forms.errors} locale={locale} privacyHref={href(locale, "privacy")} source={source} tone="light" />
        </div>
      </div>
    </section>
  );
}
