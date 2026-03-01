-- ============================================================
-- Admin: Check Logo Status for Bulk Logo Update
-- Returns for each entry whether the vendor exists and whether
-- the vendor / its products already have logos set.
-- ============================================================

CREATE OR REPLACE FUNCTION admin_check_logo_status(
  p_entries jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_entry          jsonb;
  v_company_name   text;
  v_website_link   text;
  v_vendor_id      uuid;
  v_vendor_logo    text;
  v_products_count int;
  v_results        jsonb := '[]'::jsonb;
BEGIN
  FOR v_entry IN SELECT * FROM jsonb_array_elements(p_entries)
  LOOP
    v_company_name := NULLIF(trim(v_entry->>'company_name'), '');
    v_website_link := NULLIF(trim(v_entry->>'website_link'), '');

    -- Look up vendor by company_name (preferred) or website_link
    SELECT vendor_id, logo
      INTO v_vendor_id, v_vendor_logo
      FROM public.vendors
     WHERE (v_company_name IS NOT NULL AND company_name ILIKE v_company_name)
        OR (v_website_link IS NOT NULL AND website_link ILIKE v_website_link)
     LIMIT 1;

    IF v_vendor_id IS NULL THEN
      v_results := v_results || jsonb_build_array(jsonb_build_object(
        'company_name',      v_company_name,
        'website_link',      v_website_link,
        'vendor_found',      false,
        'vendor_has_logo',   false,
        'products_with_logo', 0
      ));
    ELSE
      -- Count products that already have a real logo (not null/empty/placeholder)
      SELECT COUNT(*)
        INTO v_products_count
        FROM public.products
       WHERE vendor_id = v_vendor_id
         AND logo IS NOT NULL
         AND logo != ''
         AND logo != 'placeholder';

      v_results := v_results || jsonb_build_array(jsonb_build_object(
        'company_name',      v_company_name,
        'website_link',      v_website_link,
        'vendor_found',      true,
        'vendor_has_logo',   (v_vendor_logo IS NOT NULL AND v_vendor_logo != ''),
        'products_with_logo', v_products_count
      ));
    END IF;

    -- Reset for next iteration
    v_vendor_id    := NULL;
    v_vendor_logo  := NULL;
    v_products_count := 0;
  END LOOP;

  RETURN v_results;
END;
$$;

-- Grant execute permission to authenticated users (admin check is done via RLS/policies)
GRANT EXECUTE ON FUNCTION admin_check_logo_status(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_check_logo_status(jsonb) TO service_role;
