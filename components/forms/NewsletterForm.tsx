"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { subscribeNewsletter } from "@/app/actions/forms";
import { initialFormState } from "@/lib/forms";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";

type Props = {
  d: Dictionary["newsletterSignup"];
  errors: Dictionary["forms"]["errors"];
  locale: string;
  privacyHref: string;
  source: string;
  /** dark = auf dunklem Grund (Footer), light = auf hellem Grund (Teaser) */
  tone?: "dark" | "light";
};

function Submit({ label, pending, tone }: { label: string; pending: string; tone: "dark" | "light" }) {
  const { pending: isPending } = useFormStatus();
  return (
    <button type="submit" disabled={isPending} aria-disabled={isPending} className={`btn ${tone === "dark" ? "btn-light" : "btn-primary"} shrink-0 disabled:opacity-70`}>
      {isPending ? pending : label}
    </button>
  );
}

export function NewsletterForm({ d, errors, locale, privacyHref, source, tone = "light" }: Props) {
  const [state, action] = useActionState(subscribeNewsletter, initialFormState);
  const [ts, setTs] = useState(0);
  const msgRef = useRef<HTMLParagraphElement>(null);
  const id = `nl-${source}`;
  useEffect(() => setTs(Date.now()), []);
  useEffect(() => {
    if (state.status !== "idle") msgRef.current?.focus();
  }, [state]);

  const dark = tone === "dark";
  if (state.status === "success") {
    return (
      <p ref={msgRef} tabIndex={-1} role="status" className={`rounded-2xl p-5 font-semibold ${dark ? "bg-white/10 text-white" : "bg-[#e6f1ec] text-forest"}`}>
        {d.success}
      </p>
    );
  }

  const emailErr = state.errors.email ? errors[state.errors.email] : undefined;
  const consentErr = state.errors.privacy ? errors[state.errors.privacy] : undefined;
  const formErr = state.status === "error" && !emailErr && !consentErr && state.formError ? errors[state.formError] : undefined;
  const [before, after] = d.consent.split("{link}");

  return (
    <form action={action} key={state.nonce} className="relative space-y-4" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="ts" value={ts} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div>
        <label htmlFor={`${id}-email`} className={`mb-2 block text-sm font-bold ${dark ? "text-white" : "text-slate"}`}>{d.emailLabel}</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            defaultValue={state.values.email ?? ""}
            placeholder={d.placeholder}
            aria-invalid={emailErr ? true : undefined}
            aria-describedby={emailErr ? `${id}-email-error` : undefined}
            className={`min-h-12 w-full rounded-xl border px-4 text-base outline-none focus:ring-4 ${dark ? "border-white/25 bg-white/95 text-slate focus:border-water focus:ring-water/30" : "border-line bg-white text-slate focus:border-forest focus:ring-forest/15"}`}
          />
          <Submit label={d.button} pending={d.pending} tone={tone} />
        </div>
        {emailErr && <p id={`${id}-email-error`} className={`mt-2 text-sm font-semibold ${dark ? "text-[#ffb59c]" : "text-signal"}`}>{emailErr}</p>}
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            id={`${id}-privacy`}
            name="privacy"
            type="checkbox"
            required
            defaultChecked={state.values.privacy === "on"}
            aria-invalid={consentErr ? true : undefined}
            aria-describedby={consentErr ? `${id}-privacy-error` : undefined}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded accent-[#155540]"
          />
          <label htmlFor={`${id}-privacy`} className={`cursor-pointer text-sm leading-relaxed ${dark ? "text-white/75" : "text-slate-soft"}`}>
            {before}
            <a href={privacyHref} target="_blank" rel="noopener" className="underline underline-offset-2">{d.privacyLink}</a>
            {after}
          </label>
        </div>
        {consentErr && <p id={`${id}-privacy-error`} className={`mt-2 pl-8 text-sm font-semibold ${dark ? "text-[#ffb59c]" : "text-signal"}`}>{consentErr}</p>}
      </div>

      {formErr && (
        <p ref={msgRef} tabIndex={-1} role="alert" className={`text-sm font-semibold ${dark ? "text-[#ffb59c]" : "text-signal"}`}>{formErr}</p>
      )}
    </form>
  );
}
