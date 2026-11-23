import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Supabase-Client mit der Session des angemeldeten Redaktions-/Admin-Users. Alle Zugriffe laufen über RLS. */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // In Server Components nicht setzbar – Middleware frischt die Session auf.
        }
      },
    },
  });
}

export type Role = "admin" | "editor" | "viewer";

export type Staff = { id: string; email: string | null; role: Role | null };

export async function getStaff(): Promise<Staff | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase.from("admin_profiles").select("role").eq("user_id", data.user.id).maybeSingle();
  return { id: data.user.id, email: data.user.email ?? null, role: (profile?.role as Role | undefined) ?? null };
}
