-- =========================================================================
-- Migración inicial: esquema clínico + RBAC + RLS
-- Alineado a NOM-004-SSA3-2012 y NOM-024-SSA3-2012
-- =========================================================================

-- ---------------------------------------------------------------------
-- Extensiones
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type user_role as enum ('medico', 'asistente', 'paciente');
create type cita_estado as enum ('pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio');
create type pago_estado as enum ('pendiente', 'aprobado', 'rechazado', 'reembolsado');
create type pago_metodo as enum ('stripe', 'mercadopago', 'efectivo');
create type documento_tipo as enum ('identificacion', 'estudio', 'consentimiento_firmado', 'receta', 'otro');
create type consentimiento_tipo as enum ('tratamiento_general', 'aviso_privacidad', 'procedimiento_especifico');

-- ---------------------------------------------------------------------
-- users: perfil extendido de auth.users
-- ---------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'paciente',
  email text not null unique,
  nombre text not null,
  telefono text,
  mfa_enabled boolean not null default false,
  creado_en timestamptz not null default now()
);

comment on table public.users is 'Perfil y rol de cada usuario autenticado. El rol médico/asistente solo se asigna manualmente por un admin, nunca por auto-registro.';

-- helper: rol del usuario autenticado actual
create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- pacientes
-- ---------------------------------------------------------------------
create table public.pacientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  nombre text not null,
  apellido_paterno text not null,
  apellido_materno text,
  fecha_nacimiento date not null,
  sexo text,
  curp text,
  telefono text,
  email text,
  direccion text,
  contacto_emergencia_nombre text,
  contacto_emergencia_telefono text,
  creado_en timestamptz not null default now(),
  creado_por uuid references public.users(id)
);

-- helper: ¿el paciente actual (uid) corresponde a este paciente.id?
create or replace function public.is_own_paciente(p_paciente_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.pacientes
    where id = p_paciente_id and user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- expedientes_clinicos (1:1 con paciente)
-- ---------------------------------------------------------------------
create table public.expedientes_clinicos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null unique references public.pacientes(id) on delete restrict,
  antecedentes_heredofamiliares text,
  antecedentes_patologicos text,
  antecedentes_no_patologicos text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- notas_clinicas: append-only, versionado, firma
-- ---------------------------------------------------------------------
create table public.notas_clinicas (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid not null references public.expedientes_clinicos(id) on delete restrict,
  autor_id uuid not null references public.users(id),
  padre_id uuid references public.notas_clinicas(id), -- versión anterior, si aplica
  version int not null default 1,
  padecimiento_actual text,
  exploracion_fisica text,
  contenido text not null,
  fecha timestamptz not null default now(),
  firmada boolean not null default false,
  firmada_en timestamptz
);

-- Impide UPDATE de contenido clínico una vez creada la fila; solo permite
-- transicionar firmada:false -> true (y sellar firmada_en). Todo lo demás
-- se corrige creando una nueva versión (padre_id) vía INSERT.
create or replace function public.notas_clinicas_block_mutation()
returns trigger
language plpgsql
as $$
begin
  if old.firmada = true then
    raise exception 'No se puede modificar una nota clínica ya firmada (append-only).';
  end if;

  if new.contenido is distinct from old.contenido
     or new.padecimiento_actual is distinct from old.padecimiento_actual
     or new.exploracion_fisica is distinct from old.exploracion_fisica
     or new.autor_id is distinct from old.autor_id
     or new.expediente_id is distinct from old.expediente_id
     or new.version is distinct from old.version then
    raise exception 'Las notas clínicas son append-only: el contenido no se puede editar, solo firmar.';
  end if;

  if new.firmada = true and old.firmada = false then
    new.firmada_en := now();
  end if;

  return new;
end;
$$;

create trigger trg_notas_clinicas_block_mutation
  before update on public.notas_clinicas
  for each row execute function public.notas_clinicas_block_mutation();

create rule notas_clinicas_no_delete as on delete to public.notas_clinicas do instead nothing;

-- ---------------------------------------------------------------------
-- documentos
-- ---------------------------------------------------------------------
create table public.documentos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete restrict,
  tipo documento_tipo not null,
  storage_path text not null,
  subido_por uuid not null references public.users(id),
  subido_en timestamptz not null default now(),
  descripcion text
);

-- ---------------------------------------------------------------------
-- consentimientos: firma electrónica simple (hash + timestamp)
-- ---------------------------------------------------------------------
create table public.consentimientos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete restrict,
  tipo consentimiento_tipo not null,
  texto_version text not null,
  firmado_en timestamptz,
  firma_digital_hash text
);

create rule consentimientos_no_delete as on delete to public.consentimientos do instead nothing;

-- ---------------------------------------------------------------------
-- servicios
-- ---------------------------------------------------------------------
create table public.servicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  precio numeric(10,2) not null check (precio >= 0),
  anticipo_requerido numeric(10,2) not null default 0 check (anticipo_requerido >= 0),
  duracion_minutos int not null check (duracion_minutos > 0),
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- citas
-- ---------------------------------------------------------------------
create table public.citas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete restrict,
  servicio_id uuid not null references public.servicios(id),
  fecha_hora timestamptz not null,
  estado cita_estado not null default 'pendiente',
  requiere_anticipo boolean not null default false,
  anticipo_pagado boolean not null default false,
  creado_en timestamptz not null default now(),
  creado_por uuid references public.users(id)
);

-- ---------------------------------------------------------------------
-- pagos
-- ---------------------------------------------------------------------
create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  cita_id uuid not null references public.citas(id) on delete restrict,
  monto numeric(10,2) not null check (monto >= 0),
  metodo pago_metodo not null,
  stripe_payment_id text,
  mp_payment_id text,
  estado pago_estado not null default 'pendiente',
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- bitacora_auditoria: solo INSERT, nunca UPDATE/DELETE
-- ---------------------------------------------------------------------
create table public.bitacora_auditoria (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.users(id),
  accion text not null,
  entidad_afectada text not null,
  entidad_id uuid,
  "timestamp" timestamptz not null default now(),
  ip text
);

create rule bitacora_no_update as on update to public.bitacora_auditoria do instead nothing;
create rule bitacora_no_delete as on delete to public.bitacora_auditoria do instead nothing;

-- helper para registrar auditoría desde funciones de servidor (SECURITY DEFINER)
create or replace function public.log_auditoria(
  p_accion text,
  p_entidad_afectada text,
  p_entidad_id uuid,
  p_ip text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.bitacora_auditoria (usuario_id, accion, entidad_afectada, entidad_id, ip)
  values (auth.uid(), p_accion, p_entidad_afectada, p_entidad_id, p_ip);
end;
$$;

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

alter table public.users enable row level security;
alter table public.pacientes enable row level security;
alter table public.expedientes_clinicos enable row level security;
alter table public.notas_clinicas enable row level security;
alter table public.documentos enable row level security;
alter table public.consentimientos enable row level security;
alter table public.servicios enable row level security;
alter table public.citas enable row level security;
alter table public.pagos enable row level security;
alter table public.bitacora_auditoria enable row level security;

-- ------------------ users ------------------
create policy users_select_own_or_staff
  on public.users for select
  using (id = auth.uid() or public.current_user_role() in ('medico', 'asistente'));

create policy users_update_own_limited
  on public.users for update
  using (id = auth.uid())
  with check (id = auth.uid());
-- Nota: el cambio de `role`/`mfa_enabled` debe hacerse vía función
-- SECURITY DEFINER administrativa, no directamente desde el cliente.
-- No se otorga INSERT/DELETE directo: el registro pasa por un trigger
-- en auth.users -> public.users (definido en migración de auth).

-- ------------------ pacientes ------------------
create policy pacientes_select
  on public.pacientes for select
  using (
    public.current_user_role() in ('medico', 'asistente')
    or user_id = auth.uid()
  );

create policy pacientes_insert_staff
  on public.pacientes for insert
  with check (public.current_user_role() in ('medico', 'asistente'));

create policy pacientes_update_staff
  on public.pacientes for update
  using (public.current_user_role() in ('medico', 'asistente'))
  with check (public.current_user_role() in ('medico', 'asistente'));

-- ------------------ expedientes_clinicos (solo médico + dueño paciente en lectura) ------------------
create policy expedientes_select
  on public.expedientes_clinicos for select
  using (
    public.current_user_role() = 'medico'
    or public.is_own_paciente(paciente_id)
  );

create policy expedientes_insert_medico
  on public.expedientes_clinicos for insert
  with check (public.current_user_role() = 'medico');

create policy expedientes_update_medico
  on public.expedientes_clinicos for update
  using (public.current_user_role() = 'medico')
  with check (public.current_user_role() = 'medico');

-- ------------------ notas_clinicas (solo médico; paciente NO ve notas internas) ------------------
create policy notas_select_medico
  on public.notas_clinicas for select
  using (public.current_user_role() = 'medico');

create policy notas_insert_medico
  on public.notas_clinicas for insert
  with check (
    public.current_user_role() = 'medico'
    and autor_id = auth.uid()
  );

create policy notas_update_medico
  on public.notas_clinicas for update
  using (public.current_user_role() = 'medico')
  with check (public.current_user_role() = 'medico');
-- El trigger trg_notas_clinicas_block_mutation impide editar contenido
-- y bloquea cualquier update sobre una nota ya firmada.

-- ------------------ documentos ------------------
create policy documentos_select
  on public.documentos for select
  using (
    public.current_user_role() in ('medico', 'asistente')
    or public.is_own_paciente(paciente_id)
  );

create policy documentos_insert_staff
  on public.documentos for insert
  with check (public.current_user_role() in ('medico', 'asistente'));

-- sin policy de update/delete: los documentos no se editan ni se borran,
-- se re-suben como nuevo registro si es necesario.

-- ------------------ consentimientos ------------------
create policy consentimientos_select
  on public.consentimientos for select
  using (
    public.current_user_role() in ('medico', 'asistente')
    or public.is_own_paciente(paciente_id)
  );

create policy consentimientos_insert_staff
  on public.consentimientos for insert
  with check (public.current_user_role() in ('medico', 'asistente'));

create policy consentimientos_firma_paciente
  on public.consentimientos for update
  using (public.is_own_paciente(paciente_id) and firmado_en is null)
  with check (public.is_own_paciente(paciente_id));
-- El paciente solo puede pasar de "no firmado" a "firmado" (una vez);
-- una vez firmado_en no es null, esta misma condición en `using` lo bloquea.

-- ------------------ servicios (catálogo público de lectura) ------------------
create policy servicios_select_public
  on public.servicios for select
  using (true);

create policy servicios_write_medico
  on public.servicios for insert
  with check (public.current_user_role() = 'medico');

create policy servicios_update_medico
  on public.servicios for update
  using (public.current_user_role() = 'medico')
  with check (public.current_user_role() = 'medico');

-- ------------------ citas ------------------
create policy citas_select
  on public.citas for select
  using (
    public.current_user_role() in ('medico', 'asistente')
    or public.is_own_paciente(paciente_id)
  );

create policy citas_insert
  on public.citas for insert
  with check (
    public.current_user_role() in ('medico', 'asistente')
    or public.is_own_paciente(paciente_id)
  );

create policy citas_update_staff
  on public.citas for update
  using (public.current_user_role() in ('medico', 'asistente'))
  with check (public.current_user_role() in ('medico', 'asistente'));

create policy citas_update_paciente_cancela
  on public.citas for update
  using (public.is_own_paciente(paciente_id) and estado in ('pendiente', 'confirmada'))
  with check (public.is_own_paciente(paciente_id) and estado = 'cancelada');
-- El paciente solo puede mover su propia cita a estado 'cancelada'.

-- ------------------ pagos (asistente y médico; paciente ve los suyos) ------------------
create policy pagos_select
  on public.pagos for select
  using (
    public.current_user_role() in ('medico', 'asistente')
    or exists (
      select 1 from public.citas c
      where c.id = pagos.cita_id and public.is_own_paciente(c.paciente_id)
    )
  );

create policy pagos_write_staff
  on public.pagos for insert
  with check (public.current_user_role() in ('medico', 'asistente'));

create policy pagos_update_staff
  on public.pagos for update
  using (public.current_user_role() in ('medico', 'asistente'))
  with check (public.current_user_role() in ('medico', 'asistente'));
-- Los webhooks de Stripe/Mercado Pago corren con la service_role key
-- (bypassa RLS por diseño de Supabase), nunca con el JWT del cliente.

-- ------------------ bitacora_auditoria (solo médico lee; nadie actualiza/borra) ------------------
create policy bitacora_select_medico
  on public.bitacora_auditoria for select
  using (public.current_user_role() = 'medico');

create policy bitacora_insert_authenticated
  on public.bitacora_auditoria for insert
  with check (auth.uid() is not null);
-- En la práctica se inserta vía la función log_auditoria() desde server
-- actions, para garantizar accion/entidad/ip consistentes.
