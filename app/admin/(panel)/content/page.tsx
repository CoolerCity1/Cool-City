import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/admin-format";
import { setContentStatus, saveArticle } from "../../actions";
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
