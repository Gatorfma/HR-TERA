import { z } from "zod";
import { Tier, ListingStatus } from "../types";

// Tier constraints from database
export const TIER_CONSTRAINTS = {
  freemium: {
    maxCategories: 1, // main only, no secondary
    maxFeatures: 3,
    allowVideo: false,
    allowDemo: false,
    allowGallery: false,
  },
  plus: {
    maxCategories: 5, // main + 4 secondary
    maxFeatures: 10,
    allowVideo: true,
    allowDemo: false,
    allowGallery: true,
  },
  premium: {
    maxCategories: 5,
    maxFeatures: 10,
    allowVideo: true,
    allowDemo: true,
    allowGallery: true,
  },
} as const;

// NOTE: Category grouping is now handled dynamically by @/lib/categoryGroups.ts
// Categories are fetched from the database enum and grouped based on keyword matching
// This allows the database to be the single source of truth for available categories

// Base product form schema
export const productFormSchema = z.object({
  // Basic info
  productName: z
    .string()
    .min(2, "Ürün adı en az 2 karakter olmalı")
    .max(100, "Ürün adı en fazla 100 karakter olabilir"),
  shortDesc: z
    .string()
    .min(10, "Kısa açıklama en az 10 karakter olmalı")
    .max(200, "Kısa açıklama en fazla 200 karakter olabilir"),
  longDesc: z.string().max(5000, "Detaylı açıklama en fazla 5000 karakter olabilir").optional().or(z.literal("")),

  // Categories
  mainCategory: z.string().min(1, "Ana kategori seçilmeli"),
  categories: z.array(z.string()).default([]),

  // Features
  features: z.array(z.string()).default([]),

  // Media
  logo: z.string().min(1, "Logo yüklenmeli"),
  gallery: z.array(z.string()).default([]),
  videoUrl: z
    .string()
    .url("Geçerli bir video URL'si girin")
    .optional()
    .or(z.literal("")),

  // Links
  websiteLink: z
    .string()
    .url("Geçerli bir web sitesi URL'si girin")
    .optional()
    .or(z.literal("")),
  demoLink: z
    .string()
    .url("Geçerli bir demo linki girin")
    .optional()
    .or(z.literal("")),

  // Other
  pricing: z.string().max(100, "Fiyatlandırma en fazla 100 karakter olabilir").optional().or(z.literal("")),
  languages: z.array(z.string()).default([]),
  releaseDate: z.string().optional().or(z.literal("")),

  // Status (admin only)
  listingStatus: z.enum(["pending", "approved", "rejected"]).default("pending"),
  rating: z.coerce.number().min(0).max(5).optional(),
});

// Type for the form values
export type ProductFormValues = z.infer<typeof productFormSchema>;

// Default values for the form
export const defaultProductFormValues: ProductFormValues = {
  productName: "",
  shortDesc: "",
  longDesc: "",
  mainCategory: "",
  categories: [],
  features: [],
  logo: "",
  gallery: [],
  videoUrl: "",
  websiteLink: "",
  demoLink: "",
  pricing: "",
  languages: [],
  releaseDate: "",
  listingStatus: "pending",
  rating: undefined,
};

// Helper function to create tier-aware validation
// NOTE: Tier-based constraints (maxCategories, maxFeatures, allowVideo, allowDemo)
// are enforced by the database trigger `enforce_product_subscription_constraints`.
// We keep TIER_CONSTRAINTS above for UI purposes (disabling buttons, showing limits)
// but don't duplicate the validation logic here - the database is the source of truth.
// If the database rejects an operation due to tier constraints, the error will be
// displayed to the user via the toast notification system.
export function createTierValidation(tier: Tier) {
  // Simply return the base schema - tier constraints are enforced by DB trigger
  return productFormSchema;
}

// Helper to convert API product to form values
export function apiProductToFormValues(product: {
  product_name: string;
  short_desc: string;
  long_desc?: string | null;
  main_category: string;
  categories?: string[] | null;
  features?: string[] | null;
  logo: string;
  gallery?: string[] | null;
  video_url?: string | null;
  website_link?: string | null;
  demo_link?: string | null;
  pricing?: string | null;
  languages?: string[] | null;
  release_date?: string | null;
  listing_status?: ListingStatus;
  rating?: number | null;
}): ProductFormValues {
  return {
    productName: product.product_name || "",
    shortDesc: product.short_desc || "",
    longDesc: product.long_desc || "",
    mainCategory: product.main_category || "",
    categories: product.categories || [],
    features: product.features || [],
    logo: product.logo || "",
    gallery: product.gallery || [],
    videoUrl: product.video_url || "",
    websiteLink: product.website_link || "",
    demoLink: product.demo_link || "",
    pricing: product.pricing || "",
    languages: product.languages || [],
    releaseDate: product.release_date || "",
    listingStatus: product.listing_status || "pending",
    rating: product.rating || undefined,
  };
}

// Helper to convert form values to API format
export function formValuesToApiProduct(values: ProductFormValues) {
  return {
    productName: values.productName,
    shortDesc: values.shortDesc,
    longDesc: values.longDesc || null,
    mainCategory: values.mainCategory,
    categories: values.categories.length > 0 ? values.categories : null,
    features: values.features.length > 0 ? values.features : null,
    logo: values.logo,
    gallery: values.gallery.length > 0 ? values.gallery : null,
    videoUrl: values.videoUrl || null,
    websiteLink: values.websiteLink || null,
    demoLink: values.demoLink || null,
    pricing: values.pricing || null,
    languages: values.languages.length > 0 ? values.languages : null,
    releaseDate: values.releaseDate || null,
    listingStatus: values.listingStatus,
    rating: values.rating,
  };
}

// Available features list
export const AVAILABLE_FEATURES = [
  "Automation",
  "Leadership",
  "Communication",
  "AI Assistant",
  "Analytics & Reporting",
  "Integrations",
  "Security & Compliance",
  "Collaboration",
  "Mobile Support",
  "Onboarding Tools",
  "Training & LMS",
  "Performance Feedback",
] as const;

// Available languages
export const AVAILABLE_LANGUAGES = [
  "Türkçe",
  "İngilizce",
  "Almanca",
  "Fransızca",
  "İspanyolca",
  "İtalyanca",
  "Portekizce",
  "Felemenkçe",
  "Lehçe",
  "Rusça",
  "Japonca",
  "Çince",
  "Korece",
  "Arapça",
] as const;
