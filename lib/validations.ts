import { z } from "zod";

/** Fehlermeldungen sind Schlüssel aus dictionary.forms.errors – so bleibt die Validierung sprachneutral. */
export type ErrorKey = "required" | "email" | "url" | "number" | "consent" | "tooLong" | "summary" | "server" | "rateLimited" | "spam" | "webinarFull" | "webinarUnavailable";

const req = (max = 200) => z.string().trim().min(1, "required").max(max, "tooLong");
const opt = (max = 200) => z.string().trim().max(max, "tooLong").optional().transform((v) => (v ? v : undefined));
const email = z.string().trim().min(1, "required").max(254, "tooLong").email("email");
const checkbox = z.union([z.literal("on"), z.literal("true")]).optional().transform((v) => !!v);
const consent = z.union([z.literal("on"), z.literal("true")], { errorMap: () => ({ message: "consent" }) });
const intOpt = (min: number, max: number) =>
  z.string().trim().optional().transform((v, ctx) => {
    if (!v) return undefined;
    const n = Number(v);
    if (!Number.isInteger(n) || n < min || n > max) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "number" });
      return z.NEVER;
    }
    return n;
  });
const urlOpt = z.string().trim().max(300, "tooLong").optional().transform((v, ctx) => {
  if (!v) return undefined;
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withProto);
    if (!u.hostname.includes(".")) throw new Error();
    return u.toString();
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "url" });
    return z.NEVER;
  }
});

const person = {
  first_name: req(100),
  last_name: req(100),
  email,
};

export const schemas = {
  municipality: z.object({
    ...person,
    country: req(80),
    city: req(120),
    organization: req(200),
    postal_code: opt(20),
    module_band: z.enum(["10-19", "20-49", "50-99", "100+", "open"], { errorMap: () => ({ message: "required" }) }),
    start_year: intOpt(2025, 2040),
    season_months: opt(100),
    site_count: intOpt(1, 999),
    site_description: opt(3000),
    role_title: req(120),
    phone: opt(40),
    message: opt(5000),
    privacy: consent,
    newsletter: checkbox,
  }),
  investor: z.object({
    ...person,
    organization: req(200),
    investor_category: z.enum(["vc", "angel", "strategic", "family_office", "public", "other"], { errorMap: () => ({ message: "required" }) }),
    investment_focus: opt(1000),
    linkedin_url: urlOpt,
    message: opt(5000),
    consent_contact: consent,
    privacy: consent,
    newsletter: checkbox,
  }),
  partner: z.object({
    ...person,
    organization: req(200),
    country: req(80),
    region: req(120),
    operator_profile: opt(2000),
    has_logistics: checkbox,
    has_green_expertise: checkbox,
    storage_capacity: opt(300),
    team_size: z.enum(["1-5", "6-20", "21-50", "50+"]).optional().or(z.literal("").transform(() => undefined)),
    investment_band: z.enum(["none", "lt50", "50-150", "150-500", "gt500"]).optional().or(z.literal("").transform(() => undefined)),
    phone: opt(40),
    message: opt(5000),
    privacy: consent,
    newsletter: checkbox,
  }),
  supplier: z.object({
    ...person,
    organization: req(200),
    country: req(80),
    supply_category: req(300),
    phone: opt(40),
    message: opt(5000),
    privacy: consent,
    newsletter: checkbox,
  }),
  contact: z.object({
    ...person,
    organization: opt(200),
    topic: z.enum(["municipality", "investor", "partner", "supplier", "press", "other"], { errorMap: () => ({ message: "required" }) }),
    message: req(5000),
    privacy: consent,
    newsletter: checkbox,
  }),
  webinar: z.object({
    ...person,
    organization: req(200),
    role_title: opt(120),
    country: opt(80),
    privacy: consent,
  }),
} as const;

export type LeadType = Exclude<keyof typeof schemas, "webinar">;
export const leadTypes: LeadType[] = ["municipality", "investor", "partner", "supplier", "contact"];

export function issuesToErrors(error: z.ZodError): Record<string, ErrorKey> {
  const out: Record<string, ErrorKey> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "_form");
    if (!out[field]) out[field] = (issue.message as ErrorKey) || "required";
  }
  return out;
}
