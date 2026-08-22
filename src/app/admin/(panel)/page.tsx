import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { Pieza } from "@/lib/types";

export default async function PaginaPanel() {
  const supabase = await crearClienteServidor();
  const { data: piezas } = await supabase
    .from("piezas")
    .select("*")
    .order("creado_en", { ascending: false });

  const lista = (piezas ?? []) as Pieza[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-museo-oscuro">
          Piezas del catálogo ({lista.length})
        </h2>
        <Link
          href="/admin/nueva"
          className="rounded-md bg-museo-oscuro px-4 py-2 text-sm font-semibold text-white hover:bg-museo-medio"
        >
          + Agregar pieza
        </Link>
      </div>

      {lista.length === 0 ? (
        <p className="mt-8 rounded-md border border-dashed border-museo-medio/30 p-8 text-center text-museo-texto/60">
          Todavía no hay piezas cargadas. Usa &quot;Agregar pieza&quot; para
          crear la primera.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-museo-medio/15 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-museo-crema text-left text-xs uppercase text-museo-texto/60">
              <tr>
                <th className="px-4 py-3">Pieza</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Campos pendientes</th>
                <th className="px-4 py-3">Actualizada</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {lista.map((pieza) => (
                <tr key={pieza.id} className="border-t border-museo-medio/10">
                  <td className="px-4 py-3 font-medium text-museo-oscuro">
                    {pieza.titulo || pieza.ficha["Título"] || "(sin título)"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        pieza.estado === "publicada"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {pieza.estado === "publicada" ? "Publicada" : "Oculta"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {pieza.campos_faltantes.length > 0 ? (
                      <span className="text-xs font-medium text-amber-600">
                        {pieza.campos_faltantes.length} campo(s) por revisar
                      </span>
                    ) : (
                      <span className="text-xs text-museo-texto/40">
                        Completa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-museo-texto/60">
                    {new Date(pieza.actualizado_en).toLocaleDateString("es-CL")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/${pieza.id}`}
                      className="font-semibold text-museo-medio hover:underline"
                    >
                      Gestionar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
