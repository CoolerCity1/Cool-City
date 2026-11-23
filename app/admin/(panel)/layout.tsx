import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaff } from "@/lib/supabase/server";
import { signOut } from "../actions";
import { LogoMark } from "@/components/layout/Logo";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  if (!staff.role) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6">
        <div className="card max-w-md p-8">
          <h1 className="text-xl font-extrabold">Kein Zugriff</h1>
          <p className="mt-3 text-slate-soft">Für {staff.email} ist keine Rolle hinterlegt. Ein Admin muss in der Tabelle admin_profiles eine Rolle vergeben.</p>
          <form action={signOut}><button className="btn btn-secondary mt-6">Abmelden</button></form>
        </div>
      </main>
    );
  }
  const nav = [
    ["/admin", "Übersicht"],
    ["/admin/leads", "Anfragen"],
    ["/admin/webinars", "Webinare"],
    ["/admin/content", "Inhalte"],
    ...(staff.role === "admin" ? [["/admin/downloads", "Downloads"]] : []),
  ];
  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 font-extrabold"><LogoMark className="h-8 w-8" /> Admin</Link>
          <nav className="flex flex-1 flex-wrap gap-1">
            {nav.map(([h, l]) => (
              <Link key={h} href={h} className="rounded-full px-3 py-2 text-sm font-bold hover:bg-concrete">{l}</Link>
            ))}
          </nav>
          <span className="text-sm text-muted">{staff.email} · {staff.role}</span>
          <form action={signOut}><button className="rounded-full px-3 py-2 text-sm font-bold hover:bg-concrete">Abmelden</button></form>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
