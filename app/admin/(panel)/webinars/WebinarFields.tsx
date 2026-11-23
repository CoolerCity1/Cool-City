import { toBerlinLocal } from "@/lib/admin-format";

type W = { id?: string; webinar_type?: string; locale?: string; title?: string; description?: string | null; starts_at?: string; duration_minutes?: number; meeting_url?: string | null; capacity?: number | null; status?: string };

export function WebinarFields({ w = {} }: { w?: W }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {w.id && <input type="hidden" name="id" value={w.id} />}
      <div><label className="field-label" htmlFor="wt">Format</label>
        <select id="wt" name="webinar_type" defaultValue={w.webinar_type ?? "municipality"} className="field-input"><option value="municipality">Kommunen</option><option value="investor">Investoren</option></select></div>
      <div><label className="field-label" htmlFor="wl">Sprache</label>
        <select id="wl" name="locale" defaultValue={w.locale ?? "de"} className="field-input">{["de", "en", "es", "it", "fr", "pt"].map((l) => <option key={l}>{l}</option>)}</select></div>
      <div className="sm:col-span-2"><label className="field-label" htmlFor="wti">Titel *</label><input id="wti" name="title" required defaultValue={w.title ?? ""} className="field-input" /></div>
      <div className="sm:col-span-2"><label className="field-label" htmlFor="wd">Beschreibung</label><textarea id="wd" name="description" defaultValue={w.description ?? ""} className="field-input" rows={4} /></div>
      <div><label className="field-label" htmlFor="ws">Beginn (Zeit Europe/Berlin) *</label><input id="ws" name="starts_at" type="datetime-local" required defaultValue={toBerlinLocal(w.starts_at)} className="field-input" /></div>
      <div><label className="field-label" htmlFor="wdu">Dauer (Min.)</label><input id="wdu" name="duration_minutes" type="number" min={15} max={480} defaultValue={w.duration_minutes ?? 45} className="field-input" /></div>
      <div><label className="field-label" htmlFor="wc">Kapazität</label><input id="wc" name="capacity" type="number" min={1} defaultValue={w.capacity ?? ""} className="field-input" /></div>
      <div><label className="field-label" htmlFor="wst">Status</label>
        <select id="wst" name="status" defaultValue={w.status ?? "draft"} className="field-input"><option value="draft">Entwurf</option><option value="published">Veröffentlicht</option><option value="cancelled">Abgesagt</option><option value="completed">Abgeschlossen</option></select></div>
      <div className="sm:col-span-2"><label className="field-label" htmlFor="wm">Meeting-URL (privat, nur in Mails)</label><input id="wm" name="meeting_url" type="url" defaultValue={w.meeting_url ?? ""} className="field-input" /></div>
    </div>
  );
}
