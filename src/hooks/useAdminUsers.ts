// ============================================================
// Admin Users Hook
// Manages state and operations for admin user management
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  adminGetVendors,
  adminUpdateVendorTier,
  adminUpdateVendorProfile,
  adminUpdateVendorVerification,
} from '@/api/adminUserApi';
import {
  AdminVendorView,
  AdminVendorsResponse,
  ApiError,
  UpdateVendorTierInput,
  UpdateVendorProfileInput,
} from '@/lib/admin-types';
import { Tier } from '@/lib/types';

interface UseAdminVendorsState {
  vendors: AdminVendorView[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: ApiError | null;
}

interface UseAdminVendorsReturn extends UseAdminVendorsState {
  // Actions
  fetchVendors: (page?: number, searchQuery?: string) => Promise<void>;
  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  searchQuery: string;

  // Mutations
  updateTier: (vendorId: string, newTier: Tier) => Promise<{ success: boolean; error?: ApiError }>;
  updateProfile: (
    input: Omit<UpdateVendorProfileInput, 'vendorId'> & { vendorId: string }
  ) => Promise<{ success: boolean; error?: ApiError }>;
  updateVerification: (vendorId: string, isVerified: boolean) => Promise<{ success: boolean; error?: ApiError }>;

  // Selected vendor
  selectedVendor: AdminVendorView | null;
  setSelectedVendor: (vendor: AdminVendorView | null) => void;

  // Mutation states
  isUpdatingTier: boolean;
  isUpdatingProfile: boolean;
  isUpdatingVerification: boolean;
}

const DEFAULT_PAGE_SIZE = 20;

export function useAdminVendors(): UseAdminVendorsReturn {
  // List state
  const [vendors, setVendors] = useState<AdminVendorView[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchQuery, setSearchQueryState] = useState('');

  // Loading states - start as true since we fetch on mount
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingTier, setIsUpdatingTier] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingVerification, setIsUpdatingVerification] = useState(false);

  // Error state
  const [error, setError] = useState<ApiError | null>(null);

  // Selected vendor
  const [selectedVendor, setSelectedVendor] = useState<AdminVendorView | null>(null);

  // Fetch vendors
  const fetchVendors = useCallback(
    async (page: number = 1, search: string = '') => {
      setIsLoading(true);
      setError(null);

      const result = await adminGetVendors({
        page,
        pageSize,
        searchQuery: search || null,
      });

      if (result.success && result.data) {
        const data: AdminVendorsResponse = result.data;
        setVendors(data.vendors);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
        setCurrentPage(data.page);

        // Auto-select first vendor if none selected
        setSelectedVendor((prev) => {
          if (prev) {
            const updated = data.vendors.find((v) => v.vendor_id === prev.vendor_id);
            return updated || prev;
          }
          return data.vendors.length > 0 ? data.vendors[0] : null;
        });
      } else {
        setError(result.error || { code: 'UNKNOWN', message: 'Failed to fetch vendors' });
        setVendors([]);
      }

      setIsLoading(false);
    },
    [pageSize]
  );

  // Set page
  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    []
  );

  // Set search query (only if different to prevent loops)
  const setSearchQuery = useCallback(
    (query: string) => {
      setSearchQueryState((prev) => {
        if (prev === query) return prev; // No change
        setCurrentPage(1); // Reset to page 1 on new search
        return query;
      });
    },
    []
  );

  // Fetch when page or search changes
  useEffect(() => {
    fetchVendors(currentPage, searchQuery);
    // fetchVendors is stable (only depends on pageSize which doesn't change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  // Update vendor tier
  const updateTier = useCallback(
    async (
      vendorId: string,
      newTier: Tier
    ): Promise<{ success: boolean; error?: ApiError }> => {
      setIsUpdatingTier(true);

      const input: UpdateVendorTierInput = { vendorId, newTier };
      const result = await adminUpdateVendorTier(input);

      if (result.success) {
        // Optimistic update: update local state
        setVendors((prev) =>
          prev.map((v) =>
            v.vendor_id === vendorId ? { ...v, subscription: newTier } : v
          )
        );
        setSelectedVendor((prev) => 
          prev?.vendor_id === vendorId ? { ...prev, subscription: newTier } : prev
        );
      }

      setIsUpdatingTier(false);
      return { success: result.success, error: result.error };
    },
    []
  );

  // Update vendor profile
  const updateProfile = useCallback(
    async (
      input: Omit<UpdateVendorProfileInput, 'vendorId'> & { vendorId: string }
    ): Promise<{ success: boolean; error?: ApiError }> => {
      setIsUpdatingProfile(true);

      const result = await adminUpdateVendorProfile(input);

      if (result.success) {
        // Optimistic update
        setVendors((prev) =>
          prev.map((v) =>
            v.vendor_id === input.vendorId
              ? {
                  ...v,
                  company_name: input.companyName ?? v.company_name,
                  website_link: input.companyWebsite ?? v.website_link,
                  company_size: input.companySize ?? v.company_size,
                  headquarters: input.headquarters ?? v.headquarters,
                }
              : v
          )
        );
        setSelectedVendor((prev) =>
          prev?.vendor_id === input.vendorId
            ? {
                ...prev,
                company_name: input.companyName ?? prev.company_name,
                website_link: input.companyWebsite ?? prev.website_link,
                company_size: input.companySize ?? prev.company_size,
                headquarters: input.headquarters ?? prev.headquarters,
              }
            : prev
        );
      }

      setIsUpdatingProfile(false);
      return { success: result.success, error: result.error };
    },
    []
  );

  // Update vendor verification status
  const updateVerification = useCallback(
    async (
      vendorId: string,
      isVerified: boolean
    ): Promise<{ success: boolean; error?: ApiError }> => {
      setIsUpdatingVerification(true);

      const result = await adminUpdateVendorVerification({ vendorId, isVerified });

      if (result.success) {
        // Optimistic update: update local state
        setVendors((prev) =>
          prev.map((v) =>
            v.vendor_id === vendorId ? { ...v, is_verified: isVerified } : v
          )
        );
        setSelectedVendor((prev) => 
          prev?.vendor_id === vendorId ? { ...prev, is_verified: isVerified } : prev
        );
      }

      setIsUpdatingVerification(false);
      return { success: result.success, error: result.error };
    },
    []
  );

  // Note: Initial fetch happens via the useEffect that watches currentPage/searchQuery

  return {
    // State
    vendors,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    isLoading,
    error,
    searchQuery,

    // Actions
    fetchVendors,
    setPage,
    setSearchQuery,

    // Mutations
    updateTier,
    updateProfile,
    updateVerification,

    // Selected vendor
    selectedVendor,
    setSelectedVendor,

    // Mutation states
    isUpdatingTier,
    isUpdatingProfile,
    isUpdatingVerification,
  };
}

/**
 * @deprecated Use useAdminVendors instead
 */
export const useAdminUsers = useAdminVendors;

