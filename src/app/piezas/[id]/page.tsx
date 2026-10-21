import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Viewer3D } from "@/components/Viewer3D";
import { FichaTecnica } from "@/components/FichaTecnica";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { Pieza } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PaginaPieza({ params }: Props) {
  const { id } = await params;
  const supabase = await crearClienteServidor();
  const { data: pieza } = await supabase
    .from("piezas")
    .select("*")
    .eq("id", id)
    .eq("estado", "publicada") // el público solo puede ver piezas publicadas
    .single<Pieza>();

  if (!pieza) notFound();

  const titulo = pieza.titulo || pieza.ficha["Título"] || "Pieza sin título";
  const institucion =
    pieza.ficha["Institución"] || "Museo Regional de Magallanes";

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Estructura inspirada en la ficha de SURDOC: galería a la
            izquierda (foto + modelo 3D), panel de identificación a la
            derecha. */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* --- Columna izquierda: galería --- */}
          <div className="space-y-4">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded border border-black/10 bg-museo-crema p-4">
              {pieza.imagen_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pieza.imagen_url}
                  alt={titulo}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-sm text-museo-texto/40">
                  Sin fotografía disponible
                </span>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-museo-texto/50">
                Modelo 3D interactivo
              </p>
              <Viewer3D sketchfabModelId={pieza.sketchfab_model_id} />
            </div>
          </div>

          {/* --- Columna derecha: identificación --- */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-museo-texto/40">
              {institucion}
            </p>
            <h2 className="mt-1 text-3xl font-extrabold text-museo-texto">
              {titulo}
            </h2>
            <div className="mt-2 h-1 w-16 bg-museo-acento" />

            <h3 className="mt-8 text-lg font-bold text-museo-texto">
              Identificación
            </h3>
            <FichaTecnica ficha={pieza.ficha} />
          </div>
        </div>
      </section>
    </main>
  );
}
