-- =========================================================================
-- Corrige un gap de seguridad: la policy `users_update_own_limited`
-- permite a cualquier usuario hacer UPDATE de su propia fila en
-- `public.users`, pero no restringe qué columnas puede cambiar — un
-- paciente podría hacer UPDATE ... SET role = 'medico' WHERE id = auth.uid().
--
-- Este trigger bloquea cambios directos a `role` y `mfa_enabled` salvo que
-- provengan de una función SECURITY DEFINER de confianza (set_user_role,
-- set_mfa_enabled), identificada por una bandera de sesión local.
-- =========================================================================

create or replace function public.users_block_privileged_self_edit()
returns trigger
language plpgsql
as $$
begin
  if (new.role is distinct from old.role or new.mfa_enabled is distinct from old.mfa_enabled)
     and coalesce(current_setting('app.allow_privileged_user_update', true), 'off') <> 'on' then
    raise exception 'No se puede modificar role/mfa_enabled directamente; use las funciones administrativas.';
  end if;
  return new;
end;
$$;

create trigger trg_users_block_privileged_self_edit
  before update on public.users
  for each row execute function public.users_block_privileged_self_edit();

-- set_user_role() ya existe (migración 0002); se actualiza para activar la
-- bandera de sesión que autoriza el cambio de rol.
create or replace function public.set_user_role(p_user_id uuid, p_role user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_role() <> 'medico' then
    raise exception 'Solo el rol médico puede cambiar roles de usuario.';
  end if;

  perform set_config('app.allow_privileged_user_update', 'on', true);
  update public.users set role = p_role where id = p_user_id;

  perform public.log_auditoria('cambio_rol', 'users', p_user_id, null);
end;
$$;

-- Función de autoservicio: el propio usuario marca su MFA como habilitado
-- después de completar exitosamente el enroll+verify de un factor TOTP en
-- el cliente (supabase.auth.mfa). Solo puede tocar su propia fila.
create or replace function public.set_mfa_enabled(p_enabled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado.';
  end if;

  perform set_config('app.allow_privileged_user_update', 'on', true);
  update public.users set mfa_enabled = p_enabled where id = auth.uid();

  perform public.log_auditoria(
    case when p_enabled then 'mfa_habilitado' else 'mfa_deshabilitado' end,
    'users',
    auth.uid(),
    null
  );
end;
$$;
