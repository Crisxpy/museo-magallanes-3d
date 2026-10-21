import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta institucional interna (paneles, documentos)
        museo: {
          oscuro: "#1B3A4B",
          medio: "#2E5D73",
          dorado: "#B08D57",
          crema: "#F2EFEA",
          texto: "#1A1A1A",

          // Paleta clonada del sitio oficial museodemagallanes.gob.cl
          // (medida directamente sobre una captura de /multimedia)
          flagAzul: "#0F69B5", // franja superior, azul institucional
          flagRojo: "#EB3D45", // franja superior, rojo institucional
          negro: "#000000", // barra de navegación
          acento: "#E0701E", // línea bajo títulos, enlaces activos
          acentoClaro: "#FFA11B", // ícono circular de aviso
          fondo: "#FFFDFB", // fondo cálido de cajas de aviso
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
