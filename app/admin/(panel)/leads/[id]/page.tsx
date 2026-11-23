import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { supabaseServer, getStaff } from "@/lib/supabase/server";
import { fmtDate, leadTypeLabel, leadStatuses, statusLabel } from "@/lib/admin-format";
import { updateLead, grantDeck, revokeAccess, rejectInvestor } from "../../../actions";

export default async function LeadDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; e?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const staff = await getStaff();
  const supabase = await supabaseServer();
  const { data: lead } = await supabase
    .from("leads")
    .select("*, organizations(*), contacts(*), municipality_requests(*), partner_applications(*)")
    .eq("id", id)
    .maybeSingle();
  if (!lead) notFound();
  const isAdmin = staff?.role === "admin";
  const investor = isAdmin && lead.lead_type === "investor" ? (await supabase.from("investor_requests").select("*").eq("lead_id", id).maybeSingle()).data : null;
  const docs = isAdmin && lead.lead_type === "investor" ? (await supabase.from("downloads").select("id, title, version").eq("approval_status", "approved")).data ?? [] : [];
  const access = isAdmin && lead.lead_type === "investor" ? (await supabase.from("download_access").select("id, granted_at, expires_at, revoked_at, downloads(title)").eq("contact_id", lead.contact_id).order("granted_at", { ascending: false })).data ?? [] : [];
  const mails = (await supabase.from("email_events").select("event_type, status, created_at, error").eq("contact_id", lead.contact_id).order("created_at", { ascending: false }).limit(20)).data ?? [];

  const c = lead.contacts as Record<string, string | null>;
  const o = lead.organizations as Record<string, string | null> | null;
  const sub = ((lead.municipality_requests as unknown[])?.[0] ?? lead.municipality_requests ?? (lead.partner_applications as unknown[])?.[0] ?? lead.partner_applications ?? null) as Record<string, unknown> | null;
  const kv = (obj: Record<string, unknown> | null) =>
    obj ? Object.entries(obj).filter(([k, v]) => !["id", "lead_id", "created_at"].includes(k) && v !== null && v !== "") : [];

  return (
    <div className="space-y-6">
      <Link href="/admin/leads" className="text-sm text-muted">← Anfragen</Link>
      {sp.ok === "deck" && <p className="rounded-xl bg-forest-soft p-4 font-semibold text-forest">Downloadlink erstellt und versendet.</p>}
      {sp.e && <p className="rounded-xl bg-[#fbeee8] p-4 font-semibold text-signal">Aktion fehlgeschlagen ({sp.e}). Ist das Dokument freigegeben und vorhanden?</p>}
      <h1 className="text-3xl font-extrabold">{leadTypeLabel[lead.lead_type]} · {o?.name ?? `${c.first_name} ${c.last_name}`}</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2">
          <h2 className="font-extrabold">Angaben</h2>
          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[12rem_1fr]">
            <dt className="text-muted">Eingang</dt><dd>{fmtDate(lead.submitted_at)} · {String(lead.locale).toUpperCase()}</dd>
            <dt className="text-muted">Kontakt</dt><dd>{c.first_name} {c.last_name}{c.role_title ? `, ${c.role_title}` : ""}</dd>
            <dt className="text-muted">E-Mail</dt><dd><a className="link" href={`mailto:${c.email}`}>{c.email}</a></dd>
            {c.phone && (<><dt className="text-muted">Telefon</dt><dd>{c.phone}</dd></>)}
            {o && (<><dt className="text-muted">Organisation</dt><dd>{o.name} {o.city ? `· ${o.city}` : ""} {o.country ? `· ${o.country}` : ""}</dd></>)}
            {lead.source && (<><dt className="text-muted">Quelle</dt><dd>{lead.source}</dd></>)}
            {kv(sub).map(([k, v]) => <Fragment key={k}><dt className="text-muted">{k}</dt><dd>{String(v)}</dd></Fragment>)}
            {investor && kv(investor).map(([k, v]) => <Fragment key={k}><dt className="text-muted">{k}</dt><dd>{String(v)}</dd></Fragment>)}
            {kv(lead.payload as Record<string, unknown>).map(([k, v]) => <Fragment key={k}><dt className="text-muted">{k}</dt><dd>{String(v)}</dd></Fragment>)}
          </dl>
          {lead.message && <p className="mt-6 whitespace-pre-line rounded-xl bg-concrete p-4">{lead.message}</p>}
        </section>
        <section className="card p-6">
          <h2 className="font-extrabold">Bearbeitung</h2>
          <form action={updateLead} className="mt-4 space-y-4">
            <input type="hidden" name="id" value={lead.id} />
            <label className="field-label" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={lead.status} className="field-input">
              {leadStatuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
            </select>
            <label className="field-label" htmlFor="notes">Interne Notizen</label>
            <textarea id="notes" name="internal_notes" defaultValue={lead.internal_notes ?? ""} className="field-input" rows={5} />
            <button className="btn btn-primary w-full">Speichern</button>
          </form>
        </section>
      </div>

      {investor && (
        <section className="card p-6">
          <h2 className="font-extrabold">Investorenfreigabe · Status: {investor.review_status}</h2>
          {docs.length ? (
            <form action={grantDeck} className="mt-4 flex flex-wrap items-end gap-3">
              <input type="hidden" name="lead_id" value={lead.id} />
              <div><label className="field-label" htmlFor="doc">Dokument</label>
                <select id="doc" name="download_id" className="field-input">{docs.map((d) => <option key={d.id} value={d.id}>{d.title} {d.version ? `(${d.version})` : ""}</option>)}</select></div>
              <div><label className="field-label" htmlFor="days">Gültig (Tage)</label>
                <input id="days" name="days" type="number" min={1} max={30} defaultValue={7} className="field-input !w-28" /></div>
              <button className="btn btn-primary">Freigeben & Link senden</button>
            </form>
          ) : (
            <p className="mt-3 text-muted">Kein freigegebenes Dokument vorhanden. Unter „Downloads“ hochladen und freigeben.</p>
          )}
          <form action={rejectInvestor} className="mt-3"><input type="hidden" name="lead_id" value={lead.id} /><button className="text-sm font-bold text-signal underline">Anfrage ablehnen</button></form>
          {access.length > 0 && (
            <ul className="mt-5 divide-y divide-line text-sm">
              {access.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                  <span>{(a.downloads as unknown as { title: string } | null)?.title} · erteilt {fmtDate(a.granted_at)} · gültig bis {fmtDate(a.expires_at)} {a.revoked_at ? "· widerrufen" : ""}</span>
                  {!a.revoked_at && <form action={revokeAccess}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="lead_id" value={lead.id} /><button className="font-bold text-signal underline">Widerrufen</button></form>}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted">Hinweis: Signierte Links bleiben bis zum Ablauf technisch gültig; „Widerrufen“ dokumentiert den Entzug. Für sofortigen Entzug Dokument zurückziehen und neue Version hochladen.</p>
        </section>
      )}

      <section className="card p-6">
        <h2 className="font-extrabold">E-Mail-Protokoll</h2>
        <ul className="mt-3 divide-y divide-line text-sm">
          {mails.map((m, i) => <li key={i} className="py-2">{fmtDate(m.created_at)} · {m.event_type} · <strong>{m.status}</strong>{m.error ? ` · ${m.error}` : ""}</li>)}
          {!mails.length && <li className="py-2 text-muted">Keine E-Mails protokolliert.</li>}
        </ul>
      </section>
    </div>
  );
}
