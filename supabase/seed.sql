-- =========================================================================
-- Seed de desarrollo: NO usar en producción.
-- Datos de servicios placeholder para Dra. Maggie Morales — Medicina
-- Estética, Saltillo, Coahuila. Precios y descripciones de ejemplo,
-- pendientes de validación por la clínica.
-- =========================================================================

insert into public.servicios (nombre, descripcion, precio, anticipo_requerido, duracion_minutos, activo)
values
  ('Valoración inicial', 'Consulta de valoración y plan de tratamiento personalizado.', 500.00, 0, 30, true),
  ('Toxina botulínica', 'Tratamiento para líneas de expresión con resultados naturales.', 4500.00, 1000.00, 45, true),
  ('Ácido hialurónico - labios', 'Armonización facial sutil, realce natural.', 5500.00, 1500.00, 60, true),
  ('Bioestimulador de colágeno', 'Estimulación de colágeno para mejorar firmeza y calidad de piel.', 6800.00, 2000.00, 60, true),
  ('Limpieza facial profunda', 'Limpieza facial profesional con extracción e hidratación.', 900.00, 0, 50, true)
on conflict do nothing;

-- NOTA: no se insertan usuarios/pacientes de prueba con datos clínicos
-- reales ni ficticios que simulen expedientes, para evitar confusión con
-- información real de pacientes en ambientes compartidos.
