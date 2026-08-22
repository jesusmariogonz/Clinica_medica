-- =========================================================================
-- Permite que un paciente inicie su propio registro de pago (estado
-- pendiente) para una cita suya, necesario para crear el registro antes
-- de redirigir a Stripe/Mercado Pago Checkout. La confirmación real
-- (estado -> aprobado/rechazado) solo la hace el webhook correspondiente,
-- vía el cliente service_role (bypassa RLS deliberadamente: no hay sesión
-- de usuario en un webhook).
-- =========================================================================

create policy pagos_insert_self
  on public.pagos for insert
  with check (
    estado = 'pendiente'
    and metodo in ('stripe', 'mercadopago')
    and exists (
      select 1 from public.citas c
      where c.id = pagos.cita_id and public.is_own_paciente(c.paciente_id)
    )
  );
