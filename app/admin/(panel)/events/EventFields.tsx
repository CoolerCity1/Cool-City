const LOCALES = ["de", "en", "es", "it", "fr", "pt"] as const;
const LANG: Record<string, string> = { de: "Deutsch", en: "Englisch", es: "Spanisch", it: "Italienisch", fr: "Französisch", pt: "Portugiesisch" };

export type EventRow = {
  id?: string;
  slug?: string;
  title?: string | null;
  status?: string;
  data?: { starts?: string; ends?: string; country?: string; category?: string; url?: string; city?: Record<string, string>; desc?: Record<string, string> };
};

export function EventFields({ ev = {} }: { ev?: EventRow }) {
  const d = ev.data ?? {};
  return (
    <div className="space-y-6">
      {ev.id && <input type="hidden" name="id" value={ev.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="field-label" htmlFor="et">Name der Veranstaltung *</label><input id="et" name="title" required maxLength={200} defaultValue={ev.title ?? ""} className="field-input" /></div>
        <div><label className="field-label" htmlFor="es">Beginn *</label><input id="es" name="starts" type="date" required defaultValue={d.starts ?? ""} className="field-input" /></div>
        <div><label className="field-label" htmlFor="ee">Ende</label><input id="ee" name="ends" type="date" defaultValue={d.ends ?? ""} className="field-input" /><p className="field-hint">Leer lassen bei eintägigen Terminen.</p></div>
        <div><label className="field-label" htmlFor="ec">Art</label>
          <select id="ec" name="category" defaultValue={d.category ?? "fair"} className="field-input"><option value="fair">Messe</option><option value="congress">Kongress</option><option value="exhibition">Ausstellung</option></select></div>
        <div><label className="field-label" htmlFor="eco">Land (ISO-Code, z. B. DE, FR)</label><input id="eco" name="country" maxLength={2} pattern="[A-Za-z]{2}" defaultValue={d.country ?? ""} className="field-input uppercase" /></div>
        <div className="sm:col-span-2"><label className="field-label" htmlFor="eu">Website des Veranstalters (https://…)</label><input id="eu" name="url" type="url" pattern="https://.*" defaultValue={d.url ?? ""} className="field-input" /></div>
        <div><label className="field-label" htmlFor="est">Status</label>
          <select id="est" name="status" defaultValue={ev.status ?? "draft"} className="field-input"><option value="draft">Entwurf (nicht sichtbar)</option><option value="published">Veröffentlicht</option></select></div>
        {ev.slug && <div><p className="field-label">Kennung</p><p className="pt-3 text-sm text-muted">{ev.slug}</p></div>}
      </div>
      <fieldset className="space-y-4">
        <legend className="text-lg font-extrabold">Ort und Kurzbeschreibung je Sprache</legend>
        <p className="text-sm text-muted">Leere Sprachen fallen auf Englisch bzw. Deutsch zurück.</p>
        {LOCALES.map((l) => (
          <div key={l} className="grid gap-3 rounded-2xl bg-concrete p-4 sm:grid-cols-[12rem_1fr]">
            <div><label className="field-label" htmlFor={`city_${l}`}>Ort ({LANG[l]}){l === "de" ? " *" : ""}</label><input id={`city_${l}`} name={`city_${l}`} required={l === "de"} maxLength={120} defaultValue={d.city?.[l] ?? ""} className="field-input" /></div>
            <div><label className="field-label" htmlFor={`desc_${l}`}>Kurzbeschreibung ({LANG[l]})</label><textarea id={`desc_${l}`} name={`desc_${l}`} rows={2} maxLength={400} defaultValue={d.desc?.[l] ?? ""} className="field-input" /></div>
          </div>
        ))}
      </fieldset>
    </div>
  );
}
