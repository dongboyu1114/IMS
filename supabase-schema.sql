create table if not exists public.app_state (
  id text primary key,
  products jsonb not null default '[]'::jsonb,
  shipments jsonb not null default '[]'::jsonb,
  product_templates jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state
add column if not exists product_templates jsonb not null default '[]'::jsonb;

insert into public.app_state (id, products, shipments, product_templates)
values ('main', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
on conflict (id) do nothing;

alter table public.app_state enable row level security;

drop policy if exists "Allow anon read app_state" on public.app_state;
create policy "Allow anon read app_state"
on public.app_state
for select
to anon
using (true);

drop policy if exists "Allow anon update app_state" on public.app_state;
create policy "Allow anon update app_state"
on public.app_state
for update
to anon
using (id = 'main')
with check (id = 'main');

drop policy if exists "Allow anon insert app_state" on public.app_state;
create policy "Allow anon insert app_state"
on public.app_state
for insert
to anon
with check (id = 'main');
