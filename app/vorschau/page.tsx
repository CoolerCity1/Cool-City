import { LogoMark } from "@/components/layout/Logo";
import { safeNext } from "@/lib/gate";

export default async function Vorschau({ searchParams }: { searchParams: Promise<{ next?: string; zugang?: string }> }) {
  const sp = await searchParams;
  const nextRaw = sp.next ?? "/de";
  // Fehlerhinweis kommt als Query am Zielpfad an („?zugang=falsch“)
  const wrong = sp.zugang === "falsch" || /[?&]zugang=falsch/.test(nextRaw);
  const next = safeNext(nextRaw.replace(/([?&])zugang=falsch&?/, "$1").replace(/[?&]$/, ""));

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.15] grid-lines" aria-hidden="true" style={{ filter: "invert(1)" }} />
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-water/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-48 -left-40 -z-10 h-[28rem] w-[28rem] rounded-full bg-forest/60 blur-3xl" aria-hidden="true" />

      <header className="wrap flex items-center gap-3 pt-8">
        <span className="rounded-2xl bg-white p-1.5"><LogoMark className="h-10 w-10" /></span>
        <span className="text-xl font-extrabold tracking-tight">Cool City</span>
      </header>

      <section className="wrap flex flex-1 flex-col justify-center py-16">
        <div className="grid items-end gap-14 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eyebrow eyebrow-light">Demnächst · Coming soon</p>
            <h1 className="mt-6 max-w-3xl text-display font-extrabold text-white">Grüne Infrastruktur. Genau dort, wo Städte sie brauchen.</h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl">
              Mobile, intelligent betreute Begrünung für die versiegelten Plätze Europas. Unsere Website entsteht gerade.
            </p>
            <p className="mt-3 max-w-xl text-white/60">Urban Cooling on Demand – our website is coming soon.</p>
            <a href="mailto:hello@cooler.city" className="mt-8 inline-flex min-h-11 items-center font-bold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
              hello@cooler.city
            </a>
          </div>

          <form method="post" action="/api/gate" className="rounded-[1.5rem] border border-white/15 bg-white/[0.06] p-7 backdrop-blur-md md:p-8">
            <h2 className="text-lg font-extrabold">Vorschau-Zugang</h2>
            <p className="mt-1 text-sm text-white/70">Für Partner und Team mit Passwort.</p>
            <input type="hidden" name="next" value={next} />
            <label htmlFor="password" className="mt-6 block text-sm font-bold">Passwort</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              aria-invalid={wrong || undefined}
              aria-describedby={wrong ? "pw-error" : undefined}
              className="mt-2 min-h-12 w-full rounded-xl border border-white/25 bg-white/95 px-4 text-base text-slate outline-none focus:border-water focus:ring-4 focus:ring-water/30"
            />
            {wrong && <p id="pw-error" role="alert" className="mt-2 text-sm font-bold text-[#ffb59a]">Das Passwort ist nicht korrekt.</p>}
            <button type="submit" className="btn btn-light mt-5 w-full">Vorschau öffnen</button>
          </form>
        </div>
      </section>

      <footer className="wrap pb-8 text-sm text-white/50">© {new Date().getFullYear()} Cool City</footer>
    </main>
  );
}
