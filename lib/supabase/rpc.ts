import "server-only";

/**
 * Serverseitige Aufrufe der Supabase-RPCs. Schreibende Funktionen verlangen das SERVER_RPC_SECRET,
 * das nur in der Server-Umgebung existiert. Der öffentliche Anon-Key allein erlaubt keine Schreibzugriffe.
 */
export class RpcError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new RpcError("not_configured", "Supabase ist nicht konfiguriert");
  return { url: url.replace(/\/$/, ""), key };
}

export function hasSupabase(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export async function rpc<T>(fn: string, args: Record<string, unknown>, opts: { secret?: boolean; revalidate?: number } = {}): Promise<T> {
  const { url, key } = config();
  const body = { ...args } as Record<string, unknown>;
  if (opts.secret) {
    const secret = process.env.SERVER_RPC_SECRET;
    if (!secret) throw new RpcError("not_configured", "SERVER_RPC_SECRET fehlt");
    body.p_secret = secret;
  }
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...(opts.revalidate !== undefined ? { next: { revalidate: opts.revalidate } } : { cache: "no-store" as const }),
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const j = (await res.json()) as { message?: string };
      message = j.message || message;
    } catch {}
    const code = /rate_limited|webinar_full|webinar_unavailable|invalid_email|unauthorized/.exec(message)?.[0] ?? "rpc_failed";
    throw new RpcError(code, message);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** Lesender REST-Zugriff mit Anon-Key (nur über RLS freigegebene Daten). */
export async function restSelect<T>(path: string, revalidate = 300): Promise<T> {
  const { url, key } = config();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    next: { revalidate, tags: ["content"] },
  });
  if (!res.ok) throw new RpcError("select_failed", res.statusText);
  return (await res.json()) as T;
}
