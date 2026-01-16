-- ====================================================================
-- Tier-based constraints enforced via trigger on public.products
--
-- Rules:
-- 1) Categories:
--    - gold/silver: up to 5 items in products.categories
--    - freemium: products.categories MUST be NULL
--
-- 2) Features:
--    - gold/silver: up to 10 items in products.features
--    - freemium: up to 3 items in products.features
--
-- 3) Video URL:
--    - Only gold/silver vendors can a have video_url (freemium must be NULL)
--
-- 4) Demo Link:
--    - Only gold vendors can have a demo_link (silver/freemium must be NULL)
-- ====================================================================
create or replace function public.enforce_product_subscription_constraints()
returns trigger
language plpgsql
security invoker
as $$
declare
  v_tier public.tier;
  cat_count int;
  feat_count int;
begin
  -- Fetch vendor tier
  select subscription
    into v_tier
  from public.vendors
  where vendor_id = new.vendor_id;

  if v_tier is null then
    raise exception 'Vendor % not found or has no subscription tier', new.vendor_id
      using errcode = '23503';
  end if;

  cat_count  := coalesce(array_length(new.categories, 1), 0);
  feat_count := coalesce(array_length(new.features, 1), 0);

  -- ----------------------------
  -- Categories constraints
  -- ----------------------------
  if v_tier = 'freemium' then
    if new.categories is not null then
      raise exception 'freemium products cannot have more than one category.'
        using errcode = '23514';
    end if;
  else
    if cat_count > 5 then
      raise exception 'gold/silver products can have at most 5 categories (got %).', cat_count
        using errcode = '23514';
    end if;
  end if;

  -- ----------------------------
  -- Features constraints
  -- ----------------------------
  if v_tier = 'freemium' then
    if feat_count > 3 then
      raise exception 'freemium products can have at most 3 features (got %).', feat_count
        using errcode = '23514';
    end if;
  else
    if feat_count > 10 then
      raise exception 'gold/silver products can have at most 10 features (got %).', feat_count
        using errcode = '23514';
    end if;
  end if;

  -- ----------------------------
  -- video_url constraints
  -- ----------------------------
  if v_tier = 'freemium' and new.video_url is not null then
    raise exception 'Only gold/silver products can have video_url.'
      using errcode = '23514';
  end if;

  -- ----------------------------
  -- demo_link constraints (meeting_link renamed to demo_link)
  -- ----------------------------
  if v_tier <> 'gold' and new.demo_link is not null then
    raise exception 'Only gold products can have demo_link.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger trg_enforce_product_subscription_constraints
before insert or update on public.products
for each row
execute function public.enforce_product_subscription_constraints();


-- ============================================================
-- Trigger function: merge vendors on ownership approval
-- ============================================================
create or replace function public.merge_vendors_on_ownership_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' then
    perform public.merge_vendors(new.claimer_vendor_id, new.claimed_vendor_id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_assign_vendor_owner_on_approval on public.ownership_requests;
drop trigger if exists trg_merge_vendors_on_ownership_approval on public.ownership_requests;

create trigger trg_merge_vendors_on_ownership_approval
after update on public.ownership_requests
for each row
execute function public.merge_vendors_on_ownership_approval();


-- ============================================================
-- Trigger function: handle new user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.vendors
    where user_id = new.id
  ) then
    insert into public.vendors (user_id)
    values (new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
