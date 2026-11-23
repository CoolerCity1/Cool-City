import Link from "next/link";
import { notFound } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";
import { href, dateLocale, type Locale } from "@/lib/i18n/config";
import { getArticles, getArticle, readingMinutes } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { siteUrl } from "@/lib/site";
import { PageHero } from "@/components/ui/Section";
import { ArticleFilter } from "@/components/sections/ArticleFilter";

export async function InsightsPage({ locale, d }: { locale: Locale; d: Dictionary }) {
  const articles = await getArticles(locale);
  const fmt = new Intl.DateTimeFormat(dateLocale[locale], { dateStyle: "long" });
  const items = articles.map((a) => ({
    id: a.id,
    href: href(locale, "insights", a.slug),
    title: a.title,
    teaser: a.teaser,
    category: a.data?.category,
    date: a.published_at ? fmt.format(new Date(a.published_at)) : null,
    minutes: a.data?.reading_minutes ?? readingMinutes(a.body),
  }));
  return (
    <>
      <PageHero eyebrow={d.insights.eyebrow} title={d.insights.title} text={d.insights.text} />
      <section className="pb-24">
        <div className="wrap">
          {items.length ? (
            <ArticleFilter items={items} labels={{ search: d.insights.search, all: d.insights.all, noResults: d.insights.noResults, readingTime: d.insights.readingTime, minutes: d.common.minutes }} />
          ) : (
            <p className="rounded-[1.5rem] border border-dashed border-line p-8 text-lg text-slate-soft">{d.insights.empty}</p>
          )}
        </div>
      </section>
    </>
  );
}

export async function ArticlePage({ locale, d, slug }: { locale: Locale; d: Dictionary; slug: string }) {
  const a = await getArticle(locale, slug);
  if (!a) notFound();
  const { html, toc } = renderMarkdown(a.body ?? "");
  const fmt = new Intl.DateTimeFormat(dateLocale[locale], { dateStyle: "long" });
  const url = `${siteUrl}${href(locale, "insights", a.slug)}`;
  const minutes = a.data?.reading_minutes ?? readingMinutes(a.body);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.teaser ?? undefined,
    inLanguage: locale,
    datePublished: a.published_at ?? undefined,
    dateModified: a.updated_at,
    author: a.author ? { "@type": "Person", name: a.author } : { "@type": "Organization", name: "Cool City" },
    publisher: { "@type": "Organization", name: "Cool City", logo: { "@type": "ImageObject", url: `${siteUrl}/brand/icon-512.png` } },
    mainEntityOfPage: url,
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: d.nav.home, item: `${siteUrl}/${locale}` },
      { "@type": "ListItem", position: 2, name: d.nav.insights, item: `${siteUrl}${href(locale, "insights")}` },
      { "@type": "ListItem", position: 3, name: a.title, item: url },
    ],
  };

  return (
    <article>
      <header className="wrap pb-10 pt-14 md:pt-20">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href={href(locale, "insights")} className="hover:text-forest">← {d.nav.insights}</Link>
        </nav>
        {a.data?.category && <p className="eyebrow mt-8">{a.data.category}</p>}
        <h1 className="mt-4 max-w-4xl text-h1">{a.title}</h1>
        {a.teaser && <p className="mt-6 max-w-3xl text-xl leading-relaxed text-slate-soft">{a.teaser}</p>}
        <p className="mt-6 text-sm text-muted">
          {a.author && <>{a.author} · </>}
          {a.published_at && <>{d.insights.published} {fmt.format(new Date(a.published_at))} · </>}
          {d.insights.updated} {fmt.format(new Date(a.updated_at))} · {d.insights.readingTime} {minutes} {d.common.minutes}
        </p>
      </header>
      <div className="wrap grid gap-12 pb-24 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          {toc.length > 1 && (
            <nav aria-label={d.insights.toc} className="lg:sticky lg:top-28">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted">{d.insights.toc}</p>
              <ol className="mt-3 space-y-2 border-l border-line pl-4 text-sm">
                {toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className="hover:text-forest">{t.text}</a></li>)}
              </ol>
            </nav>
          )}
        </aside>
        <div className="lg:col-span-7">
          <div className="prose-cc" dangerouslySetInnerHTML={{ __html: html }} />
          {!!a.data?.sources?.length && (
            <section className="mt-12 border-t border-line pt-8">
              <h2 className="text-lg font-extrabold">{d.insights.sources}</h2>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-soft">
                {a.data.sources.map((s, i) => (
                  <li key={i}>{s.url && /^https?:\/\//.test(s.url) ? <a href={s.url} rel="noopener nofollow" target="_blank" className="link">{s.title}</a> : s.title}</li>
                ))}
              </ol>
            </section>
          )}
          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-line pt-8">
            <span className="text-sm font-bold">{d.insights.share}:</span>
            <a className="btn btn-secondary !min-h-10 !px-4 text-sm" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener">LinkedIn</a>
            <a className="btn btn-secondary !min-h-10 !px-4 text-sm" href={`mailto:?subject=${encodeURIComponent(a.title)}&body=${encodeURIComponent(url)}`}>E-Mail</a>
          </div>
          <Link href={href(locale, "webinars")} className="mt-10 flex items-center justify-between rounded-2xl bg-forest-soft p-6 font-bold text-forest-dark hover:bg-[#d5e6dd]">
            {d.insights.webinarCta} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([ld, breadcrumbs]) }} />
    </article>
  );
}
