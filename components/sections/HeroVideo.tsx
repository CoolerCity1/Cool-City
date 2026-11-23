"use client";

import { useEffect, useRef, useState } from "react";

export function HeroVideo({ label, alt, pauseLabel, playLabel }: { label: string; alt: string; pauseLabel: string; playLabel: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;
    v.src = small ? "/media/hero-plaza-mobile.mp4" : "/media/hero-plaza.mp4";
    if (!reduce) v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {});
    else { v.pause(); setPlaying(false); }
  };

  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        poster="/media/hero-plaza-poster.jpg"
        muted
        loop
        playsInline
        preload="none"
        aria-label={alt}
      />
      <div className="absolute bottom-5 right-4 z-10 flex items-center gap-2 md:bottom-8 md:right-8">
        <span className="viz-label">{label}</span>
        <button type="button" onClick={toggle} className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/65">
          <span className="sr-only">{playing ? pauseLabel : playLabel}</span>
          {playing ? (
            <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M5 3h3v14H5zM12 3h3v14h-3z" /></svg>
          ) : (
            <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M6 3.5v13l11-6.5z" /></svg>
          )}
        </button>
      </div>
    </>
  );
}
