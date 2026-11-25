import { supabaseServer, getStaff } from "@/lib/supabase/server";
import { siteUrl as site } from "@/lib/site";

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s; // CSV-Injection verhindern
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  const staff = await getStaff();
  if (!staff?.role || !["admin", "editor"].includes(staff.role)) return new Response("Forbidden", { status: 403 });
  const url = new URL(req.url);
  const supabase = await supabaseServer();
  let q = supabase
    .from("newsletter_subscriptions")
    .select("email, locale, doi_status, source, consented_at, confirmed_at, unsubscribed_at, doi_token")
    .order("created_at", { ascending: false });
  const status = url.searchParams.get("status");
  const locale = url.searchParams.get("locale");
  if (status) q = q.eq("doi_status", status);
  if (locale) q = q.eq("locale", locale);
  const { data, error } = await q;
  if (error) return new Response("Error", { status: 500 });
  const header = ["email", "locale", "status", "source", "consented_at", "confirmed_at", "unsubscribed_at", "unsubscribe_url"];
  const lines = (data ?? []).map((r) =>
    [r.email, r.locale, r.doi_status, r.source, r.consented_at, r.confirmed_at, r.unsubscribed_at, `${site}/${r.locale}/newsletter?unsubscribe=${r.doi_token}`].map(csvCell).join(";"),
  );
  await supabase.from("audit_logs").insert({ actor_id: staff.id, action: "newsletter.export", entity: "newsletter_subscriptions", details: { count: lines.length, status, locale } });
  return new Response("﻿" + [header.join(";"), ...lines].join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="cool-city-newsletter-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
  });
}
