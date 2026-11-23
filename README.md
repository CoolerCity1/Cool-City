# Cool City – Website & Lead-Plattform

Mehrsprachige B2B-Website für **Cool City** (cooler.city): Greenery-as-a-Service für europäische Innenstädte.

**Stack:** Next.js 15 (App Router, TypeScript strict) · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage, RLS) · Resend · Vercel

## Funktionsumfang

- 6 Sprachen (`de` Default, `en`, `es`, `it`, `fr`, `pt`) mit lokalisierten URLs, `hreflang`, Canonical, Sitemap
- Seiten: Start, System, Kommunen, Investoren (Unit-Economics-Rechner), Partner, Insights, Webinare, Über uns, Anfrage, Kontakt, FAQ, Datenschutz, Impressum, Barrierefreiheit, Danke, 404
- Funnels mit echter Persistenz: Kommunen (4 Schritte), Investor, Partner, Lieferant, Kontakt, Webinar-Anmeldung
- Bestätigungsmails (6 Sprachen), interne Benachrichtigung, Newsletter-Double-Opt-in, `.ics`, tägliche Webinar-Erinnerungen ohne Doppelversand, Stornierung per Bestätigungsklick
- Admin unter `/admin` (Supabase Auth, Rollen `admin`/`editor`/`viewer`): Leads mit Status/Notizen/CSV-Export, Webinare, Artikel, Freigabe technischer Kennwerte, Investoren-Dokumente mit ablaufenden signierten Links, Audit-Log
- Technische Kennwerte (Maße, Tank, Gewicht, Saison, Richtpreis) sind im CMS als **Entwurf** angelegt und erscheinen erst nach Freigabe

## Architektur & Sicherheit

- Besucher schreiben **nie direkt** in Tabellen. Formulare → Server Action → Supabase-RPC (`SECURITY DEFINER`), die ein **Server-Secret** (`SERVER_RPC_SECRET`) prüft. Der öffentliche Anon-Key allein kann nichts schreiben. Ein Service-Role-Key wird nicht benötigt.
- RLS auf allen Tabellen; Lesen nur für Staff-Rollen. Öffentlich lesbar: veröffentlichte Inhalte/Medien.
- Spam-Schutz: Honeypot, Mindest-Ausfüllzeit, IP-Drosselung pro Instanz, DB-Limit (5 Einreichungen/E-Mail/Stunde).
- E-Mails werden in `email_events` mit Idempotency-Key reserviert (keine Doppelmails), Status per Resend-Webhook (Svix-Signatur geprüft).
- Logs enthalten keine Formularinhalte; interne Benachrichtigung enthält nur Typ/Organisation/Land + Admin-Link.

## Lokale Entwicklung

```bash
cp .env.example .env.local   # Werte eintragen
npm install
npm run dev                  # http://localhost:3000 → /de
npm test                     # Routing, Markdown-Sanitizing, ICS
```

## Umgebungsvariablen

| Variable | Wo | Zweck |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | alle | Basis-URL für Canonical, Sitemap, Mail-Links |
| `NEXT_PUBLIC_SUPABASE_URL` | alle | Supabase-Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | alle | öffentlicher Anon-/Publishable-Key |
| `SERVER_RPC_SECRET` | nur Server | muss `private.settings.server_rpc_secret` entsprechen |
| `RESEND_API_KEY` | nur Server | Resend-Versand |
| `EMAIL_FROM` | nur Server | z. B. `Cool City <hello@cooler.city>` (Domain muss in Resend verifiziert sein) |
| `EMAIL_REPLY_TO` | nur Server | Antwortadresse |
| `INTERNAL_NOTIFY_EMAIL` | nur Server | interne Benachrichtigung neuer Leads (leer = aus) |
| `RESEND_WEBHOOK_SECRET` | nur Server | `whsec_…` des Resend-Webhooks auf `/api/resend-webhook` |
| `CRON_SECRET` | nur Server | Vercel Cron sendet `Authorization: Bearer …` an `/api/cron/webinar-reminders` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | optional | datenschutzfreundliche Analytics, erst nach rechtlicher Prüfung |

Server-Secret rotieren: neuen Wert in Vercel setzen **und** `update private.settings set value = '<neu>' where key = 'server_rpc_secret';` ausführen.

## Supabase

- Migrationen: `supabase/migrations/` (maßgeblich; keine manuellen Tabellen in Produktion).
- Buckets: `media` (öffentlich), `investor-docs` (privat, nur PDF).
- **Admin anlegen:** Supabase Dashboard → Authentication → *Add user* (E-Mail + Passwort, MFA empfohlen). Danach:
  ```sql
  insert into public.admin_profiles (user_id, role)
  select id, 'admin' from auth.users where email = 'admin@cooler.city';
  ```
- Backups: Supabase-Plan mit täglichen Backups/PITR nutzen; vor größeren Migrationen `supabase db dump`.
- Löschfristen: `leads.retention_until` (Standard 24 Monate). Löschanfragen: Kontakt in `contacts` löschen → Leads, Registrierungen, Consents werden kaskadierend entfernt.

## Deployment (Vercel)

Push auf `main` → Production; andere Branches → Preview. Cron (täglich 07:00 UTC) ist in `vercel.json` definiert (Hobby-Plan: max. 1×/Tag).

Domain: `cooler.city` als Production-Domain hinzufügen, `www.cooler.city` → Redirect (zusätzlich in `next.config.ts`). DNS laut Vercel-Anzeige (A-Record `76.76.21.21` bzw. CNAME `cname.vercel-dns.com`).

## Resend

Domain `cooler.city` in Resend anlegen, SPF/DKIM (und empfohlen DMARC `v=DMARC1; p=none; rua=mailto:…`) beim DNS-Anbieter eintragen, verifizieren. Bis dahin schlägt der Versand fehl und wird in `email_events` als `failed` protokolliert – die Anfrage selbst wird trotzdem gespeichert.

## Launch-Checkliste

Siehe [`LAUNCH-CHECKLIST.md`](./LAUNCH-CHECKLIST.md).
