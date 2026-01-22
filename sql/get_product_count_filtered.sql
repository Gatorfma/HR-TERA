-- ============================================================
-- RPC: get_product_count_filtered
-- Purpose: Get total count of products matching the filters for pagination
-- ============================================================
create or replace function public.get_product_count_filtered(
  product_filter  text default null,
  vendor_filter   text default null,
  category_filter public.product_category default null,
  language_filter text default null,
  country_filter  text default null,
  tier_filter     public.tier default null
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
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
    );
$$;

grant execute on function public.get_product_count_filtered(
  text,
  text,
  public.product_category,
  text,
  text,
  public.tier
) to anon, authenticated, service_role;
