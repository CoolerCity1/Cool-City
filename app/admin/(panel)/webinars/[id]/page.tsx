import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/admin-format";
import { saveWebinar } from "../../../actions";
import { WebinarFields } from "../WebinarFields";

export default async function WebinarDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data: w } = await supabase.from("webinars").select("*").eq("id", id).maybeSingle();
  if (!w) notFound();
  const { data: regs } = await supabase.from("webinar_registrations").select("id, status, registered_at, cancelled_at, contacts(first_name, last_name, email, organization_id)").eq("webinar_id", id).order("registered_at");
  const keys = (regs ?? []).map((r) => `webinar-reminder:${r.id}`);
  const { data: reminders } = keys.length ? await supabase.from("email_events").select("idempotency_key, status").in("idempotency_key", keys) : { data: [] as { idempotency_key: string; status: string }[] };
  const rem = new Map((reminders ?? []).map((r) => [r.idempotency_key, r.status]));

  return (
    <div className="space-y-6">
      <Link href="/admin/webinars" className="text-sm text-muted">← Webinare</Link>
      <h1 className="text-3xl font-extrabold">{w.title}</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <form action={saveWebinar} className="space-y-5">
            <WebinarFields w={w} />
            <button className="btn btn-primary">Speichern</button>
          </form>
          <p className="mt-4 text-xs text-muted">Absage: Status „Abgesagt“ setzen. Die Seite zeigt die Absage; informieren Sie Angemeldete bei Bedarf zusätzlich per E-Mail.</p>
        </section>
        <section className="card p-6">
          <h2 className="font-extrabold">Anmeldungen ({(regs ?? []).filter((r) => r.status === "registered").length})</h2>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted"><tr><th className="py-2">Name</th><th>Status</th><th>Erinnerung</th></tr></thead>
            <tbody>
              {(regs ?? []).map((r) => {
                const c = r.contacts as unknown as { first_name: string; last_name: string; email: string } | null;
                return (
                  <tr key={r.id} className="border-t border-line">
                    <td className="py-2">{c?.first_name} {c?.last_name}<br /><span className="text-muted">{c?.email} · {fmtDate(r.registered_at)}</span></td>
                    <td>{r.status}</td>
                    <td>{rem.get(`webinar-reminder:${r.id}`) ?? "–"}</td>
                  </tr>
                );
              })}
              {!regs?.length && <tr><td colSpan={3} className="py-3 text-muted">Noch keine Anmeldungen.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
