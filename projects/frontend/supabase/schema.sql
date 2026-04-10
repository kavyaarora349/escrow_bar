create table if not exists public.bounties (
  app_id bigint primary key,
  app_address text not null,
  creator text not null,
  title text not null,
  description text not null default '',
  reward numeric not null check (reward >= 0),
  category text not null default 'General',
  difficulty text not null default 'Medium',
  created_at bigint not null,
  status text not null check (status in ('active', 'claimed', 'completed'))
);

create index if not exists bounties_created_at_idx on public.bounties (created_at desc);

alter table public.bounties enable row level security;

drop policy if exists "Allow anonymous read bounties" on public.bounties;
create policy "Allow anonymous read bounties"
on public.bounties for select
to anon
using (true);

drop policy if exists "Allow anonymous write bounties" on public.bounties;
create policy "Allow anonymous write bounties"
on public.bounties for insert
to anon
with check (true);

drop policy if exists "Allow anonymous update bounties" on public.bounties;
create policy "Allow anonymous update bounties"
on public.bounties for update
to anon
using (true)
with check (true);
