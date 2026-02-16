-- ============================================================
-- Admin: Bulk Create Products
-- RPC function for bulk importing products from Excel
-- Uses company_name to lookup vendor_id internally
-- ============================================================

CREATE OR REPLACE FUNCTION admin_bulk_create_products(
  p_products jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product jsonb;
  v_success_count int := 0;
  v_error_count int := 0;
  v_errors jsonb := '[]'::jsonb;
  v_product_name text;
  v_company_name text;
  v_vendor_id uuid;
BEGIN
  -- Loop through each product in the input array
  FOR v_product IN SELECT * FROM jsonb_array_elements(p_products)
  LOOP
    v_product_name := v_product->>'product_name';
    v_company_name := v_product->>'company_name';
    
    BEGIN
      -- Lookup vendor_id by company_name
      SELECT vendor_id INTO v_vendor_id
      FROM public.vendors
      WHERE company_name ILIKE v_company_name
      LIMIT 1;
      
      IF v_vendor_id IS NULL THEN
        RAISE EXCEPTION 'Şirket bulunamadı: %', v_company_name;
      END IF;
      
      -- Insert product
      INSERT INTO public.products (
        vendor_id,
        product_name,
        short_desc,
        long_desc,
        main_category,
        website_link,
        features,
        languages,
        listing_status,
        logo
      ) VALUES (
        v_vendor_id,
        v_product_name,
        COALESCE(NULLIF(v_product->>'short_desc', ''), v_product_name),
        NULLIF(v_product->>'long_desc', ''),
        (v_product->>'main_category')::public.product_category,
        NULLIF(v_product->>'website_link', ''),
        COALESCE(
          (SELECT array_agg(elem::text) FROM jsonb_array_elements_text(v_product->'features') AS elem),
          ARRAY[]::text[]
        ),
        COALESCE(
          (SELECT array_agg(elem::text) FROM jsonb_array_elements_text(v_product->'languages') AS elem),
          ARRAY[]::text[]
        ),
        'approved'::public.listing_status,
        'placeholder' -- Placeholder logo
      );
      
      v_success_count := v_success_count + 1;
    EXCEPTION WHEN OTHERS THEN
      v_error_count := v_error_count + 1;
      v_errors := v_errors || jsonb_build_object(
        'product_name', v_product_name,
        'error', SQLERRM
      );
    END;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success_count', v_success_count,
    'error_count', v_error_count,
    'errors', v_errors
  );
END;
$$;

-- Grant execute permission to authenticated users (admin check is done via RLS/policies)
GRANT EXECUTE ON FUNCTION admin_bulk_create_products(jsonb) TO authenticated;

