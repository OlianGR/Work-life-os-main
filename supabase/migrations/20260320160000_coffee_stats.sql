-- Create a table to track website statistics like coffee count
create table if not exists public.site_stats (
    id bigint primary key generated always as identity,
    name text unique not null,
    value bigint default 0,
    updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.site_stats enable row level security;

-- Policy: Anyone can read stats
create policy "Allow public read access on site_stats"
on public.site_stats for select
to public
using (true);

-- Policy: Only service role can modify stats (security definer or service role)
-- This is where Stripe webhooks or administrative actions will push data
create policy "Restrict insert/update to service role"
on public.site_stats for all
using (auth.role() = 'service_role');

-- Insert the initial coffee counter
insert into public.site_stats (name, value)
values ('coffees_received', 0)
on conflict (name) do nothing;

-- Function to increment coffee count (to be called by webhooks securely)
create or replace function public.increment_coffee_count(p_amount int default 1)
returns void
language plpgsql
security definer
as $$
begin
    update public.site_stats
    set value = value + p_amount,
        updated_at = now()
    where name = 'coffees_received';
end;
$$;
