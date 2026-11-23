export const fmtDate = (iso: string | null | undefined) =>
  iso ? new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" }).format(new Date(iso)) : "–";

/** ISO-UTC → Wert für <input type="datetime-local"> in Europe/Berlin */
export function toBerlinLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(iso));
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}

export const leadTypeLabel: Record<string, string> = { municipality: "Kommune", investor: "Investor", partner: "Partner", supplier: "Lieferant", contact: "Kontakt" };
export const leadStatuses = ["new", "qualified", "contacted", "in_discussion", "won", "lost", "archived"] as const;
export const statusLabel: Record<string, string> = { new: "Neu", qualified: "Qualifiziert", contacted: "Kontaktiert", in_discussion: "Im Gespräch", won: "Gewonnen", lost: "Verloren", archived: "Archiviert" };
