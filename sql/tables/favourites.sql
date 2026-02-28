create table if not exists public.favourites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(product_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.favourites enable row level security;

-- Users can view only their own favourites
create policy "Users can view own favourites"
  on public.favourites for select
  using (auth.uid() = user_id);

-- Users can insert their own favourites
create policy "Users can insert own favourites"
  on public.favourites for insert
  with check (auth.uid() = user_id);

-- Users can delete their own favourites
create policy "Users can delete own favourites"
  on public.favourites for delete
  using (auth.uid() = user_id);
