import { NextResponse } from "next/server";
import { GATE_COOKIE, gateToken, safeNext } from "@/lib/gate";

export async function POST(req: Request) {
  const fd = await req.formData();
  const next = safeNext(String(fd.get("next") ?? ""));
  const pw = process.env.SITE_PASSWORD;
  const base = new URL(req.url);

  if (!pw) return NextResponse.redirect(new URL(next, base), 303);

  const given = String(fd.get("password") ?? "");
  const [a, b] = await Promise.all([gateToken(given), gateToken(pw)]);
  if (a !== b) {
    await new Promise((r) => setTimeout(r, 800)); // bremst Ausprobieren
    const back = new URL(next, base);
    back.searchParams.set("zugang", "falsch");
    return NextResponse.redirect(back, 303);
  }

  const res = NextResponse.redirect(new URL(next, base), 303);
  res.cookies.set(GATE_COOKIE, b, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
