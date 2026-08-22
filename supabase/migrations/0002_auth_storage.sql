-- =========================================================================
-- Auth sync + Storage privado para documentos
-- =========================================================================

-- ---------------------------------------------------------------------
-- Trigger: al crear un usuario en auth.users, crear su fila en public.users
-- Rol por defecto 'paciente'; medico/asistente se promueven manualmente
-- por un admin (nunca vía auto-registro).
-- ---------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, nombre, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre', new.email),
    'paciente'
  );
  return new;
end;
$$;

create trigger trg_handle_new_auth_user
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------
-- Función administrativa para promover un rol (solo médico puede invocarla)
-- ---------------------------------------------------------------------
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

  update public.users set role = p_role where id = p_user_id;

  perform public.log_auditoria('cambio_rol', 'users', p_user_id, null);
end;
$$;

-- ---------------------------------------------------------------------
-- Storage: bucket privado para documentos clínicos
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documentos-clinicos', 'documentos-clinicos', false)
on conflict (id) do nothing;

-- Solo médico/asistente pueden subir (INSERT) a este bucket.
create policy storage_documentos_insert_staff
  on storage.objects for insert
  with check (
    bucket_id = 'documentos-clinicos'
    and public.current_user_role() in ('medico', 'asistente')
  );

-- Lectura: médico/asistente ven todo; paciente solo su propia carpeta
-- (convención de path: {paciente_id}/{archivo}).
create policy storage_documentos_select
  on storage.objects for select
  using (
    bucket_id = 'documentos-clinicos'
    and (
      public.current_user_role() in ('medico', 'asistente')
      or public.is_own_paciente((storage.foldername(name))[1]::uuid)
    )
  );

-- Sin policy de update/delete: los archivos no se sobrescriben ni se
-- borran, siguiendo el mismo principio append-only que notas_clinicas.
-- El acceso real siempre se hace vía URLs firmadas de expiración corta
-- generadas server-side con la service_role key, no con acceso directo
-- de storage.objects desde el cliente.
