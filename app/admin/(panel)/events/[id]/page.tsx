import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer, getStaff } from "@/lib/supabase/server";
import { saveEvent, deleteEvent } from "../../../actions";
import { EventFields, type EventRow } from "../EventFields";

export default async function EventDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ e?: string; ok?: string }> }) {
  const { id } = await params;
  const { e, ok } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await supabaseServer();
  const staff = await getStaff();
  const { data } = await supabase.from("content_entries").select("id, slug, title, status, data").eq("id", id).eq("content_type", "event").maybeSingle();
  if (!data) notFound();
  return (
    <div className="space-y-6">
      <Link href="/admin/events" className="link text-sm">← Alle Termine</Link>
      <h1 className="text-3xl font-extrabold">{data.title}</h1>
      {ok && <p role="status" className="rounded-xl bg-forest-soft p-4 font-semibold text-forest">Gespeichert.</p>}
      {e && <p role="alert" className="rounded-xl bg-[#fbeee8] p-4 font-semibold text-signal">Bitte Name, Beginn und Ort (Deutsch) ausfüllen. Das Ende darf nicht vor dem Beginn liegen, Links müssen mit https:// beginnen.</p>}
      <form action={saveEvent} className="card space-y-6 p-6 md:p-8">
        <EventFields ev={data as EventRow} />
        <button className="btn btn-primary">Speichern</button>
      </form>
      {staff?.role === "admin" && (
        <form action={deleteEvent} className="card flex flex-wrap items-center justify-between gap-4 p-6">
          <input type="hidden" name="id" value={data.id} />
          <p className="text-sm text-slate-soft">Termin endgültig löschen. Zum vorübergehenden Ausblenden besser den Status „Entwurf“ wählen.</p>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="confirm" required className="h-5 w-5" /> Löschen bestätigen</label>
          <button className="btn btn-secondary !border-signal !text-signal">Termin löschen</button>
        </form>
      )}
    </div>
  );
}
