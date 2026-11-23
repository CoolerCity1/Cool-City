import { signIn } from "../actions";
import { LogoMark } from "@/components/layout/Logo";

export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <form action={signIn} className="card w-full max-w-sm p-8">
        <LogoMark className="h-12 w-12" />
        <h1 className="mt-4 text-2xl font-extrabold">Redaktion & Admin</h1>
        {e && <p role="alert" className="mt-4 rounded-xl bg-[#fbeee8] p-3 text-sm font-semibold text-signal">Anmeldung fehlgeschlagen.</p>}
        <label htmlFor="email" className="field-label mt-6">E-Mail</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="field-input" />
        <label htmlFor="password" className="field-label mt-4">Passwort</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field-input" />
        <button className="btn btn-primary mt-6 w-full">Anmelden</button>
      </form>
    </main>
  );
}
