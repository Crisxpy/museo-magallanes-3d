"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResultadoPrescrapper } from "@/lib/types";

type Paso = "formulario" | "revision";

export default function PaginaNuevaPieza() {
  const router = useRouter();

  const [paso, setPaso] = useState<Paso>("formulario");
  const [sketchfabUrl, setSketchfabUrl] = useState("");
  const [surdocUrl, setSurdocUrl] = useState("");
  const [sketchfabModelId, setSketchfabModelId] = useState<string | null>(null);

  const [resultado, setResultado] = useState<ResultadoPrescrapper | null>(null);
  const [titulo, setTitulo] = useState("");
  const [ficha, setFicha] = useState<Record<string, string>>({});
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ejecutarPrescrapper(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const res = await fetch("/api/surdoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surdocUrl, sketchfabUrl }),
      });
      const datos = await res.json();

      if (!res.ok) {
        setError(datos.error || "No se pudo leer la ficha de SURDOC.");
        setCargando(false);
        return;
      }

      setResultado(datos);
      setFicha(datos.ficha);
      setTitulo(datos.ficha["Título"] || "");
      setImagenUrl(datos.imagen_url);
      setSketchfabModelId(datos.sketchfabModelId);
      setPaso("revision");
    } catch {
      setError("Error de conexión al ejecutar el prescrapper.");
    } finally {
      setCargando(false);
    }
  }

  function actualizarCampo(clave: string, valor: string) {
    setFicha((prev) => ({ ...prev, [clave]: valor }));
  }

  function agregarCampoFaltante(clave: string) {
    setFicha((prev) => ({ ...prev, [clave]: "" }));
  }

  async function guardarPieza(estado: "publicada" | "oculta") {
    if (!sketchfabModelId) {
      setError("No se pudo determinar el ID del modelo de Sketchfab.");
      return;
    }
    setGuardando(true);
    setError(null);

    // Solo guardamos campos que el administrador dejó con contenido real.
    const fichaFinal = Object.fromEntries(
      Object.entries(ficha).filter(([, valor]) => valor.trim() !== "")
    );
    const camposFaltantes = (resultado?.campos_faltantes ?? []).filter(
      (campo) => !fichaFinal[campo] || fichaFinal[campo].trim() === ""
    );

    try {
      const res = await fetch("/api/piezas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sketchfab_url: sketchfabUrl,
          sketchfab_model_id: sketchfabModelId,
          surdoc_url: surdocUrl,
          ficha: fichaFinal,
          imagen_url: imagenUrl,
          campos_faltantes: camposFaltantes,
          titulo: titulo.trim() || null,
          estado,
        }),
      });
      const datos = await res.json();

      if (!res.ok) {
        setError(datos.error || "No se pudo guardar la pieza.");
        setGuardando(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de conexión al guardar la pieza.");
      setGuardando(false);
    }
  }

  if (paso === "formulario") {
    return (
      <div className="mx-auto max-w-xl">
        <h2 className="text-xl font-semibold text-museo-oscuro">
          Agregar pieza
        </h2>
        <p className="mt-1 text-sm text-museo-texto/70">
          Pega el enlace de Sketchfab del modelo y el enlace de SURDOC de la
          ficha oficial. El sistema completará los datos automáticamente para
          que los revises antes de publicar.
        </p>

        <form onSubmit={ejecutarPrescrapper} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-museo-texto">
              Enlace de Sketchfab
            </label>
            <input
              type="url"
              required
              value={sketchfabUrl}
              onChange={(e) => setSketchfabUrl(e.target.value)}
              placeholder="https://sketchfab.com/3d-models/..."
              className="w-full rounded-md border border-museo-medio/30 px-3 py-2 text-sm focus:border-museo-medio focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-museo-texto">
              Enlace de SURDOC
            </label>
            <input
              type="url"
              required
              value={surdocUrl}
              onChange={(e) => setSurdocUrl(e.target.value)}
              placeholder="https://www.surdoc.cl/registro/..."
              className="w-full rounded-md border border-museo-medio/30 px-3 py-2 text-sm focus:border-museo-medio focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="rounded-md bg-museo-oscuro px-5 py-2.5 text-sm font-semibold text-white hover:bg-museo-medio disabled:opacity-60"
          >
            {cargando ? "Consultando SURDOC..." : "Cargar ficha desde SURDOC"}
          </button>
        </form>
      </div>
    );
  }

  // --- Paso de revisión manual ---
  const camposFaltantesPendientes = (resultado?.campos_faltantes ?? []).filter(
    (c) => !(c in ficha)
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-museo-oscuro">
            Revisar ficha antes de publicar
          </h2>
          <p className="mt-1 text-sm text-museo-texto/70">
            Este es el resultado del prescrapper. Revisa manualmente los
            datos, corrige lo necesario y completa los campos marcados como
            pendientes.
          </p>
        </div>
        <button
          onClick={() => setPaso("formulario")}
          className="text-sm text-museo-medio hover:underline"
        >
          ← Volver
        </button>
      </div>

      {camposFaltantesPendientes.length > 0 && (
        <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            Campos que SURDOC no entregó — revisa si corresponde
            completarlos manualmente:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {camposFaltantesPendientes.map((campo) => (
              <button
                key={campo}
                onClick={() => agregarCampoFaltante(campo)}
                className="rounded-full border border-amber-400 bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
              >
                + {campo}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <p className="mb-2 text-sm font-semibold text-museo-oscuro">
            Fotografía detectada
          </p>
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border border-museo-medio/20 bg-museo-crema">
            {imagenUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagenUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              <span className="text-xs text-museo-texto/50">
                No se encontró fotografía
              </span>
            )}
          </div>
          <input
            type="url"
            value={imagenUrl ?? ""}
            onChange={(e) => setImagenUrl(e.target.value || null)}
            placeholder="URL de imagen (editable)"
            className="mt-2 w-full rounded-md border border-museo-medio/30 px-2 py-1.5 text-xs"
          />
        </div>

        <div className="lg:col-span-2 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-museo-dorado">
              Título de la pieza (para el catálogo)
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Vasija ceremonial selk'nam"
              className="w-full rounded-md border-2 border-museo-dorado/40 px-3 py-2 text-sm font-medium focus:border-museo-dorado focus:outline-none"
            />
            <p className="mt-1 text-xs text-museo-texto/50">
              Este es el nombre que verá el público. Si SURDOC entregó un
              título, aparece precargado aquí — igual puedes editarlo.
            </p>
          </div>

          {Object.entries(ficha).map(([clave, valor]) => (
            <div key={clave}>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-museo-medio">
                {clave}
              </label>
              {valor.length > 100 ? (
                <textarea
                  value={valor}
                  onChange={(e) => actualizarCampo(clave, e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-museo-medio/30 px-3 py-2 text-sm focus:border-museo-medio focus:outline-none"
                />
              ) : (
                <input
                  type="text"
                  value={valor}
                  onChange={(e) => actualizarCampo(clave, e.target.value)}
                  className="w-full rounded-md border border-museo-medio/30 px-3 py-2 text-sm focus:border-museo-medio focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 flex gap-3">
        <button
          onClick={() => guardarPieza("oculta")}
          disabled={guardando}
          className="rounded-md border border-museo-oscuro px-5 py-2.5 text-sm font-semibold text-museo-oscuro hover:bg-museo-oscuro/5 disabled:opacity-60"
        >
          Guardar como oculta
        </button>
        <button
          onClick={() => guardarPieza("publicada")}
          disabled={guardando}
          className="rounded-md bg-museo-oscuro px-5 py-2.5 text-sm font-semibold text-white hover:bg-museo-medio disabled:opacity-60"
        >
          {guardando ? "Guardando..." : "Guardar y publicar"}
        </button>
      </div>
    </div>
  );
}
