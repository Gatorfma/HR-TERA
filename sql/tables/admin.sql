create table if not exists public.admin (
  user_id uuid primary key references auth.users(id) on delete cascade
);
