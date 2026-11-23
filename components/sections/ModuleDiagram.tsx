"use client";

import { useState } from "react";

type Hotspot = { id: string; title: string; text: string };

const pos: Record<string, [number, number]> = {
  vegetation: [300, 118],
  inlay: [300, 462],
  substrate: [176, 412],
  irrigation: [404, 522],
  sensors: [446, 356],
  tank: [252, 612],
  insulation: [126, 470],
  logistics: [205, 681],
};

export function ModuleDiagram({ hotspots, conceptLabel, compact = false }: { hotspots: Hotspot[]; conceptLabel: string; compact?: boolean }) {
  const [active, setActive] = useState<string>(hotspots[0]?.id ?? "vegetation");
  const current = hotspots.find((h) => h.id === active) ?? hotspots[0];
  const dim = (id: string | string[]) => {
    const ids = Array.isArray(id) ? id : [id];
    return ids.includes(active) ? 1 : 0.28;
  };

  return (
    <div className={`grid items-center gap-10 ${compact ? "" : "lg:grid-cols-[1.1fr_1fr]"}`}>
      <div className="relative mx-auto w-full max-w-[34rem]">
        <svg viewBox="0 0 600 760" className="h-auto w-full" role="img" aria-label={`${conceptLabel}: CoolBase`}>
          <defs>
            <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="#f1ece0" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="#d9cfb8" strokeWidth="2.4" />
            </pattern>
            <pattern id="soil" width="14" height="14" patternUnits="userSpaceOnUse">
              <rect width="14" height="14" fill="#5b4c40" />
              <circle cx="3" cy="4" r="1.6" fill="#7a6857" />
              <circle cx="10" cy="9" r="1.9" fill="#46392f" />
              <circle cx="7" cy="12" r="1.1" fill="#8b7866" />
            </pattern>
            <pattern id="grate" width="10" height="12" patternUnits="userSpaceOnUse">
              <rect width="10" height="12" fill="#e8e1cf" />
              <rect x="0" width="3" height="12" fill="#bfb39a" />
            </pattern>
            <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6cb9da" />
              <stop offset="1" stopColor="#238ab8" />
            </linearGradient>
          </defs>

          {/* Boden */}
          <rect x="40" y="700" width="520" height="6" rx="3" fill="#d4dad7" />

          {/* Baum */}
          <g opacity={dim("vegetation")} style={{ transition: "opacity .3s" }}>
            <rect x="293" y="200" width="14" height="210" rx="6" fill="#5b4a3c" />
            <path d="M300 250 L252 205 M300 285 L352 232" stroke="#5b4a3c" strokeWidth="7" strokeLinecap="round" />
            {[
              [300, 120, 92, "#1d6a50"], [208, 168, 70, "#155540"], [392, 168, 72, "#1b6149"], [250, 92, 62, "#247a5b"],
              [356, 88, 64, "#1f6e53"], [300, 190, 66, "#2b8462"], [160, 214, 46, "#1a5e46"], [440, 214, 48, "#236f55"],
            ].map(([cx, cy, r, c], i) => (
              <circle key={i} cx={cx as number} cy={cy as number} r={r as number} fill={c as string} />
            ))}
          </g>

          {/* Gehäuse + Dämmung */}
          <g opacity={dim(["insulation", "logistics"])} style={{ transition: "opacity .3s" }}>
            <rect x="110" y="330" width="380" height="370" rx="6" fill="#25343a" />
            <rect x="124" y="330" width="352" height="330" fill="url(#hatch)" />
          </g>

          {/* Innenraum: Substrat */}
          <g opacity={dim("substrate")} style={{ transition: "opacity .3s" }}>
            <rect x="136" y="378" width="328" height="168" fill="url(#soil)" />
          </g>
          {/* Wurzel-Inlay */}
          <g opacity={dim("inlay")} style={{ transition: "opacity .3s" }}>
            <path d="M222 392 Q300 380 378 392 L372 520 Q300 540 228 520 Z" fill="#9c8a72" stroke="#cdbb9c" strokeWidth="3" strokeDasharray="6 5" />
            <path d="M300 400 C 286 440 262 470 246 500 M300 410 C 312 450 338 474 356 502 M300 420 L300 512" stroke="#3f3127" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
          {/* Geotextil + Gitterrost */}
          <g opacity={dim(["substrate", "inlay"])} style={{ transition: "opacity .3s" }}>
            <rect x="136" y="546" width="328" height="4" fill="#efe9da" />
            <rect x="136" y="550" width="328" height="12" fill="url(#grate)" />
          </g>
          {/* Tank */}
          <g opacity={dim(["tank", "irrigation"])} style={{ transition: "opacity .3s" }}>
            <rect x="136" y="562" width="328" height="98" fill="#f4f6f5" />
            <path d="M136 586 C 190 576 240 596 300 586 S 410 576 464 586 L464 660 L136 660 Z" fill="url(#water)" />
          </g>
          {/* Bewässerung */}
          <g opacity={dim("irrigation")} style={{ transition: "opacity .3s" }}>
            <rect x="412" y="618" width="26" height="34" rx="4" fill="#25343a" />
            <path d="M425 618 L425 524 L170 524" stroke="#0b3028" strokeWidth="4" fill="none" strokeLinejoin="round" />
            {[190, 230, 270, 310, 350, 390].map((x) => (
              <circle key={x} cx={x} cy={524} r="4.5" fill="#6cb9da" stroke="#0b3028" strokeWidth="1.5" />
            ))}
          </g>
          {/* Sensorik + Solar */}
          <g opacity={dim("sensors")} style={{ transition: "opacity .3s" }}>
            <rect x="396" y="322" width="80" height="9" rx="2" fill="#238ab8" />
            <rect x="430" y="344" width="30" height="22" rx="3" fill="#0b3028" />
            <rect x="172" y="440" width="7" height="44" rx="3" fill="#fafaf6" stroke="#0b3028" strokeWidth="2" />
            <rect x="146" y="564" width="22" height="10" rx="2" fill="#0b3028" />
            <path d="M445 344 L445 336" stroke="#0b3028" strokeWidth="2" />
          </g>
          {/* Logistik: Staplertaschen + Kranösen */}
          <g opacity={dim("logistics")} style={{ transition: "opacity .3s" }}>
            <rect x="150" y="668" width="100" height="24" rx="3" fill="#0f191c" />
            <rect x="350" y="668" width="100" height="24" rx="3" fill="#0f191c" />
            <circle cx="122" cy="322" r="9" fill="none" stroke="#25343a" strokeWidth="5" />
            <circle cx="478" cy="322" r="9" fill="none" stroke="#25343a" strokeWidth="5" />
            <rect x="490" y="580" width="10" height="8" rx="2" fill="#25343a" />
          </g>
        </svg>

        {hotspots.map((h, i) => {
          const [x, y] = pos[h.id] ?? [300, 380];
          const on = h.id === active;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => setActive(h.id)}
              aria-pressed={on}
              aria-label={h.title}
              className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-extrabold shadow-lg transition-all ${on ? "scale-110 bg-water text-white ring-4 ring-water/30" : "bg-white text-forest-dark hover:bg-forest-soft"}`}
              style={{ left: `${(x / 600) * 100}%`, top: `${(y / 760) * 100}%` }}
            >
              {i + 1}
            </button>
          );
        })}
        <span className="viz-label absolute right-2 top-2">{conceptLabel}</span>
      </div>

      <div>
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
          {hotspots.map((h, i) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => setActive(h.id)}
                aria-pressed={h.id === active}
                className={`flex min-h-12 w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-sm font-bold transition-colors ${h.id === active ? "border-forest bg-forest text-white" : "border-line bg-white text-slate hover:border-forest"}`}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${h.id === active ? "bg-white text-forest" : "bg-concrete"}`}>{i + 1}</span>
                {h.title}
              </button>
            </li>
          ))}
        </ol>
        {current && (
          <div className="mt-5 rounded-2xl border border-line bg-white p-6" aria-live="polite">
            <h3 className="text-h3">{current.title}</h3>
            <p className="mt-2 leading-relaxed text-slate-soft">{current.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
