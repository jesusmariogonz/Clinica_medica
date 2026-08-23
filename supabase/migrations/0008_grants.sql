-- =========================================================================
-- Concede los permisos base de Postgres (GRANT) que faltan porque el
-- proyecto se creó con "Automatically expose new tables" desactivado
-- (deliberadamente, para no exponer tablas nuevas sin RLS explícito).
-- Sin este GRANT, Postgres rechaza la consulta ANTES de evaluar las
-- políticas RLS ("permission denied for table ..."), sin importar que
-- las policies sean correctas. RLS sigue siendo la capa real de control
-- de acceso fila-por-fila; este GRANT solo habilita la operación a nivel
-- de tabla para que RLS pueda aplicarse.
-- =========================================================================

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete
  on all tables in schema public
  to authenticated;

-- El catálogo de servicios es público (se muestra en el sitio sin login).
grant select on public.servicios to anon;

grant usage, select on all sequences in schema public to authenticated;

-- Funciones invocadas vía RPC desde el cliente (supabase.rpc(...)).
grant execute on function public.set_user_role(uuid, user_role) to authenticated;
grant execute on function public.set_mfa_enabled(boolean) to authenticated;
grant execute on function public.log_auditoria(text, text, uuid, text) to authenticated;

-- Para que cualquier tabla que se cree en el futuro con estas migraciones
-- también reciba el GRANT automáticamente, sin tener que repetir esto.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
