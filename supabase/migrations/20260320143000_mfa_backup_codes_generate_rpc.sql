-- Secure RPC function to generate, save, and return 10 new backup codes
create or replace function generate_mfa_backup_codes()
returns text[]
language plpgsql security definer
as $$
declare
    v_user_id uuid;
    v_plain_code text;
    v_codes text[] := '{}';
begin
    v_user_id := auth.uid();
    
    if v_user_id is null then
        raise exception 'Not authenticated';
    end if;

    -- Delete any existing unused codes to prevent buildup and reset the codes
    delete from public.user_backup_codes 
    where user_id = v_user_id and is_used = false;

    -- Generate 10 cryptographically random codes
    for i in 1..10 loop
        -- Generate a 10-character lowercase alphanumeric code
        v_plain_code := substr(encode(gen_random_bytes(10), 'hex'), 1, 10);
        v_codes := array_append(v_codes, v_plain_code);

        -- Insert using bcrypt hashing
        insert into public.user_backup_codes (user_id, code_hash)
        values (v_user_id, crypt(v_plain_code, gen_salt('bf')));
    end loop;

    -- Return the plain codes so the user can save them
    return v_codes;
end;
$$;
