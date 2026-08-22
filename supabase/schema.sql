-- =========================================================
-- Esquema: Visualizador 3D Museo Regional de Magallanes
-- Ejecutar en Supabase -> SQL Editor
-- =========================================================

create extension if not exists "pgcrypto";

create table if not exists piezas (
  id                  uuid primary key default gen_random_uuid(),

  -- Sketchfab
  sketchfab_url       text not null,
  sketchfab_model_id  text not null,

  -- SURDOC
  surdoc_url          text not null,

  -- Datos traídos/validados por el prescrapper (clave: etiqueta, valor: texto)
  ficha               jsonb not null default '{}'::jsonb,
  imagen_url          text,

  -- Campos esperados que el prescrapper no encontró en SURDOC.
  -- Quedan pendientes de revisión/edición manual por el administrador.
  campos_faltantes    text[] not null default '{}',

  -- Estado de publicación (solo "publicada" es visible para el público)
  estado              text not null default 'oculta'
                        check (estado in ('publicada', 'oculta')),

  titulo              text,

  creado_en           timestamptz not null default now(),
  actualizado_en      timestamptz not null default now()
);

create index if not exists idx_piezas_estado on piezas (estado);

-- Mantener "actualizado_en" al día en cada UPDATE
create or replace function set_actualizado_en()
returns trigger as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_piezas_actualizado on piezas;
create trigger trg_piezas_actualizado
  before update on piezas
  for each row execute procedure set_actualizado_en();

-- =========================================================
-- Row Level Security
-- =========================================================
alter table piezas enable row level security;

-- El público (rol "anon") solo puede LEER piezas publicadas.
drop policy if exists "publico_lee_publicadas" on piezas;
create policy "publico_lee_publicadas"
  on piezas for select
  to anon
  using (estado = 'publicada');

-- Cualquier usuario autenticado (el/los administrador/es del museo)
-- tiene acceso completo: ver todo, crear, editar, ocultar y eliminar.
-- Nota: por diseño hay un único rol de administrador; el acceso de
-- administración se controla dando de alta la cuenta en Supabase Auth,
-- no mediante roles adicionales dentro de la tabla.
drop policy if exists "admin_acceso_total" on piezas;
create policy "admin_acceso_total"
  on piezas for all
  to authenticated
  using (true)
  with check (true);

-- =========================================================
-- Cómo crear la cuenta de administrador (una sola, según el proyecto):
-- Supabase Dashboard -> Authentication -> Users -> Add user
-- (correo + contraseña). No se requiere código adicional.
-- =========================================================
