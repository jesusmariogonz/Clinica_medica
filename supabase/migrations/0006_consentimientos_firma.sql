-- =========================================================================
-- La policy `consentimientos_firma_paciente` (migración 0001) permite al
-- paciente hacer UPDATE de su propio consentimiento mientras no esté
-- firmado, pero no restringe qué columnas puede tocar — igual que el gap
-- corregido para `users` en la migración 0003. Este trigger asegura que
-- un paciente solo pueda transicionar firmado_en/firma_digital_hash de
-- null a un valor, y nunca modificar tipo/texto_version/paciente_id ni
-- volver a firmar un consentimiento ya firmado.
-- =========================================================================

create or replace function public.consentimientos_block_mutation()
returns trigger
language plpgsql
as $$
begin
  if old.firmado_en is not null then
    raise exception 'Este consentimiento ya fue firmado y no puede modificarse.';
  end if;

  if new.paciente_id is distinct from old.paciente_id
     or new.tipo is distinct from old.tipo
     or new.texto_version is distinct from old.texto_version then
    raise exception 'No se pueden modificar los datos del consentimiento, solo firmarlo.';
  end if;

  return new;
end;
$$;

create trigger trg_consentimientos_block_mutation
  before update on public.consentimientos
  for each row execute function public.consentimientos_block_mutation();
