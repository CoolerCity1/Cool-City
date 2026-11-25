"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { headers } from "next/headers";
import { isLocale, href, type Locale } from "@/lib/i18n/config";
import { schemas, issuesToErrors, leadTypes, type LeadType } from "@/lib/validations";
import type { FormState } from "@/lib/forms";
import { rpc, RpcError } from "@/lib/supabase/rpc";
import { sendMail } from "@/lib/email/send";
import { leadConfirmation, newsletterDoi, webinarConfirmation, internalLeadNotification } from "@/lib/email/templates";
import { buildIcs } from "@/lib/ics";
import { siteUrl, consentVersions } from "@/lib/site";

const MIN_FILL_MS = 2500;
const hits = new Map<string, number[]>();

/** Einfache Drosselung pro Instanz; zusätzlich begrenzt die Datenbank Einreichungen je E-Mail. */
function throttled(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 8;
}

function formValues(fd: FormData): Record<string, string> {
  const v: Record<string, string> = {};
  for (const [k, val] of fd.entries()) if (typeof val === "string" && !k.startsWith("$")) v[k] = val;
  return v;
}

function fail(values: Record<string, string>, errors: FormState["errors"], formError?: FormState["formError"]): FormState {
  // Honeypot/Zeitstempel nicht zurückspielen
  const { website: _w, ...rest } = values;
  return { status: "error", errors, formError, values: rest, nonce: Date.now() };
}

async function antiSpam(values: Record<string, string>): Promise<FormState["formError"] | null> {
  if (values.website) return "spam";
  const ts = Number(values.ts);
  if (!ts || Date.now() - ts < MIN_FILL_MS) return "spam";
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (throttled(ip)) return "rateLimited";
  return null;
}

export async function submitLead(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formValues(fd);
  const locale: Locale = isLocale(values.locale) ? values.locale : "de";
  const type = values.lead_type as LeadType;
  if (!leadTypes.includes(type)) return fail(values, {}, "server");

  const spam = await antiSpam(values);
  if (spam) return fail(values, {}, spam);

  const parsed = schemas[type].safeParse(values);
  if (!parsed.success) return fail(values, issuesToErrors(parsed.error), "summary");
  const data = parsed.data as Record<string, unknown> & { email: string; first_name: string; newsletter?: boolean };

  const payload: Record<string, unknown> = {
    ...data,
    lead_type: type,
    locale,
    source: values.source?.slice(0, 200) || null,
    privacy_version: consentVersions.privacy,
    newsletter_version: consentVersions.newsletter,
  };
  if (type === "supplier") {
    payload.operator_profile = data.supply_category;
    payload.notes = data.message;
  }
  if (type === "partner") payload.notes = data.message;
  if (type === "contact") payload.extra = { topic: data.topic };

  let result: { lead_id: string; contact_id: string; newsletter_token: string | null };
  try {
    result = await rpc("submit_lead", { p: payload }, { secret: true });
  } catch (e) {
    const code = e instanceof RpcError ? e.code : "rpc_failed";
    console.error("[lead] submit failed", type, code);
    if (code === "rate_limited") return fail(values, {}, "rateLimited");
    if (code === "invalid_email") return fail(values, { email: "email" }, "summary");
    return fail(values, {}, "server");
  }

  after(async () => {
    const mail = leadConfirmation(locale, data.first_name, type === "investor");
    await sendMail({ key: `lead-confirmation:${result.lead_id}`, event: "lead_created", to: data.email, ...mail, locale, template: "lead_confirmation", contactId: result.contact_id });
    if (result.newsletter_token) {
      const url = `${siteUrl}${href(locale, "newsletter")}?confirm=${result.newsletter_token}`;
      const doi = newsletterDoi(locale, data.first_name, url);
      await sendMail({ key: `newsletter-doi:${result.newsletter_token}`, event: "newsletter_doi", to: data.email, ...doi, locale, template: "newsletter_doi", contactId: result.contact_id });
    }
    const internal = process.env.INTERNAL_NOTIFY_EMAIL;
    if (internal) {
      const n = internalLeadNotification({
        type,
        organization: (data.organization as string | undefined) ?? null,
        country: (data.country as string | undefined) ?? null,
        locale,
        adminUrl: `${siteUrl}/admin/leads/${result.lead_id}`,
      });
      await sendMail({ key: `lead-internal:${result.lead_id}`, event: "lead_internal", to: internal, ...n, locale: "de", template: "internal_lead" });
    }
  });

  const params = new URLSearchParams({ typ: type });
  if (result.newsletter_token) params.set("nl", "1");
  redirect(`${href(locale, "thanks")}?${params.toString()}`);
}

export async function registerWebinar(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formValues(fd);
  const locale: Locale = isLocale(values.locale) ? values.locale : "de";
  const webinarId = values.webinar_id;
  if (!webinarId || !/^[0-9a-f-]{36}$/i.test(webinarId)) return fail(values, {}, "webinarUnavailable");

  const spam = await antiSpam(values);
  if (spam) return fail(values, {}, spam);

  const parsed = schemas.webinar.safeParse(values);
  if (!parsed.success) return fail(values, issuesToErrors(parsed.error), "summary");
  const data = parsed.data;

  let result: { registration_id: string; cancel_token: string; already: boolean; webinar: { id: string; title: string; description: string | null; starts_at: string; duration_minutes: number } };
  try {
    result = await rpc("register_webinar", { p_webinar: webinarId, p: { ...data, locale, privacy_version: consentVersions.privacy } }, { secret: true });
  } catch (e) {
    const code = e instanceof RpcError ? e.code : "rpc_failed";
    console.error("[webinar] register failed", code);
    if (code === "webinar_full") return fail(values, {}, "webinarFull");
    if (code === "webinar_unavailable") return fail(values, {}, "webinarUnavailable");
    return fail(values, {}, "server");
  }

  after(async () => {
    const cancelUrl = `${siteUrl}${href(locale, "webinarCancel")}?token=${result.cancel_token}`;
    const w = result.webinar;
    const mail = webinarConfirmation(locale, data.first_name, w, cancelUrl);
    const ics = buildIcs({ uid: result.registration_id, title: w.title, description: w.description, start: w.starts_at, durationMinutes: w.duration_minutes, url: `${siteUrl}${href(locale, "webinars", w.id)}` });
    await sendMail({
      key: `webinar-confirmation:${result.registration_id}:${result.cancel_token}`,
      event: "webinar_registered",
      to: data.email,
      ...mail,
      locale,
      template: "webinar_confirmation",
      attachments: [{ filename: "cool-city-webinar.ics", content: Buffer.from(ics).toString("base64"), contentType: "text/calendar" }],
    });
  });

  redirect(`${href(locale, "thanks")}?typ=webinar`);
}

/** Stornierung per POST (Bestätigungsklick), damit Link-Scanner in E-Mails nichts auslösen. */
export async function cancelWebinarRegistration(fd: FormData): Promise<void> {
  const token = String(fd.get("token") ?? "");
  const loc = String(fd.get("locale") ?? "de");
  const locale: Locale = isLocale(loc) ? loc : "de";
  let ok = false;
  if (/^[0-9a-f-]{36}$/i.test(token)) {
    try {
      const r = await rpc<{ cancelled: boolean }>("cancel_webinar_registration", { p_token: token }, { secret: true });
      ok = r.cancelled;
    } catch {
      ok = false;
    }
  }
  redirect(`${href(locale, "webinarCancel")}?done=${ok ? "1" : "0"}`);
}

/** Eigenständige Newsletter-Anmeldung (Footer/Teaser) mit Double-Opt-in. Antwortet immer gleich, damit keine Adressen ausgespäht werden können. */
export async function subscribeNewsletter(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formValues(fd);
  const locale: Locale = isLocale(values.locale) ? values.locale : "de";

  const spam = await antiSpam(values);
  if (spam) return fail(values, {}, spam);

  const parsed = schemas.newsletter.safeParse(values);
  if (!parsed.success) return fail(values, issuesToErrors(parsed.error), "summary");

  let token: string | null = null;
  try {
    const r = await rpc<{ token: string | null }>(
      "subscribe_newsletter",
      { p: { email: parsed.data.email, locale, source: values.source?.slice(0, 200) || null, newsletter_version: consentVersions.newsletter } },
      { secret: true },
    );
    token = r.token;
  } catch (e) {
    const code = e instanceof RpcError ? e.code : "rpc_failed";
    console.error("[newsletter] subscribe failed", code);
    if (code === "invalid_email") return fail(values, { email: "email" }, "summary");
    return fail(values, {}, "server");
  }

  if (token) {
    const t = token;
    const to = parsed.data.email;
    after(async () => {
      const url = `${siteUrl}${href(locale, "newsletter")}?confirm=${t}`;
      const doi = newsletterDoi(locale, null, url);
      await sendMail({ key: `newsletter-doi:${t}:${Date.now()}`, event: "newsletter_doi", to, ...doi, locale, template: "newsletter_doi" });
    });
  }
  return { status: "success", errors: {}, values: {}, nonce: Date.now() };
}
