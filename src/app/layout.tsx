import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visualizador 3D | Museo Regional de Magallanes",
  description:
    "Catálogo patrimonial digital del Museo Regional de Magallanes: modelos 3D interactivos junto a la ficha oficial de cada pieza.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/*
          Roboto: la tipografía que usa el tema oficial del Estado
          (theme_snpc / museodemagallanes.gob.cl). Se carga como enlace
          normal (no next/font) para no depender de acceso a internet
          durante el build; el navegador del visitante la descarga en
          tiempo real, con una alternativa segura si no carga.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
