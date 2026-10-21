import * as cheerio from "cheerio";
import type { ResultadoPrescrapper } from "@/lib/types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Campos que esperamos encontrar en una ficha SURDOC completa.
 * El prescrapper no bloquea nada si faltan: solo los reporta como
 * "campos_faltantes" para que el administrador los revise y complete
 * manualmente antes de publicar. Es una verificación manual asistida,
 * no una validación automática estricta.
 */
const CAMPOS_ESPERADOS = [
  "Título",
  "Institución",
  "Colección",
  "Clasificación",
  "Objeto",
  "Creador",
  "Materiales",
  "Técnica",
  "Dimensiones",
  "Procedencia",
  "Descripción",
  "Estado de conservación",
  "Número de registro",
];

const PALABRAS_CLAVE_ETIQUETA = [
  "institución",
  "registro",
  "inventario",
  "clasificación",
  "colección",
  "objeto",
  "creador",
  "dimensiones",
  "técnica",
  "material",
  "ubicación",
  "título",
  "descripción",
  "conservación",
  "lugar",
  "ingreso",
  "procedencia",
  "registrador",
  "adquisición",
];

function normalizarUrlImagen(src: string): string {
  if (src.startsWith("//")) return "https:" + src;
  if (src.startsWith("/")) return "https://www.surdoc.cl" + src;
  return src;
}

function extraerImagen($: cheerio.CheerioAPI): string | null {
  const ogImage =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="og:image"]').attr("content");
  if (ogImage) return normalizarUrlImagen(ogImage);

  const claves = ["image", "foto", "main", "primary", "gallery", "responsive"];
  let candidata: string | undefined;
  $("img").each((_, el) => {
    if (candidata) return;
    const clase = ($(el).attr("class") || "").toLowerCase();
    if (claves.some((k) => clase.includes(k))) {
      candidata = $(el).attr("src");
    }
  });
  if (candidata) return normalizarUrlImagen(candidata);

  $("img").each((_, el) => {
    if (candidata) return;
    const src = $(el).attr("src") || "";
    if (
      ["/files/", "/default/", "/colecciones/"].some((p) => src.includes(p))
    ) {
      candidata = src;
    }
  });
  return candidata ? normalizarUrlImagen(candidata) : null;
}

function extraerPorFilaGenerica(
  $: cheerio.CheerioAPI,
  ficha: Record<string, string>
) {
  $("div, li").each((_, el) => {
    const clase = $(el).attr("class") || "";
    if (!/field|item-row|data-row|col-/.test(clase)) return;

    const etiquetaEl = $(el)
      .find("div, span, label, strong, b, h4, h5")
      .filter((_, e) =>
        /label|title|name|attribute|bold/.test($(e).attr("class") || "")
      )
      .first();
    const valorEl = $(el)
      .find("div, span, p, ul")
      .filter((_, e) =>
        /item|value|content|data/.test($(e).attr("class") || "")
      )
      .first();

    if (etiquetaEl.length && valorEl.length && etiquetaEl[0] !== valorEl[0]) {
      const etiqueta = etiquetaEl.text().trim().replace(/:$/, "");
      let valor = valorEl.text().replace(/\s+/g, " ").trim();
      if (valor.startsWith(etiqueta)) {
        valor = valor.slice(etiqueta.length).replace(/^[\s:]+/, "");
      }
      if (etiqueta && valor && etiqueta.length < 70) {
        ficha[etiqueta] = valor;
      }
    }
  });
}

function extraerDeTablas($: cheerio.CheerioAPI, ficha: Record<string, string>) {
  $("table").each((_, tabla) => {
    $(tabla)
      .find("tr")
      .each((_, fila) => {
        const cols = $(fila).find("th, td");
        if (cols.length === 2) {
          const clave = $(cols[0])
            .text()
            .replace(/\s+/g, " ")
            .trim()
            .replace(/:$/, "");
          const valor = $(cols[1]).text().replace(/\s+/g, " ").trim();
          if (clave && valor) ficha[clave] = valor;
        } else if (cols.length > 2) {
          for (let i = 0; i < cols.length - 1; i += 2) {
            const clave = $(cols[i])
              .text()
              .replace(/\s+/g, " ")
              .trim()
              .replace(/:$/, "");
            const valor = $(cols[i + 1])
              .text()
              .replace(/\s+/g, " ")
              .trim();
            if (clave && valor) ficha[clave] = valor;
          }
        }
      });
  });
}

function extraerDeDefiniciones(
  $: cheerio.CheerioAPI,
  ficha: Record<string, string>
) {
  $("dt").each((_, dt) => {
    const dd = $(dt).next("dd");
    if (dd.length) {
      const clave = $(dt).text().replace(/\s+/g, " ").trim().replace(/:$/, "");
      const valor = dd.text().replace(/\s+/g, " ").trim();
      if (clave && valor) ficha[clave] = valor;
    }
  });
}

function extraerDeNegritas(
  $: cheerio.CheerioAPI,
  ficha: Record<string, string>
) {
  $("strong, b").each((_, el) => {
    const texto = $(el).text().trim().replace(/:$/, "");
    if (texto.length <= 2 || texto.length >= 50) return;
    const textoLower = texto.toLowerCase();
    if (!PALABRAS_CLAVE_ETIQUETA.some((k) => textoLower.includes(k))) return;

    const siguiente = el.nextSibling;
    if (siguiente && siguiente.type === "text") {
      const valor = (siguiente.data || "").trim().replace(/^[:\s]+/, "");
      if (valor && !(texto in ficha)) {
        ficha[texto] = valor;
      }
    }
  });
}

/**
 * Lee una ficha pública de SURDOC y extrae sus metadatos + fotografía.
 * Además calcula qué campos "esperables" no se encontraron, para que
 * el administrador los revise manualmente antes de publicar la pieza.
 */
export async function scrapearSurdoc(
  url: string
): Promise<ResultadoPrescrapper> {
  const respuesta = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    // SURDOC cambia poco: evitamos cachear resultados obsoletos entre pruebas
    cache: "no-store",
  });

  if (!respuesta.ok) {
    throw new Error(`SURDOC respondió con estado ${respuesta.status}`);
  }

  const html = await respuesta.text();
  const $ = cheerio.load(html);

  const ficha: Record<string, string> = {};
  extraerPorFilaGenerica($, ficha);
  extraerDeTablas($, ficha);
  extraerDeDefiniciones($, ficha);
  extraerDeNegritas($, ficha);

  // Limpieza final: fuera valores vacíos o placeholders sin información real.
  for (const clave of Object.keys(ficha)) {
    if (!ficha[clave] || ficha[clave] === "Ver más") {
      delete ficha[clave];
    }
  }

  const imagen_url = extraerImagen($);

  const clavesEncontradas = Object.keys(ficha).map((k) => k.toLowerCase());
  const campos_faltantes = CAMPOS_ESPERADOS.filter(
    (esperado) =>
      !clavesEncontradas.some(
        (encontrada) =>
          encontrada.includes(esperado.toLowerCase()) ||
          esperado.toLowerCase().includes(encontrada)
      )
  );

  return { ficha, imagen_url, campos_faltantes };
}

/** Extrae el ID del modelo desde un enlace de Sketchfab (mismo criterio que la UI). */
export function extraerIdSketchfab(url: string): string | null {
  try {
    const partes = url.trim().split("-");
    const id = partes[partes.length - 1].replace(/\/+$/, "");
    return id || null;
  } catch {
    return null;
  }
}
