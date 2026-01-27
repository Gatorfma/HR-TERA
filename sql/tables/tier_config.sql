create table if not exists public.tier_config (
  tier            public.tier primary key,
  is_active       boolean not null default true,
  monthly_price   numeric not null default 0,
  yearly_price    numeric not null default 0,
  currency        text not null default 'USD',
  highlight_label text,
  tagline         text,
  headline        text,
  features        jsonb not null default '[]'::jsonb,
  updated_at      timestamptz not null default now()
);
