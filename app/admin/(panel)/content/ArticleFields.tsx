type A = { id?: string; slug?: string; locale?: string; title?: string | null; teaser?: string | null; body?: string | null; seo_title?: string | null; seo_description?: string | null; author?: string | null; data?: { category?: string; sources?: { title: string; url?: string }[] } };

export function ArticleFields({ a = {} }: { a?: A }) {
  const sources = (a.data?.sources ?? []).map((s) => (s.url ? `${s.title} | ${s.url}` : s.title)).join("\n");
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {a.id && <input type="hidden" name="id" value={a.id} />}
      <div className="sm:col-span-2"><label className="field-label" htmlFor="t">Titel *</label><input id="t" name="title" required defaultValue={a.title ?? ""} className="field-input" /></div>
      <div><label className="field-label" htmlFor="s">Slug (URL) *</label><input id="s" name="slug" required pattern="[a-z0-9-]+" defaultValue={a.slug ?? ""} className="field-input" /></div>
      <div><label className="field-label" htmlFor="l">Sprache</label><select id="l" name="locale" defaultValue={a.locale ?? "de"} className="field-input">{["de", "en", "es", "it", "fr", "pt"].map((x) => <option key={x}>{x}</option>)}</select></div>
      <div><label className="field-label" htmlFor="c">Kategorie</label><input id="c" name="category" defaultValue={a.data?.category ?? ""} className="field-input" /></div>
      <div><label className="field-label" htmlFor="au">Autor</label><input id="au" name="author" defaultValue={a.author ?? ""} className="field-input" /></div>
      <div className="sm:col-span-2"><label className="field-label" htmlFor="te">Teaser</label><textarea id="te" name="teaser" defaultValue={a.teaser ?? ""} rows={2} className="field-input" /></div>
      <div className="sm:col-span-2"><label className="field-label" htmlFor="b">Text (Markdown: ## Überschrift, - Liste, **fett**, [Link](https://…))</label><textarea id="b" name="body" defaultValue={a.body ?? ""} rows={18} className="field-input font-mono text-sm" /></div>
      <div className="sm:col-span-2"><label className="field-label" htmlFor="so">Quellen (eine pro Zeile: Titel | URL)</label><textarea id="so" name="sources" defaultValue={sources} rows={4} className="field-input" /></div>
      <div><label className="field-label" htmlFor="st">SEO-Titel</label><input id="st" name="seo_title" defaultValue={a.seo_title ?? ""} className="field-input" /></div>
      <div><label className="field-label" htmlFor="sd">SEO-Beschreibung</label><input id="sd" name="seo_description" defaultValue={a.seo_description ?? ""} className="field-input" /></div>
    </div>
  );
}
