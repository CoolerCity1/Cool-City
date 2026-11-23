import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { GATE_COOKIE, gateEnabled, isAuthorized } from "@/lib/gate";

const LOCALES = ["de", "en", "es", "it", "fr", "pt"];

/** Pfade, die auch ohne Vorschau-Passwort erreichbar sein müssen. */
const GATE_EXEMPT = [/^\/api\/gate$/, /^\/api\/cron\//, /^\/api\/resend-webhook$/, /^\/vorschau$/, /^\/brand\//, /^\/robots\.txt$/, /^\/favicon\.ico$/];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1) Ankündigungsseite mit Passwort, solange SITE_PASSWORD gesetzt ist
  if (gateEnabled() && !GATE_EXEMPT.some((r) => r.test(pathname)) && !(await isAuthorized(req.cookies.get(GATE_COOKIE)?.value))) {
    if (pathname.startsWith("/api/") || req.method !== "GET") {
      return new NextResponse("Unauthorized", { status: 401, headers: { "X-Robots-Tag": "noindex, nofollow" } });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/vorschau";
    url.search = "";
    url.searchParams.set("next", pathname + search);
    const res = NextResponse.rewrite(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  }

  // Statische Dateien, API und Vorschauseite ohne weitere Logik durchreichen
  if (pathname.startsWith("/api/") || pathname === "/vorschau" || /\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next();
  }

  // 2) Admin: Supabase-Session auffrischen und unangemeldete Besucher zum Login schicken
  if (pathname.startsWith("/admin")) {
    let res = NextResponse.next({ request: req });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return res;
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies: { name: string; value: string; options: CookieOptions }[]) => {
          cookies.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    if (!data.user && pathname !== "/admin/login") {
      const login = req.nextUrl.clone();
      login.pathname = "/admin/login";
      login.search = "";
      return NextResponse.redirect(login);
    }
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // 3) Sprachpräfix erzwingen
  const first = pathname.split("/")[1];
  if (!LOCALES.includes(first)) {
    const url = req.nextUrl.clone();
    url.pathname = `/de${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, pathname === "/" ? 308 : 307);
  }

  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
