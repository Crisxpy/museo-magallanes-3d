import { NextResponse } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/server";
import { scrapearSurdoc, extraerIdSketchfab } from "@/lib/scraper/surdoc";

/**
 * POST /api/surdoc
 * Body: { surdocUrl: string, sketchfabUrl: string }
 *
 * Ejecuta el "prescrapper": lee la ficha oficial de SURDOC y la deja
 * lista para que el administrador la revise manualmente (vista previa)
 * antes de guardar la pieza. Solo accesible para el administrador
 * autenticado — no se expone al público.
 */
export async function POST(request: Request) {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const surdocUrl: string | undefined = body?.surdocUrl;
  const sketchfabUrl: string | undefined = body?.sketchfabUrl;

  if (!surdocUrl) {
    return NextResponse.json(
      { error: "Falta el enlace de SURDOC." },
      { status: 400 }
    );
  }

  let urlValida: URL;
  try {
    urlValida = new URL(surdocUrl);
  } catch {
    return NextResponse.json(
      { error: "El enlace de SURDOC no es una URL válida." },
      { status: 400 }
    );
  }
  if (!urlValida.hostname.endsWith("surdoc.cl")) {
    return NextResponse.json(
      { error: "El enlace debe pertenecer al dominio surdoc.cl." },
      { status: 400 }
    );
  }

  try {
    const resultado = await scrapearSurdoc(surdocUrl);
    const sketchfabModelId = sketchfabUrl
      ? extraerIdSketchfab(sketchfabUrl)
      : null;

    return NextResponse.json({ ...resultado, sketchfabModelId });
  } catch (error) {
    console.error("Error en prescrapper:", error);
    return NextResponse.json(
      {
        error:
          "No se pudo leer la ficha desde SURDOC. Verifica el enlace o inténtalo nuevamente.",
      },
      { status: 502 }
    );
  }
}
