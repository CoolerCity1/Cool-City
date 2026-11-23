# Cool City – Hinweise für Claude Code

- Verbindliches Briefing: Unternehmens-, Produkt- und Investorenzahlen nie als nachgewiesen darstellen. Neue Kennwerte als `content_entries` (`content_type = 'fact'`, Status `draft`) anlegen, nie hart in Komponenten.
- Keine Fake-Testimonials, Pilotstädte, Zähler, Logos oder Termine. Renderings immer mit Label „Visualisierung“.
- Texte: `lib/i18n/dictionaries/de.ts` ist die Quelle; alle 6 Sprachen müssen dieselbe Struktur haben (Typ `Dictionary`).
- Routen: interne IDs + lokalisierte Slugs in `lib/i18n/config.ts`; Seiten-Komponenten in `components/pages`.
- Schreibzugriffe aus der Website nur über RPCs mit `SERVER_RPC_SECRET` (`lib/supabase/rpc.ts`). Admin nutzt Supabase-Session + RLS (`lib/supabase/server.ts`).
- Schemaänderungen nur als Migration in `supabase/migrations/`.
- Vor dem Commit: `npm run typecheck && npm test && npm run build`.
