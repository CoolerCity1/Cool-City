"use client";

import { useId, useState } from "react";

type Labels = { capex: string; price: string; opex: string; utilization: string; overhead: string; margin: string; payback: string; seasons: string; formula: string; disclaimer: string; never: string };

export function UnitCalculator({ labels, numberLocale }: { labels: Labels; numberLocale: string }) {
  const [capex, setCapex] = useState(1700);
  const [price, setPrice] = useState(1850);
  const [opex, setOpex] = useState(400);
  const [util, setUtil] = useState(100);
  const [overhead, setOverhead] = useState(0);

  const revenue = price * (util / 100);
  const contribution = revenue - opex - revenue * (overhead / 100);
  const payback = contribution > 0 ? capex / contribution : null;
  const eur = new Intl.NumberFormat(numberLocale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const num = new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 2 });

  return (
    <div className="grid gap-8 rounded-[1.5rem] border border-line bg-white p-6 md:p-10 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-6">
        <Slider label={labels.capex} value={capex} set={setCapex} min={800} max={4000} step={50} display={eur.format(capex)} />
        <Slider label={labels.price} value={price} set={setPrice} min={800} max={4000} step={50} display={eur.format(price)} />
        <Slider label={labels.opex} value={opex} set={setOpex} min={0} max={1500} step={25} display={eur.format(opex)} />
        <Slider label={labels.utilization} value={util} set={setUtil} min={0} max={100} step={5} display={`${util} %`} />
        <Slider label={labels.overhead} value={overhead} set={setOverhead} min={0} max={50} step={1} display={`${overhead} %`} />
      </div>
      <div className="flex flex-col justify-between rounded-2xl bg-forest-dark p-7 text-white">
        <div aria-live="polite">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#9fc7b6]">{labels.margin}</p>
          <p className="mt-2 text-[2.6rem] font-extrabold leading-none tracking-tight tabular-nums">{eur.format(contribution)}</p>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.12em] text-[#9fc7b6]">{labels.payback}</p>
          <p className="mt-2 text-[2rem] font-extrabold leading-tight tabular-nums">
            {payback !== null ? `≈ ${num.format(payback)} ${labels.seasons}` : <span className="text-lg">{labels.never}</span>}
          </p>
        </div>
        <div className="mt-8 border-t border-white/15 pt-5 text-sm text-white/75">
          <p>{labels.formula}</p>
          <p className="mt-3 font-bold text-white">{labels.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, set, min, max, step, display }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step: number; display: string }) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-bold">{label}</label>
        <output htmlFor={id} className="text-lg font-extrabold tabular-nums text-forest">{display}</output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="mt-3 h-11 w-full cursor-pointer accent-[#155540]" />
    </div>
  );
}
