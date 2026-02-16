CREATE TABLE IF NOT EXISTS public.product_reviews (
  review_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       uuid NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  parent_review_id uuid REFERENCES public.product_reviews(review_id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Content (approved / live version)
  rating           integer CHECK (rating BETWEEN 1 AND 5),  -- NULL for replies
  title            text    CHECK (char_length(title)  <= 100),
  body             text CHECK (body IS NULL OR char_length(body) BETWEEN 5 AND 2000),
  -- Cached display info (captured at submission time)
  reviewer_name    text NOT NULL,
  reviewer_role    text,
  reviewer_company text,
  -- Approval workflow
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected')),
  admin_note       text,
  -- Edit-pending flow (show old content publicly while edit awaits admin approval)
  has_pending_edit  boolean NOT NULL DEFAULT false,
  pending_rating    integer CHECK (pending_rating BETWEEN 1 AND 5),
  pending_title     text    CHECK (char_length(pending_title) <= 100),
  pending_body      text    CHECK (char_length(pending_body) BETWEEN 5 AND 2000),
  -- Timestamps
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  -- Constraint: top-level reviews must have a rating; replies must NOT
  CONSTRAINT chk_rating_presence CHECK (
    (parent_review_id IS NULL AND rating IS NOT NULL) OR
    (parent_review_id IS NOT NULL AND rating IS NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id       ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_parent_review_id ON public.product_reviews(parent_review_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id          ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status           ON public.product_reviews(status);

-- Migration: allow rating-only reviews (body optional)
ALTER TABLE public.product_reviews ALTER COLUMN body DROP NOT NULL;
ALTER TABLE public.product_reviews DROP CONSTRAINT IF EXISTS product_reviews_body_check;
ALTER TABLE public.product_reviews
  ADD CONSTRAINT product_reviews_body_check
  CHECK (body IS NULL OR char_length(body) BETWEEN 5 AND 2000);
