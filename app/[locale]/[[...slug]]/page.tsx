import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { isLocale, locales, routes, resolveRoute, href, indexableRoutes, type Locale, type RouteId } from "@/lib/i18n/config";
import { getArticle, getWebinar } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import { HomePage } from "@/components/pages/HomePage";
import { SystemPage } from "@/components/pages/SystemPage";
import { MunicipalitiesPage } from "@/components/pages/MunicipalitiesPage";
import { InvestorsPage } from "@/components/pages/InvestorsPage";
import { PartnersPage } from "@/components/pages/PartnersPage";
import { InsightsPage, ArticlePage } from "@/components/pages/InsightsPages";
import { WebinarsPage, WebinarDetailPage } from "@/components/pages/WebinarPages";
import { CompanyPage } from "@/components/pages/CompanyPage";
import { RequestPage, ContactPage } from "@/components/pages/RequestPages";
import { FaqPage } from "@/components/pages/FaqPage";
import { PrivacyPage, ImprintPage, AccessibilityPage } from "@/components/pages/LegalPages";
import { ThanksPage, NewsletterPage, WebinarCancelPage } from "@/components/pages/StatusPages";

export const revalidate = 300;

type Params = { locale: string; slug?: string[] };
type Search = Record<string, string | string[] | undefined>;

const withDetail: RouteId[] = ["insights", "webinars"];
const noindex: RouteId[] = ["thanks", "newsletter", "webinarCancel"];

export function generateStaticParams() {
  const out: Params[] = [];
  for (const locale of locales) {
    for (const id of Object.keys(routes) as RouteId[]) {
      const slug = routes[id][locale];
      out.push({ locale, slug: slug ? [slug] : [] });
    }
  }
  return out;
}

function resolve(params: Params): { locale: Locale; id: RouteId; rest: string[] } | null {
  if (!isLocale(params.locale)) return null;
  const r = resolveRoute(params.locale, params.slug ?? []);
  if (!r) return null;
  if (r.rest.length > (withDetail.includes(r.id) ? 1 : 0)) return null;
  return { locale: params.locale, ...r };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const r = resolve(await params);
  if (!r) return {};
  const d = getDictionary(r.locale);
  const page = r.id === "home" ? null : d.meta.pages[r.id as Exclude<RouteId, "home">];
  let title: string | undefined = page?.title;
  let description = page?.description ?? d.meta.defaultDescription;
  let ogType: "website" | "article" = "website";

  // Detailseiten
  if (r.rest[0] && r.id === "insights") {
    const a = await getArticle(r.locale, r.rest[0]);
    if (!a) return {};
    title = a.seo_title || a.title;
    description = a.seo_description || a.teaser || description;
    ogType = "article";
    const url = `${siteUrl}${href(r.locale, "insights", a.slug)}`;
    return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: ogType, locale: r.locale } };
  }
  if (r.rest[0] && r.id === "webinars") {
    const w = await getWebinar(r.rest[0]);
    if (!w) return {};
    title = w.title;
    description = w.description || description;
  }

  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${siteUrl}${href(l, r.id, ...r.rest)}`;
  languages["x-default"] = `${siteUrl}${href("de", r.id, ...r.rest)}`;
  const canonical = `${siteUrl}${href(r.locale, r.id, ...r.rest)}`;
  const isIndexable = indexableRoutes.includes(r.id) && !noindex.includes(r.id);

  return {
    title: r.id === "home" ? { absolute: d.meta.defaultTitle } : title,
    description,
    alternates: r.id === "webinars" && r.rest[0] ? { canonical } : { canonical, languages },
    openGraph: { title: title ?? d.meta.defaultTitle, description, url: canonical, type: ogType, locale: r.locale },
    robots: isIndexable || (r.id === "webinars" && r.rest[0]) ? undefined : { index: false, follow: true },
  };
}

export default async function Page({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Search> }) {
  const r = resolve(await params);
  if (!r) notFound();
  const { locale, id, rest } = r;
  const d = getDictionary(locale);
  const p = { locale, d };

  switch (id) {
    case "home":
      return <HomePage {...p} />;
    case "system":
      return <SystemPage {...p} />;
    case "municipalities":
      return <MunicipalitiesPage {...p} />;
    case "investors":
      return <InvestorsPage {...p} />;
    case "partners":
      return <PartnersPage {...p} />;
    case "insights":
      return rest[0] ? <ArticlePage {...p} slug={rest[0]} /> : <InsightsPage {...p} />;
    case "webinars":
      return rest[0] ? <WebinarDetailPage {...p} id={rest[0]} /> : <WebinarsPage {...p} />;
    case "company":
      return <CompanyPage {...p} />;
    case "request": {
      const sp = await searchParams;
      return <RequestPage {...p} type={typeof sp.typ === "string" ? sp.typ : undefined} source={typeof sp.src === "string" ? sp.src : undefined} />;
    }
    case "contact":
      return <ContactPage {...p} />;
    case "faq":
      return <FaqPage {...p} />;
    case "privacy":
      return <PrivacyPage {...p} />;
    case "imprint":
      return <ImprintPage {...p} />;
    case "accessibility":
      return <AccessibilityPage {...p} />;
    case "thanks": {
      const sp = await searchParams;
      return <ThanksPage {...p} type={typeof sp.typ === "string" ? sp.typ : undefined} newsletter={sp.nl === "1"} />;
    }
    case "newsletter": {
      const sp = await searchParams;
      return <NewsletterPage {...p} confirm={typeof sp.confirm === "string" ? sp.confirm : undefined} unsubscribe={typeof sp.unsubscribe === "string" ? sp.unsubscribe : undefined} />;
    }
    case "webinarCancel": {
      const sp = await searchParams;
      return <WebinarCancelPage {...p} token={typeof sp.token === "string" ? sp.token : undefined} done={typeof sp.done === "string" ? sp.done : undefined} />;
    }
    default:
      notFound();
  }
}
