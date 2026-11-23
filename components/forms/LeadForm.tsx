"use client";

import { useActionState } from "react";
import { submitLead } from "@/app/actions/forms";
import { initialFormState } from "@/lib/forms";
import { TextField, TextArea, SelectField, Checkbox, PrivacyCheckbox, HiddenMeta, FormAlert, SubmitButton, useFieldProps, type FormDict } from "./Fields";

export type LeadFormType = "investor" | "partner" | "supplier" | "contact";

export function LeadForm({ type, f, locale, privacyHref, ts, source }: { type: LeadFormType; f: FormDict; locale: string; privacyHref: string; ts: number; source?: string }) {
  const [state, action] = useActionState(submitLead, initialFormState);
  const fp = useFieldProps(state, f);
  const err = (k: string) => (state.errors[k] ? f.errors[state.errors[k]] : undefined);

  return (
    <form action={action} key={state.nonce} className="relative space-y-6">
      <HiddenMeta locale={locale} type={type} ts={ts} source={source} />
      <FormAlert state={state} f={f} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField {...fp("first_name")} label={f.fields.firstName} required autoComplete="given-name" />
        <TextField {...fp("last_name")} label={f.fields.lastName} required autoComplete="family-name" />
        <TextField {...fp("email")} label={type === "contact" ? f.fields.emailGeneric : f.fields.email} required type="email" inputMode="email" autoComplete="email" />
        {type === "contact" ? (
          <TextField {...fp("organization")} label={f.fields.organization} optionalLabel={f.optional} autoComplete="organization" />
        ) : (
          <TextField {...fp("organization")} label={f.fields.organization} required autoComplete="organization" />
        )}
      </div>

      {type === "investor" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField {...fp("investor_category")} label={f.fields.investorCategory} required options={f.options.investorCategory} />
          <TextField {...fp("linkedin_url")} label={f.fields.linkedin} optionalLabel={f.optional} hint={f.hints.linkedin} type="url" inputMode="url" />
          <TextArea {...fp("investment_focus")} label={f.fields.investmentFocus} optionalLabel={f.optional} rows={3} className="sm:col-span-2" />
        </div>
      )}

      {type === "partner" && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField {...fp("country")} label={f.fields.country} required autoComplete="country-name" />
            <TextField {...fp("region")} label={f.fields.region} required />
            <SelectField {...fp("team_size")} label={f.fields.teamSize} optionalLabel={f.optional} options={f.options.teamSize} />
            <SelectField {...fp("investment_band")} label={f.fields.investmentBand} optionalLabel={f.optional} options={f.options.investmentBand} />
            <TextField {...fp("storage_capacity")} label={f.fields.storage} optionalLabel={f.optional} className="sm:col-span-2" />
          </div>
          <TextArea {...fp("operator_profile")} label={f.fields.operatorProfile} optionalLabel={f.optional} rows={3} />
          <div className="space-y-3 rounded-2xl bg-concrete p-5">
            <Checkbox name="has_logistics" defaultChecked={state.values.has_logistics === "on"} label={f.fields.hasLogistics} />
            <Checkbox name="has_green_expertise" defaultChecked={state.values.has_green_expertise === "on"} label={f.fields.hasGreen} />
          </div>
        </>
      )}

      {type === "supplier" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField {...fp("country")} label={f.fields.country} required autoComplete="country-name" />
          <TextField {...fp("supply_category")} label={f.fields.supplyCategory} required />
        </div>
      )}

      {type === "contact" && <SelectField {...fp("topic")} label={f.fields.topic} required options={f.options.topic} />}

      {(type === "partner" || type === "supplier") && (
        <TextField {...fp("phone")} label={f.fields.phone} optionalLabel={f.optional} type="tel" inputMode="tel" autoComplete="tel" />
      )}

      {type === "contact" ? (
        <TextArea {...fp("message")} label={f.fields.message} required rows={6} />
      ) : (
        <TextArea {...fp("message")} label={f.fields.message} optionalLabel={f.optional} rows={4} />
      )}

      <div className="space-y-4 border-t border-line pt-6">
        {type === "investor" && (
          <Checkbox name="consent_contact" required defaultChecked={state.values.consent_contact === "on"} error={err("consent_contact")}>
            {f.investorConsent}
            <span className="text-signal" aria-hidden="true"> *</span>
          </Checkbox>
        )}
        <PrivacyCheckbox f={f} privacyHref={privacyHref} state={state} />
        <Checkbox name="newsletter" defaultChecked={state.values.newsletter === "on"} label={f.newsletter} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">{f.notBinding}</p>
        <SubmitButton label={f.submit} pending={f.sending} />
      </div>
    </form>
  );
}
