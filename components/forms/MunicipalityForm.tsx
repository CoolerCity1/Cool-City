"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitLead } from "@/app/actions/forms";
import { initialFormState } from "@/lib/forms";
import { TextField, TextArea, SelectField, Checkbox, PrivacyCheckbox, HiddenMeta, FormAlert, SubmitButton, useFieldProps, type FormDict } from "./Fields";

const stepFields: string[][] = [
  ["country", "city", "organization", "postal_code"],
  ["module_band", "start_year", "season_months", "site_count", "site_description"],
  ["first_name", "last_name", "role_title", "email", "phone", "message"],
  ["privacy"],
];

export function MunicipalityForm({ f, locale, privacyHref, ts, source }: { f: FormDict; locale: string; privacyHref: string; ts: number; source?: string }) {
  const [state, action] = useActionState(submitLead, initialFormState);
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fp = useFieldProps(state, f);
  const steps = [f.steps.location, f.steps.needs, f.steps.contact, f.steps.review];
  const [summary, setSummary] = useState<Record<string, string>>({});
  const moved = useRef(false);

  // Nach Serverfehler zum ersten fehlerhaften Schritt springen
  useEffect(() => {
    if (state.status !== "error") return;
    const idx = stepFields.findIndex((fs) => fs.some((k) => state.errors[k]));
    moved.current = true;
    setStep(idx >= 0 ? idx : 3);
  }, [state]);

  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
  }, [step]);

  const validateStep = (i: number) => {
    const form = formRef.current;
    if (!form) return true;
    for (const name of stepFields[i]) {
      const el = form.elements.namedItem(name) as HTMLInputElement | null;
      if (el && !el.checkValidity()) {
        el.reportValidity();
        return false;
      }
    }
    return true;
  };

  const go = (to: number) => {
    if (to > step && !validateStep(step)) return;
    if (to === 3 && formRef.current) {
      const fd = new FormData(formRef.current);
      const s: Record<string, string> = {};
      for (const [k, v] of fd.entries()) if (typeof v === "string") s[k] = v;
      setSummary(s);
    }
    moved.current = true;
    setStep(to);
  };

  const yearNow = new Date().getFullYear();
  const years = Object.fromEntries([0, 1, 2, 3].map((n) => [String(yearNow + n), String(yearNow + n)]));
  const reviewRows: [string, string][] = [
    [f.fields.organization, summary.organization],
    [f.fields.city, [summary.postal_code, summary.city].filter(Boolean).join(" ")],
    [f.fields.country, summary.country],
    [f.fields.moduleBand, summary.module_band ? f.options.moduleBand[summary.module_band as keyof typeof f.options.moduleBand] : ""],
    [f.fields.startYear, summary.start_year],
    [f.fields.seasonMonths, summary.season_months],
    [f.fields.siteCount, summary.site_count],
    [`${f.fields.firstName} / ${f.fields.lastName}`, [summary.first_name, summary.last_name].filter(Boolean).join(" ")],
    [f.fields.role, summary.role_title],
    [f.fields.email, summary.email],
    [f.fields.phone, summary.phone],
  ].filter(([, v]) => !!v) as [string, string][];

  return (
    <form ref={formRef} action={action} key={state.nonce} noValidate={false} className="relative">
      <HiddenMeta locale={locale} type="municipality" ts={ts} source={source} />

      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label={f.stepOf.replace("{n}", String(step + 1)).replace("{total}", "4")} data-js-only>
        {steps.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}>
            <span className={`block h-1.5 rounded-full ${i <= step ? "bg-forest" : "bg-line"}`} />
            <span className={`mt-2 hidden text-xs font-bold uppercase tracking-wide sm:block ${i === step ? "text-forest" : "text-muted"}`}>{s}</span>
          </li>
        ))}
      </ol>

      <FormAlert state={state} f={f} />

      <fieldset data-step hidden={step !== 0} className="mt-6 space-y-5">
        <legend className="sr-only">{steps[0]}</legend>
        <StepHeading refEl={step === 0 ? headingRef : undefined} text={f.stepOf.replace("{n}", "1").replace("{total}", "4")} title={steps[0]} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField {...fp("country")} label={f.fields.country} required autoComplete="country-name" />
          <TextField {...fp("city")} label={f.fields.city} required autoComplete="address-level2" />
          <TextField {...fp("organization")} label={f.fields.organization} required autoComplete="organization" />
          <TextField {...fp("postal_code")} label={f.fields.postalCode} optionalLabel={f.optional} autoComplete="postal-code" />
        </div>
      </fieldset>

      <fieldset data-step hidden={step !== 1} className="mt-6 space-y-5">
        <legend className="sr-only">{steps[1]}</legend>
        <StepHeading refEl={step === 1 ? headingRef : undefined} text={f.stepOf.replace("{n}", "2").replace("{total}", "4")} title={steps[1]} />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField {...fp("module_band")} label={f.fields.moduleBand} required options={f.options.moduleBand} />
          <SelectField {...fp("start_year")} label={f.fields.startYear} optionalLabel={f.optional} options={years} />
          <TextField {...fp("season_months")} label={f.fields.seasonMonths} optionalLabel={f.optional} hint={f.hints.seasonMonths} />
          <TextField {...fp("site_count")} label={f.fields.siteCount} optionalLabel={f.optional} type="number" inputMode="numeric" />
        </div>
        <TextArea {...fp("site_description")} label={f.fields.siteDescription} optionalLabel={f.optional} hint={f.hints.siteDescription} rows={4} />
      </fieldset>

      <fieldset data-step hidden={step !== 2} className="mt-6 space-y-5">
        <legend className="sr-only">{steps[2]}</legend>
        <StepHeading refEl={step === 2 ? headingRef : undefined} text={f.stepOf.replace("{n}", "3").replace("{total}", "4")} title={steps[2]} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField {...fp("first_name")} label={f.fields.firstName} required autoComplete="given-name" />
          <TextField {...fp("last_name")} label={f.fields.lastName} required autoComplete="family-name" />
          <TextField {...fp("role_title")} label={f.fields.role} required autoComplete="organization-title" />
          <TextField {...fp("email")} label={f.fields.email} required type="email" inputMode="email" autoComplete="email" />
          <TextField {...fp("phone")} label={f.fields.phone} optionalLabel={f.optional} type="tel" inputMode="tel" autoComplete="tel" />
        </div>
        <TextArea {...fp("message")} label={f.fields.message} optionalLabel={f.optional} rows={4} />
      </fieldset>

      <fieldset data-step hidden={step !== 3} className="mt-6 space-y-6">
        <legend className="sr-only">{steps[3]}</legend>
        <StepHeading refEl={step === 3 ? headingRef : undefined} text={f.stepOf.replace("{n}", "4").replace("{total}", "4")} title={steps[3]} />
        {reviewRows.length > 0 && (
          <div className="rounded-2xl bg-concrete p-5" data-js-only>
            <p className="mb-3 font-bold">{f.review}</p>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
              {reviewRows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        <PrivacyCheckbox f={f} privacyHref={privacyHref} state={state} />
        <Checkbox name="newsletter" defaultChecked={state.values.newsletter === "on"} label={f.newsletter} />
        <p className="text-sm text-muted">{f.notBinding}</p>
      </fieldset>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <div data-js-only>
          {step > 0 && (
            <button type="button" onClick={() => go(step - 1)} className="btn btn-secondary">← {f.edit}</button>
          )}
        </div>
        {step < 3 ? (
          <button type="button" data-js-only onClick={() => go(step + 1)} className="btn btn-primary min-w-40">{steps[step + 1]} →</button>
        ) : (
          <SubmitButton label={f.submit} pending={f.sending} />
        )}
        <noscript>
          <button type="submit" className="btn btn-primary">{f.submit}</button>
        </noscript>
      </div>
    </form>
  );
}

function StepHeading({ text, title, refEl }: { text: string; title: string; refEl?: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <div>
      <p className="text-sm font-bold text-muted">{text}</p>
      <h3 ref={refEl} tabIndex={-1} className="text-h3 outline-none">{title}</h3>
    </div>
  );
}
