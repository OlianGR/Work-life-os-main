-- Create user_backup_codes table protected by RLS
create table if not exists public.user_backup_codes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    code_hash text not null,
    is_used boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_backup_codes enable row level security;

-- Policy: Only the owner can view their own backup codes
create policy "Users can view their own backup codes"
    on public.user_backup_codes for select
    using ( auth.uid() = user_id );

-- Policy: Only the owner can insert their own backup codes (when generating them initially)
create policy "Users can insert their own backup codes"
    on public.user_backup_codes for insert
    with check ( auth.uid() = user_id );

-- Create the pgcrypto extension if not present
create extension if not exists pgcrypto;

-- Secure RPC function to verify and burn a backup code in the database
-- This runs with security definer to bypass RLS for the exact match lookup/update
create or replace function verify_and_burn_backup_code(entered_code text)
returns boolean
language plpgsql security definer
as $$
declare
    v_id uuid;
    v_user_id uuid;
begin
    v_user_id := auth.uid();
    
    -- Ensure the user is actually making the request
    if v_user_id is null then
        return false;
    end if;

    -- Look for a match among active codes using crypt() comparison
    select id into v_id
    from public.user_backup_codes
    where user_id = v_user_id 
      and is_used = false 
      and code_hash = crypt(entered_code, code_hash)
    limit 1;

    -- If found, mark it as used (burn it) and return true
    if v_id is not null then
        update public.user_backup_codes
        set is_used = true
        where id = v_id;
        
        return true;
    end if;

    return false;
end;
$$;
