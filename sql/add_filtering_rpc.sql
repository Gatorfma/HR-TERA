-- ============================================================
-- RPC: get_all_products_with_details
-- Purpose: Fetch all approved products with extended details 
-- (languages, headquarters) for client-side filtering.
-- ============================================================
create or replace function public.get_all_products_with_details()
returns table (
  product_id       uuid,
  product_name     text,
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
    p.product_id,
    p.product_name,
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
  from public.products p
  join public.vendors v
    on v.vendor_id = p.vendor_id
  where p.listing_status = 'approved'
  order by
    case v.subscription
      when 'gold' then 1
      when 'silver' then 2
      else 3
    end,
    p.rating desc nulls last,
    p.created_at desc;
$$;

grant execute on function public.get_all_products_with_details() to anon, authenticated, service_role;
