create table if not exists public.analytics_events (
  id         uuid primary key default gen_random_uuid(),
  event_type text not null,
  path       text,
  product_id uuid null references public.products(product_id) on delete cascade,
  user_id    uuid null references auth.users(id) on delete set null,
  session_id uuid,
  referrer   text,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);

create index if not exists analytics_events_event_type_idx
  on public.analytics_events (event_type);

create index if not exists analytics_events_product_id_idx
  on public.analytics_events (product_id);
