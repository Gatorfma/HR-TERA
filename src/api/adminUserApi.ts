// ============================================================
// Admin User Management API (DAL Layer)
// All database access goes through these functions only
// ============================================================

import { supabase } from './supabaseClient';
import {
  AdminVendorView,
  AdminGetVendorsInput,
  AdminVendorsResponse,
  UpdateVendorTierInput,
  UpdateVendorProfileInput,
  UpdateVendorVerificationInput,
  ApiResponse,
  AdminErrorCodes,
} from '@/lib/admin-types';
import { Tier } from '@/lib/types';

// ============================================================
// Validation helpers
// ============================================================

const VALID_TIERS: Tier[] = ['freemium', 'plus', 'premium'];

function isValidTier(tier: string): tier is Tier {
  return VALID_TIERS.includes(tier as Tier);
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function isValidUrl(url: string): boolean {
  return /^https?:\/\/.+/.test(url);
}

function isValidCompanySize(size: string): boolean {
  return /^[0-9]+-[0-9]+$/.test(size);
}

// ============================================================
// Error parsing helper
// ============================================================

function parseSupabaseError(error: { code?: string; message?: string }): {
  code: string;
  message: string;
} {
  const msg = error.message || 'Unknown error';
  
  // Map Postgres error codes to our error codes
  if (msg.includes('Unauthorized') || error.code === 'P0403') {
    return { code: AdminErrorCodes.NOT_ADMIN, message: 'Admin access required' };
  }
  if (msg.includes('not found') || error.code === 'P0404') {
    return { code: AdminErrorCodes.VENDOR_NOT_FOUND, message: msg };
  }
  if (msg.includes('Invalid') || error.code === 'P0400') {
    return { code: AdminErrorCodes.VALIDATION_ERROR, message: msg };
  }
  
  return { code: AdminErrorCodes.DATABASE_ERROR, message: msg };
}

// ============================================================
// API Functions
// ============================================================

/**
 * Fetch paginated list of vendors
 * @requires Admin role
 */
export async function adminGetVendors(
  input: AdminGetVendorsInput
): Promise<ApiResponse<AdminVendorsResponse>> {
  const { page, pageSize, searchQuery } = input;

  // Client-side validation
  if (page < 1) {
    return {
      success: false,
      error: { code: AdminErrorCodes.VALIDATION_ERROR, message: 'Page must be >= 1' },
    };
  }
  if (pageSize < 1 || pageSize > 100) {
    return {
      success: false,
      error: { code: AdminErrorCodes.VALIDATION_ERROR, message: 'Page size must be 1-100' },
    };
  }

  try {
    // Fetch vendors and count in parallel
    const [vendorsResult, countResult] = await Promise.all([
      supabase.rpc('admin_get_vendors', {
        page_num: page,
        page_size: pageSize,
        search_query: searchQuery || null,
      }),
      supabase.rpc('admin_get_vendors_count', {
        search_query: searchQuery || null,
      }),
    ]);

    if (vendorsResult.error) {
      const parsed = parseSupabaseError(vendorsResult.error);
      return { success: false, error: parsed };
    }

    if (countResult.error) {
      const parsed = parseSupabaseError(countResult.error);
      return { success: false, error: parsed };
    }

    const vendors: AdminVendorView[] = vendorsResult.data ?? [];
    const totalCount: number = countResult.data ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        vendors,
        totalCount,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: {
        code: AdminErrorCodes.DATABASE_ERROR,
        message: err instanceof Error ? err.message : 'Unknown error',
      },
    };
  }
}

/**
 * @deprecated Use adminGetVendors instead
 */
export const adminGetUsers = adminGetVendors;

/**
 * Update a vendor's subscription tier
 * @requires Admin role
 */
export async function adminUpdateVendorTier(
  input: UpdateVendorTierInput
): Promise<ApiResponse<boolean>> {
  const { vendorId, newTier } = input;

  console.log('[adminUpdateVendorTier] Input:', { vendorId, newTier });

  // Client-side validation
  if (!vendorId) {
    console.error('[adminUpdateVendorTier] vendorId is empty or undefined:', vendorId);
    return {
      success: false,
      error: { 
        code: AdminErrorCodes.VALIDATION_ERROR, 
        message: `Vendor ID is required. Received: ${vendorId === null ? 'null' : vendorId === undefined ? 'undefined' : `"${vendorId}"`}` 
      },
    };
  }
  
  if (!isValidUUID(vendorId)) {
    console.error('[adminUpdateVendorTier] vendorId is not a valid UUID:', vendorId);
    return {
      success: false,
      error: { 
        code: AdminErrorCodes.VALIDATION_ERROR, 
        message: `Invalid vendor ID format. Expected UUID, received: "${vendorId}"` 
      },
    };
  }
  
  if (!isValidTier(newTier)) {
    return {
      success: false,
      error: {
        code: AdminErrorCodes.INVALID_TIER,
        message: `Invalid tier. Must be one of: ${VALID_TIERS.join(', ')}. Received: "${newTier}"`,
      },
    };
  }

  try {
    console.log('[adminUpdateVendorTier] Calling RPC with:', { p_vendor_id: vendorId, p_new_tier: newTier });
    
    const { data, error } = await supabase.rpc('admin_update_vendor_tier', {
      p_vendor_id: vendorId,
      p_new_tier: newTier,
    });

    if (error) {
      console.error('[adminUpdateVendorTier] RPC error:', error);
      const parsed = parseSupabaseError(error);
      return { success: false, error: parsed };
    }

    console.log('[adminUpdateVendorTier] Success:', data);
    return { success: true, data: data ?? false };
  } catch (err) {
    console.error('[adminUpdateVendorTier] Exception:', err);
    return {
      success: false,
      error: {
        code: AdminErrorCodes.DATABASE_ERROR,
        message: err instanceof Error ? err.message : 'Unknown error',
      },
    };
  }
}

/**
 * Update vendor profile fields
 * @requires Admin role
 */
export async function adminUpdateVendorProfile(
  input: UpdateVendorProfileInput
): Promise<ApiResponse<boolean>> {
  const { vendorId, companyName, companyWebsite, companySize, headquarters, linkedinLink, instagramLink, logo, companyMotto, companyDesc, foundedAt } = input;

  console.log('[adminUpdateVendorProfile] Input:', { vendorId, companyName, companyWebsite, companySize, headquarters, linkedinLink, instagramLink, logo, companyMotto, companyDesc, foundedAt });

  // Client-side validation
  if (!vendorId) {
    console.error('[adminUpdateVendorProfile] vendorId is empty or undefined:', vendorId);
    return {
      success: false,
      error: { 
        code: AdminErrorCodes.VALIDATION_ERROR, 
        message: `Vendor ID is required. Received: ${vendorId === null ? 'null' : vendorId === undefined ? 'undefined' : `"${vendorId}"`}` 
      },
    };
  }
  
  if (!isValidUUID(vendorId)) {
    console.error('[adminUpdateVendorProfile] vendorId is not a valid UUID:', vendorId);
    return {
      success: false,
      error: { 
        code: AdminErrorCodes.VALIDATION_ERROR, 
        message: `Invalid vendor ID format. Expected UUID, received: "${vendorId}"` 
      },
    };
  }
  
  if (companyWebsite && companyWebsite.trim() !== '' && !isValidUrl(companyWebsite)) {
    return {
      success: false,
      error: {
        code: AdminErrorCodes.VALIDATION_ERROR,
        message: 'Website must start with http:// or https://',
      },
    };
  }
  if (companySize && companySize.trim() !== '' && !isValidCompanySize(companySize)) {
    return {
      success: false,
      error: {
        code: AdminErrorCodes.VALIDATION_ERROR,
        message: 'Company size must be in format "min-max" (e.g., "1-10")',
      },
    };
  }

  try {
    console.log('[adminUpdateVendorProfile] Calling RPC with:', { 
      p_vendor_id: vendorId, 
      p_company_name: companyName ?? null,
      p_company_website: companyWebsite ?? null,
      p_company_size: companySize ?? null,
      p_headquarters: headquarters ?? null,
      p_linkedin_link: linkedinLink ?? null,
      p_instagram_link: instagramLink ?? null,
      p_logo: logo ?? null,
      p_company_motto: companyMotto ?? null,
      p_company_desc: companyDesc ?? null,
      p_founded_at: foundedAt ?? null,
    });
    
    const { data, error } = await supabase.rpc('admin_update_vendor_profile', {
      p_vendor_id: vendorId,
      p_company_name: companyName ?? null,
      p_company_website: companyWebsite ?? null,
      p_company_size: companySize ?? null,
      p_headquarters: headquarters ?? null,
      p_linkedin_link: linkedinLink ?? null,
      p_instagram_link: instagramLink ?? null,
      p_logo: logo ?? null,
      p_company_motto: companyMotto ?? null,
      p_company_desc: companyDesc ?? null,
      p_founded_at: foundedAt ?? null,
    });

    if (error) {
      console.error('[adminUpdateVendorProfile] RPC error:', error);
      const parsed = parseSupabaseError(error);
      return { success: false, error: parsed };
    }
    
    console.log('[adminUpdateVendorProfile] Success:', data);

    return { success: true, data: data ?? false };
  } catch (err) {
    return {
      success: false,
      error: {
        code: AdminErrorCodes.DATABASE_ERROR,
        message: err instanceof Error ? err.message : 'Unknown error',
      },
    };
  }
}

/**
 * Update vendor verification status
 * @requires Admin role
 */
export async function adminUpdateVendorVerification(
  input: UpdateVendorVerificationInput
): Promise<ApiResponse<boolean>> {
  const { vendorId, isVerified } = input;

  console.log('[adminUpdateVendorVerification] Input:', { vendorId, isVerified });

  // Client-side validation
  if (!vendorId) {
    console.error('[adminUpdateVendorVerification] vendorId is empty or undefined:', vendorId);
    return {
      success: false,
      error: { 
        code: AdminErrorCodes.VALIDATION_ERROR, 
        message: `Vendor ID is required. Received: ${vendorId === null ? 'null' : vendorId === undefined ? 'undefined' : `"${vendorId}"`}` 
      },
    };
  }
  
  if (!isValidUUID(vendorId)) {
    console.error('[adminUpdateVendorVerification] vendorId is not a valid UUID:', vendorId);
    return {
      success: false,
      error: { 
        code: AdminErrorCodes.VALIDATION_ERROR, 
        message: `Invalid vendor ID format. Expected UUID, received: "${vendorId}"` 
      },
    };
  }

  if (typeof isVerified !== 'boolean') {
    return {
      success: false,
      error: {
        code: AdminErrorCodes.VALIDATION_ERROR,
        message: 'isVerified must be a boolean value',
      },
    };
  }

  try {
    console.log('[adminUpdateVendorVerification] Calling RPC with:', { p_vendor_id: vendorId, p_is_verified: isVerified });
    
    const { data, error } = await supabase.rpc('admin_update_vendor_verification', {
      p_vendor_id: vendorId,
      p_is_verified: isVerified,
    });

    if (error) {
      console.error('[adminUpdateVendorVerification] RPC error:', error);
      const parsed = parseSupabaseError(error);
      return { success: false, error: parsed };
    }

    console.log('[adminUpdateVendorVerification] Success:', data);
    return { success: true, data: data ?? false };
  } catch (err) {
    console.error('[adminUpdateVendorVerification] Exception:', err);
    return {
      success: false,
      error: {
        code: AdminErrorCodes.DATABASE_ERROR,
        message: err instanceof Error ? err.message : 'Unknown error',
      },
    };
  }
}

