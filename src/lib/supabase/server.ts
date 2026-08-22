import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para Server Components / Route Handlers.
 * Lee y escribe la sesión desde las cookies de la request.
 * Usa la clave pública (anon): las políticas RLS deciden qué puede ver
 * cada usuario (público vs. administrador autenticado).
 *
 * IMPORTANTE (Next.js 15+): cookies() es asíncrono, por eso esta función
 * también lo es. Todo lugar que la use debe hacer `await crearClienteServidor()`.
 */
export async function crearClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Se puede ignorar si se llama desde un Server Component puro.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Se puede ignorar si se llama desde un Server Component puro.
          }
        },
      },
    }
  );
}

/**
 * Cliente con la "service role key". Se salta RLS por completo.
 * SOLO usar dentro de Route Handlers protegidos, después de confirmar
 * que hay una sesión de administrador válida (ver src/middleware.ts).
 * Nunca exponer esta clave al navegador.
 */
export function crearClienteAdmin() {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
