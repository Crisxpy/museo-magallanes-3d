# Visualizador 3D — Museo Regional de Magallanes

Catálogo patrimonial digital: modelos 3D (Sketchfab) junto a la ficha oficial
de cada pieza (SURDOC), con panel de administración.

## Stack

- **Next.js 16** (App Router + Turbopack) + TypeScript + Tailwind CSS —
  frontend y backend (API routes) en un solo proyecto, ideal para
  desplegar gratis en **Vercel**. Requiere **Node.js 20.9 o superior**.
  El archivo `src/proxy.ts` protege las rutas `/admin/*` (en Next.js 16
  este archivo reemplaza al antiguo `middleware.ts`).
- **Supabase** (Postgres + Auth) — base de datos gratuita y persistente para
  las piezas, y autenticación para el (único) usuario administrador.
- **cheerio** — motor del *prescrapper* que lee las fichas públicas de
  SURDOC en el servidor.

## 1. Crear el proyecto de Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto nuevo
   (plan gratuito).
2. Abre **SQL Editor** y ejecuta el contenido de [`supabase/schema.sql`](./supabase/schema.sql).
   Esto crea la tabla `piezas` y las reglas de seguridad (RLS): el público
   solo puede leer piezas con estado `publicada`; el administrador
   autenticado tiene acceso completo.
3. Ve a **Authentication → Users → Add user** y crea **una sola cuenta**
   (correo + contraseña) para el administrador del museo. El proyecto está
   diseñado con un único rol de administrador: cualquier cuenta que exista
   en este proyecto de Supabase puede entrar al panel.
4. En **Project Settings → API** copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (mantener en secreto)

## 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Completa `.env.local` con los tres valores anteriores.

## 3. Ejecutar en local

```bash
npm install
npm run dev
```

- Sitio público: `http://localhost:3000`
- Panel de administración: `http://localhost:3000/admin` (pide iniciar sesión)

## 4. Cómo se usa el panel

1. **Agregar pieza** (`/admin/nueva`): pega el enlace de Sketchfab y el
   enlace de SURDOC. El sistema ejecuta el *prescrapper*, que completa
   automáticamente la ficha oficial y la fotografía.
2. El administrador **revisa manualmente** la ficha obtenida, incluyendo
   un campo de **Título** siempre editable (se precarga si SURDOC lo
   entregó, pero se puede escribir cualquier título propio). Los campos
   que SURDOC no entregó aparecen listados aparte para agregarlos a mano
   si corresponde — el prescrapper no bloquea la publicación, solo asiste
   la verificación.
3. Se guarda como **oculta** (borrador) o se **publica** directamente.
4. Desde el listado (`/admin`) se puede volver a entrar a cada pieza para
   editar campos (incluido el título), **revalidar contra SURDOC** (por
   si la ficha oficial cambió), ocultar/publicar o eliminar.

## 5. Acceso del administrador (importante)

Por seguridad, **el sitio público no muestra ningún botón ni enlace hacia
el panel de administración** — así se evita que cualquier visitante lo
encuentre y solo intente iniciar sesión quien conoce la dirección.

La única forma de entrar es escribiendo directamente la URL en el
navegador:

```
https://tu-sitio.vercel.app/admin/login
```

Recomendación: cada persona del equipo del museo debe **guardar esta
URL en sus favoritos** del navegador (no compartirla por canales
públicos). El acceso real sigue protegido por la contraseña de Supabase
Auth aunque alguien adivine la URL — esto es una capa adicional, no
reemplaza la autenticación.

## 6. Desplegar en Vercel (gratis)

1. Sube este proyecto a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com), **Add New → Project** e importa el
   repositorio.
3. En **Environment Variables** agrega las mismas tres variables de
   `.env.local`.
4. Deploy. Vercel construye y publica el sitio automáticamente en cada
   cambio al repositorio.

## Identidad visual

El sitio público clona la estética de
[museodemagallanes.gob.cl/multimedia](https://www.museodemagallanes.gob.cl/multimedia):
franja superior azul/rojo, header blanco, barra de navegación negra y
acentos naranjos. Los colores están centralizados en `tailwind.config.ts`
(grupo `museo.flagAzul`, `museo.flagRojo`, `museo.negro`, `museo.acento`,
`museo.acentoClaro`).

**Pendiente:** el logo actual es un placeholder de texto ("MRM") en
`src/components/Header.tsx`. Cuando el museo entregue el archivo oficial
del logo, basta reemplazar ese bloque por una etiqueta `<img>` apuntando
al archivo (por ejemplo en `public/logo-museo.png`).

## Búsqueda

El buscador del header (`?q=`) filtra piezas publicadas por título usando
`ilike` sobre la columna `titulo`. Si más adelante quieres que también
busque dentro de la descripción u otros campos de la ficha, es un ajuste
pequeño en `src/app/page.tsx`.

## Estructura del proyecto

```
src/
  app/
    page.tsx                 → catálogo público
    piezas/[id]/page.tsx      → detalle público de una pieza
    admin/
      login/page.tsx          → inicio de sesión
      (panel)/
        layout.tsx             → navegación del panel (protegida)
        page.tsx                → listado de piezas
        nueva/page.tsx          → agregar pieza + revisión del prescrapper
        [id]/page.tsx           → gestionar una pieza existente
    api/
      surdoc/route.ts          → endpoint del prescrapper
      piezas/route.ts          → listar / crear piezas
      piezas/[id]/route.ts     → obtener / editar / eliminar una pieza
  lib/
    scraper/surdoc.ts          → lógica de extracción de datos SURDOC
    supabase/                  → clientes de Supabase (navegador y servidor)
    types.ts
  middleware.ts                → protege /admin/* exigiendo sesión
  components/                  → piezas de UI reutilizables
supabase/schema.sql             → esquema de base de datos + RLS
```

## Próximos pasos sugeridos

- Manual de uso paso a paso con capturas de pantalla para el equipo del
  museo (se entrega en una etapa posterior, una vez esté validada la
  versión final del panel).
- Ajustar la identidad visual (logos, tipografías, colores exactos) según
  el manual de marca del museo.
- Carga del primer lote de piezas como piloto.
