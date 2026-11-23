import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { PageHero, Faq } from "@/components/ui/Section";

export function FaqPage({ d }: { locale: Locale; d: Dictionary }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [...d.faq.municipalities.items, ...d.faq.investors.items].map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
  return (
    <>
      <PageHero eyebrow={d.faq.eyebrow} title={d.faq.title} text={d.faq.text} />
      <section className="pb-24">
        <div className="wrap space-y-20">
          {[d.faq.municipalities, d.faq.investors].map((g) => (
            <div key={g.title} className="grid gap-8 lg:grid-cols-12">
              <h2 className="text-h2 lg:col-span-4">{g.title}</h2>
              <div className="lg:col-span-8"><Faq items={g.items} /></div>
            </div>
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
