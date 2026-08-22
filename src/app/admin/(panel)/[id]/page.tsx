"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Pieza } from "@/lib/types";

export default function PaginaGestionarPieza() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [pieza, setPieza] = useState<Pieza | null>(null);
  const [titulo, setTitulo] = useState("");
  const [ficha, setFicha] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [revalidando, setRevalidando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/piezas/${id}`)
      .then((r) => r.json())
      .then((datos) => {
        if (datos.pieza) {
          setPieza(datos.pieza);
          setFicha(datos.pieza.ficha);
          setTitulo(datos.pieza.titulo || datos.pieza.ficha["Título"] || "");
        } else {
          setError("No se encontró la pieza.");
        }
      })
      .finally(() => setCargando(false));
  }, [id]);

  function actualizarCampo(clave: string, valor: string) {
    setFicha((prev) => ({ ...prev, [clave]: valor }));
  }

  async function guardarCambios(cambios: Partial<Pieza>) {
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      const res = await fetch(`/api/piezas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cambios),
      });
      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudo guardar.");
        return;
      }
      setPieza(datos.pieza);
      setMensaje("Cambios guardados.");
    } catch {
      setError("Error de conexión al guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function revalidarConSurdoc() {
    if (!pieza) return;
    setRevalidando(true);
    setError(null);
    setMensaje(null);
    try {
      const res = await fetch("/api/surdoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surdocUrl: pieza.surdoc_url,
          sketchfabUrl: pieza.sketchfab_url,
        }),
      });
      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudo revalidar contra SURDOC.");
        return;
      }
      // Se muestra la ficha recién obtenida para revisión manual;
      // el administrador decide si la guarda con "Guardar cambios".
      setFicha(datos.ficha);
      setMensaje(
        "Ficha actualizada desde SURDOC. Revísala y presiona 'Guardar cambios' para aplicarla."
      );
    } catch {
      setError("Error de conexión al revalidar con SURDOC.");
    } finally {
      setRevalidando(false);
    }
  }

  async function eliminarPieza() {
    if (!confirm("¿Eliminar esta pieza definitivamente del catálogo?")) return;
    const res = await fetch(`/api/piezas/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("No se pudo eliminar la pieza.");
    }
  }

  if (cargando) return <p className="text-sm text-museo-texto/60">Cargando...</p>;
  if (!pieza) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-museo-oscuro">
            {pieza.titulo || ficha["Título"] || "(sin título)"}
          </h2>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
              pieza.estado === "publicada"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {pieza.estado === "publicada" ? "Publicada" : "Oculta"}
          </span>
        </div>
        <button
          onClick={() => router.push("/admin")}
          className="text-sm text-museo-medio hover:underline"
        >
          ← Volver al listado
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {pieza.estado === "publicada" ? (
          <button
            onClick={() => guardarCambios({ estado: "oculta" })}
            disabled={guardando}
            className="rounded-md border border-museo-oscuro px-4 py-2 text-sm font-semibold text-museo-oscuro hover:bg-museo-oscuro/5"
          >
            Ocultar del sitio público
          </button>
        ) : (
          <button
            onClick={() => guardarCambios({ estado: "publicada" })}
            disabled={guardando}
            className="rounded-md bg-museo-oscuro px-4 py-2 text-sm font-semibold text-white hover:bg-museo-medio"
          >
            Publicar
          </button>
        )}
        <button
          onClick={revalidarConSurdoc}
          disabled={revalidando}
          className="rounded-md border border-museo-medio px-4 py-2 text-sm font-semibold text-museo-medio hover:bg-museo-medio/5"
        >
          {revalidando ? "Consultando SURDOC..." : "Revalidar contra SURDOC"}
        </button>
        <button
          onClick={eliminarPieza}
          className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Eliminar pieza
        </button>
      </div>

      {mensaje && <p className="mt-4 text-sm text-green-700">{mensaje}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div>
          <p className="mb-2 text-sm font-semibold text-museo-oscuro">Fotografía</p>
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border border-museo-medio/20 bg-museo-crema">
            {pieza.imagen_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pieza.imagen_url} alt="" className="h-full w-full object-contain" />
            ) : (
              <span className="text-xs text-museo-texto/50">Sin fotografía</span>
            )}
          </div>
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
          </div>

          {Object.entries(ficha).map(([clave, valor]) => (
            <div key={clave}>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-museo-medio">
                {clave}
              </label>
              <input
                type="text"
                value={valor}
                onChange={(e) => actualizarCampo(clave, e.target.value)}
                className="w-full rounded-md border border-museo-medio/30 px-3 py-2 text-sm focus:border-museo-medio focus:outline-none"
              />
            </div>
          ))}

          <button
            onClick={() => guardarCambios({ ficha, titulo: titulo.trim() || null })}
            disabled={guardando}
            className="mt-2 rounded-md bg-museo-oscuro px-5 py-2.5 text-sm font-semibold text-white hover:bg-museo-medio disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
