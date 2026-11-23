/**
 * Passwortschutz („Ankündigungsseite“) – aktiv, solange SITE_PASSWORD gesetzt ist.
 * Das Cookie enthält nur einen SHA-256-Hash, nie das Passwort selbst. Ändert sich das Passwort,
 * werden alle bestehenden Freigaben ungültig.
 */
export const GATE_COOKIE = "cc_preview";

export function gateEnabled(): boolean {
  return !!process.env.SITE_PASSWORD;
}

export async function gateToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`cool-city-gate:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function isAuthorized(cookieValue: string | undefined): Promise<boolean> {
  const pw = process.env.SITE_PASSWORD;
  if (!pw) return true;
  if (!cookieValue) return false;
  return cookieValue === (await gateToken(pw));
}

/** Nur relative, interne Ziele zulassen (kein Open Redirect). */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/de";
  if (next.startsWith("/vorschau") || next.startsWith("/api/")) return "/de";
  return next;
}
