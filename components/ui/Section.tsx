import Link from "next/link";

export function SectionHead({ eyebrow, title, text, light = false, align = "left", as: H = "h2" }: { eyebrow?: string; title: string; text?: string; light?: boolean; align?: "left" | "center"; as?: "h1" | "h2" }) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className={`eyebrow ${light ? "eyebrow-light" : ""} ${align === "center" ? "justify-center" : ""}`}>{eyebrow}</p>}
      <H className={`mt-4 ${H === "h1" ? "text-h1" : "text-h2"} ${light ? "text-white" : "text-slate"}`}>{title}</H>
      {text && <p className={`mt-5 text-lg leading-relaxed ${light ? "text-white/80" : "text-slate-soft"}`}>{text}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, text, children, tone = "paper" }: { eyebrow: string; title: string; text?: string; children?: React.ReactNode; tone?: "paper" | "forest" }) {
  const dark = tone === "forest";
  return (
    <section className={`relative overflow-hidden ${dark ? "bg-forest-dark text-white" : "bg-paper"}`}>
      <div className={`pointer-events-none absolute inset-0 ${dark ? "opacity-20" : "opacity-70"} grid-lines`} aria-hidden="true" />
      <div className="wrap relative pb-16 pt-14 md:pb-24 md:pt-24">
        <p className={`eyebrow ${dark ? "eyebrow-light" : ""}`}>{eyebrow}</p>
        <h1 className={`mt-5 max-w-5xl text-h1 ${dark ? "text-white" : "text-slate"}`}>{title}</h1>
        {text && <p className={`mt-6 max-w-2xl text-lg leading-relaxed md:text-xl ${dark ? "text-white/80" : "text-slate-soft"}`}>{text}</p>}
        {children && <div className="mt-9 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}

export function VizImage({ name, alt, label, sizes = "100vw", className = "", priority = false }: { name: "plaza-overview" | "plaza-closeup"; alt: string; label: string; sizes?: string; className?: string; priority?: boolean }) {
  return (
    <figure className={`relative overflow-hidden ${className}`}>
      <img
        src={`/images/${name}-1600.webp`}
        srcSet={`/images/${name}-960.webp 960w, /images/${name}-1600.webp 1600w, /images/${name}-2400.webp 2400w`}
        sizes={sizes}
        alt={alt}
        width={1600}
        height={900}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full object-cover"
      />
      <figcaption className="absolute bottom-3 left-3"><span className="viz-label">{label}</span></figcaption>
    </figure>
  );
}

export function CtaBand({ title, text, primary, secondary }: { title: string; text?: string; primary: { href: string; label: string }; secondary?: { href: string; label: string } }) {
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="wrap">
        <div className="relative overflow-hidden rounded-[2rem] bg-forest px-6 py-14 text-white md:px-16 md:py-20">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-water/30 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <h2 className="text-h2 text-white">{title}</h2>
            {text && <p className="mt-4 text-lg text-white/80">{text}</p>}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={primary.href} className="btn btn-light">{primary.label}</Link>
              {secondary && <Link href={secondary.href} className="btn btn-ghost-light">{secondary.label}</Link>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Check({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`${className} shrink-0`} aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="currentColor" opacity=".14" />
      <path d="M6 10.4l2.6 2.6L14 7.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((it) => (
        <details key={it.q} className="group py-1">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-3 text-left text-lg font-bold [&::-webkit-details-marker]:hidden">
            {it.q}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-forest transition-transform group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <p className="max-w-3xl pb-6 pr-12 text-[1.05rem] leading-relaxed text-slate-soft">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
