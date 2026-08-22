import { NextResponse } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/server";

/**
 * GET /api/piezas
 * Uso del panel de administración: lista TODAS las piezas (publicadas y
 * ocultas). Requiere sesión de administrador — RLS ya lo exige, pero
 * además lo confirmamos aquí para dar un error claro.
 */
export async function GET() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("piezas")
    .select("*")
    .order("creado_en", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ piezas: data });
}

/**
 * POST /api/piezas
 * Guarda una pieza nueva. El administrador ya revisó manualmente la
 * ficha (y completó los campos_faltantes que quiso completar) en la
 * vista previa del prescrapper antes de llegar a este paso.
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
  const {
    sketchfab_url,
    sketchfab_model_id,
    surdoc_url,
    ficha,
    imagen_url,
    campos_faltantes,
    titulo,
    estado,
  } = body ?? {};

  if (!sketchfab_url || !sketchfab_model_id || !surdoc_url || !ficha) {
    return NextResponse.json(
      { error: "Faltan datos obligatorios para guardar la pieza." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("piezas")
    .insert({
      sketchfab_url,
      sketchfab_model_id,
      surdoc_url,
      ficha,
      imagen_url: imagen_url ?? null,
      campos_faltantes: campos_faltantes ?? [],
      titulo: titulo ?? ficha?.["Título"] ?? null,
      estado: estado === "publicada" ? "publicada" : "oculta",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ pieza: data }, { status: 201 });
}
