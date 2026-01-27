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
