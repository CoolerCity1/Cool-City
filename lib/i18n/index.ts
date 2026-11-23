import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/de";
import de from "./dictionaries/de";
import en from "./dictionaries/en";
import es from "./dictionaries/es";
import it from "./dictionaries/it";
import fr from "./dictionaries/fr";
import pt from "./dictionaries/pt";

const dictionaries: Record<Locale, Dictionary> = { de, en, es, it, fr, pt };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? de;
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in values ? String(values[k]) : `{${k}}`));
}

export type { Dictionary };
