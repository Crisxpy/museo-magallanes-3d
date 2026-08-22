/**
 * Panel de ficha técnica, inspirado en el bloque "Identificación" de
 * SURDOC: lista vertical de pares etiqueta/valor, sin cajas ni grillas,
 * separados por una línea sutil.
 */
export function FichaTecnica({ ficha }: { ficha: Record<string, string> }) {
  const entradas = Object.entries(ficha);

  if (entradas.length === 0) {
    return (
      <p className="text-sm text-museo-texto/50">
        Esta pieza aún no tiene ficha técnica disponible.
      </p>
    );
  }

  return (
    <div className="divide-y divide-black/10 border-t border-black/10">
      {entradas.map(([clave, valor]) => (
        <div key={clave} className="py-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-museo-texto/50">
            {clave}
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-museo-texto">
            {valor}
          </dd>
        </div>
      ))}
    </div>
  );
}
