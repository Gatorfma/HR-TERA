-- ============================================================
-- Admin: Bulk Create Vendors
-- RPC function for bulk importing vendors from Excel
-- ============================================================

CREATE OR REPLACE FUNCTION admin_bulk_create_vendors(
  p_vendors jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vendor jsonb;
  v_success_count int := 0;
  v_error_count int := 0;
  v_errors jsonb := '[]'::jsonb;
  v_company_name text;
BEGIN
  -- Loop through each vendor in the input array
  FOR v_vendor IN SELECT * FROM jsonb_array_elements(p_vendors)
  LOOP
    v_company_name := v_vendor->>'company_name';
    
    BEGIN
      INSERT INTO public.vendors (
        company_name,
        website_link,
        headquarters,
        founded_at,
        company_size,
        company_motto,
        company_desc,
        subscription,
        is_verified,
        user_id
      ) VALUES (
        v_company_name,
        NULLIF(v_vendor->>'website_link', ''),
        NULLIF(v_vendor->>'headquarters', ''),
        CASE 
          WHEN v_vendor->>'founded_at' IS NOT NULL AND v_vendor->>'founded_at' != ''
          THEN (v_vendor->>'founded_at' || '-01-01')::date
          ELSE NULL
        END,
        NULLIF(v_vendor->>'company_size', ''),
        NULLIF(v_vendor->>'company_motto', ''),
        NULLIF(v_vendor->>'company_desc', ''),
        'freemium'::public.tier,
        true,
        NULL
      );
      
      v_success_count := v_success_count + 1;
    EXCEPTION WHEN OTHERS THEN
      v_error_count := v_error_count + 1;
      v_errors := v_errors || jsonb_build_object(
        'company_name', v_company_name,
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
GRANT EXECUTE ON FUNCTION admin_bulk_create_vendors(jsonb) TO authenticated;
