-- Bag reservations for /inventory: one row per physical bag ("slot"), with the
-- friend's name and address. Password protected:
--   * RLS is on with no policies, so the public (anon) key can't touch either
--     table directly.
--   * The page reads and writes only through the two functions below, which
--     check the password against a bcrypt hash in inventory_settings.
-- The password itself is set separately (not in this file):
--   insert into public.inventory_settings (id, password_hash)
--   values (1, extensions.crypt('<password>', extensions.gen_salt('bf')))
--   on conflict (id) do update set password_hash = excluded.password_hash;

create table public.bag_reservations (
  slot text primary key,
  name text not null default '',
  address text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.bag_reservations enable row level security;

create table public.inventory_settings (
  id int primary key default 1 check (id = 1),
  password_hash text not null
);
alter table public.inventory_settings enable row level security;

create function public.inventory_password_ok(p_password text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.inventory_settings s
    where s.password_hash = extensions.crypt(p_password, s.password_hash)
  );
$$;

create function public.inventory_load(p_password text)
returns table (slot text, name text, address text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.inventory_password_ok(p_password) then
    raise exception 'wrong password' using errcode = '28P01';
  end if;
  return query select r.slot, r.name, r.address from public.bag_reservations r;
end;
$$;

-- p_rows: [{ "slot": "honey-100-1", "name": "...", "address": "..." }, ...]
create function public.inventory_save(p_password text, p_rows jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.inventory_password_ok(p_password) then
    raise exception 'wrong password' using errcode = '28P01';
  end if;
  insert into public.bag_reservations (slot, name, address, updated_at)
  select x.slot, coalesce(x.name, ''), coalesce(x.address, ''), now()
  from jsonb_to_recordset(p_rows) as x(slot text, name text, address text)
  on conflict (slot) do update
    set name = excluded.name, address = excluded.address, updated_at = now();
end;
$$;

-- Only the two page functions are callable from the site
revoke all on function public.inventory_password_ok(text) from public, anon, authenticated;
revoke all on function public.inventory_load(text) from public;
revoke all on function public.inventory_save(text, jsonb) from public;
grant execute on function public.inventory_load(text) to anon, authenticated;
grant execute on function public.inventory_save(text, jsonb) to anon, authenticated;
