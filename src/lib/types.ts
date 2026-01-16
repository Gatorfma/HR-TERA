// Vendor tier type
export type Tier = 'freemium' | 'silver' | 'gold';

// Listing status type
export type ListingStatus = 'pending' | 'approved' | 'rejected';

// Dashboard product interface for API responses
export interface DashboardProduct {
  product_name: string;
  product_id: string;
  main_category: string;
  short_desc: string;
  logo: string;
  pricing: string;
  rating: number;
  vendor_id: string;
  is_verified: boolean;
  company_name: string;
  subscription: string;
}

// Full product detail interface for product detail page
export interface ProductDetailData {
  // Product fields
  product_id: string;
  vendor_id: string;
  product_name: string;
  product_website: string | null;
  main_category: string;
  categories: string[] | null;
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
  
  // Vendor fields
  vendor_user_id: string | null;
  is_verified: boolean;
  linkedin_link: string | null;
  instagram_link: string | null;
  vendor_website: string | null;
  company_name: string | null;
  company_size: string | null;
  company_motto: string | null;
  company_desc: string | null;
  headquarters: string | null;
  founded_at: string | null;
  subscription: Tier;
  vendor_created_at: string;
  vendor_updated_at: string;
}

// Vendor card interface for vendor listing page
export interface VendorCardData {
  vendor_id: string;
  company_name: string | null;
  company_motto: string | null;
  company_desc: string | null;
  company_size: string | null;
  headquarters: string | null;
  website_link: string | null;
  linkedin_link: string | null;
  instagram_link: string | null;
  subscription: Tier;
  is_verified: boolean;
  founded_at: string | null;
  created_at: string;
}

// Full vendor detail interface for vendor detail page
export interface VendorDetailData {
  vendor_id: string;
  user_id: string | null;
  company_name: string | null;
  company_motto: string | null;
  company_desc: string | null;
  company_size: string | null;
  headquarters: string | null;
  website_link: string | null;
  linkedin_link: string | null;
  instagram_link: string | null;
  subscription: Tier;
  is_verified: boolean;
  founded_at: string | null;
  created_at: string;
  updated_at: string;
}

// Vendor product interface for vendor's products list
export interface VendorProductData {
  product_id: string;
  product_name: string;
  short_desc: string;
  logo: string;
  main_category: string;
  pricing: string | null;
  rating: number | null;
}

