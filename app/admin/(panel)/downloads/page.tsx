import { redirect } from "next/navigation";
import { supabaseServer, getStaff } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/admin-format";
import { uploadDownload, setDownloadStatus } from "../../actions";

export default async function Downloads({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const staff = await getStaff();
  if (staff?.role !== "admin") redirect("/admin");
  const { e } = await searchParams;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("downloads").select("*").order("created_at", { ascending: false });
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <h1 className="text-3xl font-extrabold">Vertrauliche Dokumente</h1>
        <p className="mt-2 text-slate-soft">Gespeichert im privaten Bucket „investor-docs“. Versand nur über persönliche, ablaufende Links aus der Anfrage-Detailansicht.</p>
        <ul className="card mt-6 divide-y divide-line">
          {(data ?? []).map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div><p className="font-bold">{d.title} {d.version && <span className="font-normal text-muted">({d.version})</span>}</p><p className="text-sm text-muted">{d.doc_type} · {fmtDate(d.created_at)} · {d.approval_status}</p></div>
              <div className="flex gap-1">
                {(["draft", "approved", "withdrawn"] as const).map((s) => (
                  <form key={s} action={setDownloadStatus}><input type="hidden" name="id" value={d.id} /><input type="hidden" name="status" value={s} />
                    <button className={`rounded-full px-3 py-1.5 text-xs font-bold ${d.approval_status === s ? "bg-forest text-white" : "bg-concrete"}`}>{{ draft: "Entwurf", approved: "Freigegeben", withdrawn: "Zurückgezogen" }[s]}</button></form>
                ))}
              </div>
            </li>
          ))}
          {!data?.length && <li className="p-4 text-muted">Noch keine Dokumente.</li>}
        </ul>
      </section>
      <section className="card p-6">
        <h2 className="text-xl font-extrabold">PDF hochladen</h2>
        {e && <p className="mt-2 text-sm font-bold text-signal">Upload fehlgeschlagen ({e}). Nur PDF bis 4 MB.</p>}
        <form action={uploadDownload} className="mt-4 space-y-4">
          <div><label className="field-label" htmlFor="ti">Titel *</label><input id="ti" name="title" required className="field-input" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="field-label" htmlFor="ty">Typ</label><select id="ty" name="doc_type" className="field-input"><option value="pitch_deck">Pitch-Deck</option><option value="financials">Financials</option><option value="datasheet">Datenblatt</option><option value="other">Sonstiges</option></select></div>
            <div><label className="field-label" htmlFor="v">Version</label><input id="v" name="version" className="field-input" /></div>
          </div>
          <div><label className="field-label" htmlFor="fi">Datei (PDF, max. 4 MB) *</label><input id="fi" name="file" type="file" accept="application/pdf" required className="field-input" /></div>
          <button className="btn btn-primary">Hochladen</button>
        </form>
      </section>
    </div>
  );
}
