import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { fmtDate, leadTypeLabel, statusLabel } from "@/lib/admin-format";

export default async function Dashboard() {
  const supabase = await supabaseServer();
  const [{ data: leads }, { data: webinars }, { data: mails }] = await Promise.all([
    supabase.from("leads").select("id, lead_type, status, submitted_at, organizations(name)").order("submitted_at", { ascending: false }).limit(200),
    supabase.from("webinars").select("id, title, starts_at, status, webinar_registrations(count)").gte("starts_at", new Date(Date.now() - 86400000).toISOString()).order("starts_at").limit(10),
    supabase.from("email_events").select("status").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
  ]);
  const byType = Object.keys(leadTypeLabel).map((t) => ({ t, n: (leads ?? []).filter((l) => l.lead_type === t).length, open: (leads ?? []).filter((l) => l.lead_type === t && l.status === "new").length }));
  const failed = (mails ?? []).filter((m) => m.status === "failed" || m.status === "bounced").length;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold">Übersicht</h1>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {byType.map(({ t, n, open }) => (
          <Link key={t} href={`/admin/leads?type=${t}`} className="card p-5 hover:border-forest">
            <p className="text-sm font-bold text-muted">{leadTypeLabel[t]}</p>
            <p className="mt-1 text-3xl font-extrabold">{n}</p>
            <p className="text-sm text-forest">{open} neu</p>
          </Link>
        ))}
      </div>
      {failed > 0 && <p className="rounded-xl bg-[#fbeee8] p-4 font-semibold text-signal">{failed} E-Mails in den letzten 30 Tagen fehlgeschlagen oder gebounct.</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-lg font-extrabold">Neueste Anfragen</h2>
          <ul className="mt-4 divide-y divide-line">
            {(leads ?? []).slice(0, 8).map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads/${l.id}`} className="flex justify-between gap-4 py-3 hover:text-forest">
                  <span><strong>{leadTypeLabel[l.lead_type]}</strong> · {(l.organizations as unknown as { name: string } | null)?.name ?? "–"}</span>
                  <span className="text-sm text-muted">{statusLabel[l.status]} · {fmtDate(l.submitted_at)}</span>
                </Link>
              </li>
            ))}
            {!leads?.length && <li className="py-3 text-muted">Noch keine Anfragen.</li>}
          </ul>
        </section>
        <section className="card p-6">
          <h2 className="text-lg font-extrabold">Anstehende Webinare</h2>
          <ul className="mt-4 divide-y divide-line">
            {(webinars ?? []).map((w) => (
              <li key={w.id}>
                <Link href={`/admin/webinars/${w.id}`} className="flex justify-between gap-4 py-3 hover:text-forest">
                  <span><strong>{w.title}</strong> <span className="text-sm text-muted">({w.status})</span></span>
                  <span className="text-sm text-muted">{fmtDate(w.starts_at)} · {(w.webinar_registrations as unknown as { count: number }[])?.[0]?.count ?? 0} Anm.</span>
                </Link>
              </li>
            ))}
            {!webinars?.length && <li className="py-3 text-muted">Keine Termine angelegt.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
