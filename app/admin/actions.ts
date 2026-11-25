"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { supabaseServer, getStaff, type Role } from "@/lib/supabase/server";
import { sendMail } from "@/lib/email/send";
import { deckAccess } from "@/lib/email/templates";
import { isLocale } from "@/lib/i18n/config";

async function requireRole(roles: Role[]) {
  const staff = await getStaff();
  if (!staff || !staff.role || !roles.includes(staff.role)) redirect("/admin/login");
  return staff;
}

async function audit(action: string, entity: string, entityId: string | null, details: Record<string, unknown> = {}) {
  const supabase = await supabaseServer();
  const staff = await getStaff();
  await supabase.from("audit_logs").insert({ actor_id: staff?.id ?? null, action, entity, entity_id: entityId, details });
}

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" && v.trim() ? v.trim() : null;
};

export async function signIn(fd: FormData) {
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email: String(fd.get("email") ?? ""), password: String(fd.get("password") ?? "") });
  if (error) redirect("/admin/login?e=1");
  redirect("/admin");
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* ---------- Leads ---------- */
export async function updateLead(fd: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(fd.get("id"));
  const supabase = await supabaseServer();
  const status = str(fd, "status");
  const notes = typeof fd.get("internal_notes") === "string" ? String(fd.get("internal_notes")) : undefined;
  await supabase.from("leads").update({ ...(status ? { status } : {}), ...(notes !== undefined ? { internal_notes: notes } : {}) }).eq("id", id);
  await audit("lead.update", "leads", id, { status });
  revalidatePath(`/admin/leads/${id}`);
}

export async function grantDeck(fd: FormData) {
  await requireRole(["admin"]);
  const leadId = String(fd.get("lead_id"));
  const downloadId = String(fd.get("download_id"));
  const days = Math.min(Math.max(Number(fd.get("days") ?? 7), 1), 30);
  const supabase = await supabaseServer();

  const { data: lead } = await supabase.from("leads").select("id, locale, contact_id, contacts(email, first_name)").eq("id", leadId).single();
  const { data: doc } = await supabase.from("downloads").select("id, storage_bucket, storage_path, approval_status").eq("id", downloadId).single();
  if (!lead || !doc || doc.approval_status !== "approved") redirect(`/admin/leads/${leadId}?e=doc`);

  const { data: signed, error } = await supabase.storage.from(doc.storage_bucket).createSignedUrl(doc.storage_path, days * 86400, { download: true });
  if (error || !signed) redirect(`/admin/leads/${leadId}?e=sign`);

  const expires = new Date(Date.now() + days * 86400_000).toISOString();
  const { data: access } = await supabase
    .from("download_access")
    .insert({ contact_id: lead.contact_id, download_id: doc.id, expires_at: expires, access_log: [{ event: "link_issued", at: new Date().toISOString() }] })
    .select("id")
    .single();
  await supabase.from("investor_requests").update({ review_status: "approved", reviewed_at: new Date().toISOString() }).eq("lead_id", leadId);

  const contact = (Array.isArray(lead.contacts) ? lead.contacts[0] : lead.contacts) as { email: string; first_name: string | null } | null;
  if (contact?.email) {
    const locale = isLocale(lead.locale) ? lead.locale : "de";
    const mail = deckAccess(locale, contact.first_name, signed.signedUrl, expires);
    await sendMail({ key: `deck-access:${access?.id ?? leadId}`, event: "deck_access", to: contact.email, ...mail, locale, template: "deck_access", contactId: lead.contact_id });
  }
  await supabase.from("leads").update({ status: "contacted" }).eq("id", leadId).eq("status", "new");
  await audit("investor.grant_deck", "download_access", access?.id ?? null, { lead_id: leadId, days });
  redirect(`/admin/leads/${leadId}?ok=deck`);
}

export async function revokeAccess(fd: FormData) {
  await requireRole(["admin"]);
  const id = String(fd.get("id"));
  const leadId = String(fd.get("lead_id"));
  const supabase = await supabaseServer();
  await supabase.from("download_access").update({ revoked_at: new Date().toISOString(), expires_at: new Date().toISOString() }).eq("id", id);
  await supabase.from("investor_requests").update({ review_status: "revoked" }).eq("lead_id", leadId);
  await audit("investor.revoke", "download_access", id);
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function rejectInvestor(fd: FormData) {
  await requireRole(["admin"]);
  const leadId = String(fd.get("lead_id"));
  const supabase = await supabaseServer();
  await supabase.from("investor_requests").update({ review_status: "rejected", reviewed_at: new Date().toISOString() }).eq("lead_id", leadId);
  await audit("investor.reject", "investor_requests", leadId);
  revalidatePath(`/admin/leads/${leadId}`);
}

/* ---------- Webinare ---------- */
/** Wandelt "YYYY-MM-DDTHH:mm" (Ortszeit Europe/Berlin) in ISO-UTC um – inkl. Sommer-/Winterzeit. */
function berlinToUtc(local: string): string {
  const asUtc = new Date(local + ":00Z");
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(asUtc);
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const berlinAsUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"));
  const offset = berlinAsUtc - asUtc.getTime();
  return new Date(asUtc.getTime() - offset).toISOString();
}

function webinarFields(fd: FormData) {
  const date = str(fd, "starts_at");
  return {
    webinar_type: str(fd, "webinar_type") ?? "municipality",
    locale: str(fd, "locale") ?? "de",
    title: str(fd, "title") ?? "",
    description: str(fd, "description"),
    starts_at: date && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date) ? berlinToUtc(date) : null,
    duration_minutes: Number(str(fd, "duration_minutes") ?? 45),
    meeting_url: str(fd, "meeting_url"),
    capacity: str(fd, "capacity") ? Number(str(fd, "capacity")) : null,
    status: str(fd, "status") ?? "draft",
  };
}

export async function saveWebinar(fd: FormData) {
  await requireRole(["admin", "editor"]);
  const supabase = await supabaseServer();
  const id = str(fd, "id");
  const fields = webinarFields(fd);
  if (!fields.title || !fields.starts_at) redirect(id ? `/admin/webinars/${id}?e=1` : "/admin/webinars?e=1");
  if (id) {
    await supabase.from("webinars").update(fields).eq("id", id);
    await audit("webinar.update", "webinars", id, { status: fields.status });
  } else {
    const { data } = await supabase.from("webinars").insert(fields).select("id").single();
    await audit("webinar.create", "webinars", data?.id ?? null);
    revalidatePath("/[locale]/[[...slug]]", "page");
    redirect(`/admin/webinars/${data?.id}`);
  }
  revalidatePath("/[locale]/[[...slug]]", "page");
  revalidatePath(`/admin/webinars/${id}`);
}

/* ---------- Inhalte ---------- */
export async function setContentStatus(fd: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(fd.get("id"));
  const status = String(fd.get("status"));
  if (!["draft", "reviewed", "published"].includes(status)) return;
  const supabase = await supabaseServer();
  await supabase.from("content_entries").update({ status, ...(status === "published" ? { published_at: new Date().toISOString() } : {}) }).eq("id", id);
  await audit("content.status", "content_entries", id, { status });
  revalidateTag("content");
  revalidatePath("/admin/content");
}

export async function saveArticle(fd: FormData) {
  await requireRole(["admin", "editor"]);
  const supabase = await supabaseServer();
  const id = str(fd, "id");
  const sources = (str(fd, "sources") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [title, url] = l.split("|").map((x) => x.trim());
      return url ? { title, url } : { title };
    });
  const fields = {
    content_type: "article",
    slug: (str(fd, "slug") ?? "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""),
    locale: str(fd, "locale") ?? "de",
    title: str(fd, "title"),
    teaser: str(fd, "teaser"),
    body: str(fd, "body"),
    seo_title: str(fd, "seo_title"),
    seo_description: str(fd, "seo_description"),
    author: str(fd, "author"),
    data: { category: str(fd, "category") ?? undefined, sources },
  };
  if (!fields.slug || !fields.title) redirect(id ? `/admin/content/${id}?e=1` : "/admin/content?e=1");
  if (id) {
    const { data: cur } = await supabase.from("content_entries").select("revision").eq("id", id).single();
    await supabase.from("content_entries").update({ ...fields, revision: (cur?.revision ?? 1) + 1 }).eq("id", id);
    await audit("article.update", "content_entries", id);
  } else {
    const { data } = await supabase.from("content_entries").insert({ ...fields, status: "draft" }).select("id").single();
    await audit("article.create", "content_entries", data?.id ?? null);
    redirect(`/admin/content/${data?.id}`);
  }
  revalidateTag("content");
  revalidatePath(`/admin/content/${id}`);
}

/* ---------- Downloads ---------- */
export async function uploadDownload(fd: FormData) {
  await requireRole(["admin"]);
  const file = fd.get("file");
  const title = str(fd, "title");
  if (!(file instanceof File) || !file.size || !title) redirect("/admin/downloads?e=1");
  if (file.type !== "application/pdf" || file.size > 4 * 1024 * 1024) redirect("/admin/downloads?e=type");
  const supabase = await supabaseServer();
  const path = `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}.pdf`;
  const { error } = await supabase.storage.from("investor-docs").upload(path, file, { contentType: "application/pdf", upsert: false });
  if (error) redirect("/admin/downloads?e=upload");
  const { data } = await supabase
    .from("downloads")
    .insert({ doc_type: str(fd, "doc_type") ?? "pitch_deck", title, version: str(fd, "version"), storage_bucket: "investor-docs", storage_path: path, approval_status: "draft" })
    .select("id")
    .single();
  await audit("download.upload", "downloads", data?.id ?? null);
  revalidatePath("/admin/downloads");
}

export async function setDownloadStatus(fd: FormData) {
  await requireRole(["admin"]);
  const id = String(fd.get("id"));
  const status = String(fd.get("status"));
  if (!["draft", "approved", "withdrawn"].includes(status)) return;
  const supabase = await supabaseServer();
  await supabase.from("downloads").update({ approval_status: status }).eq("id", id);
  await audit("download.status", "downloads", id, { status });
  revalidatePath("/admin/downloads");
}

export async function setNewsletterStatus(fd: FormData) {
  await requireRole(["admin", "editor"]);
  const id = str(fd, "id");
  const status = str(fd, "status");
  if (!id || status !== "unsubscribed") redirect("/admin/newsletter");
  const supabase = await supabaseServer();
  await supabase.from("newsletter_subscriptions").update({ doi_status: "unsubscribed", unsubscribed_at: new Date().toISOString() }).eq("id", id);
  await audit("newsletter.unsubscribe", "newsletter_subscriptions", id);
  revalidatePath("/admin/newsletter");
}

/* ---------- Öffentliche Termine (Messen, Kongresse) ---------- */
const EVENT_LOCALES = ["de", "en", "es", "it", "fr", "pt"] as const;
const isoDate = (v: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

export async function saveEvent(fd: FormData) {
  await requireRole(["admin", "editor"]);
  const supabase = await supabaseServer();
  const id = str(fd, "id");
  const back = id ? `/admin/events/${id}` : "/admin/events";
  const title = str(fd, "title")?.slice(0, 200) ?? null;
  const starts = isoDate(str(fd, "starts"));
  const ends = isoDate(str(fd, "ends")) ?? starts;
  const url = str(fd, "url");
  const country = (str(fd, "country") ?? "").toUpperCase();
  const categoryRaw = str(fd, "category");
  const category = categoryRaw === "congress" || categoryRaw === "exhibition" ? categoryRaw : "fair";
  const status = str(fd, "status") === "published" ? "published" : "draft";
  const city: Record<string, string> = {};
  const desc: Record<string, string> = {};
  for (const l of EVENT_LOCALES) {
    const c = str(fd, `city_${l}`);
    const t = str(fd, `desc_${l}`);
    if (c) city[l] = c.slice(0, 120);
    if (t) desc[l] = t.slice(0, 400);
  }
  if (!title || !starts || !ends || ends < starts || !city.de || (url && !/^https:\/\/[^\s]+$/.test(url)) || (country && !/^[A-Z]{2}$/.test(country))) {
    redirect(`${back}?e=1`);
  }
  const data = { starts, ends, country: country || undefined, category, url: url || undefined, city, desc };
  if (id) {
    await supabase.from("content_entries").update({ title, data, status, ...(status === "published" ? { published_at: new Date().toISOString() } : {}) }).eq("id", id).eq("content_type", "event");
    await audit("event.update", "content_entries", id, { status });
    revalidateTag("content");
    revalidatePath("/admin/events");
    redirect(`/admin/events/${id}?ok=1`);
  }
  const base = `${title}-${starts.slice(0, 4)}`.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  const { data: row } = await supabase
    .from("content_entries")
    .insert({ content_type: "event", locale: "de", slug, title, data, status, ...(status === "published" ? { published_at: new Date().toISOString() } : {}) })
    .select("id")
    .single();
  await audit("event.create", "content_entries", row?.id ?? null, { status });
  revalidateTag("content");
  revalidatePath("/admin/events");
  redirect(row?.id ? `/admin/events/${row.id}?ok=1` : "/admin/events?e=1");
}

export async function deleteEvent(fd: FormData) {
  await requireRole(["admin"]);
  const id = str(fd, "id");
  if (!id || fd.get("confirm") !== "on") redirect(id ? `/admin/events/${id}` : "/admin/events");
  const supabase = await supabaseServer();
  await supabase.from("content_entries").delete().eq("id", id).eq("content_type", "event");
  await audit("event.delete", "content_entries", id);
  revalidateTag("content");
  revalidatePath("/admin/events");
  redirect("/admin/events");
}
