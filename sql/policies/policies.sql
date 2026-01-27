/* ============================================================
   Supabase / Postgres: RLS + Privileges
   Goals:
   - admin: no client access
   - products, vendors: RPC-only (no direct client access)
   - ownership_requests: insert by all; select/update/delete only by admin
   Prereq: public.is_admin() -> boolean
   ============================================================ */

-- ------------------------------------------------------------
-- 1) Privileges (block direct table access from client roles)
-- ------------------------------------------------------------

-- admin: fully blocked for clients
revoke all on table public.admin from anon, authenticated;

-- ownership_requests: clients can insert only
revoke all on table public.ownership_requests from anon, authenticated;
grant insert on table public.ownership_requests to anon, authenticated;

-- products / vendors: RPC-only (no direct access)
revoke all on table public.products from anon, authenticated;
revoke all on table public.vendors  from anon, authenticated;

-- tier_config: RPC-only (no direct access)
revoke all on table public.tier_config from anon, authenticated;

-- analytics_events: RPC-only (no direct access)
revoke all on table public.analytics_events from anon, authenticated;

-- service_role: full access (typical server-side role)
grant all on table
  public.admin,
  public.ownership_requests,
  public.products,
  public.tier_config,
  public.analytics_events,
  public.vendors
to service_role;


-- ------------------------------------------------------------
-- 2) RLS: enable + force (deny unless a policy allows)
-- ------------------------------------------------------------

alter table public.admin              enable row level security;
alter table public.admin              force  row level security;

alter table public.ownership_requests enable row level security;
alter table public.ownership_requests force  row level security;

alter table public.products           enable row level security;
alter table public.products           force  row level security;

alter table public.vendors            enable row level security;
alter table public.vendors            force  row level security;

alter table public.tier_config        enable row level security;
alter table public.tier_config        force  row level security;

alter table public.analytics_events   enable row level security;
alter table public.analytics_events   force  row level security;


-- ------------------------------------------------------------
-- 3) admin: no policies (remains inaccessible to clients)
-- ------------------------------------------------------------
-- No policies on public.admin on purpose.


-- ------------------------------------------------------------
-- 4) ownership_requests policies
-- ------------------------------------------------------------

-- insert: everyone (anon + authenticated)
drop policy if exists "ownership_insert_all" on public.ownership_requests;
create policy "ownership_insert_all"
on public.ownership_requests
for insert
to anon, authenticated
with check (true);

-- select: admin only
drop policy if exists "ownership_select_admin_only" on public.ownership_requests;
create policy "ownership_select_admin_only"
on public.ownership_requests
for select
to authenticated
using (public.is_admin());

-- update: admin only
drop policy if exists "ownership_update_admin_only" on public.ownership_requests;
create policy "ownership_update_admin_only"
on public.ownership_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- delete: admin only
drop policy if exists "ownership_delete_admin_only" on public.ownership_requests;
create policy "ownership_delete_admin_only"
on public.ownership_requests
for delete
to authenticated
using (public.is_admin());


-- ------------------------------------------------------------
-- 5) products / vendors: no policies (RPC-only)
-- ------------------------------------------------------------
-- No policies on public.products or public.vendors on purpose.
-- Access must go through SECURITY DEFINER RPC with explicit checks.

-- ------------------------------------------------------------
-- 6) tier_config: no policies (RPC-only)
-- ------------------------------------------------------------
-- Access must go through SECURITY DEFINER RPC with explicit checks.
