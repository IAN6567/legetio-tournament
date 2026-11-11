-- Legetio Youth Tournament: Supabase (PostgreSQL) schema
-- Run in Supabase Dashboard > SQL Editor.
create extension if not exists "pgcrypto";

create table wards   (id uuid primary key default gen_random_uuid(), name text unique not null);
create table teams   (id uuid primary key default gen_random_uuid(), name text not null, ward_id uuid references wards(id), coach text default 'TBA', created_at timestamptz default now());
create table players (id uuid primary key default gen_random_uuid(), team_id uuid not null references teams(id) on delete cascade, name text not null, position text check (position in ('GK','DF','MF','FW')), shirt_no int, dob date, id_verified boolean default false);
create table matches (
  id uuid primary key default gen_random_uuid(),
  stage text not null check (stage in ('ward','main')),
  ward_id uuid references wards(id),
  round text not null default 'Group',
  match_date date, kickoff time, venue text,
  home_id uuid references teams(id), away_id uuid references teams(id),
  home_score int, away_score int,
  status text not null default 'Upcoming' check (status in ('Upcoming','Live','FT')),
  motm_id uuid references players(id),
  check (home_id <> away_id)
);
create table match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  team_id uuid references teams(id), player_id uuid references players(id),
  type text not null check (type in ('goal','assist','yellow','red')),
  minute int
);
create table news (id uuid primary key default gen_random_uuid(), body text not null, created_at timestamptz default now());

-- Security: everyone can READ; only logged-in admins can WRITE.
do $$ declare t text; begin
  foreach t in array array['wards','teams','players','matches','match_events','news'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('create policy "admin write" on %I for all to authenticated using (true) with check (true)', t);
  end loop; end $$;

-- Live scores: enable realtime on matches and match_events
alter publication supabase_realtime add table matches, match_events;
