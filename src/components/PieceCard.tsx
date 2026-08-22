import Link from "next/link";
import type { Pieza } from "@/lib/types";

/**
 * Tarjeta de pieza, inspirada en el estilo "Objetos destacados" de SURDOC:
 * imagen completa sin recortar (object-contain sobre fondo neutro),
 * seguida del título y la institución/descripción.
 */
export function PieceCard({ pieza }: { pieza: Pieza }) {
  const titulo = pieza.titulo || pieza.ficha["Título"] || "Pieza sin título";

  return (
    <Link
      href={`/piezas/${pieza.id}`}
      className="group flex flex-col overflow-hidden rounded border border-black/10 bg-white transition hover:border-museo-acento hover:shadow-md"
    >
      <div className="flex aspect-square items-center justify-center bg-museo-crema p-4">
        {pieza.imagen_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pieza.imagen_url}
            alt={titulo}
            className="h-full w-full object-contain transition group-hover:scale-105"
          />
        ) : (
          <span className="text-sm text-museo-texto/40">Sin fotografía</span>
        )}
      </div>
      <div className="border-t border-black/10 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-museo-texto/40">
          {pieza.ficha["Institución"] || "Museo Regional de Magallanes"}
        </p>
        <h3 className="mt-1 font-bold text-museo-texto group-hover:text-museo-acento">
          {titulo}
        </h3>
      </div>
    </Link>
  );
}
