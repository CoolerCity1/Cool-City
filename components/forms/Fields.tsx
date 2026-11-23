"use client";

import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/forms";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";

export type FormDict = Dictionary["forms"];

export function useFieldProps(state: FormState, f: FormDict) {
  return (name: string) => {
    const err = state.errors[name];
    return {
      name,
      id: `f-${name}`,
      defaultValue: state.values[name] ?? "",
      "aria-invalid": err ? true : undefined,
      "aria-describedby": err ? `f-${name}-error` : undefined,
      error: err ? f.errors[err] : undefined,
    };
  };
}

type Base = { label: string; required?: boolean; hint?: string; error?: string; optionalLabel?: string; className?: string };

function Label({ htmlFor, label, required, optionalLabel }: { htmlFor: string; label: string; required?: boolean; optionalLabel?: string }) {
  return (
    <label htmlFor={htmlFor} className="field-label">
      {label}
      {required ? <span className="text-signal" aria-hidden="true"> *</span> : optionalLabel ? <span className="ml-1 font-normal text-muted">({optionalLabel})</span> : null}
    </label>
  );
}

function Feedback({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <>
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </>
  );
}

export function TextField(p: Base & { name: string; id: string; defaultValue: string; type?: string; autoComplete?: string; inputMode?: "text" | "email" | "tel" | "numeric" | "url"; "aria-invalid"?: boolean; "aria-describedby"?: string; maxLength?: number }) {
  const { label, required, hint, error, optionalLabel, className, ...input } = p;
  const describedBy = [input["aria-describedby"], hint ? `${p.id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <Label htmlFor={p.id} label={label} required={required} optionalLabel={optionalLabel} />
      <input {...input} type={p.type ?? "text"} required={required} aria-required={required} aria-describedby={describedBy} className="field-input" />
      <Feedback id={p.id} hint={hint} error={error} />
    </div>
  );
}

export function TextArea(p: Base & { name: string; id: string; defaultValue: string; "aria-invalid"?: boolean; "aria-describedby"?: string; rows?: number }) {
  const { label, required, hint, error, optionalLabel, className, ...input } = p;
  const describedBy = [input["aria-describedby"], hint ? `${p.id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <Label htmlFor={p.id} label={label} required={required} optionalLabel={optionalLabel} />
      <textarea {...input} required={required} aria-required={required} aria-describedby={describedBy} rows={p.rows ?? 5} className="field-input" />
      <Feedback id={p.id} hint={hint} error={error} />
    </div>
  );
}

export function SelectField(p: Base & { name: string; id: string; defaultValue: string; options: Record<string, string>; placeholder?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) {
  const { label, required, hint, error, optionalLabel, className, options, placeholder, ...input } = p;
  return (
    <div className={className}>
      <Label htmlFor={p.id} label={label} required={required} optionalLabel={optionalLabel} />
      <select {...input} required={required} aria-required={required} className="field-input appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22><path fill=%22%2325343a%22 d=%22M5 7l5 6 5-6z%22/></svg>')] bg-[length:1.1rem] bg-[right_0.9rem_center] bg-no-repeat pr-10">
        <option value="">{placeholder ?? "—"}</option>
        {Object.entries(options).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      <Feedback id={p.id} hint={hint} error={error} />
    </div>
  );
}

export function Checkbox({ name, label, defaultChecked, required, error, children }: { name: string; label?: string; defaultChecked?: boolean; required?: boolean; error?: string; children?: React.ReactNode }) {
  const id = `f-${name}`;
  return (
    <div>
      <div className="flex items-start gap-3">
        <input id={id} name={name} type="checkbox" defaultChecked={defaultChecked} required={required} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer rounded accent-[#155540]" />
        <label htmlFor={id} className="cursor-pointer leading-relaxed text-slate-soft">{children ?? label}</label>
      </div>
      {error && <p id={`${id}-error`} className="field-error pl-9">{error}</p>}
    </div>
  );
}

export function PrivacyCheckbox({ f, privacyHref, state }: { f: FormDict; privacyHref: string; state: FormState }) {
  const [before, after] = f.privacy.split("{link}");
  return (
    <Checkbox name="privacy" required defaultChecked={state.values.privacy === "on"} error={state.errors.privacy ? f.errors[state.errors.privacy] : undefined}>
      {before}
      <a href={privacyHref} target="_blank" rel="noopener" className="link">{f.privacyLink}</a>
      {after}
      <span className="text-signal" aria-hidden="true"> *</span>
    </Checkbox>
  );
}

export function HiddenMeta({ locale, type, ts, source }: { locale: string; type?: string; ts: number; source?: string }) {
  return (
    <>
      <input type="hidden" name="locale" value={locale} />
      {type && <input type="hidden" name="lead_type" value={type} />}
      <input type="hidden" name="ts" value={ts} />
      {source && <input type="hidden" name="source" value={source} />}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="f-website">Website</label>
        <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
    </>
  );
}

const fieldLabel: Record<string, keyof FormDict["fields"]> = {
  country: "country", city: "city", organization: "organization", postal_code: "postalCode", module_band: "moduleBand", start_year: "startYear",
  season_months: "seasonMonths", site_count: "siteCount", site_description: "siteDescription", first_name: "firstName", last_name: "lastName",
  role_title: "role", email: "emailGeneric", phone: "phone", message: "message", investor_category: "investorCategory", investment_focus: "investmentFocus",
  linkedin_url: "linkedin", region: "region", operator_profile: "operatorProfile", storage_capacity: "storage", team_size: "teamSize",
  investment_band: "investmentBand", topic: "topic", supply_category: "supplyCategory",
};

export function FormAlert({ state, f }: { state: FormState; f: FormDict }) {
  if (state.status !== "error" || !state.formError) return null;
  const fieldErrors = Object.keys(state.errors);
  return (
    <div role="alert" tabIndex={-1} className="rounded-2xl border border-signal/40 bg-[#fbeee8] p-5 font-semibold text-signal">
      {f.errors[state.formError]}
      {fieldErrors.length > 0 && state.formError === "summary" && (
        <ul className="mt-2 list-disc pl-5 text-sm font-normal">
          {fieldErrors.map((k) => (
            <li key={k}><a href={`#f-${k}`} className="underline">{fieldLabel[k] ? f.fields[fieldLabel[k]] : k === "privacy" || k === "consent_contact" ? f.errors.consent : k}</a></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SubmitButton({ label, pending }: { label: string; pending: string }) {
  const { pending: isPending } = useFormStatus();
  return (
    <button type="submit" disabled={isPending} aria-disabled={isPending} className="btn btn-primary min-w-48 disabled:opacity-70">
      {isPending ? pending : label}
    </button>
  );
}
