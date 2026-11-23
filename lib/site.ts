/**
 * Unternehmensangaben für Impressum, strukturierte Daten und E-Mails.
 * Werte bleiben null, bis sie verbindlich vorliegen – das Frontend blendet fehlende Angaben aus
 * und zeigt einen Hinweis. Niemals Platzhalter mit erfundenen Daten befüllen.
 */
export const company = {
  brand: "Cool City",
  legalName: null as string | null,
  representative: null as string | null,
  street: null as string | null,
  postalCity: null as string | null,
  country: null as string | null,
  email: "hello@cooler.city" as string | null,
  phone: null as string | null,
  register: null as string | null,
  vatId: null as string | null,
  responsibleForContent: null as string | null,
  social: { linkedin: null as string | null, instagram: null as string | null },
};

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://cooler.city").replace(/\/$/, "");

/** Versionen der Einwilligungstexte – bei Textänderungen erhöhen (Nachweis in consent_records). */
export const consentVersions = { privacy: "2026-11-v1", newsletter: "2026-11-v1" };
