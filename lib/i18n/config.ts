export const locales = ["de", "en", "es", "it", "fr", "pt"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "de";

export const localeNames: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  es: "Español",
  it: "Italiano",
  fr: "Français",
  pt: "Português",
};

export const htmlLang: Record<Locale, string> = { de: "de-DE", en: "en", es: "es", it: "it", fr: "fr", pt: "pt-PT" };
export const dateLocale: Record<Locale, string> = { de: "de-DE", en: "en-GB", es: "es-ES", it: "it-IT", fr: "fr-FR", pt: "pt-PT" };

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Stabile interne Routen-IDs mit lokalisierten Slugs. */
export const routes = {
  home: { de: "", en: "", es: "", it: "", fr: "", pt: "" },
  system: { de: "system", en: "system", es: "sistema", it: "sistema", fr: "systeme", pt: "sistema" },
  municipalities: { de: "kommunen", en: "municipalities", es: "municipios", it: "comuni", fr: "collectivites", pt: "municipios" },
  investors: { de: "investoren", en: "investors", es: "inversores", it: "investitori", fr: "investisseurs", pt: "investidores" },
  partners: { de: "partner", en: "partners", es: "socios", it: "partner", fr: "partenaires", pt: "parceiros" },
  insights: { de: "insights", en: "insights", es: "insights", it: "insights", fr: "insights", pt: "insights" },
  webinars: { de: "webinare", en: "webinars", es: "webinars", it: "webinar", fr: "webinaires", pt: "webinars" },
  company: { de: "unternehmen", en: "company", es: "empresa", it: "azienda", fr: "entreprise", pt: "empresa" },
  request: { de: "anfrage", en: "request", es: "solicitud", it: "richiesta", fr: "demande", pt: "pedido" },
  contact: { de: "kontakt", en: "contact", es: "contacto", it: "contatti", fr: "contact", pt: "contacto" },
  faq: { de: "faq", en: "faq", es: "preguntas", it: "domande", fr: "questions", pt: "perguntas" },
  privacy: { de: "datenschutz", en: "privacy", es: "privacidad", it: "privacy", fr: "confidentialite", pt: "privacidade" },
  imprint: { de: "impressum", en: "imprint", es: "aviso-legal", it: "note-legali", fr: "mentions-legales", pt: "aviso-legal" },
  accessibility: { de: "barrierefreiheit", en: "accessibility", es: "accesibilidad", it: "accessibilita", fr: "accessibilite", pt: "acessibilidade" },
  thanks: { de: "danke", en: "thank-you", es: "gracias", it: "grazie", fr: "merci", pt: "obrigado" },
  newsletter: { de: "newsletter", en: "newsletter", es: "newsletter", it: "newsletter", fr: "newsletter", pt: "newsletter" },
  webinarCancel: { de: "webinar-abmeldung", en: "webinar-cancellation", es: "cancelar-webinar", it: "annulla-webinar", fr: "annulation-webinaire", pt: "cancelar-webinar" },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteId = keyof typeof routes;

/** Seiten, die indexiert und in die Sitemap aufgenommen werden. */
export const indexableRoutes: RouteId[] = [
  "home", "system", "municipalities", "investors", "partners", "insights", "webinars", "company", "request", "contact", "faq", "privacy", "imprint", "accessibility",
];

export function href(locale: Locale, id: RouteId, ...rest: string[]): string {
  const slug = routes[id][locale];
  const parts = [locale, slug, ...rest].filter(Boolean);
  return "/" + parts.join("/");
}

export function resolveRoute(locale: Locale, segments: string[]): { id: RouteId; rest: string[] } | null {
  const [first = "", ...rest] = segments;
  for (const id of Object.keys(routes) as RouteId[]) {
    if (routes[id][locale] === first) {
      if (id === "home" && segments.length > 0) continue;
      return { id, rest };
    }
  }
  return null;
}
