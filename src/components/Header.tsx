import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

/**
 * Header público, clonado del tema oficial del Estado (theme_snpc) que usa
 * museodemagallanes.gob.cl: header blanco con el logo oficial (la franja
 * azul/roja institucional ya viene incluida dentro del propio archivo del
 * logo) + buscador, y barra de navegación negra.
 *
 * IMPORTANTE: por seguridad, aquí NO hay enlace al panel de administración.
 * El equipo del museo debe ingresar directamente escribiendo o guardando en
 * favoritos la URL /admin/login — ver la sección "Acceso del administrador"
 * en el README.
 */
export function Header({ busquedaActual }: { busquedaActual?: string }) {
  return (
    <>
      {/* Header blanco con logo oficial (incluye la franja azul/roja) + buscador */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-museo.png"
              alt="Museo Regional de Magallanes"
              width={364}
              height={128}
              priority
              className="h-24 w-auto"
            />
          </Link>

          <form
            action="/"
            method="GET"
            className="flex items-center gap-2 rounded border border-black/15 bg-white px-3 py-2 focus-within:border-museo-acento"
          >
            <input
              type="search"
              name="q"
              defaultValue={busquedaActual}
              placeholder="Busca"
              className="w-40 bg-transparent text-sm text-museo-texto outline-none placeholder:text-museo-texto/40 sm:w-56"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="text-museo-texto/50 hover:text-museo-acento"
            >
              <Search size={18} />
            </button>
          </form>
        </div>
      </header>

      {/* Barra de navegación negra */}
      <nav className="bg-museo-negro">
        <div className="mx-auto flex max-w-6xl items-center gap-10 px-6 py-5 text-base font-bold uppercase tracking-wide text-white">
          <Link href="/" className="hover:text-museo-acentoClaro">
            Inicio
          </Link>
          <span className="text-white/50">Colección Digital 3D</span>
        </div>
      </nav>
    </>
  );
}
