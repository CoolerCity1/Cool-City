import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { fmtDate, leadTypeLabel, leadStatuses, statusLabel } from "@/lib/admin-format";

export default async function Leads({ searchParams }: { searchParams: Promise<{ type?: string; status?: string; q?: string }> }) {
  const sp = await searchParams;
  const supabase = await supabaseServer();
  let query = supabase
    .from("leads")
    .select("id, lead_type, status, submitted_at, locale, organizations(name, country), contacts(first_name, last_name, email)")
    .order("submitted_at", { ascending: false })
    .limit(500);
  if (sp.type && leadTypeLabel[sp.type]) query = query.eq("lead_type", sp.type);
  if (sp.status && statusLabel[sp.status]) query = query.eq("status", sp.status);
  const { data } = await query;
  const q = (sp.q ?? "").toLowerCase();
  const rows = (data ?? []).filter((l) => {
    if (!q) return true;
    const c = l.contacts as unknown as { first_name: string; last_name: string; email: string } | null;
    const o = l.organizations as unknown as { name: string } | null;
    return `${c?.first_name} ${c?.last_name} ${c?.email} ${o?.name}`.toLowerCase().includes(q);
  });
  const exportQs = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-extrabold">Anfragen</h1>
        <a href={`/admin/leads/export?${exportQs}`} className="btn btn-secondary !min-h-10 text-sm">CSV exportieren</a>
      </div>
      <form className="mt-6 flex flex-wrap gap-3">
        <select name="type" defaultValue={sp.type ?? ""} className="field-input !w-auto">
          <option value="">Alle Typen</option>
          {Object.entries(leadTypeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className="field-input !w-auto">
          <option value="">Alle Status</option>
          {leadStatuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
        </select>
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Suche Name, E-Mail, Organisation" className="field-input !w-72" />
        <button className="btn btn-primary !min-h-12">Filtern</button>
      </form>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-muted">
            <tr><th className="p-3">Eingang</th><th className="p-3">Typ</th><th className="p-3">Organisation</th><th className="p-3">Kontakt</th><th className="p-3">Sprache</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const c = l.contacts as unknown as { first_name: string; last_name: string; email: string } | null;
              const o = l.organizations as unknown as { name: string; country: string } | null;
              return (
                <tr key={l.id} className="border-b border-line last:border-0 hover:bg-concrete/60">
                  <td className="p-3"><Link href={`/admin/leads/${l.id}`} className="font-bold text-forest underline">{fmtDate(l.submitted_at)}</Link></td>
                  <td className="p-3">{leadTypeLabel[l.lead_type]}</td>
                  <td className="p-3">{o?.name ?? "–"}{o?.country ? ` (${o.country})` : ""}</td>
                  <td className="p-3">{c ? `${c.first_name ?? ""} ${c.last_name ?? ""}` : "–"}<br /><span className="text-muted">{c?.email}</span></td>
                  <td className="p-3 uppercase">{l.locale}</td>
                  <td className="p-3">{statusLabel[l.status]}</td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={6} className="p-6 text-muted">Keine Einträge.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
