import { supabaseServer, getStaff } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/admin-format";
import { setNewsletterStatus } from "../../actions";

const statusLabel: Record<string, string> = { pending: "Unbestätigt", confirmed: "Bestätigt", unsubscribed: "Abgemeldet" };
const sourceLabel: Record<string, string> = { footer: "Footer", home: "Startseite-Teaser", insights: "Insights-Teaser" };

export default async function Newsletter({ searchParams }: { searchParams: Promise<{ status?: string; locale?: string; q?: string }> }) {
  const sp = await searchParams;
  const staff = await getStaff();
  const supabase = await supabaseServer();
  let query = supabase
    .from("newsletter_subscriptions")
    .select("id, email, locale, doi_status, source, consented_at, confirmed_at, unsubscribed_at, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (sp.status && statusLabel[sp.status]) query = query.eq("doi_status", sp.status);
  if (sp.locale && /^(de|en|es|it|fr|pt)$/.test(sp.locale)) query = query.eq("locale", sp.locale);
  const { data } = await query;
  const q = (sp.q ?? "").toLowerCase();
  const rows = (data ?? []).filter((r) => !q || r.email.toLowerCase().includes(q));
  const count = (s: string) => (data ?? []).filter((r) => r.doi_status === s).length;
  const exportQs = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString();
  const canEdit = staff?.role === "admin" || staff?.role === "editor";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Newsletter</h1>
          <p className="mt-2 text-slate-soft">Anmeldungen mit Double-Opt-in. Versenden nur an „Bestätigt“.</p>
        </div>
        {canEdit && <a href={`/admin/newsletter/export?${exportQs}`} className="btn btn-secondary !min-h-10 text-sm">CSV exportieren</a>}
      </div>
      {!sp.status && !sp.locale && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {Object.entries(statusLabel).map(([k, v]) => (
            <a key={k} href={`/admin/newsletter?status=${k}`} className="card p-5 hover:border-forest">
              <p className="text-sm font-bold text-muted">{v}</p>
              <p className="mt-1 text-3xl font-extrabold">{count(k)}</p>
            </a>
          ))}
        </div>
      )}
      <form className="mt-6 flex flex-wrap gap-3">
        <select name="status" defaultValue={sp.status ?? ""} className="field-input !w-auto">
          <option value="">Alle Status</option>
          {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="locale" defaultValue={sp.locale ?? ""} className="field-input !w-auto">
          <option value="">Alle Sprachen</option>
          {["de", "en", "es", "it", "fr", "pt"].map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
        </select>
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Suche E-Mail" className="field-input !w-72" />
        <button className="btn btn-primary !min-h-12">Filtern</button>
      </form>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-muted">
            <tr><th className="p-3">E-Mail</th><th className="p-3">Sprache</th><th className="p-3">Status</th><th className="p-3">Quelle</th><th className="p-3">Angemeldet</th><th className="p-3">Bestätigt</th>{canEdit && <th className="p-3" />}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="p-3 font-semibold">{r.email}</td>
                <td className="p-3 uppercase">{r.locale}</td>
                <td className="p-3">{statusLabel[r.doi_status] ?? r.doi_status}{r.unsubscribed_at ? <span className="block text-xs text-muted">{fmtDate(r.unsubscribed_at)}</span> : null}</td>
                <td className="p-3">{r.source ? sourceLabel[r.source] ?? r.source : "Anfrageformular"}</td>
                <td className="p-3">{fmtDate(r.consented_at ?? r.created_at)}</td>
                <td className="p-3">{r.confirmed_at ? fmtDate(r.confirmed_at) : "–"}</td>
                {canEdit && (
                  <td className="p-3 text-right">
                    {r.doi_status !== "unsubscribed" && (
                      <form action={setNewsletterStatus}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value="unsubscribed" />
                        <button className="rounded-full px-3 py-1.5 text-xs font-bold text-signal hover:bg-concrete">Abmelden</button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="p-6 text-muted">Keine Einträge.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
