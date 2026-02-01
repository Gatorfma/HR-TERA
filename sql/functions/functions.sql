-- =================================
-- Check if the user is the admin
-- =================================
-- NOTE: Uses SECURITY DEFINER because the admin table has RLS
-- enabled with no read policies. This allows the function to
-- bypass RLS and check if the calling user is in the admin table.
-- =================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.admin
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to service_role;


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
      when 'premium' then 1
      when 'plus' then 2
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


-- ==================================================================
-- RPC: get_product_details
-- - Returns full product + vendor details for a given product_id,
-- - but only if the product is approved; otherwise raises an error.
-- ==================================================================
create or replace function public.get_product_details(p_product_id uuid)
returns table (
  -- products.*
  product_id       uuid,
  vendor_id        uuid,
  product_name     text,
  product_website  text,
  main_category    public.product_category,
  categories       public.product_category[],
  features         text[],
  short_desc       text,
  long_desc        text,
  logo             text,
  video_url        text,
  gallery          text[],
  pricing          text,
  languages        text[],
  demo_link        text,
  release_date     date,
  rating           double precision,
  listing_status   public.listing_status,
  product_created_at timestamptz,
  product_updated_at timestamptz,

  -- vendors.*
  vendor_user_id   uuid,
  is_verified      boolean,
  linkedin_link    text,
  instagram_link   text,
  vendor_website   text,
  company_name     text,
  company_size     text,
  company_motto    text,
  company_desc     text,
  headquarters     text,
  founded_at       date,
  subscription     public.tier,
  vendor_created_at timestamptz,
  vendor_updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
begin
  return query
  select
    p.product_id,
    p.vendor_id,
    p.product_name,
    p.website_link,
    p.main_category,
    p.categories,
    p.features,
    p.short_desc,
    p.long_desc,
    p.logo,
    p.video_url,
    p.gallery,
    p.pricing,
    p.languages,
    p.demo_link,
    p.release_date,
    p.rating,
    p.listing_status,
    p.created_at,
    p.updated_at,

    v.user_id,
    v.is_verified,
    v.linkedin_link,
    v.instagram_link,
    v.website_link,
    v.company_name,
    v.company_size,
    v.company_motto,
    v.company_desc,
    v.headquarters,
    v.founded_at,
    v.subscription,
    v.created_at,
    v.updated_at
  from public.products p
  join public.vendors v
    on v.vendor_id = p.vendor_id
  where p.product_id = p_product_id
    and p.listing_status = 'approved';

  if not found then
    raise exception 'Product not found or not approved'
      using errcode = 'P0001';
  end if;
end;
$$;

grant execute on function public.get_product_details(uuid) to anon;
grant execute on function public.get_product_details(uuid) to authenticated;
grant execute on function public.get_product_details(uuid) to service_role;


-- ============================================================
-- RPC: get_product_count
-- ============================================================
create or replace function public.get_product_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)
  from public.products
  where listing_status = 'approved';
$$;

grant execute on function public.get_product_count() to anon;
grant execute on function public.get_product_count() to authenticated;
grant execute on function public.get_product_count() to service_role;


-- RPC: get_product_count_filtered
-- ============================================================
-- Returns count of products matching the same filters as get_product_cards
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
  select count(*)
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
      or v.headquarters ilike '%' || country_filter
    )
    and (
      tier_filter is null
      or v.subscription = tier_filter
    );
$$;

grant execute on function public.get_product_count_filtered(text, text, public.product_category, text, text, public.tier) to anon;
grant execute on function public.get_product_count_filtered(text, text, public.product_category, text, text, public.tier) to authenticated;
grant execute on function public.get_product_count_filtered(text, text, public.product_category, text, text, public.tier) to service_role;


-- ============================================================
-- RPC: get_vendor_count
-- ============================================================
create or replace function public.get_vendor_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)
  from public.vendors;
$$;

grant execute on function public.get_vendor_count() to anon;
grant execute on function public.get_vendor_count() to authenticated;
grant execute on function public.get_vendor_count() to service_role;


-- ============================================================
-- RPC: get_public_tier_config
-- Purpose: Expose active tier config for marketing/pricing pages
-- ============================================================
create or replace function public.get_public_tier_config()
returns table (
  tier public.tier,
  is_active boolean,
  monthly_price numeric,
  yearly_price numeric,
  currency text,
  highlight_label text,
  tagline text,
  headline text,
  features jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    t.tier,
    t.is_active,
    t.monthly_price,
    t.yearly_price,
    t.currency,
    t.highlight_label,
    t.tagline,
    t.headline,
    t.features
  from public.tier_config t
  where t.is_active = true
  order by
    case t.tier
      when 'freemium' then 1
      when 'plus' then 2
      when 'premium' then 3
    end;
$$;

grant execute on function public.get_public_tier_config() to anon;
grant execute on function public.get_public_tier_config() to authenticated;
grant execute on function public.get_public_tier_config() to service_role;


-- ############################################################
-- ANALYTICS FUNCTIONS
-- ############################################################


-- ============================================================
-- RPC: log_page_view
-- Purpose: Track general page views (and product views when product_id provided)
-- Callable by: anon, authenticated
-- ============================================================
create or replace function public.log_page_view(
  p_path text,
  p_product_id uuid default null,
  p_referrer text default null,
  p_session_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_product_id uuid;
  v_event_type text := 'page_view';
begin
  if p_path is null or length(p_path) = 0 then
    p_path := '/';
  end if;

  if p_metadata is null then
    p_metadata := '{}'::jsonb;
  end if;

  v_product_id := p_product_id;

  if p_product_id is not null then
    if exists (
      select 1
      from public.products
      where product_id = p_product_id
    ) then
      v_event_type := 'product_view';
    else
      v_product_id := null;
    end if;
  end if;

  insert into public.analytics_events (
    event_type,
    path,
    product_id,
    user_id,
    session_id,
    referrer,
    metadata
  )
  values (
    v_event_type,
    p_path,
    v_product_id,
    auth.uid(),
    p_session_id,
    p_referrer,
    p_metadata
  );

  return true;
end;
$$;

grant execute on function public.log_page_view(text, uuid, text, uuid, jsonb) to anon;
grant execute on function public.log_page_view(text, uuid, text, uuid, jsonb) to authenticated;
grant execute on function public.log_page_view(text, uuid, text, uuid, jsonb) to service_role;


-- ============================================================
-- RPC: log_product_event
-- Purpose: Track product-level actions (CTA clicks)
-- Callable by: anon, authenticated
-- ============================================================
create or replace function public.log_product_event(
  p_product_id uuid,
  p_event_type text,
  p_path text default null,
  p_referrer text default null,
  p_session_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if p_product_id is null then
    raise exception 'Product id is required'
      using errcode = 'P0400';
  end if;

  if p_event_type is null or p_event_type not in ('product_cta_click') then
    raise exception 'Invalid event type: %', p_event_type
      using errcode = 'P0400';
  end if;

  if not exists (
    select 1
    from public.products
    where product_id = p_product_id
  ) then
    return false;
  end if;

  if p_path is null or length(p_path) = 0 then
    p_path := '/';
  end if;

  if p_metadata is null then
    p_metadata := '{}'::jsonb;
  end if;

  insert into public.analytics_events (
    event_type,
    path,
    product_id,
    user_id,
    session_id,
    referrer,
    metadata
  )
  values (
    p_event_type,
    p_path,
    p_product_id,
    auth.uid(),
    p_session_id,
    p_referrer,
    p_metadata
  );

  return true;
end;
$$;

grant execute on function public.log_product_event(uuid, text, text, text, uuid, jsonb) to anon;
grant execute on function public.log_product_event(uuid, text, text, text, uuid, jsonb) to authenticated;
grant execute on function public.log_product_event(uuid, text, text, text, uuid, jsonb) to service_role;


-- ============================================================
-- RPC: log_vendor_event
-- Purpose: Track vendor-level actions (CTA clicks)
-- Callable by: anon, authenticated
-- ============================================================
create or replace function public.log_vendor_event(
  p_vendor_id uuid,
  p_event_type text,
  p_path text default null,
  p_referrer text default null,
  p_session_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if p_vendor_id is null then
    raise exception 'Vendor id is required'
      using errcode = 'P0400';
  end if;

  if p_event_type is null or p_event_type not in ('vendor_cta_click') then
    raise exception 'Invalid event type: %', p_event_type
      using errcode = 'P0400';
  end if;

  if not exists (
    select 1
    from public.vendors
    where vendor_id = p_vendor_id
  ) then
    return false;
  end if;

  if p_path is null or length(p_path) = 0 then
    p_path := '/';
  end if;

  if p_metadata is null then
    p_metadata := '{}'::jsonb;
  end if;

  p_metadata := jsonb_set(p_metadata, '{vendor_id}', to_jsonb(p_vendor_id::text), true);

  insert into public.analytics_events (
    event_type,
    path,
    product_id,
    user_id,
    session_id,
    referrer,
    metadata
  )
  values (
    p_event_type,
    p_path,
    null,
    auth.uid(),
    p_session_id,
    p_referrer,
    p_metadata
  );

  return true;
end;
$$;

grant execute on function public.log_vendor_event(uuid, text, text, text, uuid, jsonb) to anon;
grant execute on function public.log_vendor_event(uuid, text, text, text, uuid, jsonb) to authenticated;
grant execute on function public.log_vendor_event(uuid, text, text, text, uuid, jsonb) to service_role;

-- ============================================================
-- RPC: admin_get_product_analytics
-- Purpose: Product analytics view for admin (visits + ratings)
-- ============================================================
create or replace function public.admin_get_product_analytics(
  p_start_date date default null,
  p_end_date date default null
)
returns table (
  product_id uuid,
  product_name text,
  short_desc text,
  website_link text,
  main_category public.product_category,
  categories public.product_category[],
  vendor_id uuid,
  vendor_name text,
  subscription public.tier,
  rating double precision,
  visits bigint,
  last_viewed_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  return query
  select
    p.product_id,
    p.product_name,
    p.short_desc,
    p.website_link,
    p.main_category,
    p.categories,
    v.vendor_id,
    v.company_name,
    v.subscription,
    p.rating,
    coalesce(ev.visits, 0)::bigint as visits,
    ev.last_viewed_at
  from public.products p
  join public.vendors v
    on v.vendor_id = p.vendor_id
  left join lateral (
    select
      count(*)::bigint as visits,
      max(e.created_at) as last_viewed_at
    from public.analytics_events e
    where e.product_id = p.product_id
      and e.event_type = 'product_view'
      and (p_start_date is null or e.created_at >= p_start_date)
      and (p_end_date is null or e.created_at < (p_end_date + interval '1 day'))
  ) ev on true
  order by visits desc, p.created_at desc;
end;
$$;

grant execute on function public.admin_get_product_analytics(date, date) to authenticated;
grant execute on function public.admin_get_product_analytics(date, date) to service_role;


-- ============================================================
-- RPC: admin_get_dashboard_kpis
-- Purpose: Summary metrics for admin dashboard
-- ============================================================
create or replace function public.admin_get_dashboard_kpis()
returns table (
  total_users integer,
  users_added_30d integer,
  total_products integer,
  products_added_30d integer,
  weekly_visits integer,
  conversion_rate numeric
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  v_total_users integer;
  v_users_added_30d integer;
  v_total_products integer;
  v_products_added_30d integer;
  v_weekly_visits integer;
  v_product_views_30d integer;
  v_product_cta_30d integer;
  v_conversion_rate numeric;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  select count(*)::integer into v_total_users
  from auth.users;

  select count(*)::integer into v_users_added_30d
  from auth.users
  where created_at >= now() - interval '30 days';

  select count(*)::integer into v_total_products
  from public.products;

  select count(*)::integer into v_products_added_30d
  from public.products
  where created_at >= now() - interval '30 days';

  select count(*)::integer into v_weekly_visits
  from public.analytics_events e
  where e.created_at >= now() - interval '7 days'
    and e.event_type in ('page_view', 'product_view')
    and (
      e.path is null
      or split_part(split_part(e.path, '?', 1), '#', 1) not like '/admin%'
    );

  select count(*)::integer into v_product_views_30d
  from public.analytics_events e
  where e.created_at >= now() - interval '30 days'
    and e.event_type = 'product_view';

  select count(*)::integer into v_product_cta_30d
  from public.analytics_events e
  where e.created_at >= now() - interval '30 days'
    and e.event_type = 'product_cta_click';

  if v_product_views_30d = 0 then
    v_conversion_rate := 0;
  else
    v_conversion_rate := round((v_product_cta_30d::numeric / v_product_views_30d::numeric) * 100, 1);
  end if;

  return query
  select
    v_total_users,
    v_users_added_30d,
    v_total_products,
    v_products_added_30d,
    v_weekly_visits,
    v_conversion_rate;
end;
$$;

grant execute on function public.admin_get_dashboard_kpis() to authenticated;
grant execute on function public.admin_get_dashboard_kpis() to service_role;


-- ============================================================
-- RPC: admin_get_weekly_visits
-- Purpose: Daily visit counts for last N days
-- ============================================================
create or replace function public.admin_get_weekly_visits(
  p_days integer default 7
)
returns table (
  day date,
  visits integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  return query
  select
    d::date as day,
    coalesce(count(e.*), 0)::integer as visits
  from generate_series(
    current_date - greatest(p_days - 1, 0),
    current_date,
    interval '1 day'
  ) as d
  left join public.analytics_events e
    on e.created_at >= d
   and e.created_at < d + interval '1 day'
   and e.event_type in ('page_view', 'product_view')
   and (
     e.path is null
     or split_part(split_part(e.path, '?', 1), '#', 1) not like '/admin%'
   )
  group by d
  order by d;
end;
$$;

grant execute on function public.admin_get_weekly_visits(integer) to authenticated;
grant execute on function public.admin_get_weekly_visits(integer) to service_role;


-- ============================================================
-- RPC: admin_get_monthly_product_additions
-- Purpose: Monthly product counts for last N months
-- ============================================================
create or replace function public.admin_get_monthly_product_additions(
  p_months integer default 6
)
returns table (
  month date,
  products integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  return query
  select
    date_trunc('month', d)::date as month,
    coalesce(count(p.*), 0)::integer as products
  from generate_series(
    date_trunc('month', current_date) - ((greatest(p_months, 1) - 1) * interval '1 month'),
    date_trunc('month', current_date),
    interval '1 month'
  ) as d
  left join public.products p
    on p.created_at >= d
   and p.created_at < d + interval '1 month'
  group by d
  order by d;
end;
$$;

grant execute on function public.admin_get_monthly_product_additions(integer) to authenticated;
grant execute on function public.admin_get_monthly_product_additions(integer) to service_role;


-- ============================================================
-- RPC: admin_get_category_distribution
-- Purpose: Category distribution for admin analytics
-- ============================================================
create or replace function public.admin_get_category_distribution()
returns table (
  category text,
  value integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  return query
  select
    p.main_category::text as category,
    count(*)::integer as value
  from public.products p
  group by p.main_category
  order by count(*) desc;
end;
$$;

grant execute on function public.admin_get_category_distribution() to authenticated;
grant execute on function public.admin_get_category_distribution() to service_role;


-- ############################################################
-- ADMIN USER MANAGEMENT FUNCTIONS
-- ############################################################
-- These functions enable administrators to manage users and vendors.
-- All functions require admin privileges (checked via is_admin()).
-- 
-- Security Model:
-- - SECURITY DEFINER: Functions run with definer privileges
-- - Admin check at start of each function
-- - Only authenticated and service_role can execute
-- ############################################################


-- ============================================================
-- RPC: admin_get_vendors
-- ============================================================
-- Purpose: List all vendors (paginated) for admin management
-- Queries public.vendors and optionally joins auth.users for email
-- 
-- Parameters:
--   page_num     : Page number (1-based)
--   page_size    : Number of results per page (default 20)
--   search_query : Optional search term for company name or email
--
-- Returns: Table of vendors with optional user email
-- Errors: P0403 if caller is not admin
-- ============================================================
create or replace function public.admin_get_vendors(
  page_num integer default 1,
  page_size integer default 20,
  search_query text default null
)
returns table (
  vendor_id uuid,
  user_id uuid,
  company_name text,
  company_size text,
  company_motto text,
  company_desc text,
  headquarters text,
  website_link text,
  linkedin_link text,
  instagram_link text,
  logo text,
  subscription public.tier,
  is_verified boolean,
  founded_at date,
  created_at timestamptz,
  updated_at timestamptz,
  -- From auth.users (if linked)
  user_email text,
  user_full_name text
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  -- Admin check: only admins can list all vendors
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  return query
  select
    v.vendor_id,
    v.user_id,
    v.company_name,
    v.company_size,
    v.company_motto,
    v.company_desc,
    v.headquarters,
    v.website_link,
    v.linkedin_link,
    v.instagram_link,
    v.logo,
    v.subscription,
    v.is_verified,
    v.founded_at,
    v.created_at,
    v.updated_at,
    u.email::text as user_email,
    (u.raw_user_meta_data->>'full_name')::text as user_full_name
  from public.vendors v
  left join auth.users u on u.id = v.user_id
  where (
    search_query is null
    or v.company_name ilike '%' || search_query || '%'
    or u.email ilike '%' || search_query || '%'
  )
  order by v.created_at desc
  limit greatest(page_size, 1)
  offset greatest((page_num - 1) * page_size, 0);
end;
$$;

grant execute on function public.admin_get_vendors(integer, integer, text) to authenticated;
grant execute on function public.admin_get_vendors(integer, integer, text) to service_role;


-- ============================================================
-- RPC: admin_get_vendors_count
-- ============================================================
-- Purpose: Get total count of vendors for pagination
-- Uses same search logic as admin_get_vendors
--
-- Parameters:
--   search_query : Optional search term
--
-- Returns: Integer count
-- Errors: P0403 if caller is not admin
-- ============================================================
create or replace function public.admin_get_vendors_count(
  search_query text default null
)
returns integer
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  total integer;
begin
  -- Admin check
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  select count(*)::integer into total
  from public.vendors v
  left join auth.users u on u.id = v.user_id
  where (
    search_query is null
    or v.company_name ilike '%' || search_query || '%'
    or u.email ilike '%' || search_query || '%'
  );

  return total;
end;
$$;

grant execute on function public.admin_get_vendors_count(text) to authenticated;
grant execute on function public.admin_get_vendors_count(text) to service_role;


-- ============================================================
-- RPC: admin_update_vendor_tier
-- ============================================================
-- Purpose: Update a vendor's subscription tier (freemium/plus/premium)
-- This controls the vendor's access level and listing priority
--
-- Parameters:
--   p_vendor_id : UUID of the vendor to update
--   p_new_tier  : New tier value (freemium, plus, or premium)
--
-- Returns: Boolean (true if update succeeded)
-- Errors:
--   P0403 if caller is not admin
--   P0404 if vendor not found
-- Side Effects: Updates vendors.subscription and vendors.updated_at
-- ============================================================
create or replace function public.admin_update_vendor_tier(
  p_vendor_id uuid,
  p_new_tier public.tier
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  rows_affected integer;
begin
  -- Admin check
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  -- Validate vendor exists
  if not exists (select 1 from public.vendors where vendor_id = p_vendor_id) then
    raise exception 'Vendor not found: %', p_vendor_id
      using errcode = 'P0404';
  end if;

  -- Update the tier
  update public.vendors
  set 
    subscription = p_new_tier,
    updated_at = now()
  where vendor_id = p_vendor_id;

  get diagnostics rows_affected = row_count;
  
  return rows_affected > 0;
end;
$$;

grant execute on function public.admin_update_vendor_tier(uuid, public.tier) to authenticated;
grant execute on function public.admin_update_vendor_tier(uuid, public.tier) to service_role;


-- ============================================================
-- RPC: admin_update_vendor_verification
-- ============================================================
-- Purpose: Update a vendor's verification status
-- This controls whether the vendor is displayed as verified
--
-- Parameters:
--   p_vendor_id   : UUID of the vendor to update
--   p_is_verified : Boolean verification status
--
-- Returns: Boolean (true if update succeeded)
-- Errors:
--   P0403 if caller is not admin
--   P0404 if vendor not found
-- Side Effects: Updates vendors.is_verified and vendors.updated_at
-- ============================================================
create or replace function public.admin_update_vendor_verification(
  p_vendor_id uuid,
  p_is_verified boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  rows_affected integer;
begin
  -- Check admin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  -- Update vendor verification status
  update public.vendors
  set
    is_verified = p_is_verified,
    updated_at = now()
  where vendor_id = p_vendor_id;

  get diagnostics rows_affected = row_count;

  if rows_affected = 0 then
    raise exception 'Vendor not found: %', p_vendor_id
      using errcode = 'P0404';
  end if;
  
  return rows_affected > 0;
end;
$$;

grant execute on function public.admin_update_vendor_verification(uuid, boolean) to authenticated;
grant execute on function public.admin_update_vendor_verification(uuid, boolean) to service_role;


-- ============================================================
-- RPC: admin_update_vendor_profile
-- ============================================================
-- Purpose: Update vendor profile fields (company info)
-- Allows admin to modify company_name, website, size, headquarters, and social links
--
-- Parameters:
--   p_vendor_id       : UUID of the vendor to update
--   p_company_name    : New company name (null = no change)
--   p_company_website : New website URL (null = no change)
--   p_company_size    : New size range like "1-10" (null = no change)
--   p_headquarters    : New headquarters location (null = no change)
--   p_linkedin_link   : LinkedIn profile URL (null = no change)
--   p_instagram_link  : Instagram profile URL (null = no change)
--   p_logo            : Company logo URL (null = no change)
--   p_company_motto   : Company motto/tagline (null = no change)
--   p_company_desc    : Company description (null = no change)
--   p_founded_at      : Company founding date (null = no change)
--
-- Returns: Boolean (true if update succeeded)
-- Errors:
--   P0403 if caller is not admin
--   P0404 if vendor not found
--   P0400 if website URL or company size format is invalid
-- Side Effects: Updates vendors fields and vendors.updated_at
-- ============================================================
create or replace function public.admin_update_vendor_profile(
  p_vendor_id uuid,
  p_company_name text default null,
  p_company_website text default null,
  p_company_size text default null,
  p_headquarters text default null,
  p_linkedin_link text default null,
  p_instagram_link text default null,
  p_logo text default null,
  p_company_motto text default null,
  p_company_desc text default null,
  p_founded_at date default null
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  rows_affected integer;
begin
  -- Admin check
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  -- Validate vendor exists
  if not exists (select 1 from public.vendors where vendor_id = p_vendor_id) then
    raise exception 'Vendor not found: %', p_vendor_id
      using errcode = 'P0404';
  end if;

  -- Validate website URL format if provided
  if p_company_website is not null and p_company_website != '' then
    if not (p_company_website ~* '^https?://') then
      raise exception 'Invalid website URL format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
  end if;

  -- Validate company_size format if provided (must be "number-number")
  if p_company_size is not null and p_company_size != '' then
    if not (p_company_size ~ '^[0-9]+-[0-9]+$') then
      raise exception 'Invalid company size format. Must be like "1-10" or "50-100"'
        using errcode = 'P0400';
    end if;
  end if;

  -- Update fields (only non-null values)
  -- COALESCE with NULLIF handles empty strings
  update public.vendors
  set 
    company_name = coalesce(nullif(p_company_name, ''), company_name),
    website_link = case 
      when p_company_website is not null then nullif(p_company_website, '')
      else website_link 
    end,
    company_size = case 
      when p_company_size is not null then nullif(p_company_size, '')
      else company_size 
    end,
    headquarters = case 
      when p_headquarters is not null then nullif(p_headquarters, '')
      else headquarters 
    end,
    linkedin_link = case 
      when p_linkedin_link is not null then nullif(p_linkedin_link, '')
      else linkedin_link 
    end,
    instagram_link = case 
      when p_instagram_link is not null then nullif(p_instagram_link, '')
      else instagram_link 
    end,
    logo = case 
      when p_logo is not null then nullif(p_logo, '')
      else logo 
    end,
    company_motto = case 
      when p_company_motto is not null then nullif(p_company_motto, '')
      else company_motto 
    end,
    company_desc = case 
      when p_company_desc is not null then nullif(p_company_desc, '')
      else company_desc 
    end,
    founded_at = coalesce(p_founded_at, founded_at),
    updated_at = now()
  where vendor_id = p_vendor_id;

  get diagnostics rows_affected = row_count;
  
  return rows_affected > 0;
end;
$$;

grant execute on function public.admin_update_vendor_profile(uuid, text, text, text, text, text, text, text, text, text, date) to authenticated;
grant execute on function public.admin_update_vendor_profile(uuid, text, text, text, text, text, text, text, text, text, date) to service_role;


-- ============================================================
-- RPC: admin_create_vendor
-- Purpose: Create a new vendor (company) record
-- Parameters:
--   p_company_name    : Company name
--   p_user_id         : Optional user to link (null if none)
--   p_is_verified     : Verification status (default false)
--   p_company_size    : Company size range (e.g. "1-10")
--   p_company_motto   : Company motto/tagline
--   p_company_desc    : Company description
--   p_headquarters    : Company headquarters location
--   p_founded_at      : Company founding date
--   p_website_link    : Website URL
--   p_linkedin_link   : LinkedIn URL
--   p_instagram_link  : Instagram URL
--   p_logo            : Logo URL or base64
--   p_subscription    : Tier (freemium/plus/premium)
--
-- Returns: UUID of the newly created vendor
-- Errors: P0403 if not admin, P0400 for validation errors
-- ============================================================
create or replace function public.admin_create_vendor(
  p_company_name text default null,
  p_user_id uuid default null,
  p_is_verified boolean default false,
  p_company_size text default null,
  p_company_motto text default null,
  p_company_desc text default null,
  p_headquarters text default null,
  p_founded_at date default null,
  p_website_link text default null,
  p_linkedin_link text default null,
  p_instagram_link text default null,
  p_logo text default null,
  p_subscription public.tier default 'freemium'
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public, auth
as $$
declare
  v_vendor_id uuid;
  v_existing_vendor_id uuid;
begin
  -- Admin check
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  -- Validate company_size format if provided
  if p_company_size is not null and p_company_size != '' then
    if not (p_company_size ~ '^[0-9]+-[0-9]+$') then
      raise exception 'Invalid company size format. Must be like "1-10" or "50-100"'
        using errcode = 'P0400';
    end if;
  end if;

  -- Validate website URL format if provided
  if p_website_link is not null and p_website_link != '' then
    if not (p_website_link ~* '^https?://') then
      raise exception 'Invalid website URL format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
  end if;

  -- If user_id is provided, check if user exists
  if p_user_id is not null then
    if not exists (select 1 from auth.users where id = p_user_id) then
      raise exception 'User not found: %', p_user_id
        using errcode = 'P0404';
    end if;

    -- Check if user is already assigned to another vendor
    select vendor_id into v_existing_vendor_id
    from public.vendors
    where user_id = p_user_id;

    if v_existing_vendor_id is not null then
      raise exception 'User is already assigned to vendor: %', v_existing_vendor_id
        using errcode = 'P0409';
    end if;
  end if;

  -- Insert new vendor
  insert into public.vendors (
    user_id,
    is_verified,
    company_name,
    company_size,
    company_motto,
    company_desc,
    headquarters,
    founded_at,
    website_link,
    linkedin_link,
    instagram_link,
    logo,
    subscription
  ) values (
    p_user_id,
    coalesce(p_is_verified, false),
    nullif(p_company_name, ''),
    nullif(p_company_size, ''),
    nullif(p_company_motto, ''),
    nullif(p_company_desc, ''),
    nullif(p_headquarters, ''),
    p_founded_at,
    nullif(p_website_link, ''),
    nullif(p_linkedin_link, ''),
    nullif(p_instagram_link, ''),
    nullif(p_logo, ''),
    coalesce(p_subscription, 'freemium')
  )
  returning vendor_id into v_vendor_id;

  return v_vendor_id;
end;
$$;

grant execute on function public.admin_create_vendor(text, uuid, boolean, text, text, text, text, date, text, text, text, text, public.tier) to authenticated;
grant execute on function public.admin_create_vendor(text, uuid, boolean, text, text, text, text, date, text, text, text, text, public.tier) to service_role;


-- ============================================================
-- RPC: admin_search_users
-- Purpose: Search users by email for admin assignment
-- Parameters:
--   search_query : Email search term (partial match)
--   result_limit : Max results to return (default 10)
-- Returns: List of users with their vendor assignment status
-- Errors: P0403 if caller is not admin
-- ============================================================
create or replace function public.admin_search_users(
  search_query text,
  result_limit integer default 10
)
returns table (
  user_id uuid,
  email text,
  full_name text,
  assigned_vendor_id uuid,
  assigned_vendor_name text
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  -- Admin check
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  -- Validate search query
  if search_query is null or length(trim(search_query)) < 2 then
    raise exception 'Search query must be at least 2 characters'
      using errcode = 'P0400';
  end if;

  return query
  select
    u.id as user_id,
    u.email::text as email,
    (u.raw_user_meta_data->>'full_name')::text as full_name,
    v.vendor_id as assigned_vendor_id,
    v.company_name as assigned_vendor_name
  from auth.users u
  left join public.vendors v on v.user_id = u.id
  where u.email ilike '%' || trim(search_query) || '%'
  order by u.email asc
  limit greatest(result_limit, 1);
end;
$$;

grant execute on function public.admin_search_users(text, integer) to authenticated;
grant execute on function public.admin_search_users(text, integer) to service_role;


-- ============================================================
-- RPC: admin_assign_user_to_vendor
-- Purpose: Assign a user account to a vendor
-- Parameters:
--   p_vendor_id : The vendor to assign the user to
--   p_user_id   : The user to assign (null to unassign current user)
-- Returns: Boolean (true if update succeeded)
-- Errors: P0403 if not admin, P0404 if vendor/user not found,
--         P0409 if user already assigned to another vendor
-- ============================================================
create or replace function public.admin_assign_user_to_vendor(
  p_vendor_id uuid,
  p_user_id uuid default null
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public, auth
as $$
declare
  v_existing_vendor_id uuid;
  v_existing_vendor_name text;
  rows_affected integer;
begin
  -- Admin check
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  -- Validate vendor exists
  if not exists (select 1 from public.vendors where vendor_id = p_vendor_id) then
    raise exception 'Vendor not found: %', p_vendor_id
      using errcode = 'P0404';
  end if;

  -- If assigning a user (not unassigning)
  if p_user_id is not null then
    -- Validate user exists
    if not exists (select 1 from auth.users where id = p_user_id) then
      raise exception 'User not found: %', p_user_id
        using errcode = 'P0404';
    end if;

    -- Check if user is already assigned to another vendor
    select vendor_id, company_name into v_existing_vendor_id, v_existing_vendor_name
    from public.vendors
    where user_id = p_user_id and vendor_id != p_vendor_id;

    if v_existing_vendor_id is not null then
      raise exception 'User is already assigned to vendor: % (%)', v_existing_vendor_name, v_existing_vendor_id
        using errcode = 'P0409';
    end if;
  end if;

  -- Update vendor with new user_id
  update public.vendors
  set
    user_id = p_user_id,
    updated_at = now()
  where vendor_id = p_vendor_id;

  get diagnostics rows_affected = row_count;

  return rows_affected > 0;
end;
$$;

grant execute on function public.admin_assign_user_to_vendor(uuid, uuid) to authenticated;
grant execute on function public.admin_assign_user_to_vendor(uuid, uuid) to service_role;


-- ============================================================
-- RPC: admin_search_vendors
-- Purpose: Search vendors by company name for admin assignment
-- Parameters:
--   search_query : Company name search term (partial match)
--   result_limit : Max results to return (default 10)
-- Returns: List of vendors with basic info
-- Errors: P0403 if caller is not admin
-- ============================================================
create or replace function public.admin_search_vendors(
  search_query text,
  result_limit integer default 10
)
returns table (
  vendor_id uuid,
  company_name text,
  subscription public.tier,
  is_verified boolean,
  headquarters text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Admin check
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  -- Validate search query
  if search_query is null or length(trim(search_query)) < 2 then
    raise exception 'Search query must be at least 2 characters'
      using errcode = 'P0400';
  end if;

  return query
  select
    v.vendor_id,
    v.company_name,
    v.subscription,
    v.is_verified,
    v.headquarters
  from public.vendors v
  where v.company_name ilike '%' || trim(search_query) || '%'
  order by v.company_name asc
  limit greatest(result_limit, 1);
end;
$$;

grant execute on function public.admin_search_vendors(text, integer) to authenticated;
grant execute on function public.admin_search_vendors(text, integer) to service_role;


-- ############################################################
-- ADMIN PRODUCT/OWNERSHIP REQUEST FUNCTIONS
-- ############################################################


-- ============================================================
-- RPC: admin_get_product_requests
-- Purpose: List all product listing requests for admin review
-- Returns: Product info with vendor details
-- Errors: P0403 if caller is not admin
-- ============================================================
create or replace function public.admin_get_product_requests()
returns table (
  product_id uuid,
  vendor_id uuid,
  product_name text,
  short_desc text,
  website_link text,
  logo text,
  main_category public.product_category,
  categories public.product_category[],
  features text[],
  listing_status public.listing_status,
  created_at timestamptz,
  company_name text,
  subscription public.tier,
  company_motto text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  return query
  select
    p.product_id,
    p.vendor_id,
    p.product_name,
    p.short_desc,
    p.website_link,
    p.logo,
    p.main_category,
    p.categories,
    p.features,
    p.listing_status,
    p.created_at,
    v.company_name,
    v.subscription,
    v.company_motto
  from public.products p
  join public.vendors v
    on v.vendor_id = p.vendor_id
  order by p.created_at desc;
end;
$$;

grant execute on function public.admin_get_product_requests() to authenticated;
grant execute on function public.admin_get_product_requests() to service_role;


-- ============================================================
-- RPC: admin_update_product_listing_status
-- Purpose: Update a product listing status (pending/approved/rejected)
-- Returns: Boolean (true if update succeeded)
-- Errors:
--   P0403 if caller is not admin
--   P0404 if product not found
-- ============================================================
create or replace function public.admin_update_product_listing_status(
  p_product_id uuid,
  p_status public.listing_status
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  rows_affected integer;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  if not exists (select 1 from public.products where product_id = p_product_id) then
    raise exception 'Product not found: %', p_product_id
      using errcode = 'P0404';
  end if;

  update public.products
  set
    listing_status = p_status,
    updated_at = now()
  where product_id = p_product_id;

  get diagnostics rows_affected = row_count;

  return rows_affected > 0;
end;
$$;

grant execute on function public.admin_update_product_listing_status(uuid, public.listing_status) to authenticated;
grant execute on function public.admin_update_product_listing_status(uuid, public.listing_status) to service_role;


-- ============================================================
-- Helper: merge vendors (claimer <- claimed)
-- ============================================================
create or replace function public.merge_vendors(
  p_claimer_vendor_id uuid,
  p_claimed_vendor_id uuid
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_claimer public.vendors%rowtype;
  v_claimed public.vendors%rowtype;
begin
  if p_claimer_vendor_id is null or p_claimed_vendor_id is null then
    raise exception 'Vendor ids are required'
      using errcode = 'P0400';
  end if;

  if p_claimer_vendor_id = p_claimed_vendor_id then
    return false;
  end if;

  select * into v_claimer
  from public.vendors
  where vendor_id = p_claimer_vendor_id;

  if v_claimer.vendor_id is null then
    raise exception 'Claimer vendor not found: %', p_claimer_vendor_id
      using errcode = 'P0404';
  end if;

  select * into v_claimed
  from public.vendors
  where vendor_id = p_claimed_vendor_id;

  -- If claimed vendor already removed, treat as no-op
  if v_claimed.vendor_id is null then
    return false;
  end if;

  update public.vendors
  set
    user_id = coalesce(v_claimer.user_id, v_claimed.user_id),
    company_name = coalesce(nullif(v_claimer.company_name, ''), v_claimed.company_name),
    company_size = coalesce(nullif(v_claimer.company_size, ''), v_claimed.company_size),
    company_motto = coalesce(nullif(v_claimer.company_motto, ''), v_claimed.company_motto),
    company_desc = coalesce(nullif(v_claimer.company_desc, ''), v_claimed.company_desc),
    headquarters = coalesce(nullif(v_claimer.headquarters, ''), v_claimed.headquarters),
    founded_at = coalesce(v_claimer.founded_at, v_claimed.founded_at),
    website_link = coalesce(nullif(v_claimer.website_link, ''), v_claimed.website_link),
    linkedin_link = coalesce(nullif(v_claimer.linkedin_link, ''), v_claimed.linkedin_link),
    instagram_link = coalesce(nullif(v_claimer.instagram_link, ''), v_claimed.instagram_link),
    is_verified = v_claimer.is_verified or v_claimed.is_verified,
    subscription = case
      when v_claimer.subscription = 'premium' or v_claimed.subscription = 'premium' then 'premium'::public.tier
      when v_claimer.subscription = 'plus' or v_claimed.subscription = 'plus' then 'plus'::public.tier
      else 'freemium'::public.tier
    end,
    updated_at = now()
  where vendor_id = p_claimer_vendor_id;

  update public.products
  set
    vendor_id = p_claimer_vendor_id,
    updated_at = now()
  where vendor_id = p_claimed_vendor_id;

  delete from public.vendors
  where vendor_id = p_claimed_vendor_id;

  return true;
end;
$$;

revoke execute on function public.merge_vendors(uuid, uuid) from public;
grant execute on function public.merge_vendors(uuid, uuid) to service_role;


-- ############################################################
-- ADMIN TIER CONFIG FUNCTIONS
-- ############################################################


-- ============================================================
-- RPC: admin_get_tier_config
-- Purpose: Fetch tier pricing + feature config for admin
-- Returns: Full tier config rows
-- Errors: P0403 if caller is not admin
-- ============================================================
create or replace function public.admin_get_tier_config()
returns table (
  tier public.tier,
  is_active boolean,
  monthly_price numeric,
  yearly_price numeric,
  currency text,
  highlight_label text,
  tagline text,
  headline text,
  features jsonb,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  return query
  select
    t.tier,
    t.is_active,
    t.monthly_price,
    t.yearly_price,
    t.currency,
    t.highlight_label,
    t.tagline,
    t.headline,
    t.features,
    t.updated_at
  from public.tier_config t
  order by t.tier;
end;
$$;

grant execute on function public.admin_get_tier_config() to authenticated;
grant execute on function public.admin_get_tier_config() to service_role;


-- ============================================================
-- RPC: admin_upsert_tier_config
-- Purpose: Upsert tier config rows from JSON payload
-- Input: JSON array of tier objects
-- Errors: P0403 if caller is not admin
-- ============================================================
create or replace function public.admin_upsert_tier_config(
  p_tiers jsonb
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  tier_item jsonb;
  v_tier public.tier;
  v_is_active boolean;
  v_monthly numeric;
  v_yearly numeric;
  v_currency text;
  v_highlight text;
  v_tagline text;
  v_headline text;
  v_features jsonb;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  if p_tiers is null or jsonb_typeof(p_tiers) <> 'array' then
    raise exception 'Invalid payload: expected array'
      using errcode = 'P0400';
  end if;

  for tier_item in select * from jsonb_array_elements(p_tiers) loop
    v_tier := (tier_item->>'tier')::public.tier;
    v_is_active := coalesce((tier_item->>'is_active')::boolean, true);
    v_monthly := coalesce(nullif(tier_item->>'monthly_price', '')::numeric, 0);
    v_yearly := coalesce(nullif(tier_item->>'yearly_price', '')::numeric, 0);
    v_currency := nullif(tier_item->>'currency', '');
    v_highlight := nullif(tier_item->>'highlight_label', '');
    v_tagline := nullif(tier_item->>'tagline', '');
    v_headline := nullif(tier_item->>'headline', '');
    v_features := coalesce(tier_item->'features', '[]'::jsonb);

    if v_currency is null then
      v_currency := 'USD';
    end if;

    if jsonb_typeof(v_features) <> 'array' then
      raise exception 'Invalid features: expected array'
        using errcode = 'P0400';
    end if;

    if v_monthly < 0 or v_yearly < 0 then
      raise exception 'Pricing must be non-negative'
        using errcode = 'P0400';
    end if;

    if v_tier = 'freemium' then
      v_monthly := 0;
      v_yearly := 0;
      v_is_active := true;
    end if;

    insert into public.tier_config (
      tier,
      is_active,
      monthly_price,
      yearly_price,
      currency,
      highlight_label,
      tagline,
      headline,
      features,
      updated_at
    )
    values (
      v_tier,
      v_is_active,
      v_monthly,
      v_yearly,
      v_currency,
      v_highlight,
      v_tagline,
      v_headline,
      v_features,
      now()
    )
    on conflict (tier) do update
    set
      is_active = excluded.is_active,
      monthly_price = excluded.monthly_price,
      yearly_price = excluded.yearly_price,
      currency = excluded.currency,
      highlight_label = excluded.highlight_label,
      tagline = excluded.tagline,
      headline = excluded.headline,
      features = excluded.features,
      updated_at = now();
  end loop;

  return true;
end;
$$;

grant execute on function public.admin_upsert_tier_config(jsonb) to authenticated;
grant execute on function public.admin_upsert_tier_config(jsonb) to service_role;


-- ============================================================
-- RPC: admin_get_ownership_requests
-- Purpose: List all ownership requests for admin review
-- Returns: Ownership request info with vendor + user details
-- Errors: P0403 if caller is not admin
-- ============================================================
create or replace function public.admin_get_ownership_requests()
returns table (
  id uuid,
  claimed_vendor_id uuid,
  claimed_vendor_name text,
  claimer_vendor_id uuid,
  claimer_vendor_name text,
  claimer_user_id uuid,
  user_email text,
  user_full_name text,
  status public.listing_status,
  message text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  return query
  select
    o.id,
    o.claimed_vendor_id,
    v_claimed.company_name,
    o.claimer_vendor_id,
    v_claimer.company_name,
    v_claimer.user_id,
    u.email::text as user_email,
    (u.raw_user_meta_data->>'full_name')::text as user_full_name,
    o.status,
    o.message,
    o.created_at
  from public.ownership_requests o
  join public.vendors v_claimed
    on v_claimed.vendor_id = o.claimed_vendor_id
  join public.vendors v_claimer
    on v_claimer.vendor_id = o.claimer_vendor_id
  left join auth.users u
    on u.id = v_claimer.user_id
  order by o.created_at desc;
end;
$$;

grant execute on function public.admin_get_ownership_requests() to authenticated;
grant execute on function public.admin_get_ownership_requests() to service_role;


-- ============================================================
-- RPC: submit_ownership_request
-- Purpose: Submit ownership claim for a vendor (current user only)
-- Returns: UUID of the created request
-- Errors:
--   P0401 if not authenticated
--   P0404 if claimed vendor or claimer vendor not found
--   P0409 if request already pending
-- ============================================================
create or replace function public.submit_ownership_request(
  p_claimed_vendor_id uuid,
  p_message text default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_claimer_vendor_id uuid;
  v_request_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized: authentication required'
      using errcode = 'P0401';
  end if;

  if p_claimed_vendor_id is null then
    raise exception 'Claimed vendor id is required'
      using errcode = 'P0400';
  end if;

  select vendor_id
    into v_claimer_vendor_id
  from public.vendors
  where user_id = auth.uid();

  if v_claimer_vendor_id is null then
    raise exception 'Vendor not found for current user'
      using errcode = 'P0404';
  end if;

  if not exists (
    select 1
    from public.vendors
    where vendor_id = p_claimed_vendor_id
  ) then
    raise exception 'Claimed vendor not found: %', p_claimed_vendor_id
      using errcode = 'P0404';
  end if;

  if p_claimed_vendor_id = v_claimer_vendor_id then
    raise exception 'Cannot claim your own vendor'
      using errcode = 'P0400';
  end if;

  if exists (
    select 1
    from public.ownership_requests
    where claimed_vendor_id = p_claimed_vendor_id
      and claimer_vendor_id = v_claimer_vendor_id
      and status = 'pending'
  ) then
    raise exception 'Ownership request already pending'
      using errcode = 'P0409';
  end if;

  insert into public.ownership_requests (
    claimed_vendor_id,
    claimer_vendor_id,
    status,
    message
  )
  values (
    p_claimed_vendor_id,
    v_claimer_vendor_id,
    'pending',
    nullif(p_message, '')
  )
  returning id into v_request_id;

  return v_request_id;
end;
$$;

grant execute on function public.submit_ownership_request(uuid, text) to authenticated;
grant execute on function public.submit_ownership_request(uuid, text) to service_role;


-- ============================================================
-- RPC: admin_update_ownership_request_status
-- Purpose: Update ownership request status (pending/approved/rejected)
-- Returns: Boolean (true if update succeeded)
-- Errors:
--   P0403 if caller is not admin
--   P0404 if request not found
-- ============================================================
create or replace function public.admin_update_ownership_request_status(
  p_request_id uuid,
  p_status public.listing_status
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  rows_affected integer;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  if not exists (select 1 from public.ownership_requests where id = p_request_id) then
    raise exception 'Ownership request not found: %', p_request_id
      using errcode = 'P0404';
  end if;

  update public.ownership_requests
  set status = p_status
  where id = p_request_id;

  get diagnostics rows_affected = row_count;

  return rows_affected > 0;
end;
$$;

grant execute on function public.admin_update_ownership_request_status(uuid, public.listing_status) to authenticated;
grant execute on function public.admin_update_ownership_request_status(uuid, public.listing_status) to service_role;


-- ============================================================
-- RPC: ownership_request_approve
-- Purpose: Approve ownership request and trigger merge
-- Returns: Boolean (true if update succeeded)
-- Errors:
--   P0403 if caller is not admin
--   P0404 if request not found
-- ============================================================
create or replace function public.ownership_request_approve(
  p_request_id uuid
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  rows_affected integer;
  v_claimer_id uuid;
  v_claimed_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  select claimer_vendor_id, claimed_vendor_id
    into v_claimer_id, v_claimed_id
  from public.ownership_requests
  where id = p_request_id;

  if not found then
    raise exception 'Ownership request not found: %', p_request_id
      using errcode = 'P0404';
  end if;

  update public.ownership_requests
  set status = 'approved'
  where id = p_request_id;

  get diagnostics rows_affected = row_count;

  if rows_affected = 0 then
    raise exception 'Ownership request not found: %', p_request_id
      using errcode = 'P0404';
  end if;

  perform public.merge_vendors(v_claimer_id, v_claimed_id);

  return true;
end;
$$;

grant execute on function public.ownership_request_approve(uuid) to authenticated;
grant execute on function public.ownership_request_approve(uuid) to service_role;


-- ############################################################
-- USER SELF-SERVICE FUNCTIONS
-- ############################################################
-- Functions that allow authenticated users to access their own data
-- ############################################################


-- ============================================================
-- RPC: get_current_user_vendor
-- ============================================================
-- Purpose: Get the vendor record for the currently logged-in user
-- Used by the frontend to load user profile data on login
-- 
-- Returns: Vendor record if user has one, empty if not
-- Security: Only returns data for the calling user's own vendor
-- ============================================================
create or replace function public.get_current_user_vendor()
returns table (
  vendor_id uuid,
  company_name text,
  company_size text,
  company_motto text,
  company_desc text,
  headquarters text,
  website_link text,
  linkedin_link text,
  instagram_link text,
  subscription public.tier,
  is_verified boolean,
  founded_at date,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    v.vendor_id,
    v.company_name,
    v.company_size,
    v.company_motto,
    v.company_desc,
    v.headquarters,
    v.website_link,
    v.linkedin_link,
    v.instagram_link,
    v.subscription,
    v.is_verified,
    v.founded_at,
    v.created_at,
    v.updated_at
  from public.vendors v
  where v.user_id = auth.uid();
$$;

grant execute on function public.get_current_user_vendor() to authenticated;
grant execute on function public.get_current_user_vendor() to service_role;


-- ============================================================
-- RPC: update_my_vendor_profile
-- Purpose: Update current user's vendor profile fields
-- Returns: Boolean (true if update succeeded)
-- ============================================================
create or replace function public.update_my_vendor_profile(
  p_company_name text default null,
  p_website_link text default null,
  p_company_size text default null
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  rows_affected integer;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized: authentication required'
      using errcode = 'P0401';
  end if;

  if p_website_link is not null and p_website_link != '' then
    if not (p_website_link ~* '^https?://') then
      raise exception 'Invalid website URL format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
  end if;

  update public.vendors
  set
    company_name = case
      when p_company_name is not null then nullif(p_company_name, '')
      else company_name
    end,
    website_link = case
      when p_website_link is not null then nullif(p_website_link, '')
      else website_link
    end,
    company_size = case
      when p_company_size is not null then nullif(p_company_size, '')
      else company_size
    end,
    updated_at = now()
  where user_id = auth.uid();

  get diagnostics rows_affected = row_count;

  return rows_affected > 0;
end;
$$;

grant execute on function public.update_my_vendor_profile(text, text, text) to authenticated;
grant execute on function public.update_my_vendor_profile(text, text, text) to service_role;


-- ============================================================
-- RPC: get_my_products
-- ============================================================
-- Purpose: Get all products for the currently logged-in user's vendor
-- Used by the profile page to show the user's products
-- 
-- Returns: All products (approved, pending, rejected) for the user's vendor
-- Security: Only returns products for the calling user's own vendor
-- ============================================================
drop function if exists public.get_my_products();
create or replace function public.get_my_products()
returns table (
  product_id       uuid,
  vendor_id        uuid,
  product_name     text,
  website_link     text,
  main_category    public.product_category,
  categories       public.product_category[],
  features         text[],
  short_desc       text,
  long_desc        text,
  logo             text,
  video_url        text,
  gallery          text[],
  pricing          text,
  languages        text[],
  demo_link        text,
  release_date     date,
  rating           double precision,
  listing_status   public.listing_status,
  created_at       timestamptz,
  updated_at       timestamptz,
  subscription     public.tier
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.product_id,
    p.vendor_id,
    p.product_name,
    p.website_link,
    p.main_category,
    p.categories,
    p.features,
    p.short_desc,
    p.long_desc,
    p.logo,
    p.video_url,
    p.gallery,
    p.pricing,
    p.languages,
    p.demo_link,
    p.release_date,
    p.rating,
    p.listing_status,
    p.created_at,
    p.updated_at,
    v.subscription
  from public.products p
  join public.vendors v on v.vendor_id = p.vendor_id
  where v.user_id = auth.uid()
  order by p.created_at desc;
$$;

grant execute on function public.get_my_products() to authenticated;
grant execute on function public.get_my_products() to service_role;


-- ============================================================
-- RPC: submit_product_request
-- Purpose: Submit a product listing request for the current user's vendor
-- Callable by: authenticated
-- Returns: UUID of the created product
-- ============================================================
create or replace function public.submit_product_request(
  p_product_name text,
  p_short_desc text,
  p_logo text,
  p_main_category public.product_category,
  p_website_link text default null,
  p_long_desc text default null,
  p_categories public.product_category[] default null,
  p_features text[] default null,
  p_video_url text default null,
  p_gallery text[] default null,
  p_pricing text default null,
  p_languages text[] default null,
  p_demo_link text default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_vendor_id uuid;
  v_tier public.tier;
  new_product_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized: authentication required'
      using errcode = 'P0401';
  end if;

  if p_product_name is null or length(trim(p_product_name)) = 0 then
    raise exception 'Product name is required'
      using errcode = 'P0400';
  end if;

  if p_short_desc is null or length(trim(p_short_desc)) = 0 then
    raise exception 'Short description is required'
      using errcode = 'P0400';
  end if;

  if p_logo is null or length(trim(p_logo)) = 0 then
    raise exception 'Logo is required'
      using errcode = 'P0400';
  end if;

  if p_main_category is null then
    raise exception 'Main category is required'
      using errcode = 'P0400';
  end if;

  select v.vendor_id, v.subscription
    into v_vendor_id, v_tier
  from public.vendors v
  where v.user_id = auth.uid()
  order by v.created_at desc
  limit 1;

  if v_vendor_id is null then
    insert into public.vendors (user_id)
    select auth.uid()
    where not exists (
      select 1 from public.vendors where user_id = auth.uid()
    );

    select v.vendor_id, v.subscription
      into v_vendor_id, v_tier
    from public.vendors v
    where v.user_id = auth.uid()
    order by v.created_at desc
    limit 1;

    if v_vendor_id is null then
      raise exception 'Vendor not found for current user'
        using errcode = 'P0404';
    end if;
  end if;

  if v_tier <> 'premium' then
    p_demo_link := null;
  end if;

  if v_tier = 'freemium' then
    p_categories := null;
  end if;

  if p_website_link is not null and p_website_link != '' then
    if not (p_website_link ~* '^https?://') then
      raise exception 'Invalid website URL format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
  end if;

  if p_video_url is not null and p_video_url != '' then
    if not (p_video_url ~* '^https?://') then
      raise exception 'Invalid video URL format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
  end if;

  if p_demo_link is not null and p_demo_link != '' then
    if not (p_demo_link ~* '^https?://') then
      raise exception 'Invalid demo link format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
  end if;

  insert into public.products (
    vendor_id,
    product_name,
    website_link,
    main_category,
    categories,
    features,
    short_desc,
    long_desc,
    logo,
    video_url,
    gallery,
    pricing,
    languages,
    demo_link,
    listing_status
  ) values (
    v_vendor_id,
    p_product_name,
    nullif(p_website_link, ''),
    p_main_category,
    p_categories,
    p_features,
    p_short_desc,
    nullif(p_long_desc, ''),
    p_logo,
    nullif(p_video_url, ''),
    p_gallery,
    nullif(p_pricing, ''),
    p_languages,
    nullif(p_demo_link, ''),
    'pending'
  )
  returning product_id into new_product_id;

  return new_product_id;
end;
$$;

grant execute on function public.submit_product_request(
  text,
  text,
  text,
  public.product_category,
  text,
  text,
  public.product_category[],
  text[],
  text,
  text[],
  text,
  text[],
  text
) to authenticated;
grant execute on function public.submit_product_request(
  text,
  text,
  text,
  public.product_category,
  text,
  text,
  public.product_category[],
  text[],
  text,
  text[],
  text,
  text[],
  text
) to service_role;


-- ============================================================
-- RPC: update_my_product
-- Purpose: Update a product owned by the current user's vendor
-- Callable by: authenticated (only for own products)
-- Returns: Boolean (true if update succeeded)
-- ============================================================
create or replace function public.update_my_product(
  p_product_id uuid,
  p_product_name text default null,
  p_short_desc text default null,
  p_logo text default null,
  p_main_category public.product_category default null,
  p_website_link text default null,
  p_long_desc text default null,
  p_categories public.product_category[] default null,
  p_features text[] default null,
  p_video_url text default null,
  p_gallery text[] default null,
  p_pricing text default null,
  p_languages text[] default null,
  p_demo_link text default null
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_vendor_id uuid;
  v_tier public.tier;
  rows_affected integer;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized: authentication required'
      using errcode = 'P0401';
  end if;

  -- Get the vendor_id for the current user
  select v.vendor_id, v.subscription
    into v_vendor_id, v_tier
  from public.vendors v
  where v.user_id = auth.uid()
  limit 1;

  if v_vendor_id is null then
    raise exception 'Vendor not found for current user'
      using errcode = 'P0404';
  end if;

  -- Verify the product belongs to the user's vendor
  if not exists (
    select 1 from public.products p
    where p.product_id = p_product_id
      and p.vendor_id = v_vendor_id
  ) then
    raise exception 'Product not found or access denied'
      using errcode = 'P0404';
  end if;

  -- Validate URLs if provided
  if p_website_link is not null and p_website_link != '' then
    if not (p_website_link ~* '^https?://') then
      raise exception 'Invalid website URL format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
  end if;

  if p_video_url is not null and p_video_url != '' then
    if not (p_video_url ~* '^https?://') then
      raise exception 'Invalid video URL format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
  end if;

  if p_demo_link is not null and p_demo_link != '' then
    if not (p_demo_link ~* '^https?://') then
      raise exception 'Invalid demo link format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
    -- Only premium tier can have demo_link
    if v_tier <> 'premium' then
      p_demo_link := null;
    end if;
  end if;

  -- Enforce tier restrictions
  if v_tier = 'freemium' and p_categories is not null then
    -- Freemium can only have one category (main_category)
    p_categories := null;
  end if;

  -- Update the product (only non-null values)
  update public.products
  set
    product_name = coalesce(nullif(p_product_name, ''), product_name),
    short_desc = coalesce(nullif(p_short_desc, ''), short_desc),
    logo = coalesce(nullif(p_logo, ''), logo),
    main_category = coalesce(p_main_category, main_category),
    website_link = case
      when p_website_link is not null then nullif(p_website_link, '')
      else website_link
    end,
    long_desc = case
      when p_long_desc is not null then nullif(p_long_desc, '')
      else long_desc
    end,
    categories = case
      when p_categories is not null then p_categories
      else categories
    end,
    features = case
      when p_features is not null then p_features
      else features
    end,
    video_url = case
      when p_video_url is not null then nullif(p_video_url, '')
      else video_url
    end,
    gallery = case
      when p_gallery is not null then p_gallery
      else gallery
    end,
    pricing = case
      when p_pricing is not null then nullif(p_pricing, '')
      else pricing
    end,
    languages = case
      when p_languages is not null then p_languages
      else languages
    end,
    demo_link = case
      when p_demo_link is not null then nullif(p_demo_link, '')
      else demo_link
    end,
    updated_at = now()
  where product_id = p_product_id
    and vendor_id = v_vendor_id;

  get diagnostics rows_affected = row_count;

  return rows_affected > 0;
end;
$$;

grant execute on function public.update_my_product(uuid, text, text, text, public.product_category, text, text, public.product_category[], text[], text, text[], text, text[], text) to authenticated;
grant execute on function public.update_my_product(uuid, text, text, text, public.product_category, text, text, public.product_category[], text[], text, text[], text, text[], text) to service_role;


-- ============================================================
-- RPC: get_similar_products
-- - Returns products that share at least one category with the given product
-- - Sorted by number of matching categories, then by tier, then by rating
-- - Excludes the given product from results
-- ============================================================
drop function if exists public.get_similar_products(uuid, integer);
create or replace function public.get_similar_products(
  p_product_id uuid,
  p_limit integer default 4
)
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
  subscription     public.tier
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_categories public.product_category[];
begin
  -- Get all categories from the source product
  select 
    array_cat(
      array[p.main_category],
      coalesce(p.categories, array[]::public.product_category[])
    )
  into v_categories
  from public.products p
  where p.product_id = p_product_id
    and p.listing_status = 'approved';

  -- If product not found, return empty
  if v_categories is null then
    return;
  end if;

  -- Find similar products
  return query
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
    v.subscription
  from public.products p
  join public.vendors v on v.vendor_id = p.vendor_id
  where p.listing_status = 'approved'
    and p.product_id != p_product_id
    and (
      p.main_category = any(v_categories)
      or p.categories && v_categories
    )
  order by
    -- Sort by number of matching categories (more matches = higher priority)
    (
      case when p.main_category = any(v_categories) then 1 else 0 end
      + coalesce(array_length(
          array(select unnest(p.categories) intersect select unnest(v_categories)),
          1
        ), 0)
    ) desc,
    -- Then by tier
    case v.subscription
      when 'premium' then 1
      when 'plus' then 2
      else 3
    end,
    -- Then by rating
    p.rating desc nulls last
  limit greatest(p_limit, 0);
end;
$$;

grant execute on function public.get_similar_products(uuid, integer) to anon;
grant execute on function public.get_similar_products(uuid, integer) to authenticated;
grant execute on function public.get_similar_products(uuid, integer) to service_role;


-- ============================================================
-- RPC: get_vendor_details
-- - Returns vendor details by vendor_id
-- - Callable by anyone
-- ============================================================
drop function if exists public.get_vendor_details(uuid);
create or replace function public.get_vendor_details(p_vendor_id uuid)
returns table (
  vendor_id        uuid,
  user_id          uuid,
  is_verified      boolean,
  linkedin_link    text,
  instagram_link   text,
  website_link     text,
  logo             text,
  company_name     text,
  company_size     text,
  company_motto    text,
  company_desc     text,
  headquarters     text,
  founded_at       date,
  subscription     public.tier,
  created_at       timestamptz,
  updated_at       timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    v.vendor_id,
    v.user_id,
    v.is_verified,
    v.linkedin_link,
    v.instagram_link,
    v.website_link,
    v.logo,
    v.company_name,
    v.company_size,
    v.company_motto,
    v.company_desc,
    v.headquarters,
    v.founded_at,
    v.subscription,
    v.created_at,
    v.updated_at
  from public.vendors v
  where v.vendor_id = p_vendor_id;
$$;

grant execute on function public.get_vendor_details(uuid) to anon;
grant execute on function public.get_vendor_details(uuid) to authenticated;
grant execute on function public.get_vendor_details(uuid) to service_role;


-- ============================================================
-- RPC: get_vendor_products
-- - Returns all approved products for a given vendor
-- - Callable by anyone
-- ============================================================
drop function if exists public.get_vendor_products(uuid);
create or replace function public.get_vendor_products(p_vendor_id uuid)
returns table (
  product_id       uuid,
  product_name     text,
  main_category    public.product_category,
  categories       public.product_category[],
  short_desc       text,
  logo             text,
  pricing          text,
  rating           double precision,
  subscription     public.tier
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
    v.subscription
  from public.products p
  join public.vendors v on v.vendor_id = p.vendor_id
  where p.vendor_id = p_vendor_id
    and p.listing_status = 'approved'
  order by p.rating desc nulls last, p.created_at desc;
$$;

grant execute on function public.get_vendor_products(uuid) to anon;
grant execute on function public.get_vendor_products(uuid) to authenticated;
grant execute on function public.get_vendor_products(uuid) to service_role;


-- ============================================================
-- RPC: admin_create_product
-- ============================================================
-- Purpose: Create a new product (admin only)
-- Creates a product and links it to a vendor
--
-- Parameters:
--   p_vendor_id    : UUID of the vendor (required)
--   p_product_name : Product name (required)
--   p_short_desc   : Short description (required)
--   p_logo         : Logo URL/base64 (required)
--   p_main_category: Main category (required)
--   p_website_link : Website URL (optional)
--   p_long_desc    : Long description (optional)
--   p_categories   : Additional categories array (optional)
--   p_features     : Features array (optional)
--   p_video_url    : Video URL (optional)
--   p_gallery      : Gallery array (optional)
--   p_pricing      : Pricing info (optional)
--   p_languages    : Languages array (optional)
--   p_demo_link    : Demo/Calendly link (optional)
--   p_listing_status: Listing status (default: pending)
--
-- Returns: UUID of the created product
-- Errors:
--   P0403 if caller is not admin
--   P0404 if vendor not found
-- ============================================================
create or replace function public.admin_create_product(
  p_vendor_id uuid,
  p_product_name text,
  p_short_desc text,
  p_logo text,
  p_main_category public.product_category,
  p_website_link text default null,
  p_long_desc text default null,
  p_categories public.product_category[] default null,
  p_features text[] default null,
  p_video_url text default null,
  p_gallery text[] default null,
  p_pricing text default null,
  p_languages text[] default null,
  p_demo_link text default null,
  p_listing_status public.listing_status default 'pending'
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  new_product_id uuid;
begin
  -- Admin check
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  -- Validate vendor exists
  if not exists (select 1 from public.vendors where vendor_id = p_vendor_id) then
    raise exception 'Vendor not found: %', p_vendor_id
      using errcode = 'P0404';
  end if;

  -- Validate website URL format if provided
  if p_website_link is not null and p_website_link != '' then
    if not (p_website_link ~* '^https?://') then
      raise exception 'Invalid website URL format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
  end if;

  -- Validate video URL format if provided
  if p_video_url is not null and p_video_url != '' then
    if not (p_video_url ~* '^https?://') then
      raise exception 'Invalid video URL format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
  end if;

  -- Validate demo link format if provided
  if p_demo_link is not null and p_demo_link != '' then
    if not (p_demo_link ~* '^https?://') then
      raise exception 'Invalid demo link format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
  end if;

  -- Insert the product
  insert into public.products (
    vendor_id,
    product_name,
    website_link,
    main_category,
    categories,
    features,
    short_desc,
    long_desc,
    logo,
    video_url,
    gallery,
    pricing,
    languages,
    demo_link,
    listing_status
  ) values (
    p_vendor_id,
    p_product_name,
    nullif(p_website_link, ''),
    p_main_category,
    p_categories,
    p_features,
    p_short_desc,
    nullif(p_long_desc, ''),
    p_logo,
    nullif(p_video_url, ''),
    p_gallery,
    nullif(p_pricing, ''),
    p_languages,
    nullif(p_demo_link, ''),
    p_listing_status
  )
  returning product_id into new_product_id;

  return new_product_id;
end;
$$;

grant execute on function public.admin_create_product(uuid, text, text, text, public.product_category, text, text, public.product_category[], text[], text, text[], text, text[], text, public.listing_status) to authenticated;
grant execute on function public.admin_create_product(uuid, text, text, text, public.product_category, text, text, public.product_category[], text[], text, text[], text, text[], text, public.listing_status) to service_role;


-- ============================================================
-- RPC: admin_lookup_vendor
-- ============================================================
-- Purpose: Look up a vendor by ID for admin product creation
-- Returns vendor info if found
--
-- Parameters:
--   p_vendor_id : UUID of the vendor to look up
--
-- Returns: Vendor info or empty if not found
-- ============================================================
create or replace function public.admin_lookup_vendor(p_vendor_id uuid)
returns table (
  vendor_id uuid,
  company_name text,
  subscription public.tier,
  is_verified boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Admin check
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  return query
  select
    v.vendor_id,
    v.company_name,
    v.subscription,
    v.is_verified
  from public.vendors v
  where v.vendor_id = p_vendor_id;
end;
$$;

grant execute on function public.admin_lookup_vendor(uuid) to authenticated;
grant execute on function public.admin_lookup_vendor(uuid) to service_role;


-- ============================================================
-- RPC: admin_bulk_create_products
-- ============================================================
-- Purpose: Bulk create products (admin only)
-- Creates multiple products at once, all linked to the same vendor
--
-- Parameters:
--   p_vendor_id : UUID of the vendor (required)
--   p_products  : JSONB array of products to create
--     Each product should have: product_name, short_desc, main_category, website_link, logo
--
-- Returns: JSONB with success count and errors
-- ============================================================
create or replace function public.admin_bulk_create_products(
  p_vendor_id uuid,
  p_products jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_product jsonb;
  v_success_count integer := 0;
  v_error_count integer := 0;
  v_errors jsonb := '[]'::jsonb;
  v_new_product_id uuid;
  v_product_name text;
  v_main_category text;
begin
  -- Admin check
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  -- Validate vendor exists
  if not exists (select 1 from public.vendors where vendor_id = p_vendor_id) then
    raise exception 'Vendor not found: %', p_vendor_id
      using errcode = 'P0404';
  end if;

  -- Loop through products
  for v_product in select * from jsonb_array_elements(p_products)
  loop
    begin
      v_product_name := v_product->>'product_name';
      v_main_category := v_product->>'main_category';
      
      -- Validate required fields
      if v_product_name is null or v_product_name = '' then
        v_error_count := v_error_count + 1;
        v_errors := v_errors || jsonb_build_object(
          'product_name', coalesce(v_product_name, 'unknown'),
          'error', 'Product name is required'
        );
        continue;
      end if;
      
      -- Insert the product
      insert into public.products (
        vendor_id,
        product_name,
        website_link,
        main_category,
        short_desc,
        logo,
        listing_status
      ) values (
        p_vendor_id,
        v_product_name,
        nullif(v_product->>'website_link', ''),
        v_main_category::public.product_category,
        coalesce(nullif(v_product->>'short_desc', ''), v_product_name),
        coalesce(nullif(v_product->>'logo', ''), 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23e5e7eb" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="40">' || left(v_product_name, 1) || '</text></svg>'),
        'pending'
      )
      returning product_id into v_new_product_id;
      
      v_success_count := v_success_count + 1;
      
    exception when others then
      v_error_count := v_error_count + 1;
      v_errors := v_errors || jsonb_build_object(
        'product_name', coalesce(v_product_name, 'unknown'),
        'error', SQLERRM
      );
    end;
  end loop;

  return jsonb_build_object(
    'success_count', v_success_count,
    'error_count', v_error_count,
    'errors', v_errors
  );
end;
$$;

grant execute on function public.admin_bulk_create_products(uuid, jsonb) to authenticated;
grant execute on function public.admin_bulk_create_products(uuid, jsonb) to service_role;


-- ============================================================
-- RPC: update_my_vendor
-- ============================================================
create or replace function public.update_my_vendor(
  p_company_name    text default null,
  p_logo            text default null,
  p_website_link    text default null,
  p_headquarters    text default null,
  p_company_motto   text default null,
  p_instagram_link  text default null,
  p_linkedin_link   text default null,
  p_founded_at      date default null,
  p_company_size    text default null
)
returns public.vendors
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.vendors;
begin
  -- Basic auth guard
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Update only the caller's vendor row, and only fields provided
  update public.vendors v
  set
    company_name   = coalesce(p_company_name, v.company_name),
    logo           = coalesce(p_logo, v.logo),
    website_link   = coalesce(p_website_link, v.website_link),
    headquarters   = coalesce(p_headquarters, v.headquarters),
    company_motto  = coalesce(p_company_motto, v.company_motto),
    instagram_link = coalesce(p_instagram_link, v.instagram_link),
    linkedin_link  = coalesce(p_linkedin_link, v.linkedin_link),
    founded_at     = coalesce(p_founded_at, v.founded_at),
    company_size   = coalesce(p_company_size, v.company_size),
    updated_at     = now()
  where v.user_id = auth.uid()
  returning v.* into v_row;

  if not found then
    raise exception 'Vendor not found for this user';
  end if;

  return v_row;
end;
$$;

grant execute on function public.update_my_vendor(
  text, text, text, text, text, text, text, date, text
) to authenticated;
grant execute on function public.update_my_vendor(
  text, text, text, text, text, text, text, date, text
) to service_role;


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
      when 'premium' then 1
      when 'plus' then 2
      else 3
    end,
    p.rating desc nulls last,
    p.created_at desc;
$$;

grant execute on function public.get_all_products_with_details() to anon, authenticated, service_role;


-- ============================================================
-- RPC: get_all_categories
-- Purpose: Fetch all product categories from the enum type
-- Returns: Array of all category values sorted alphabetically
-- ============================================================
create or replace function public.get_all_categories()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select array_agg(enumlabel::text order by enumlabel)
  from pg_enum
  where enumtypid = 'public.product_category'::regtype;
$$;

grant execute on function public.get_all_categories() to anon, authenticated, service_role;


-- ============================================================
-- RPC: get_all_countries
-- Purpose: Fetch all distinct countries from vendor headquarters
-- Returns: Array of all unique country values sorted alphabetically
-- Note: Extracts country from headquarters field (assumes format: "City, Country")
-- ============================================================
create or replace function public.get_all_countries()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select array_agg(distinct country order by country)
  from (
    select trim(substring(v.headquarters from '([^,]+)$')) as country
    from public.vendors v
    where v.headquarters is not null
      and v.headquarters != ''
      and exists (
        select 1 from public.products p
        where p.vendor_id = v.vendor_id
          and p.listing_status = 'approved'
      )
  ) as countries
  where country is not null and country != '';
$$;

grant execute on function public.get_all_countries() to anon, authenticated, service_role;


-- ============================================================
-- RPC: get_all_languages
-- Purpose: Fetch all distinct languages from products
-- Returns: Array of all unique language values sorted alphabetically
-- ============================================================
create or replace function public.get_all_languages()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select array_agg(distinct lang order by lang)
  from (
    select unnest(p.languages) as lang
    from public.products p
    where p.listing_status = 'approved'
      and p.languages is not null
      and array_length(p.languages, 1) > 0
  ) as languages
  where lang is not null and lang != '';
$$;

grant execute on function public.get_all_languages() to anon, authenticated, service_role;


-- ############################################################
-- ADMIN PRODUCT MANAGEMENT FUNCTIONS
-- ############################################################
-- Functions for admin product management (edit, list, update)
-- All functions require admin privileges (checked via is_admin())
-- ############################################################


-- ============================================================
-- RPC: admin_get_products
-- ============================================================
-- Purpose: List all products (paginated) for admin management
-- Returns ALL products regardless of listing_status
-- 
-- Parameters:
--   page_num     : Page number (1-based)
--   page_size    : Number of results per page (default 20)
--   search_query : Optional search term for product name, vendor, or category
--   status_filter: Optional filter by listing_status
--   tier_filter  : Optional filter by vendor subscription tier
--
-- Returns: Table of products with vendor info
-- Errors: P0403 if caller is not admin
-- ============================================================
create or replace function public.admin_get_products(
  page_num integer default 1,
  page_size integer default 50,
  search_query text default null,
  status_filter public.listing_status default null,
  tier_filter public.tier default null
)
returns table (
  product_id uuid,
  vendor_id uuid,
  product_name text,
  website_link text,
  main_category public.product_category,
  categories public.product_category[],
  features text[],
  short_desc text,
  long_desc text,
  logo text,
  video_url text,
  gallery text[],
  pricing text,
  languages text[],
  demo_link text,
  release_date date,
  rating double precision,
  listing_status public.listing_status,
  product_created_at timestamptz,
  product_updated_at timestamptz,
  -- Vendor info
  company_name text,
  subscription public.tier,
  is_verified boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Admin check: only admins can list all products
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  return query
  select
    p.product_id,
    p.vendor_id,
    p.product_name,
    p.website_link,
    p.main_category,
    p.categories,
    p.features,
    p.short_desc,
    p.long_desc,
    p.logo,
    p.video_url,
    p.gallery,
    p.pricing,
    p.languages,
    p.demo_link,
    p.release_date,
    p.rating,
    p.listing_status,
    p.created_at as product_created_at,
    p.updated_at as product_updated_at,
    v.company_name,
    v.subscription,
    v.is_verified
  from public.products p
  join public.vendors v on v.vendor_id = p.vendor_id
  where (
    search_query is null
    or p.product_name ilike '%' || search_query || '%'
    or v.company_name ilike '%' || search_query || '%'
    or p.main_category::text ilike '%' || search_query || '%'
  )
  and (status_filter is null or p.listing_status = status_filter)
  and (tier_filter is null or v.subscription = tier_filter)
  order by p.created_at desc
  limit greatest(page_size, 1)
  offset greatest((page_num - 1) * page_size, 0);
end;
$$;

grant execute on function public.admin_get_products(integer, integer, text, public.listing_status, public.tier) to authenticated;
grant execute on function public.admin_get_products(integer, integer, text, public.listing_status, public.tier) to service_role;


-- ============================================================
-- RPC: admin_get_products_count
-- ============================================================
-- Purpose: Get total count of products for pagination
-- Uses same filter logic as admin_get_products
--
-- Parameters:
--   search_query : Optional search term
--   status_filter: Optional filter by listing_status
--   tier_filter  : Optional filter by vendor subscription tier
--
-- Returns: Integer count
-- Errors: P0403 if caller is not admin
-- ============================================================
create or replace function public.admin_get_products_count(
  search_query text default null,
  status_filter public.listing_status default null,
  tier_filter public.tier default null
)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  total integer;
begin
  -- Admin check
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  select count(*)::integer into total
  from public.products p
  join public.vendors v on v.vendor_id = p.vendor_id
  where (
    search_query is null
    or p.product_name ilike '%' || search_query || '%'
    or v.company_name ilike '%' || search_query || '%'
    or p.main_category::text ilike '%' || search_query || '%'
  )
  and (status_filter is null or p.listing_status = status_filter)
  and (tier_filter is null or v.subscription = tier_filter);

  return total;
end;
$$;

grant execute on function public.admin_get_products_count(text, public.listing_status, public.tier) to authenticated;
grant execute on function public.admin_get_products_count(text, public.listing_status, public.tier) to service_role;


-- ============================================================
-- RPC: admin_update_product
-- ============================================================
-- Purpose: Update product fields for admin management
-- Allows admin to modify product details
--
-- Parameters:
--   p_product_id   : UUID of the product to update
 --   p_vendor_id    : New vendor ID (null = no change)
--   p_product_name : New product name (null = no change)
--   p_website_link : New website URL (null = no change)
--   p_short_desc   : New short description (null = no change)
--   p_long_desc    : New long description (null = no change)
--   p_main_category: New main category (null = no change)
--   p_categories   : New categories array (null = no change)
--   p_features     : New features array (null = no change)
--   p_logo         : New logo (null = no change)
--   p_video_url    : New video URL (null = no change)
--   p_gallery      : New gallery array (null = no change)
--   p_pricing      : New pricing (null = no change)
--   p_languages    : New languages array (null = no change)
--   p_demo_link    : New demo link (null = no change)
--   p_listing_status: New listing status (null = no change)
--
-- Returns: Boolean (true if update succeeded)
-- Errors:
--   P0403 if caller is not admin
--   P0404 if product or vendor not found
-- ============================================================
create or replace function public.admin_update_product(
  p_product_id uuid,
  p_vendor_id uuid default null,
  p_product_name text default null,
  p_website_link text default null,
  p_short_desc text default null,
  p_long_desc text default null,
  p_main_category public.product_category default null,
  p_categories public.product_category[] default null,
  p_features text[] default null,
  p_logo text default null,
  p_video_url text default null,
  p_gallery text[] default null,
  p_pricing text default null,
  p_languages text[] default null,
  p_demo_link text default null,
  p_release_date date default null,
  p_listing_status public.listing_status default null
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  rows_affected integer;
begin
  -- Admin check
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  -- Validate product exists
  if not exists (select 1 from public.products where product_id = p_product_id) then
    raise exception 'Product not found: %', p_product_id
      using errcode = 'P0404';
  end if;

  -- Validate vendor exists if provided
  if p_vendor_id is not null then
    if not exists (select 1 from public.vendors where vendor_id = p_vendor_id) then
      raise exception 'Vendor not found: %', p_vendor_id
        using errcode = 'P0404';
    end if;
  end if;

  -- Validate website URL format if provided
  if p_website_link is not null and p_website_link != '' then
    if not (p_website_link ~* '^https?://') then
      raise exception 'Invalid website URL format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
  end if;

  -- Validate video URL format if provided
  if p_video_url is not null and p_video_url != '' then
    if not (p_video_url ~* '^https?://') then
      raise exception 'Invalid video URL format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
  end if;

  -- Validate demo link format if provided
  if p_demo_link is not null and p_demo_link != '' then
    if not (p_demo_link ~* '^https?://') then
      raise exception 'Invalid demo link format. Must start with http:// or https://'
        using errcode = 'P0400';
    end if;
  end if;

  -- Update fields (only non-null values)
  update public.products
  set 
    vendor_id = coalesce(p_vendor_id, vendor_id),
    product_name = coalesce(nullif(p_product_name, ''), product_name),
    website_link = case 
      when p_website_link is not null then nullif(p_website_link, '')
      else website_link 
    end,
    short_desc = coalesce(nullif(p_short_desc, ''), short_desc),
    long_desc = case 
      when p_long_desc is not null then nullif(p_long_desc, '')
      else long_desc 
    end,
    main_category = coalesce(p_main_category, main_category),
    categories = coalesce(p_categories, categories),
    features = coalesce(p_features, features),
    logo = coalesce(nullif(p_logo, ''), logo),
    video_url = case 
      when p_video_url is not null then nullif(p_video_url, '')
      else video_url 
    end,
    gallery = coalesce(p_gallery, gallery),
    pricing = case 
      when p_pricing is not null then nullif(p_pricing, '')
      else pricing 
    end,
    languages = coalesce(p_languages, languages),
    demo_link = case 
      when p_demo_link is not null then nullif(p_demo_link, '')
      else demo_link 
    end,
    release_date = coalesce(p_release_date, release_date),
    listing_status = coalesce(p_listing_status, listing_status),
    updated_at = now()
  where product_id = p_product_id;

  get diagnostics rows_affected = row_count;
  
  return rows_affected > 0;
end;
$$;

grant execute on function public.admin_update_product(uuid, uuid, text, text, text, text, public.product_category, public.product_category[], text[], text, text, text[], text, text[], text, date, public.listing_status) to authenticated;
grant execute on function public.admin_update_product(uuid, uuid, text, text, text, text, public.product_category, public.product_category[], text[], text, text, text[], text, text[], text, date, public.listing_status) to service_role;