import { NextResponse } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/server";

interface Contexto {
  params: Promise<{ id: string }>;
}

/** GET /api/piezas/:id — detalle para el panel de administración. */
export async function GET(_request: Request, { params }: Contexto) {
  const { id } = await params;
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
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ pieza: data });
}

/**
 * PUT /api/piezas/:id
 * Edita la ficha (por ejemplo tras re-ejecutar el prescrapper y revisar
 * cambios manualmente) o cambia el estado publicada/oculta.
 */
export async function PUT(request: Request, { params }: Contexto) {
  const { id } = await params;
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const camposPermitidos = [
    "ficha",
    "imagen_url",
    "campos_faltantes",
    "titulo",
    "estado",
    "sketchfab_url",
    "sketchfab_model_id",
    "surdoc_url",
  ];
  const actualizacion: Record<string, unknown> = {};
  for (const campo of camposPermitidos) {
    if (campo in body) actualizacion[campo] = body[campo];
  }

  const { data, error } = await supabase
    .from("piezas")
    .update(actualizacion)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ pieza: data });
}

/** DELETE /api/piezas/:id — elimina definitivamente una pieza del catálogo. */
export async function DELETE(_request: Request, { params }: Contexto) {
  const { id } = await params;
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { error } = await supabase.from("piezas").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
