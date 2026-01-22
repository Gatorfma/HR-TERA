-- Remove the deprecated function that returned all products at once
DROP FUNCTION IF EXISTS public.get_all_products_with_details();

-- Optional: If you want to clean up the old version of get_product_cards (with fewer arguments) to avoid confusion:
-- DROP FUNCTION IF EXISTS public.get_product_cards(integer, integer, text, text, public.product_category);
