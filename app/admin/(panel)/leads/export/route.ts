import { supabaseServer, getStaff } from "@/lib/supabase/server";

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s; // CSV-Injection verhindern
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  const staff = await getStaff();
  if (!staff?.role || !["admin", "editor"].includes(staff.role)) return new Response("Forbidden", { status: 403 });
  const url = new URL(req.url);
  const supabase = await supabaseServer();
  let q = supabase
    .from("leads")
    .select("id, lead_type, status, submitted_at, locale, source, message, payload, organizations(name, country, city), contacts(first_name, last_name, email, phone, role_title), municipality_requests(*), partner_applications(*), investor_requests(*)")
    .order("submitted_at", { ascending: false });
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");
  if (type) q = q.eq("lead_type", type);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return new Response("Error", { status: 500 });
  const header = ["id", "type", "status", "submitted_at", "locale", "organization", "country", "city", "first_name", "last_name", "email", "phone", "role", "source", "message", "details"];
  const lines = (data ?? []).map((l) => {
    const o = l.organizations as unknown as Record<string, string> | null;
    const c = l.contacts as unknown as Record<string, string> | null;
    const details = { ...(l.payload as object), municipality: l.municipality_requests, partner: l.partner_applications, investor: l.investor_requests };
    return [l.id, l.lead_type, l.status, l.submitted_at, l.locale, o?.name, o?.country, o?.city, c?.first_name, c?.last_name, c?.email, c?.phone, c?.role_title, l.source, l.message, details].map(csvCell).join(";");
  });
  await supabase.from("audit_logs").insert({ actor_id: staff.id, action: "leads.export", entity: "leads", details: { count: lines.length, type, status } });
  return new Response("﻿" + [header.join(";"), ...lines].join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="cool-city-leads-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
  });
}
