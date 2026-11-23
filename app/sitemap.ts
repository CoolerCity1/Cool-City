import type { MetadataRoute } from "next";
import { locales, indexableRoutes, href } from "@/lib/i18n/config";
import { getAllPublishedArticleSlugs, getWebinars } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const id of indexableRoutes) {
    const languages = Object.fromEntries(locales.map((l) => [l, `${siteUrl}${href(l, id)}`]));
    for (const l of locales) {
      entries.push({ url: `${siteUrl}${href(l, id)}`, changeFrequency: id === "home" ? "weekly" : "monthly", priority: id === "home" ? 1 : 0.7, alternates: { languages: { ...languages, "x-default": `${siteUrl}${href("de", id)}` } } });
    }
  }
  for (const a of await getAllPublishedArticleSlugs()) {
    entries.push({ url: `${siteUrl}${href(a.locale, "insights", a.slug)}`, lastModified: a.updated_at, changeFrequency: "monthly", priority: 0.6 });
  }
  for (const w of await getWebinars()) {
    if (w.status === "published") entries.push({ url: `${siteUrl}${href(w.locale, "webinars", w.id)}`, changeFrequency: "weekly", priority: 0.5 });
  }
  return entries;
}
