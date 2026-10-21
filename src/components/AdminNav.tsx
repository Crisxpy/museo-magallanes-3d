"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = crearClienteNavegador();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const enlaces = [
    { href: "/admin", label: "Piezas" },
    { href: "/admin/nueva", label: "Agregar pieza" },
  ];

  return (
    <header className="border-b-4 border-museo-dorado bg-museo-oscuro">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-museo-dorado">
            Panel de administración
          </p>
          <h1 className="text-lg font-bold text-white">
            Museo Regional de Magallanes
          </h1>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          {enlaces.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`rounded px-3 py-1.5 ${
                pathname === enlace.href
                  ? "bg-museo-dorado text-museo-oscuro font-semibold"
                  : "text-white/80 hover:text-museo-dorado"
              }`}
            >
              {enlace.label}
            </Link>
          ))}
          <Link
            href="/"
            className="text-white/60 hover:text-white"
            target="_blank"
          >
            Ver sitio público
          </Link>
          <button
            onClick={cerrarSesion}
            className="rounded border border-white/30 px-3 py-1.5 text-white/80 hover:border-museo-dorado hover:text-museo-dorado"
          >
            Cerrar sesión
          </button>
        </nav>
      </div>
    </header>
  );
}
