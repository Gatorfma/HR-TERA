import { supabase } from './supabaseClient';
import {
  AdminProductView,
  AdminGetProductsInput,
  AdminProductsResponse,
  AdminUpdateProductInput,
  AdminCreateProductInput,
  AdminVendorLookup,
  VendorSearchResult,
  BulkProductInput,
  BulkImportResult,
  ListingStatus,
  ProductCategory,
  AdminReviewItem,
  AdminProductWithReviewCounts,
} from '@/lib/admin-types';
import { Tier } from '@/lib/types';

/**
 * Fetch paginated list of products for admin management
 * Returns ALL products regardless of listing_status
 */
export async function adminGetProducts(
  input: AdminGetProductsInput
): Promise<AdminProductsResponse> {
  const { page, pageSize, searchQuery, statusFilter, tierFilter } = input;

  // Fetch products
  const { data: products, error: productsError } = await supabase.rpc(
    'admin_get_products',
    {
      page_num: page,
      page_size: pageSize,
      search_query: searchQuery || null,
      status_filter: statusFilter || null,
      tier_filter: tierFilter || null,
    }
  );

  if (productsError) {
    throw new Error(productsError.message);
  }

  // Fetch total count for pagination
  const { data: totalCount, error: countError } = await supabase.rpc(
    'admin_get_products_count',
    {
      search_query: searchQuery || null,
      status_filter: statusFilter || null,
      tier_filter: tierFilter || null,
    }
  );

  if (countError) {
    throw new Error(countError.message);
  }

  const count = totalCount ?? 0;
  const totalPages = Math.ceil(count / pageSize);

  return {
    products: (products as AdminProductView[]) ?? [],
    totalCount: count,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Update a product's fields (admin only)
 */
export async function adminUpdateProduct(
  input: AdminUpdateProductInput
): Promise<boolean> {
  const { data, error } = await supabase.rpc('admin_update_product', {
    p_product_id: input.productId,
    p_vendor_id: input.vendorId ?? null,
    p_product_name: input.productName ?? null,
    p_website_link: input.websiteLink ?? null,
    p_short_desc: input.shortDesc ?? null,
    p_long_desc: input.longDesc ?? null,
    p_main_category: input.mainCategory ?? null,
    p_categories: input.categories ?? null,
    p_features: input.features ?? null,
    p_logo: input.logo ?? null,
    p_video_url: input.videoUrl ?? null,
    p_gallery: input.gallery ?? null,
    p_pricing: input.pricing ?? null,
    p_languages: input.languages ?? null,
    p_demo_link: input.demoLink ?? null,
    p_release_date: input.releaseDate ?? null,
    p_listing_status: input.listingStatus ?? null,
    p_rating: input.rating ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? false;
}

/**
 * Get a single product by ID for admin editing
 */
export async function adminGetProductById(
  productId: string
): Promise<AdminProductView | null> {
  const { data, error } = await supabase.rpc('admin_get_products', {
    page_num: 1,
    page_size: 1000, // Get all to find by ID
    search_query: null,
    status_filter: null,
    tier_filter: null,
  });

  if (error) {
    throw new Error(error.message);
  }

  const products = data as AdminProductView[];
  return products.find((p) => p.product_id === productId) ?? null;
}

/**
 * Create a new product (admin only)
 */
export async function adminCreateProduct(
  input: AdminCreateProductInput
): Promise<string> {
  const { data, error } = await supabase.rpc('admin_create_product', {
    p_vendor_id: input.vendorId,
    p_product_name: input.productName,
    p_short_desc: input.shortDesc,
    p_logo: input.logo,
    p_main_category: input.mainCategory,
    p_website_link: input.websiteLink ?? null,
    p_long_desc: input.longDesc ?? null,
    p_categories: input.categories ?? null,
    p_features: input.features ?? null,
    p_video_url: input.videoUrl ?? null,
    p_gallery: input.gallery ?? null,
    p_pricing: input.pricing ?? null,
    p_languages: input.languages ?? null,
    p_demo_link: input.demoLink ?? null,
    p_release_date: input.releaseDate ?? null,
    p_listing_status: input.listingStatus ?? 'pending',
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

/**
 * Look up a vendor by ID for admin product creation
 */
export async function adminLookupVendor(
  vendorId: string
): Promise<AdminVendorLookup | null> {
  const { data, error } = await supabase.rpc('admin_lookup_vendor', {
    p_vendor_id: vendorId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const vendors = data as AdminVendorLookup[];
  return vendors.length > 0 ? vendors[0] : null;
}

/**
 * Get vendors for admin product assignment (with optional search)
 * Uses admin_get_vendors which supports empty search query to list all vendors
 */
export async function adminGetVendors(
  searchQuery: string = '',
  limit: number = 30
): Promise<VendorSearchResult[]> {
  const trimmed = searchQuery?.trim() || '';

  const { data, error } = await supabase.rpc('admin_get_vendors', {
    page_num: 1,
    page_size: limit,
    search_query: trimmed.length > 0 ? trimmed : null,
  });

  if (error) {
    console.error('[adminGetVendors] Error:', error);
    return [];
  }

  // Map the full vendor data to VendorSearchResult format
  return (data || []).map((v: any) => ({
    vendor_id: v.vendor_id,
    company_name: v.company_name,
    subscription: v.subscription,
    is_verified: v.is_verified,
    headquarters: v.headquarters,
  }));
}

/**
 * Search vendors by company name for admin product assignment
 * @deprecated Use adminGetVendors instead which supports empty queries
 */
export async function adminSearchVendors(
  searchQuery: string,
  limit: number = 10
): Promise<VendorSearchResult[]> {
  if (!searchQuery || searchQuery.trim().length < 2) {
    return [];
  }

  const { data, error } = await supabase.rpc('admin_search_vendors', {
    search_query: searchQuery.trim(),
    result_limit: limit,
  });

  if (error) {
    console.error('[adminSearchVendors] Error:', error);
    return [];
  }

  return (data as VendorSearchResult[]) || [];
}

/**
 * Fetch vendors for dropdown - supports both full list (no/minimal query) and search
 * When query is null or < 2 chars: returns paginated vendors from admin_get_vendors
 * When query has 2+ chars: returns search results from admin_search_vendors
 */
export async function adminFetchVendorsForDropdown(
  searchQuery: string | null,
  limit: number = 20
): Promise<VendorSearchResult[]> {
  const trimmed = searchQuery?.trim() ?? "";

  if (trimmed.length >= 2) {
    return adminSearchVendors(trimmed, limit);
  }

  const { data, error } = await supabase.rpc('admin_get_vendors', {
    page_num: 1,
    page_size: limit,
    search_query: null,
  });

  if (error) {
    console.error('[adminFetchVendorsForDropdown] Error:', error);
    return [];
  }

  const vendors = (data as Array<{
    vendor_id: string;
    company_name: string | null;
    subscription: Tier;
    is_verified: boolean;
    headquarters?: string | null;
  }>) || [];
  return vendors.map((v) => ({
    vendor_id: v.vendor_id,
    company_name: v.company_name,
    subscription: v.subscription,
    is_verified: v.is_verified,
    headquarters: v.headquarters ?? null,
  }));
}

/**
 * Bulk create products (admin only)
 */
export async function adminBulkCreateProducts(
  vendorId: string,
  products: BulkProductInput[]
): Promise<BulkImportResult> {
  const { data, error } = await supabase.rpc('admin_bulk_create_products', {
    p_vendor_id: vendorId,
    p_products: products,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as BulkImportResult;
}

/**
 * Get paginated products with pending review counts
 */
export async function adminGetProductsWithReviewCounts(
  page: number,
  pageSize: number,
  search?: string | null
): Promise<AdminProductWithReviewCounts[]> {
  const { data, error } = await supabase.rpc(
    'admin_get_products_with_review_counts',
    {
      p_page_num:  page,
      p_page_size: pageSize,
      p_search:    search ?? null,
    }
  );

  if (error) throw new Error(error.message);
  return (data as AdminProductWithReviewCounts[]) ?? [];
}

/**
 * Get reviews for a product (admin view)
 */
export async function adminGetReviewsForProduct(
  productId: string,
  status: string,
  page = 1,
  pageSize = 20
): Promise<AdminReviewItem[]> {
  const { data, error } = await supabase.rpc(
    'admin_get_reviews_for_product',
    {
      p_product_id: productId,
      p_status:     status,
      p_page:       page,
      p_page_size:  pageSize,
    }
  );

  if (error) throw new Error(error.message);
  return (data as AdminReviewItem[]) ?? [];
}

/**
 * Approve a review or pending edit
 */
export async function adminApproveReview(reviewId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_approve_review', {
    p_review_id: reviewId,
  });
  if (error) throw new Error(error.message);
}

/**
 * Reject a review or pending edit
 */
export async function adminRejectReview(
  reviewId: string,
  note?: string
): Promise<void> {
  const { error } = await supabase.rpc('admin_reject_review', {
    p_review_id: reviewId,
    p_note:      note ?? null,
  });
  if (error) throw new Error(error.message);
}

/**
 * Hard-delete a review (cascades to replies and votes)
 */
export async function adminDeleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_review', {
    p_review_id: reviewId,
  });
  if (error) throw new Error(error.message);
}

/**
 * Approve a reply
 */
export async function adminApproveReply(replyId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_approve_reply', {
    p_reply_id: replyId,
  });
  if (error) throw new Error(error.message);
}

/**
 * Reject a reply
 */
export async function adminRejectReply(replyId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_reject_reply', {
    p_reply_id: replyId,
  });
  if (error) throw new Error(error.message);
}

/**
 * Hard-delete a reply
 */
export async function adminDeleteReply(replyId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_reply', {
    p_reply_id: replyId,
  });
  if (error) throw new Error(error.message);
}

