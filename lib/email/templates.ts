import "server-only";
import { getDictionary, fill } from "../i18n";
import type { Locale } from "../i18n/config";
import { dateLocale } from "../i18n/config";

const colors = { forest: "#155540", slate: "#25343A", paper: "#FAFAF6", concrete: "#EDF0EE", water: "#238AB8" };

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function layout(locale: Locale, inner: string): string {
  const d = getDictionary(locale);
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:${colors.concrete};font-family:Manrope,Segoe UI,Helvetica,Arial,sans-serif;color:${colors.slate}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colors.concrete};padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:${colors.forest};padding:22px 32px;color:#fff;font-weight:800;font-size:18px;letter-spacing:-0.01em">Cooler City</td></tr>
<tr><td style="padding:32px;font-size:15px;line-height:1.6">${inner}<p style="margin:28px 0 0">${escapeHtml(d.email.signature)}</p></td></tr>
<tr><td style="padding:18px 32px;background:${colors.paper};font-size:12px;color:#5b676b">${escapeHtml(d.email.footer)}</td></tr>
</table></td></tr></table></body></html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:${colors.forest};color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px">${escapeHtml(label)}</a></p>`;
}

function greet(locale: Locale, name?: string | null): string {
  const d = getDictionary(locale);
  return name ? fill(d.email.greeting, { name }) : d.email.greetingNoName;
}

export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(dateLocale[locale], { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin", timeZoneName: "short" }).format(new Date(iso));
}

export function leadConfirmation(locale: Locale, name: string | null, investor: boolean) {
  const d = getDictionary(locale);
  const body = investor ? d.email.investorBody : d.email.leadBody;
  const g = greet(locale, name);
  return {
    subject: d.email.leadSubject,
    html: layout(locale, `<p>${escapeHtml(g)}</p><p>${escapeHtml(body)}</p><p style="font-size:13px;color:#5b676b">${escapeHtml(d.email.notBinding)}</p>`),
    text: `${g}\n\n${body}\n\n${d.email.notBinding}\n\n${d.email.signature}`,
  };
}

export function newsletterDoi(locale: Locale, name: string | null, url: string) {
  const d = getDictionary(locale);
  const g = greet(locale, name);
  return {
    subject: d.email.newsletterSubject,
    html: layout(locale, `<p>${escapeHtml(g)}</p><p>${escapeHtml(d.email.newsletterBody)}</p>${button(url, d.email.newsletterButton)}`),
    text: `${g}\n\n${d.email.newsletterBody}\n\n${url}\n\n${d.email.signature}`,
  };
}

export function webinarConfirmation(locale: Locale, name: string | null, w: { title: string; starts_at: string }, cancelUrl: string, reminder = false, meetingUrl?: string | null) {
  const d = getDictionary(locale);
  const g = greet(locale, name);
  const when = formatDateTime(w.starts_at, locale);
  const subject = fill(reminder ? d.email.reminderSubject : d.email.webinarSubject, { title: w.title });
  const intro = reminder ? d.email.reminderBody : d.email.webinarBody;
  const link = meetingUrl
    ? `<p><strong>${escapeHtml(d.email.webinarLink)}:</strong> <a href="${escapeHtml(meetingUrl)}">${escapeHtml(meetingUrl)}</a></p>`
    : `<p>${escapeHtml(d.email.webinarLinkPending)}</p>`;
  return {
    subject,
    html: layout(locale, `<p>${escapeHtml(g)}</p><p>${escapeHtml(intro)}</p><p><strong>${escapeHtml(w.title)}</strong><br>${escapeHtml(d.email.webinarWhen)}: ${escapeHtml(when)}</p>${link}<p style="font-size:13px"><a href="${escapeHtml(cancelUrl)}" style="color:${colors.slate}">${escapeHtml(d.email.webinarCancel)}</a></p>`),
    text: `${g}\n\n${intro}\n\n${w.title}\n${d.email.webinarWhen}: ${when}\n${meetingUrl ? `${d.email.webinarLink}: ${meetingUrl}` : d.email.webinarLinkPending}\n\n${d.email.webinarCancel}: ${cancelUrl}\n\n${d.email.signature}`,
  };
}

export function deckAccess(locale: Locale, name: string | null, url: string, expires: string) {
  const d = getDictionary(locale);
  const g = greet(locale, name);
  const date = new Intl.DateTimeFormat(dateLocale[locale], { dateStyle: "long" }).format(new Date(expires));
  const body = fill(d.email.deckBody, { date });
  return {
    subject: d.email.deckSubject,
    html: layout(locale, `<p>${escapeHtml(g)}</p><p>${escapeHtml(body)}</p>${button(url, d.email.deckButton)}`),
    text: `${g}\n\n${body}\n\n${url}\n\n${d.email.signature}`,
  };
}

export function internalLeadNotification(lead: { type: string; organization?: string | null; country?: string | null; locale: string; adminUrl: string }) {
  const subject = `Neue Anfrage (${lead.type})${lead.organization ? ` – ${lead.organization}` : ""}`;
  const text = `Neue Anfrage über cooler.city\n\nTyp: ${lead.type}\nOrganisation: ${lead.organization ?? "–"}\nLand: ${lead.country ?? "–"}\nSprache: ${lead.locale}\n\nDetails im Admin-Bereich: ${lead.adminUrl}`;
  return { subject, text, html: layout("de", `<p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>`) };
}
