import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { Tier } from "@/data/products";
import { getMyProducts, submitProductRequest } from "@/api/supabaseApi";
import { useAuth } from "@/contexts/AuthContext";

export type ProductStatus = "pending" | "approved" | "rejected" | "changes_requested";

export interface ProductApplication {
  id: string;
  vendorId: string;
  name: string;
  shortDescription: string;
  websiteUrl: string;
  logo: string;
  motto?: string;
  calendlyLink?: string;
  categories: string[];
  features: string[];
  galleryImages: string[];
  productTier: Tier;
  status: ProductStatus;
  submittedAt: Date;
  adminComment?: string;
}

interface ProductApplicationsContextType {
  applications: ProductApplication[];
  isLoading: boolean;
  error: string | null;
  addApplication: (application: Omit<ProductApplication, "id" | "submittedAt" | "status">) => Promise<void>;
  refreshApplications: () => Promise<void>;
  updateApplication: (id: string, updates: Partial<ProductApplication>) => void;
  getApplicationsByVendor: (vendorId: string) => ProductApplication[];
  getPendingApplications: (vendorId: string) => ProductApplication[];
  getApprovedProducts: (vendorId: string) => ProductApplication[];
}

const ProductApplicationsContext = createContext<ProductApplicationsContextType | undefined>(undefined);

type ApiProduct = {
  product_id: string;
  vendor_id: string;
  product_name: string;
  website_link: string | null;
  main_category: string;
  categories: string[] | null;
  features: string[] | null;
  short_desc: string;
  long_desc: string | null;
  logo: string | null;
  video_url: string | null;
  gallery: string[] | null;
  pricing: string | null;
  languages: string[] | null;
  demo_link: string | null;
  release_date: string | null;
  rating: number | null;
  listing_status: ProductStatus;
  created_at: string;
  updated_at: string;
  subscription: string | null;
};

const mapProductToApplication = (product: ApiProduct): ProductApplication => {
  const categories = [
    product.main_category,
    ...(product.categories ?? []),
  ].filter(Boolean);

  return {
    id: product.product_id,
    vendorId: product.vendor_id,
    name: product.product_name,
    shortDescription: product.short_desc,
    websiteUrl: product.website_link ?? "",
    logo: product.logo ?? "",
    motto: undefined,
    calendlyLink: product.demo_link ?? undefined,
    categories: Array.from(new Set(categories)),
    features: product.features ?? [],
    galleryImages: product.gallery ?? [],
    productTier: (product.subscription ?? "freemium") as Tier,
    status: product.listing_status,
    submittedAt: new Date(product.created_at),
    adminComment: undefined,
  };
};

export const ProductApplicationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ProductApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshApplications = useCallback(async () => {
    if (!user) {
      setApplications([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyProducts();
      const mapped = (data ?? []).map((item) => mapProductToApplication(item as ApiProduct));
      setApplications(mapped);
    } catch (err) {
      console.error("[ProductApplications] Failed to load applications:", err);
      setApplications([]);
      setError("Çözüm başvuruları yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshApplications();
  }, [refreshApplications]);

  const addApplication = useCallback(
    async (application: Omit<ProductApplication, "id" | "submittedAt" | "status">) => {
      if (!user) {
        throw new Error("Authentication required");
      }

      const categories = application.categories ?? [];
      if (categories.length === 0) {
        throw new Error("Kategori seçilmelidir.");
      }

      const mainCategory = categories[0];
      const extraCategories = categories.slice(1);

      await submitProductRequest({
        productName: application.name,
        shortDesc: application.shortDescription,
        logo: application.logo,
        mainCategory,
        websiteLink: application.websiteUrl,
        categories: extraCategories.length > 0 ? extraCategories : null,
        features: application.features?.length ? application.features : null,
        demoLink: application.calendlyLink ?? null,
        gallery: application.galleryImages?.length ? application.galleryImages : null,
      });

      await refreshApplications();
    },
    [refreshApplications, user]
  );

  const updateApplication = (id: string, updates: Partial<ProductApplication>) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updates } : app))
    );
  };

  const getApplicationsByVendor = (vendorId: string) => {
    if (!vendorId) {
      return applications;
    }
    return applications.filter((app) => app.vendorId === vendorId);
  };

  const getPendingApplications = (vendorId: string) => {
    if (!vendorId) {
      return applications.filter((app) => app.status !== "approved");
    }
    return applications.filter(
      (app) => app.vendorId === vendorId && app.status !== "approved"
    );
  };

  const getApprovedProducts = (vendorId: string) => {
    if (!vendorId) {
      return applications.filter((app) => app.status === "approved");
    }
    return applications.filter(
      (app) => app.vendorId === vendorId && app.status === "approved"
    );
  };

  return (
    <ProductApplicationsContext.Provider
      value={{
        applications,
        isLoading,
        error,
        addApplication,
        refreshApplications,
        updateApplication,
        getApplicationsByVendor,
        getPendingApplications,
        getApprovedProducts,
      }}
    >
      {children}
    </ProductApplicationsContext.Provider>
  );
};

export const useProductApplications = () => {
  const context = useContext(ProductApplicationsContext);
  if (!context) {
    throw new Error("useProductApplications must be used within a ProductApplicationsProvider");
  }
  return context;
};
