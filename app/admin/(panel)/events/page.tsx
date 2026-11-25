import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { saveEvent } from "../../actions";
import { EventFields } from "./EventFields";

const catDe: Record<string, string> = { fair: "Messe", congress: "Kongress", exhibition: "Ausstellung" };
const fmt = (iso?: string) => (iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }) : "–");

export default async function Events({ searchParams }: { searchParams: Promise<{ e?: string; past?: string }> }) {
  const { e, past } = await searchParams;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("content_entries").select("id, slug, title, status, data, updated_at").eq("content_type", "event");
  const today = new Date().toISOString().slice(0, 10);
  type D = { starts?: string; ends?: string; category?: string; city?: Record<string, string> };
  const rows = (data ?? [])
    .map((r) => ({ ...r, d: (r.data ?? {}) as D }))
    .filter((r) => past === "1" || (r.d.ends ?? r.d.starts ?? "") >= today)
    .sort((a, b) => (a.d.starts ?? "").localeCompare(b.d.starts ?? ""));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold">Termine: Messen & Kongresse</h1>
        <p className="mt-2 max-w-3xl text-slate-soft">Öffentliche Branchentermine auf der Seite „Termine & Webinare“. Nur „Veröffentlicht“ ist sichtbar, vergangene Termine blendet die Website automatisch aus. Eigene Webinare verwalten Sie unter <Link href="/admin/webinars" className="link">Webinare</Link>.</p>
      </div>
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold">{past === "1" ? "Alle Termine" : "Kommende Termine"}</h2>
          <Link href={past === "1" ? "/admin/events" : "/admin/events?past=1"} className="link text-sm">{past === "1" ? "Nur kommende anzeigen" : "Auch vergangene anzeigen"}</Link>
        </div>
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase text-muted">
              <tr><th className="p-3">Datum</th><th className="p-3">Veranstaltung</th><th className="p-3">Ort</th><th className="p-3">Art</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0 hover:bg-concrete/60">
                  <td className="whitespace-nowrap p-3">{fmt(r.d.starts)}{r.d.ends && r.d.ends !== r.d.starts ? ` – ${fmt(r.d.ends)}` : ""}</td>
                  <td className="p-3"><Link href={`/admin/events/${r.id}`} className="font-bold text-forest underline">{r.title}</Link></td>
                  <td className="p-3">{r.d.city?.de ?? "–"}</td>
                  <td className="p-3">{catDe[r.d.category ?? "fair"]}</td>
                  <td className="p-3">{r.status === "published" ? "Veröffentlicht" : "Entwurf"}</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} className="p-6 text-muted">Keine Termine.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card p-6 md:p-8">
        <h2 className="text-xl font-extrabold">Neuer Termin</h2>
        {e && <p className="mt-2 text-sm font-bold text-signal">Bitte Name, Beginn und Ort (Deutsch) ausfüllen. Das Ende darf nicht vor dem Beginn liegen, Links müssen mit https:// beginnen.</p>}
        <form action={saveEvent} className="mt-6 space-y-6">
          <EventFields />
          <button className="btn btn-primary">Termin anlegen</button>
        </form>
      </section>
    </div>
  );
}
