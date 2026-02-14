import { supabase } from './supabaseClient';
import { ProductReviewDB } from '@/lib/types';

export async function getProductReviews(
  productId: string,
  sort: 'helpful' | 'newest' | 'oldest' | 'highest' | 'lowest' = 'helpful',
  offset = 0,
  limit = 20
): Promise<ProductReviewDB[]> {
  const { data, error } = await supabase.rpc('get_product_reviews', {
    p_product_id: productId,
    p_sort: sort,
    p_offset: offset,
    p_limit: limit,
  });

  if (error) throw new Error(error.message);
  return (data as ProductReviewDB[]) ?? [];
}

export async function submitReview(params: {
  productId: string;
  rating: number;
  title?: string;
  body?: string;
  reviewerName: string;
  reviewerRole?: string;
  reviewerCompany?: string;
}): Promise<void> {
  const { error } = await supabase.rpc('submit_review', {
    p_product_id:       params.productId,
    p_rating:           params.rating,
    p_title:            params.title ?? null,
    p_body:             params.body ?? null,
    p_reviewer_name:    params.reviewerName,
    p_reviewer_role:    params.reviewerRole ?? null,
    p_reviewer_company: params.reviewerCompany ?? null,
  });

  if (error) throw new Error(error.message);
}

export async function editMyReview(
  reviewId: string,
  rating: number,
  title: string | undefined,
  body: string | undefined
): Promise<void> {
  const { error } = await supabase.rpc('edit_my_review', {
    p_review_id: reviewId,
    p_rating:    rating,
    p_title:     title ?? null,
    p_body:      body ?? null,
  });

  if (error) throw new Error(error.message);
}

export async function submitReply(
  reviewId: string,
  body: string,
  replierName: string
): Promise<void> {
  const { error } = await supabase.rpc('submit_reply', {
    p_review_id:   reviewId,
    p_body:        body,
    p_replier_name: replierName,
  });

  if (error) throw new Error(error.message);
}

export async function toggleReviewVote(
  reviewId: string,
  isHelpful: boolean
): Promise<void> {
  const { error } = await supabase.rpc('toggle_review_vote', {
    p_review_id:  reviewId,
    p_is_helpful: isHelpful,
  });

  if (error) throw new Error(error.message);
}
