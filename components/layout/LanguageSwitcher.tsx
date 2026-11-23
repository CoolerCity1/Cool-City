"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { locales, localeNames, href, resolveRoute, isLocale, type Locale } from "@/lib/i18n/config";

export function targetPath(pathname: string, target: Locale): string {
  const segs = pathname.split("/").filter(Boolean);
  const current = segs[0];
  if (!isLocale(current)) return `/${target}`;
  const resolved = resolveRoute(current, segs.slice(1));
  if (!resolved) return `/${target}`;
  // Artikel-Slugs sind je Sprache verschieden → auf die Übersicht der Zielsprache
  if (resolved.id === "insights" && resolved.rest.length) return href(target, "insights");
  return href(target, resolved.id, ...resolved.rest);
}

export function LanguageSwitcher({ locale, label, tone = "dark" }: { locale: Locale; label: string; tone?: "dark" | "light" }) {
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold uppercase tracking-wide ${tone === "light" ? "text-white hover:bg-white/10" : "text-slate hover:bg-concrete"}`}
      >
        <span className="sr-only">{label}: </span>
        <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm6.9 7.75h-3.2a13 13 0 0 0-1.4-5.6 7 7 0 0 1 4.6 5.6ZM10 3.1c.8 1 1.9 3.2 2.2 6.15H7.8C8.1 6.3 9.2 4.1 10 3.1ZM7.7 3.65a13 13 0 0 0-1.4 5.6H3.1a7 7 0 0 1 4.6-5.6ZM3.1 10.75h3.2a13 13 0 0 0 1.4 5.6 7 7 0 0 1-4.6-5.6Zm6.9 6.15c-.8-1-1.9-3.2-2.2-6.15h4.4c-.3 2.95-1.4 5.15-2.2 6.15Zm2.3-.55a13 13 0 0 0 1.4-5.6h3.2a7 7 0 0 1-4.6 5.6Z"/></svg>
        {locale}
      </button>
      {open && (
        <ul className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-line bg-white py-1.5 shadow-xl">
          {locales.map((l) => (
            <li key={l}>
              <Link
                href={targetPath(pathname, l)}
                hrefLang={l}
                lang={l}
                aria-current={l === locale ? "true" : undefined}
                onClick={() => setOpen(false)}
                className={`flex min-h-11 items-center justify-between px-4 text-sm hover:bg-concrete ${l === locale ? "font-bold text-forest" : "text-slate"}`}
              >
                {localeNames[l]}
                <span className="text-xs uppercase text-muted">{l}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
