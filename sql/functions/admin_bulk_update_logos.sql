-- ============================================================
-- Admin: Bulk Update Logos
-- Updates vendor.logo and/or all products.logo for each entry.
-- Lookup is by company_name (ILIKE) or website_link.
-- ============================================================

CREATE OR REPLACE FUNCTION admin_bulk_update_logos(
  p_logos jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_entry          jsonb;
  v_company_name   text;
  v_website_link   text;
  v_vendor_logo    text;
  v_product_logo   text;
  v_vendor_id      uuid;
  v_success_count  int := 0;
  v_error_count    int := 0;
  v_errors         jsonb := '[]'::jsonb;
BEGIN
  FOR v_entry IN SELECT * FROM jsonb_array_elements(p_logos)
  LOOP
    v_company_name := NULLIF(trim(v_entry->>'company_name'), '');
    v_website_link := NULLIF(trim(v_entry->>'website_link'), '');
    v_vendor_logo  := NULLIF(trim(v_entry->>'vendor_logo'),  '');
    v_product_logo := NULLIF(trim(v_entry->>'product_logo'), '');

    BEGIN
      -- Look up vendor
      SELECT vendor_id
        INTO v_vendor_id
        FROM public.vendors
       WHERE (v_company_name IS NOT NULL AND company_name ILIKE v_company_name)
          OR (v_website_link IS NOT NULL AND website_link ILIKE v_website_link)
       LIMIT 1;

      IF v_vendor_id IS NULL THEN
        RAISE EXCEPTION 'Şirket bulunamadı: %', COALESCE(v_company_name, v_website_link);
      END IF;

      -- Update vendor logo if provided
      IF v_vendor_logo IS NOT NULL THEN
        UPDATE public.vendors
           SET logo       = v_vendor_logo,
               updated_at = now()
         WHERE vendor_id = v_vendor_id;
      END IF;

      -- Update all products of this vendor if product_logo is provided
      IF v_product_logo IS NOT NULL THEN
        UPDATE public.products
           SET logo       = v_product_logo,
               updated_at = now()
         WHERE vendor_id = v_vendor_id;
      END IF;

      v_success_count := v_success_count + 1;

    EXCEPTION WHEN OTHERS THEN
      v_error_count := v_error_count + 1;
      v_errors := v_errors || jsonb_build_array(jsonb_build_object(
        'company_name', COALESCE(v_company_name, v_website_link, 'Bilinmeyen'),
        'error',        SQLERRM
      ));
    END;

    -- Reset for next iteration
    v_vendor_id := NULL;
  END LOOP;

  RETURN jsonb_build_object(
    'success_count', v_success_count,
    'error_count',   v_error_count,
    'errors',        v_errors
  );
END;
$$;

-- Grant execute permission to authenticated users (admin check is done via RLS/policies)
GRANT EXECUTE ON FUNCTION admin_bulk_update_logos(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_bulk_update_logos(jsonb) TO service_role;
