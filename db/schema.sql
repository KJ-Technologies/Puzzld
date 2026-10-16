-- Run this in the Supabase SQL Editor for the puzzle app's dedicated project/schema.
-- Do not run in an unrelated production project without reviewing it first.

create table if not exists public.puzzles (
  id text primary key,
  title text not null,
  category text not null,
  subtitle text not null default '',
  emoji text not null default '🧩',
  palette jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.puzzle_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('puzzle_started','puzzle_completed','puzzle_restarted','reference_toggled','difficulty_changed')),
  puzzle_id text not null references public.puzzles(id),
  piece_count integer check (piece_count in (50,100,300,500,1000)),
  elapsed_seconds integer check (elapsed_seconds is null or elapsed_seconds >= 0),
  placed_pieces integer check (placed_pieces is null or placed_pieces between 0 and 1000),
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists puzzle_events_created_at_idx on public.puzzle_events(created_at desc);
create index if not exists puzzle_events_puzzle_id_idx on public.puzzle_events(puzzle_id, event_type);

alter table public.puzzles enable row level security;
alter table public.puzzle_events enable row level security;
-- No direct public table access is granted. Express accesses the database using a server-side secret key.
revoke all on public.puzzles from anon, authenticated;
revoke all on public.puzzle_events from anon, authenticated;

do $$
begin
  insert into public.puzzles (id,title,category,subtitle,emoji,palette,featured,sort_order,is_active) values
  ('jungle','Jungle Safari','Nature','Into the wild','🐅','["#123d32","#72a85b","#f5c66a"]',true,1,true),
  ('kolkata','Kolkata','Iconic cities','The City of Joy','🚋','["#7d2e32","#e7a95a","#f4d9a6"]',false,2,true),
  ('paris','Paris','Iconic cities','City of lights','🗼','["#263b61","#df9a9b","#f5d7b5"]',false,3,true),
  ('mumbai','Mumbai','Iconic cities','Maximum city','🌊','["#123b5a","#e8a86a","#f4d8ad"]',false,4,true),
  ('sunrise','Golden Sunrise','Scenic','A new day begins','🌅','["#8b4e64","#f5a35d","#f9dc9a"]',false,5,true),
  ('sunset','Ocean Sunset','Scenic','Chasing the last light','🌇','["#493b69","#e77968","#f6c17a"]',false,6,true),
  ('mountains','Mountain Escape','Scenic','Find your quiet','🏔️','["#233e55","#83a8a0","#f1d6a4"]',false,7,true),
  ('underwater','Underwater World','Nature','Dive into colour','🐠','["#0c4861","#28a8a3","#f1cf77"]',false,8,true),
  ('space','Cosmic Journey','Imagination','A little beyond','🚀','["#171b45","#6759a9","#edb5a4"]',false,9,true),
  ('garden','Secret Garden','Nature','Bloom one piece at a time','🦋','["#285744","#7ab77b","#f2c6b8"]',false,10,true)
  on conflict (id) do nothing;
end $$;
