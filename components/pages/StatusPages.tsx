import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import { rpc } from "@/lib/supabase/rpc";
import { cancelWebinarRegistration } from "@/app/actions/forms";

function Status({ title, text, extra, locale, d, ok = true }: { title: string; text?: string; extra?: string; locale: Locale; d: Dictionary; ok?: boolean }) {
  return (
    <section className="wrap flex min-h-[60vh] max-w-3xl flex-col items-start justify-center py-20">
      <span className={`flex h-14 w-14 items-center justify-center rounded-full ${ok ? "bg-forest-soft text-forest" : "bg-[#f6e3da] text-signal"}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">{ok ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M12 7v6m0 4h.01" />}</svg>
      </span>
      <h1 className="mt-6 text-h2">{title}</h1>
      {text && <p className="mt-4 text-lg leading-relaxed text-slate-soft">{text}</p>}
      {extra && <p className="mt-4 rounded-2xl bg-water-soft p-5 font-semibold">{extra}</p>}
      <Link href={href(locale, "home")} className="btn btn-primary mt-10">{d.thanks.home}</Link>
    </section>
  );
}

export function ThanksPage({ locale, d, type, newsletter }: { locale: Locale; d: Dictionary; type?: string; newsletter: boolean }) {
  const text = type === "investor" ? d.thanks.investor : type === "webinar" ? d.thanks.webinar : d.thanks.text;
  return <Status locale={locale} d={d} title={d.thanks.title} text={text} extra={newsletter ? d.thanks.newsletter : undefined} />;
}

const uuid = /^[0-9a-f-]{36}$/i;

export async function NewsletterPage({ locale, d, confirm, unsubscribe }: { locale: Locale; d: Dictionary; confirm?: string; unsubscribe?: string }) {
  let ok = false;
  let msg = d.newsletter.invalid;
  try {
    if (confirm && uuid.test(confirm)) {
      ok = await rpc<boolean>("confirm_newsletter", { p_token: confirm }, { secret: true });
      if (ok) msg = d.newsletter.confirmed;
    } else if (unsubscribe && uuid.test(unsubscribe)) {
      ok = await rpc<boolean>("unsubscribe_newsletter", { p_token: unsubscribe }, { secret: true });
      if (ok) msg = d.newsletter.unsubscribed;
    }
  } catch {
    ok = false;
  }
  return <Status locale={locale} d={d} ok={ok} title={msg} />;
}

export function WebinarCancelPage({ locale, d, token, done }: { locale: Locale; d: Dictionary; token?: string; done?: string }) {
  if (done === "1" || done === "0") return <Status locale={locale} d={d} ok={done === "1"} title={done === "1" ? d.webinarCancel.success : d.webinarCancel.invalid} />;
  if (!token || !uuid.test(token)) return <Status locale={locale} d={d} ok={false} title={d.webinarCancel.invalid} />;
  return (
    <section className="wrap flex min-h-[60vh] max-w-3xl flex-col items-start justify-center py-20">
      <h1 className="text-h2">{d.meta.pages.webinarCancel.title}</h1>
      <form action={cancelWebinarRegistration} className="mt-8">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="locale" value={locale} />
        <button type="submit" className="btn btn-primary">{d.email.webinarCancel}</button>
      </form>
    </section>
  );
}
