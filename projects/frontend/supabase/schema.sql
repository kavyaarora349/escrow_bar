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

create table if not exists public.disputes (
  id text primary key,
  bounty_id text not null,
  bounty_title text not null,
  amount numeric not null default 0 check (amount >= 0),
  raised_by text not null,
  reason text not null,
  status text not null check (status in ('voting', 'resolved')),
  created_at bigint not null,
  voting_ends_at bigint not null,
  votes_for_creator integer not null default 0 check (votes_for_creator >= 0),
  votes_for_worker integer not null default 0 check (votes_for_worker >= 0),
  voters jsonb not null default '[]'::jsonb,
  resolution text null check (resolution in ('creator', 'worker', 'tie') or resolution is null)
);

create index if not exists disputes_created_at_idx on public.disputes (created_at desc);
create index if not exists disputes_status_idx on public.disputes (status);

alter table public.disputes enable row level security;

drop policy if exists "Allow anonymous read disputes" on public.disputes;
create policy "Allow anonymous read disputes"
on public.disputes for select
to anon
using (true);

drop policy if exists "Allow anonymous write disputes" on public.disputes;
create policy "Allow anonymous write disputes"
on public.disputes for insert
to anon
with check (true);

drop policy if exists "Allow anonymous update disputes" on public.disputes;
create policy "Allow anonymous update disputes"
on public.disputes for update
to anon
using (true)
with check (true);

create table if not exists public.submissions (
  id text primary key,
  bounty_id text not null,
  submitter text not null,
  content text not null,
  created_at bigint not null,
  status text not null check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists submissions_bounty_id_idx on public.submissions (bounty_id);
create index if not exists submissions_created_at_idx on public.submissions (created_at desc);

alter table public.submissions enable row level security;

drop policy if exists "Allow anonymous read submissions" on public.submissions;
create policy "Allow anonymous read submissions"
on public.submissions for select
to anon
using (true);

drop policy if exists "Allow anonymous write submissions" on public.submissions;
create policy "Allow anonymous write submissions"
on public.submissions for insert
to anon
with check (true);

drop policy if exists "Allow anonymous update submissions" on public.submissions;
create policy "Allow anonymous update submissions"
on public.submissions for update
to anon
using (true)
with check (true);
