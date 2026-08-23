-- =========================================================================
-- Soporte para: sugerencia de próxima cita, y fotos de seguimiento como
-- tipo de documento distinguible.
-- =========================================================================

alter table public.expedientes_clinicos
  add column proxima_cita_sugerida date,
  add column proxima_cita_nota text;

alter type documento_tipo add value if not exists 'foto_seguimiento';
