import Link from "next/link";
import { notFound } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";
import { href, dateLocale, type Locale } from "@/lib/i18n/config";
import { getWebinars, getWebinar } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import { PageHero } from "@/components/ui/Section";
import { WebinarList } from "@/components/sections/WebinarList";
import { WebinarForm } from "@/components/forms/WebinarForm";

export async function WebinarsPage({ locale, d }: { locale: Locale; d: Dictionary }) {
  const webinars = await getWebinars();
  const w = d.webinars;
  return (
    <>
      <PageHero eyebrow={w.eyebrow} title={w.title} text={w.text} />
      <section className="pb-16">
        <div className="wrap grid gap-4 md:grid-cols-2">
          {(["municipality", "investor"] as const).map((t) => (
            <div key={t} className={`rounded-[1.5rem] p-8 md:p-10 ${t === "municipality" ? "bg-forest text-white" : "bg-slate text-white"}`}>
              <p className="eyebrow eyebrow-light">{w.formats[t].label}</p>
              <h2 className="mt-4 text-h3 text-white">{w.formats[t].title}</h2>
              <p className="mt-3 text-white/80">{w.formats[t].text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="pb-24">
        <div className="wrap">
          <h2 className="text-h2">{w.upcoming}</h2>
          <div className="mt-8">
            <WebinarList locale={locale} d={d} webinars={webinars} empty={w.empty} />
          </div>
          {!webinars.length && (
            <Link href={href(locale, "contact")} className="btn btn-secondary mt-6">{w.notify}</Link>
          )}
        </div>
      </section>
    </>
  );
}

export async function WebinarDetailPage({ locale, d, id }: { locale: Locale; d: Dictionary; id: string }) {
  const web = await getWebinar(id);
  if (!web) notFound();
  const w = d.webinars;
  const fmt = new Intl.DateTimeFormat(dateLocale[locale], { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Berlin", timeZoneName: "short" });
  const cancelled = web.status === "cancelled";
  const full = web.seats_left === 0;
  const end = new Date(new Date(web.starts_at).getTime() + web.duration_minutes * 60_000).toISOString();
  const ld = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: web.title,
    description: web.description ?? undefined,
    startDate: web.starts_at,
    endDate: end,
    eventStatus: cancelled ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: { "@type": "VirtualLocation", url: `${siteUrl}${href(locale, "webinars", web.id)}` },
    inLanguage: web.locale,
    organizer: { "@type": "Organization", name: "Cool City", url: siteUrl },
    isAccessibleForFree: true,
  };

  return (
    <section className="wrap grid gap-12 py-14 md:py-20 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <Link href={href(locale, "webinars")} className="text-sm text-muted hover:text-forest">← {d.nav.webinars}</Link>
        <p className="eyebrow mt-8">{w.formats[web.webinar_type].label}</p>
        <h1 className="mt-4 text-h1">{web.title}</h1>
        {web.description && <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-slate-soft">{web.description}</p>}
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="card p-5"><dt className="text-sm font-bold text-muted">{w.date}</dt><dd className="mt-1 font-extrabold"><time dateTime={web.starts_at}>{fmt.format(new Date(web.starts_at))}</time></dd></div>
          <div className="card p-5"><dt className="text-sm font-bold text-muted">{w.duration}</dt><dd className="mt-1 font-extrabold">{web.duration_minutes} {d.common.minutes} · {web.locale.toUpperCase()}</dd></div>
        </dl>
        {!cancelled && <a href={`/api/webinars/${web.id}/ics`} className="link mt-6 inline-block">{w.addToCalendar}</a>}
      </div>
      <div className="lg:col-span-6">
        <div className="card p-6 md:p-10">
          <h2 className="text-h3">{w.registerTitle}</h2>
          {cancelled ? (
            <p className="mt-4 font-bold text-signal">{w.cancelled}</p>
          ) : full ? (
            <p className="mt-4 font-bold">{w.full}</p>
          ) : (
            <div className="mt-6">
              {web.seats_left !== null && <p className="mb-5 text-sm font-bold text-forest">{web.seats_left} {w.seatsLeft}</p>}
              <WebinarForm webinarId={web.id} f={d.forms} locale={locale} privacyHref={href(locale, "privacy")} ts={Date.now()} />
            </div>
          )}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </section>
  );
}
