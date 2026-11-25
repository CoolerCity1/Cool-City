/**
 * Unternehmensangaben für Impressum, strukturierte Daten und E-Mails.
 * Werte bleiben null, bis sie verbindlich vorliegen – das Frontend blendet fehlende Angaben aus
 * und zeigt einen Hinweis. Niemals Platzhalter mit erfundenen Daten befüllen.
 */
export const company = {
  brand: "Cooler City",
  legalName: "Voodoo Creative Partners GmbH" as string | null,
  /** Cooler City ist ein Label des Anbieters (Hinweis im Impressum). */
  isLabelOfProvider: true,
  representative: "Jens-Axel Breuer, Axel Breuer" as string | null,
  street: "Gustav-Stresemann-Ring 41" as string | null,
  postalCity: "50354 Hürth" as string | null,
  /** ISO-Ländercode, wird je Sprache ausgeschrieben */
  country: "DE" as string | null,
  email: "hello@cooler.city" as string | null,
  /** Kontaktadresse des Anbieters im Impressum */
  imprintEmail: "voodoopartners@me.com" as string | null,
  phone: null as string | null,
  register: null as string | null,
  vatId: null as string | null,
  responsibleForContent: null as string | null,
  /** Profil-Links für Footer und strukturierte Daten. Buttons erscheinen, sobald ein Link eingetragen ist. */
  social: { x: "https://x.com/cooler_city" as string | null, linkedin: null as string | null },
};

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://cooler.city").replace(/\/$/, "");

/** Versionen der Einwilligungstexte – bei Textänderungen erhöhen (Nachweis in consent_records). */
export const consentVersions = { privacy: "2026-11-v1", newsletter: "2026-11-v1" };
