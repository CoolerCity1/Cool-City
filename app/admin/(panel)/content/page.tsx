import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/admin-format";
import { setContentStatus, saveArticle, runSocialQueue, retrySocialPost } from "../../actions";
import { socialAutopostActive } from "@/lib/social/queue";
import { xConfigured } from "@/lib/social/x";
import { linkedinConfigured } from "@/lib/social/linkedin";
import { ArticleFields } from "./ArticleFields";

const statuses = ["draft", "reviewed", "published"] as const;
const statusDe: Record<string, string> = { draft: "Entwurf", reviewed: "Geprüft", published: "Veröffentlicht" };

function StatusSwitch({ id, current }: { id: string; current: string }) {
  return (
    <div className="flex gap-1">
      {statuses.map((s) => (
        <form key={s} action={setContentStatus}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={s} />
          <button aria-pressed={current === s} className={`rounded-full px-3 py-1.5 text-xs font-bold ${current === s ? (s === "published" ? "bg-forest text-white" : "bg-slate text-white") : "bg-concrete hover:bg-line"}`}>{statusDe[s]}</button>
        </form>
      ))}
    </div>
  );
}

export default async function Content({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("content_entries").select("id, content_type, slug, locale, title, status, data, updated_at").order("updated_at", { ascending: false });
  const facts = (data ?? []).filter((x) => x.content_type === "fact");
  const articles = (data ?? []).filter((x) => x.content_type === "article");
  const { data: social } = await supabase.from("social_posts").select("id, channel, status, attempts, error, external_id, created_at, sent_at, content_entries(title, locale)").order("created_at", { ascending: false }).limit(30);
  const auto = socialAutopostActive();
  const socialStatus: Record<string, string> = { pending: "Wartet", processing: "In Arbeit", sent: "Gepostet", failed: "Fehlgeschlagen", skipped: "Übersprungen" };
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-extrabold">Technische Kennwerte & Claims</h1>
        <p className="mt-2 max-w-3xl text-slate-soft">Nur Werte mit Status „Veröffentlicht“ erscheinen auf der Website (Startseite, Datenblatt, Richtpreis auf der Kommunen-Seite). Bitte erst nach technischer bzw. kaufmännischer Freigabe veröffentlichen.</p>
        <div className="card mt-6 divide-y divide-line">
          {facts.map((f) => {
            const d = f.data as { value?: Record<string, string>; note?: string };
            return (
              <div key={f.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-bold">{f.title} <span className="font-normal text-muted">({f.slug})</span>: {d.value?.de}</p>
                  {d.note && <p className="text-sm text-signal">{d.note}</p>}
                </div>
                <StatusSwitch id={f.id} current={f.status} />
              </div>
            );
          })}
        </div>
      </section>
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">Automatisches Posten (X & LinkedIn)</h2>
            <p className="mt-2 max-w-3xl text-slate-soft">Neu veröffentlichte Beiträge der Sprachen aus der Einstellung „social_locales“ (Standard: Deutsch) werden automatisch gepostet. Bereits gepostete Beiträge werden nicht erneut gepostet.</p>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              <li className={`rounded-full px-3 py-1 font-bold ${auto.active ? "bg-forest-soft text-forest" : "bg-[#fbeee8] text-signal"}`}>{auto.active ? "Aktiv" : `Pausiert: ${auto.reason}`}</li>
              <li className={`rounded-full px-3 py-1 font-bold ${xConfigured() ? "bg-forest-soft text-forest" : "bg-concrete text-muted"}`}>X {xConfigured() ? "verbunden" : "nicht eingerichtet"}</li>
              <li className={`rounded-full px-3 py-1 font-bold ${linkedinConfigured() ? "bg-forest-soft text-forest" : "bg-concrete text-muted"}`}>LinkedIn {linkedinConfigured() ? "verbunden" : "nicht eingerichtet"}</li>
            </ul>
          </div>
          <form action={runSocialQueue}><button className="btn btn-secondary !min-h-10 text-sm">Warteschlange jetzt abarbeiten</button></form>
        </div>
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase text-muted"><tr><th className="p-3">Beitrag</th><th className="p-3">Kanal</th><th className="p-3">Status</th><th className="p-3">Zeit</th><th className="p-3" /></tr></thead>
            <tbody>
              {(social ?? []).map((p) => {
                const c = p.content_entries as unknown as { title: string; locale: string } | null;
                return (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <td className="p-3 font-semibold">{c?.title ?? "–"} <span className="font-normal text-muted">· {c?.locale}</span></td>
                    <td className="p-3">{p.channel === "x" ? "X" : "LinkedIn"}</td>
                    <td className="p-3">{socialStatus[p.status] ?? p.status}{p.error ? <span className="block text-xs text-signal">{p.error}</span> : null}</td>
                    <td className="p-3">{fmtDate(p.sent_at ?? p.created_at)}</td>
                    <td className="p-3 text-right">{(p.status === "failed" || p.status === "skipped") && (
                      <form action={retrySocialPost}><input type="hidden" name="id" value={p.id} /><button className="rounded-full px-3 py-1.5 text-xs font-bold hover:bg-concrete">Erneut versuchen</button></form>
                    )}</td>
                  </tr>
                );
              })}
              {!social?.length && <tr><td colSpan={5} className="p-6 text-muted">Noch keine Beiträge in der Warteschlange.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-extrabold">Artikel</h2>
          <ul className="card mt-4 divide-y divide-line">
            {articles.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <Link href={`/admin/content/${a.id}`} className="font-bold hover:text-forest">{a.title} <span className="text-sm font-normal text-muted">· {a.locale} · {fmtDate(a.updated_at)}</span></Link>
                <StatusSwitch id={a.id} current={a.status} />
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-extrabold">Neuer Artikel</h2>
          {e && <p className="mt-2 text-sm font-bold text-signal">Titel und Slug sind Pflicht.</p>}
          <form action={saveArticle} className="mt-4 space-y-5">
            <ArticleFields />
            <button className="btn btn-primary">Als Entwurf anlegen</button>
          </form>
        </div>
      </section>
    </div>
  );
}
