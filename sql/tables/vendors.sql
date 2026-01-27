create table if not exists public.vendors (
  vendor_id        uuid primary key default gen_random_uuid(),

  -- Supabase auth users live in auth.users(id)
  user_id          uuid null references auth.users(id) on delete set null,

  is_verified      boolean not null default false,

  linkedin_link    text,
  instagram_link   text,
  website_link     text,

  logo             text,         -- base64 string or link to the image
  company_name     text,
  company_size     text,
  company_motto    text,
  company_desc     text,
  headquarters     text,
  founded_at       date,

  subscription     public.tier not null default 'freemium',

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- company_size regex: "number-number" (e.g. 1-10)
  constraint vendors_company_size_range_chk
    check (company_size is null or company_size ~ '^[0-9]+-[0-9]+$')
);