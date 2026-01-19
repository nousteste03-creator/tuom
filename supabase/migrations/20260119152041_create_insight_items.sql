create table public.insight_items (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  body text not null,
  source text,
  published_at timestamptz not null,
  created_at timestamptz default now()
);

alter table public.insight_items enable row level security;

create policy "public read insight_items"
on public.insight_items
for select
using (true);
