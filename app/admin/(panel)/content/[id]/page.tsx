import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { saveArticle } from "../../../actions";
import { ArticleFields } from "../ArticleFields";

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data: a } = await supabase.from("content_entries").select("*").eq("id", id).eq("content_type", "article").maybeSingle();
  if (!a) notFound();
  return (
    <div className="space-y-6">
      <Link href="/admin/content" className="text-sm text-muted">← Inhalte</Link>
      <h1 className="text-3xl font-extrabold">{a.title}</h1>
      <p className="text-sm text-muted">Status: {a.status} · Revision {a.revision}. Veröffentlichung über die Statusschalter in der Übersicht.</p>
      <form action={saveArticle} className="card space-y-5 p-6">
        <ArticleFields a={a} />
        <button className="btn btn-primary">Speichern</button>
      </form>
    </div>
  );
}
