CREATE TABLE IF NOT EXISTS public.review_votes (
  vote_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id  uuid NOT NULL REFERENCES public.product_reviews(review_id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_vote_user_review UNIQUE (review_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_votes_review_id ON public.review_votes(review_id);
