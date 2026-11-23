import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { getDictionary } from "@/lib/i18n";
import { isLocale, locales, htmlLang, href, type Locale } from "@/lib/i18n/config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteUrl, company } from "@/lib/site";

const manrope = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope", display: "swap" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#0B3028", width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: d.meta.defaultTitle, template: `%s | Cool City` },
    description: d.meta.defaultDescription,
    applicationName: "Cool City",
    icons: {
      icon: [{ url: "/brand/cool-city-icon.svg", type: "image/svg+xml" }, { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" }],
      apple: "/brand/apple-icon.png",
    },
    manifest: "/manifest.webmanifest",
    openGraph: { siteName: "Cool City", type: "website", images: [{ url: "/brand/og-default.jpg", width: 1200, height: 630, alt: d.home.hero.videoAlt }] },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const d = getDictionary(locale);

  const items = [
    { href: href(locale, "system"), label: d.nav.system },
    { href: href(locale, "municipalities"), label: d.nav.municipalities },
    { href: href(locale, "investors"), label: d.nav.investors },
    { href: href(locale, "partners"), label: d.nav.partners },
    { href: href(locale, "insights"), label: d.nav.insights },
    { href: href(locale, "webinars"), label: d.nav.webinars },
    { href: href(locale, "company"), label: d.nav.company },
  ];

  const orgLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${siteUrl}/#org`, name: "Cool City", url: siteUrl, logo: `${siteUrl}/brand/icon-512.png`, ...(company.email ? { email: company.email } : {}) },
      { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: "Cool City", url: siteUrl, inLanguage: locales, publisher: { "@id": `${siteUrl}/#org` } },
    ],
  };

  return (
    <html lang={htmlLang[locale]} className={manrope.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <a href="#main" className="sr-only z-50 rounded-full bg-forest px-5 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          {d.nav.skip}
        </a>
        <Header
          locale={locale}
          items={items}
          cta={{ href: `${href(locale, "request")}?typ=municipality`, label: d.nav.cta }}
          labels={{ menu: d.nav.menu, close: d.nav.close, language: d.nav.language }}
          home={href(locale, "home")}
        />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer locale={locale} d={d} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script defer data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.js" />
        )}
      </body>
    </html>
  );
}
