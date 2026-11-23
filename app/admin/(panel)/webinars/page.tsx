import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/admin-format";
import { saveWebinar } from "../../actions";
import { WebinarFields } from "./WebinarFields";

export default async function Webinars({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("webinars").select("id, title, webinar_type, locale, starts_at, status, capacity, webinar_registrations(count)").order("starts_at", { ascending: false });
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <h1 className="text-3xl font-extrabold">Webinare</h1>
        <ul className="card mt-6 divide-y divide-line">
          {(data ?? []).map((w) => (
            <li key={w.id}>
              <Link href={`/admin/webinars/${w.id}`} className="block p-4 hover:bg-concrete/60">
                <p className="font-bold">{w.title}</p>
                <p className="text-sm text-muted">{fmtDate(w.starts_at)} · {w.webinar_type} · {w.locale} · {w.status} · {(w.webinar_registrations as unknown as { count: number }[])?.[0]?.count ?? 0}{w.capacity ? `/${w.capacity}` : ""} Anmeldungen</p>
              </Link>
            </li>
          ))}
          {!data?.length && <li className="p-4 text-muted">Noch keine Webinare.</li>}
        </ul>
      </section>
      <section className="card p-6">
        <h2 className="text-xl font-extrabold">Neues Webinar</h2>
        <p className="mt-1 text-sm text-muted">Erscheint öffentlich erst mit Status „Veröffentlicht“.</p>
        {e && <p className="mt-3 text-sm font-bold text-signal">Titel und Beginn sind Pflicht.</p>}
        <form action={saveWebinar} className="mt-5 space-y-5">
          <WebinarFields />
          <button className="btn btn-primary">Anlegen</button>
        </form>
      </section>
    </div>
  );
}
