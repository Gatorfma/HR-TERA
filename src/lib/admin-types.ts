// ============================================================
// Admin User Management Types
// ============================================================

import { Tier } from './types';

/**
 * Listing status for products and requests
 */
export type ListingStatus = 'pending' | 'rejected' | 'approved';

/**
 * Vendor with optional user info - returned from admin_get_vendors RPC
 */
export interface AdminVendorView {
  // Vendor fields
  vendor_id: string;
  user_id: string | null;
  company_name: string | null;
  company_size: string | null;
  company_motto: string | null;
  company_desc: string | null;
  headquarters: string | null;
  website_link: string | null;
  linkedin_link: string | null;
  instagram_link: string | null;
  logo: string | null;
  subscription: Tier;
  is_verified: boolean;
  founded_at: string | null;
  created_at: string;
  updated_at: string;

  // From auth.users (if linked)
  user_email: string | null;
  user_full_name: string | null;
}

/**
 * @deprecated Use AdminVendorView instead
 */
export type AdminUserView = AdminVendorView;

/**
 * Input for fetching admin vendors list
 */
export interface AdminGetVendorsInput {
  page: number;
  pageSize: number;
  searchQuery?: string | null;
}

/**
 * Paginated response for admin vendors
 */
export interface AdminVendorsResponse {
  vendors: AdminVendorView[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * @deprecated Use AdminGetVendorsInput instead
 */
export type AdminGetUsersInput = AdminGetVendorsInput;

/**
 * @deprecated Use AdminVendorsResponse instead
 */
export type AdminUsersResponse = AdminVendorsResponse;

/**
 * Input for updating vendor subscription tier
 */
export interface UpdateVendorTierInput {
  vendorId: string;
  newTier: Tier;
}

/**
 * Input for updating vendor profile
 */
export interface UpdateVendorProfileInput {
  vendorId: string;
  companyName?: string | null;
  companyWebsite?: string | null;
  companySize?: string | null;
  headquarters?: string | null;
  linkedinLink?: string | null;
  instagramLink?: string | null;
  logo?: string | null;
  companyMotto?: string | null;
  companyDesc?: string | null;
  foundedAt?: string | null;
}

/**
 * Input for updating vendor verification status
 */
export interface UpdateVendorVerificationInput {
  vendorId: string;
  isVerified: boolean;
}

/**
 * User search result - returned from admin_search_users RPC
 */
export interface UserSearchResult {
  user_id: string;
  email: string;
  full_name: string | null;
  assigned_vendor_id: string | null;
  assigned_vendor_name: string | null;
}

/**
 * Input for assigning a user to a vendor
 */
export interface AssignUserToVendorInput {
  vendorId: string;
  userId: string | null; // null to unassign
}

/**
 * Input for creating a new vendor
 */
export interface CreateVendorInput {
  companyName?: string | null;
  userId?: string | null;
  isVerified?: boolean;
  companySize?: string | null;
  companyMotto?: string | null;
  companyDesc?: string | null;
  headquarters?: string | null;
  foundedAt?: string | null;
  websiteLink?: string | null;
  linkedinLink?: string | null;
  instagramLink?: string | null;
  logo?: string | null;
  subscription?: 'freemium' | 'plus' | 'premium';
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * API error shape
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Error codes for admin operations
 */
export const AdminErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_ADMIN: 'NOT_ADMIN',
  VENDOR_NOT_FOUND: 'VENDOR_NOT_FOUND',
  INVALID_TIER: 'INVALID_TIER',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type AdminErrorCode = typeof AdminErrorCodes[keyof typeof AdminErrorCodes];

// ============================================================
// Admin Product Management Types
// ============================================================

/**
 * Product category - now dynamic from database enum
 * Use getAllCategories() from supabaseApi to fetch available values
 */
export type ProductCategory = string;

/**
 * Admin product view - returned from admin_get_products RPC
 */
export interface AdminProductView {
  product_id: string;
  vendor_id: string;
  product_name: string;
  website_link: string | null;
  main_category: ProductCategory;
  categories: ProductCategory[] | null;
  features: string[] | null;
  short_desc: string;
  long_desc: string | null;
  logo: string;
  video_url: string | null;
  gallery: string[] | null;
  pricing: string | null;
  languages: string[] | null;
  demo_link: string | null;
  release_date: string | null;
  rating: number | null;
  listing_status: ListingStatus;
  product_created_at: string;
  product_updated_at: string;
  // Vendor info
  company_name: string | null;
  subscription: Tier;
  is_verified: boolean;
}

/**
 * Input for fetching admin products list
 */
export interface AdminGetProductsInput {
  page: number;
  pageSize: number;
  searchQuery?: string | null;
  statusFilter?: ListingStatus | null;
  tierFilter?: Tier | null;
}

/**
 * Paginated response for admin products
 */
export interface AdminProductsResponse {
  products: AdminProductView[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Input for updating product via admin
 */
export interface AdminUpdateProductInput {
  productId: string;
  vendorId?: string | null;
  productName?: string | null;
  websiteLink?: string | null;
  shortDesc?: string | null;
  longDesc?: string | null;
  mainCategory?: ProductCategory | null;
  categories?: ProductCategory[] | null;
  features?: string[] | null;
  logo?: string | null;
  videoUrl?: string | null;
  gallery?: string[] | null;
  pricing?: string | null;
  languages?: string[] | null;
  demoLink?: string | null;
  releaseDate?: string | null;
  listingStatus?: ListingStatus | null;
  rating?: number | null;
}

/**
 * Input for creating a new product via admin
 */
export interface AdminCreateProductInput {
  vendorId: string;
  productName: string;
  shortDesc: string;
  logo: string;
  mainCategory: ProductCategory;
  websiteLink?: string | null;
  longDesc?: string | null;
  categories?: ProductCategory[] | null;
  features?: string[] | null;
  videoUrl?: string | null;
  gallery?: string[] | null;
  pricing?: string | null;
  languages?: string[] | null;
  demoLink?: string | null;
  releaseDate?: string | null;
  listingStatus?: ListingStatus;
}

/**
 * Vendor lookup result for admin
 */
export interface AdminVendorLookup {
  vendor_id: string;
  company_name: string | null;
  subscription: Tier;
  is_verified: boolean;
}

/**
 * Vendor search result for admin product assignment
 */
export interface VendorSearchResult {
  vendor_id: string;
  company_name: string | null;
  subscription: Tier;
  is_verified: boolean;
  headquarters: string | null;
}

// ============================================================
// Admin Review Management Types
// ============================================================

/**
 * Single review or reply item returned by admin_get_reviews_for_product
 */
export interface AdminReviewItem {
  review_id: string;
  parent_review_id: string | null;
  product_id: string;
  user_id: string;
  rating?: number;
  title?: string;
  body: string;
  reviewer_name: string;
  reviewer_role?: string;
  reviewer_company?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  has_pending_edit: boolean;
  pending_rating?: number;
  pending_title?: string;
  pending_body?: string;
  created_at: string;
  approved_at?: string;
  replies?: AdminReviewItem[];
}

/**
 * Admin product view extended with pending review counts
 * Returned by admin_get_products_with_review_counts
 */
export interface AdminProductWithReviewCounts extends AdminProductView {
  pending_review_count: number;
}

/**
 * Product data for bulk import
 */
export interface BulkProductInput {
  product_name: string;
  main_category: ProductCategory;
  website_link: string;
  short_desc?: string;
  logo?: string;
}

/**
 * Result from bulk import
 */
export interface BulkImportResult {
  success_count: number;
  error_count: number;
  errors: { product_name: string; error: string }[];
}

