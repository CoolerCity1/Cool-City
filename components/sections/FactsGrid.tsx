import type { Fact } from "@/lib/content";

export function FactsGrid({ facts, empty, labels, verifiedLabel }: { facts: Fact[]; empty: string; labels: Record<string, string>; verifiedLabel?: string }) {
  const shown = facts.filter((f) => f.slug !== "price");
  if (!shown.length) {
    return (
      <div className="flex items-start gap-4 rounded-[1.5rem] border border-dashed border-[#b9c4bf] bg-white p-7 md:p-9">
        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-water-soft text-water" aria-hidden="true">
          <svg viewBox="0 0 20 20" className="h-5 w-5"><path fill="currentColor" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.9 12H9.1V9h1.8v5Zm0-6.6H9.1V5.6h1.8v1.8Z" /></svg>
        </span>
        <p className="max-w-2xl text-lg leading-relaxed text-slate-soft">{empty}</p>
      </div>
    );
  }
  return (
    <dl className="grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {shown.map((f) => (
        <div key={f.slug} className="bg-white p-7">
          <dt className="text-sm font-bold uppercase tracking-[0.12em] text-muted">{labels[f.slug] ?? f.slug}</dt>
          <dd className="mt-3 text-[2rem] font-extrabold leading-tight tracking-tight text-forest">{f.value}</dd>
          {verifiedLabel && <dd className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-forest"><span className="h-1.5 w-1.5 rounded-full bg-forest" />{verifiedLabel}</dd>}
        </div>
      ))}
    </dl>
  );
}
