-- ============================================================
-- RPC: get_product_cards
-- Purpose: Paginated fetch of products with server-side filtering
-- (Search, Vendor, Category, Language, Country)
-- ============================================================
create or replace function public.get_product_cards(
  n integer,
  page integer,
  product_filter  text default null,
  vendor_filter   text default null,
  category_filter public.product_category default null,
  language_filter text default null,
  country_filter  text default null,
  tier_filter     public.tier default null
)
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
  from public.products p
  join public.vendors v
    on v.vendor_id = p.vendor_id
  where p.listing_status = 'approved'
    and (
      product_filter is null
      or p.product_name ilike '%' || product_filter || '%'
      or p.short_desc  ilike '%' || product_filter || '%'
    )
    and (
      vendor_filter is null
      or v.company_name ilike '%' || vendor_filter || '%'
    )
    and (
      category_filter is null
      or p.main_category = category_filter
      or category_filter = any (p.categories)
    )
    and (
      language_filter is null
      or language_filter = any (p.languages)
    )
    and (
      country_filter is null
      or trim(substring(v.headquarters from '([^,]+)$')) ilike country_filter
    )
    and (
      tier_filter is null
      or v.subscription = tier_filter
    )
  order by
    case v.subscription
      when 'gold' then 1
      when 'silver' then 2
      else 3
    end,
    p.rating desc nulls last,
    p.created_at desc
  limit greatest(n, 0)
  offset greatest((page - 1) * n, 0);
$$;

grant execute on function public.get_product_cards(
  integer,
  integer,
  text,
  text,
  public.product_category,
  text,
  text,
  public.tier
) to anon, authenticated, service_role;
