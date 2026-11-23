"use client";

import { useActionState } from "react";
import { registerWebinar } from "@/app/actions/forms";
import { initialFormState } from "@/lib/forms";
import { TextField, PrivacyCheckbox, HiddenMeta, FormAlert, SubmitButton, useFieldProps, type FormDict } from "./Fields";

export function WebinarForm({ webinarId, f, locale, privacyHref, ts }: { webinarId: string; f: FormDict; locale: string; privacyHref: string; ts: number }) {
  const [state, action] = useActionState(registerWebinar, initialFormState);
  const fp = useFieldProps(state, f);
  return (
    <form action={action} key={state.nonce} className="relative space-y-5">
      <HiddenMeta locale={locale} ts={ts} />
      <input type="hidden" name="webinar_id" value={webinarId} />
      <FormAlert state={state} f={f} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField {...fp("first_name")} label={f.fields.firstName} required autoComplete="given-name" />
        <TextField {...fp("last_name")} label={f.fields.lastName} required autoComplete="family-name" />
        <TextField {...fp("email")} label={f.fields.email} required type="email" inputMode="email" autoComplete="email" className="sm:col-span-2" />
        <TextField {...fp("organization")} label={f.fields.organization} required autoComplete="organization" />
        <TextField {...fp("role_title")} label={f.fields.role} optionalLabel={f.optional} autoComplete="organization-title" />
      </div>
      <PrivacyCheckbox f={f} privacyHref={privacyHref} state={state} />
      <SubmitButton label={f.submitWebinar} pending={f.sending} />
    </form>
  );
}
