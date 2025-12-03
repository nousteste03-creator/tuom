create table if not exists public.goal_installments (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,

  numero_parcela integer,
  valor_parcela numeric,
  vencimento date,
  status text default 'pending', -- pending | paid

  created_at timestamptz default now()
);
