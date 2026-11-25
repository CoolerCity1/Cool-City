import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "../globals.css";

const manrope = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "Cooler City – Demnächst",
  description: "Grüne Infrastruktur. Genau dort, wo Städte sie brauchen.",
  robots: { index: false, follow: false },
  icons: { icon: [{ url: "/brand/cool-city-icon.svg", type: "image/svg+xml" }], apple: "/brand/apple-icon.png" },
};
export const viewport: Viewport = { themeColor: "#0B3028" };
export const dynamic = "force-dynamic";

export default function GateLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={manrope.variable}>
      <body className="min-h-dvh bg-forest-dark font-sans text-white antialiased">{children}</body>
    </html>
  );
}
