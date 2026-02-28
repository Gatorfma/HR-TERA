-- ============================================================
-- RPC: get_favourite_products
-- Purpose: Fetch full product cards for the authenticated user's favourites.
-- Uses security definer to bypass the RLS on products/vendors
-- (same pattern as get_product_cards).
-- ============================================================
create or replace function public.get_favourite_products()
returns table (
  product_name     text,
  product_id       uuid,
  main_category    public.product_category,
  categories       public.product_category[],
  short_desc       text,
  logo             text,
  pricing          text,
  rating           double precision,
  vendor_id        uuid,
  is_verified      boolean,
  company_name     text,
  subscription     public.tier,
  languages        text[],
  headquarters     text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.product_name,
    p.product_id,
    p.main_category,
    p.categories,
    p.short_desc,
    p.logo,
    p.pricing,
    p.rating,
    p.vendor_id,
    v.is_verified,
    v.company_name,
    v.subscription,
    p.languages,
    v.headquarters
  from public.favourites f
  join public.products p on p.product_id = f.product_id
  join public.vendors v on v.vendor_id = p.vendor_id
  where f.user_id = auth.uid()
    and p.listing_status = 'approved'
  order by f.created_at desc;
$$;

grant execute on function public.get_favourite_products() to authenticated;
