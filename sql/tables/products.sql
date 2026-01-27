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

  logo             text not null,         -- base64 string or link to the image
  video_url        text,
  gallery          text[],                -- array of base64 strings or links

  pricing          text,                  -- "Free" OR a price / range pattern
  languages        text[],                -- or switch later to a language enum

  demo_link        text,
  release_date     date,

  rating           double precision,      -- consider computed later from reviews
  listing_status   public.listing_status not null default 'pending',

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- rating bounds
  constraint products_rating_bounds_chk
    check (rating is null or (rating >= 0 and rating <= 5))
);