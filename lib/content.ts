import "server-only";
import type { Locale } from "./i18n/config";
import { hasSupabase, restSelect, rpc } from "./supabase/rpc";

export type Fact = { slug: string; value: string; note?: string };
export type Article = {
  id: string;
  slug: string;
  locale: Locale;
  title: string;
  teaser: string | null;
  body: string | null;
  data: { category?: string; sources?: { title: string; url?: string }[]; hero_image?: string; hero_alt?: string; reading_minutes?: number };
  seo_title: string | null;
  seo_description: string | null;
  author: string | null;
  published_at: string | null;
  updated_at: string;
};
export type PublicWebinar = {
  id: string;
  webinar_type: "municipality" | "investor";
  locale: Locale;
  title: string;
  description: string | null;
  starts_at: string;
  duration_minutes: number;
  seats_left: number | null;
  status: "published" | "cancelled";
};

/** Nur freigegebene Kennwerte (status = published). */
export async function getPublishedFacts(locale: Locale): Promise<Fact[]> {
  if (!hasSupabase()) return [];
  try {
    const rows = await restSelect<{ slug: string; data: { value?: Record<string, string> } }[]>(
      "content_entries?select=slug,data&content_type=eq.fact&status=eq.published&order=created_at.asc",
    );
    return rows
      .map((r) => ({ slug: r.slug, value: r.data?.value?.[locale] ?? r.data?.value?.de ?? "" }))
      .filter((f) => f.value);
  } catch {
    return [];
  }
}

export async function isFactPublished(slug: string, locale: Locale): Promise<string | null> {
  const facts = await getPublishedFacts(locale);
  return facts.find((f) => f.slug === slug)?.value ?? null;
}

const articleFields = "id,slug,locale,title,teaser,body,data,seo_title,seo_description,author,published_at,updated_at";

export async function getArticles(locale: Locale, limit = 50): Promise<Article[]> {
  if (!hasSupabase()) return [];
  try {
    return await restSelect<Article[]>(
      `content_entries?select=${articleFields}&content_type=eq.article&status=eq.published&locale=eq.${locale}&order=published_at.desc.nullslast&limit=${limit}`,
    );
  } catch {
    return [];
  }
}

export async function getArticle(locale: Locale, slug: string): Promise<Article | null> {
  if (!hasSupabase()) return null;
  try {
    const rows = await restSelect<Article[]>(
      `content_entries?select=${articleFields}&content_type=eq.article&status=eq.published&locale=eq.${locale}&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getAllPublishedArticleSlugs(): Promise<{ locale: Locale; slug: string; updated_at: string }[]> {
  if (!hasSupabase()) return [];
  try {
    return await restSelect("content_entries?select=locale,slug,updated_at&content_type=eq.article&status=eq.published");
  } catch {
    return [];
  }
}

export async function getWebinars(locale?: Locale): Promise<PublicWebinar[]> {
  if (!hasSupabase()) return [];
  try {
    return await rpc<PublicWebinar[]>("list_public_webinars", { p_locale: locale ?? null }, { revalidate: 120 });
  } catch {
    return [];
  }
}

export async function getWebinar(id: string): Promise<PublicWebinar | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const all = await getWebinars();
  return all.find((w) => w.id === id) ?? null;
}

export function readingMinutes(text: string | null | undefined): number {
  const words = (text ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
