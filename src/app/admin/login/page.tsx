"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export default function PaginaLogin() {
  const router = useRouter();
  const supabase = crearClienteNavegador();

  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: clave,
    });

    setCargando(false);

    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-museo-oscuro px-6">
      <form
        onSubmit={manejarEnvio}
        className="w-full max-w-sm rounded-lg bg-white p-8 shadow-xl"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-museo-dorado">
          Museo Regional de Magallanes
        </p>
        <h1 className="mt-1 text-xl font-bold text-museo-oscuro">
          Panel de administración
        </h1>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-museo-texto">
              Correo
            </label>
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full rounded-md border border-museo-medio/30 px-3 py-2 text-sm focus:border-museo-medio focus:outline-none"
              placeholder="admin@museodemagallanes.gob.cl"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-museo-texto">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full rounded-md border border-museo-medio/30 px-3 py-2 text-sm focus:border-museo-medio focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="mt-6 w-full rounded-md bg-museo-oscuro py-2.5 text-sm font-semibold text-white transition hover:bg-museo-medio disabled:opacity-60"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
