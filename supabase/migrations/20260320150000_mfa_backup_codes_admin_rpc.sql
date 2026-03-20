-- FUNCTION: verify_and_burn_backup_code_admin
-- Propósito: Verificar y quemar un código de rescate con privilegios Admin para evitar problemas de RLS/Session
create or replace function public.verify_and_burn_backup_code_admin(p_user_id uuid, p_code text)
returns boolean
language plpgsql security definer
as $$
declare
    v_id uuid;
begin
    -- Buscamos el código en la tabla usando crypt para el hash
    select id into v_id
    from public.user_backup_codes
    where user_id = p_user_id 
      and is_used = false 
      and code_hash = crypt(p_code, code_hash)
    limit 1;

    -- Si hay match, lo marcamos como usado (quemado)
    if v_id is not null then
        update public.user_backup_codes
        set is_used = true
        where id = v_id;
        
        return true;
    end if;

    return false;
end;
$$;
