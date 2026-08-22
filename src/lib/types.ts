export type EstadoPieza = "publicada" | "oculta";

export interface Pieza {
  id: string;
  sketchfab_url: string;
  sketchfab_model_id: string;
  surdoc_url: string;
  ficha: Record<string, string>;
  imagen_url: string | null;
  campos_faltantes: string[];
  estado: EstadoPieza;
  titulo: string | null;
  creado_en: string;
  actualizado_en: string;
}

/** Resultado que entrega el prescrapper al leer una ficha de SURDOC. */
export interface ResultadoPrescrapper {
  ficha: Record<string, string>;
  imagen_url: string | null;
  campos_faltantes: string[];
}
