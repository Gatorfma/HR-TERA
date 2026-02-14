CREATE OR REPLACE FUNCTION public.update_product_rating_from_reviews()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_pid uuid;
BEGIN
  v_pid := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE public.products
  SET rating = (
    SELECT AVG(rating)::double precision
    FROM public.product_reviews
    WHERE product_id = v_pid
      AND parent_review_id IS NULL   -- top-level reviews only
      AND status = 'approved'
  ),
  updated_at = now()
  WHERE product_id = v_pid;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_update_product_rating_from_reviews
AFTER INSERT OR UPDATE OF status, rating OR DELETE
ON public.product_reviews FOR EACH ROW
EXECUTE FUNCTION public.update_product_rating_from_reviews();
