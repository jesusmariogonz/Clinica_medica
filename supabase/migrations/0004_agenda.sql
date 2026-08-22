-- =========================================================================
-- Módulo de agenda: disponibilidad configurable por el médico + booking.
-- =========================================================================

create table public.disponibilidad_semanal (
  id uuid primary key default gen_random_uuid(),
  dia_semana smallint not null check (dia_semana between 0 and 6), -- 0=domingo
  hora_inicio time not null,
  hora_fin time not null check (hora_fin > hora_inicio),
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table public.bloqueos_disponibilidad (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  hora_inicio time, -- null = bloquea el día completo
  hora_fin time,
  motivo text,
  creado_por uuid references public.users(id),
  creado_en timestamptz not null default now()
);

alter table public.disponibilidad_semanal enable row level security;
alter table public.bloqueos_disponibilidad enable row level security;

-- Lectura: cualquier usuario autenticado (paciente necesita calcular
-- horarios disponibles para reservar). No es información sensible.
create policy disponibilidad_select_authenticated
  on public.disponibilidad_semanal for select
  using (auth.uid() is not null);

create policy disponibilidad_write_medico
  on public.disponibilidad_semanal for all
  using (public.current_user_role() = 'medico')
  with check (public.current_user_role() = 'medico');

create policy bloqueos_select_authenticated
  on public.bloqueos_disponibilidad for select
  using (auth.uid() is not null);

create policy bloqueos_write_medico
  on public.bloqueos_disponibilidad for all
  using (public.current_user_role() = 'medico')
  with check (public.current_user_role() = 'medico');

-- ---------------------------------------------------------------------
-- Permite que un paciente cree su propio registro en `pacientes` al
-- reservar su primera cita (self-service). El expediente clínico y las
-- notas siguen siendo capturados/controlados exclusivamente por el
-- médico; esto solo crea el registro de identificación básica.
-- ---------------------------------------------------------------------
create policy pacientes_insert_self
  on public.pacientes for insert
  with check (user_id = auth.uid());
