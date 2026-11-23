# Launch-Checkliste

## Technik
- [ ] Vercel: Production-Domain `cooler.city` + `www` verbinden, DNS setzen, HTTPS prüfen
- [ ] Vercel-Env vollständig (siehe README), danach Redeploy
- [ ] Resend: Domain verifizieren (SPF, DKIM, DMARC), `EMAIL_FROM` setzen, Webhook `https://cooler.city/api/resend-webhook` (Events: sent, delivered, bounced, complained, failed) + `RESEND_WEBHOOK_SECRET`
- [ ] Supabase: Admin-User anlegen + `admin_profiles`, MFA aktivieren, Backups prüfen
- [ ] Testanfrage je Formular, Webinar-Anmeldung inkl. `.ics`, Stornierung, Newsletter-DOI
- [ ] Lighthouse mobil (Start, System, Anfrage), Tastatur-Test, Screenreader-Stichprobe
- [ ] Safari/iOS, Chrome/Android, Firefox, Edge

## Inhalte & Freigaben (offene Punkte aus dem Briefing)
- [ ] Impressum: Rechtsträger, Vertretung, Anschrift, Register, USt-ID in `lib/site.ts`
- [ ] Datenschutzhinweise juristisch prüfen (AVV/DPA mit Vercel, Supabase, Resend; Drittlandtransfer)
- [ ] Technisches Datenblatt verifizieren: Gewicht/Ballast, **Wasserinhalt (Briefing 400 l vs. Produktfilm 350 l)**, Windlast, Statik → Kennwerte im Admin freigeben
- [ ] Richtpreis 1.850 €: netto/brutto, Mindestmenge, Inklusivleistungen festlegen → freigeben
- [ ] Pitch-Deck/Financials hochladen und freigeben; Freigaberegeln festlegen
- [ ] Gründerprofil, Team, reale Referenzen (keine Platzhalter veröffentlichen)
- [ ] Echte Webinartermine + Meeting-Plattform anlegen
- [ ] Übersetzungen (en/es/it/fr/pt) muttersprachlich prüfen lassen
- [ ] Ökologische Aussagen / Green Claims juristisch prüfen
- [ ] Renderings: Nutzungsrechte bestätigen
