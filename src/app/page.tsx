import { Header } from "@/components/Header";
import { PieceCard } from "@/components/PieceCard";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { Pieza } from "@/lib/types";

export const revalidate = 60; // refresca el catálogo cada minuto

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function PaginaInicio({ searchParams }: Props) {
  const { q } = await searchParams;
  const supabase = await crearClienteServidor();

  // Sin sesión de administrador: RLS solo entrega piezas "publicada".
  let consulta = supabase
    .from("piezas")
    .select("*")
    .eq("estado", "publicada")
    .order("creado_en", { ascending: false });

  if (q && q.trim()) {
    consulta = consulta.ilike("titulo", `%${q.trim()}%`);
  }

  const { data: piezas } = await consulta;
  const lista = (piezas ?? []) as Pieza[];

  return (
    <main className="min-h-screen bg-white">
      <Header busquedaActual={q} />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-3xl font-extrabold text-museo-texto">
          {q ? `Resultados para "${q}"` : "Colección Digital 3D"}
        </h2>
        <div className="mt-2 h-1 w-16 bg-museo-acento" />
        {!q && (
          <p className="mt-4 max-w-2xl text-museo-texto/60">
            Explora las piezas del museo en 3D junto a su ficha técnica oficial.
          </p>
        )}

        {lista.length === 0 ? (
          <p className="mt-10 rounded border border-dashed border-black/15 p-8 text-center text-museo-texto/50">
            {q
              ? "No se encontraron piezas que coincidan con tu búsqueda."
              : "Aún no hay piezas publicadas en el catálogo."}
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((pieza) => (
              <PieceCard key={pieza.id} pieza={pieza} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
