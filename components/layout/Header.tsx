"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";

type NavItem = { href: string; label: string };

export function Header({ locale, items, cta, labels, home }: { locale: Locale; items: NavItem[]; cta: NavItem; labels: { menu: string; close: string; language: string }; home: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (h: string) => pathname === h || pathname?.startsWith(h + "/");

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 ${scrolled || open ? "border-b border-line bg-paper/92 backdrop-blur-md" : "bg-paper"}`}>
      <div className="wrap flex h-[4.5rem] items-center justify-between gap-4">
        <Link href={home} className="shrink-0 rounded-lg" aria-label="Cooler City – Home">
          <Wordmark />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  aria-current={isActive(it.href) ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-3 text-[0.92rem] font-semibold transition-colors hover:bg-concrete ${isActive(it.href) ? "text-forest" : "text-slate"}`}
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher locale={locale} label={labels.language} />
          <Link href={cta.href} className="btn btn-primary hidden !min-h-11 !px-5 sm:inline-flex">
            {cta.label}
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-concrete xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? labels.close : labels.menu}</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      <div id="mobile-nav" hidden={!open} className="xl:hidden">
        <nav aria-label="Mobile Navigation" className="wrap max-h-[calc(100dvh-4.5rem)] overflow-y-auto pb-8 pt-2">
          <ul className="divide-y divide-line border-y border-line">
            {items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} aria-current={isActive(it.href) ? "page" : undefined} className={`flex min-h-14 items-center justify-between text-lg font-bold ${isActive(it.href) ? "text-forest" : "text-slate"}`}>
                  {it.label}
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={cta.href} className="btn btn-primary mt-6 w-full">{cta.label}</Link>
        </nav>
      </div>
    </header>
  );
}
