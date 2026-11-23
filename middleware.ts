import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const LOCALES = ["de", "en", "es", "it", "fr", "pt"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin: Supabase-Session auffrischen und unangemeldete Besucher zum Login schicken
  if (pathname.startsWith("/admin")) {
    let res = NextResponse.next({ request: req });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return res;
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
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
  matcher: ["/((?!api|_next|brand|media|images|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.[a-zA-Z0-9]+$).*)"],
};
