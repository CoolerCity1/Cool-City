"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Item = { id: string; href: string; title: string; teaser: string | null; category?: string; date: string | null; minutes: number };

export function ArticleFilter({ items, labels }: { items: Item[]; labels: { search: string; all: string; noResults: string; readingTime: string; minutes: string } }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const cats = useMemo(() => Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[], [items]);
  const shown = items.filter((i) => (!cat || i.category === cat) && (!q || `${i.title} ${i.teaser ?? ""}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group">
          {[null, ...cats].map((c) => (
            <button key={c ?? "all"} type="button" onClick={() => setCat(c)} aria-pressed={cat === c} className={`min-h-11 rounded-full px-4 text-sm font-bold ${cat === c ? "bg-forest text-white" : "border border-line bg-white hover:border-forest"}`}>
              {c ?? labels.all}
            </button>
          ))}
        </div>
        <label className="relative block md:w-80">
          <span className="sr-only">{labels.search}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={labels.search} className="field-input" />
        </label>
      </div>
      <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {shown.map((a) => (
          <li key={a.id}>
            <Link href={a.href} className="card group flex h-full flex-col p-7 transition-colors hover:border-forest">
              {a.category && <span className="text-xs font-bold uppercase tracking-[0.12em] text-forest">{a.category}</span>}
              <h2 className="mt-3 text-xl font-extrabold leading-snug group-hover:text-forest">{a.title}</h2>
              {a.teaser && <p className="mt-3 line-clamp-3 text-slate-soft">{a.teaser}</p>}
              <p className="mt-auto pt-6 text-sm text-muted">{a.date}{a.date ? " · " : ""}{labels.readingTime} {a.minutes} {labels.minutes}</p>
            </Link>
          </li>
        ))}
      </ul>
      {!shown.length && <p className="mt-10 text-slate-soft">{labels.noResults}</p>}
    </div>
  );
}
