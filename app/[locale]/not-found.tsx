import Link from "next/link";
import { headers } from "next/headers";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export default async function NotFound() {
  const h = await headers();
  const seg = (h.get("x-pathname") || "").split("/")[1];
  const locale = isLocale(seg) ? seg : "de";
  const d = getDictionary(locale);
  return (
    <section className="wrap flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-h1">{d.notFound.title}</h1>
      <p className="mt-4 max-w-xl text-lg text-slate-soft">{d.notFound.text}</p>
      <Link href={`/${locale}`} className="btn btn-primary mt-8">{d.notFound.home}</Link>
    </section>
  );
}
