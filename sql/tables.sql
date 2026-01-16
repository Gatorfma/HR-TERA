-- =========================
-- vendors
-- =========================
create table if not exists public.vendors (
  vendor_id        uuid primary key default gen_random_uuid(),

  -- Supabase auth users live in auth.users(id)
  user_id          uuid null references auth.users(id) on delete set null,

  is_verified      boolean not null default false,

  linkedin_link    text,
  instagram_link   text,
  website_link     text,

  logo             text,         -- base64 string
  company_name     text,
  company_size     text,
  company_motto    text,
  company_desc     text,
  headquarters     text,
  founded_at       date,

  subscription     public.tier not null default 'freemium',

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- basic URL-ish checks (kept permissive)
  constraint vendors_linkedin_link_url_chk
    check (linkedin_link is null or linkedin_link ~* '^https?://'),
  constraint vendors_instagram_link_url_chk
    check (instagram_link is null or instagram_link ~* '^https?://'),
  constraint vendors_website_link_url_chk
    check (website_link is null or website_link ~* '^https?://'),

  -- company_size regex: "number-number" (e.g. 1-10)
  constraint vendors_company_size_range_chk
    check (company_size is null or company_size ~ '^[0-9]+-[0-9]+$')
);


-- =========================
-- products
-- =========================
create table if not exists public.products (
  product_id       uuid primary key default gen_random_uuid(),
  vendor_id        uuid not null references public.vendors(vendor_id) on delete cascade,

  product_name     text not null,
  website_link     text,

  main_category    public.product_category not null,
  categories       public.product_category[],

  features         text[],

  short_desc       text not null,
  long_desc        text,

  logo             text not null,         -- base64 string
  video_url        text,
  gallery          text[],                -- array of base64 strings

  pricing          text,                  -- "Free" OR a price / range pattern
  languages        text[],                -- or switch later to a language enum

  demo_link        text,
  release_date     date,

  rating           double precision,      -- consider computed later from reviews
  listing_status   public.listing_status not null default 'pending',

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- URL-ish checks
  constraint products_website_link_url_chk
    check (website_link is null or website_link ~* '^https?://'),
  constraint products_video_url_chk
    check (video_url is null or video_url ~* '^https?://'),
  constraint products_meeting_link_chk
    check (demo_link is null or demo_link ~* '^https?://'),

  -- rating bounds
  constraint products_rating_bounds_chk
    check (rating is null or (rating >= 0 and rating <= 5))
);


-- =========================
-- tier_config
-- =========================
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


-- =========================
-- analytics_events
-- =========================
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


-- =========================
-- ownership_requests
-- =========================
create table if not exists public.ownership_requests (
  id         uuid primary key default gen_random_uuid(),

  -- vendor being claimed
  claimed_vendor_id  uuid not null
                     references public.vendors(vendor_id)
                     on delete cascade,

  -- vendor submitting the claim
  claimer_vendor_id  uuid not null
                     references public.vendors(vendor_id)
                     on delete cascade,

  status     public.listing_status not null default 'pending',
  message    text,

  created_at timestamptz not null default now()
);


-- =========================
-- admin
-- =========================
create table if not exists public.admin (
  user_id uuid primary key references auth.users(id) on delete cascade
);
