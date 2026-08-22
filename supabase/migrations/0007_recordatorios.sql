-- =========================================================================
-- Campo para evitar enviar el recordatorio de 24h más de una vez por cita.
-- =========================================================================

alter table public.citas
  add column recordatorio_enviado boolean not null default false;
