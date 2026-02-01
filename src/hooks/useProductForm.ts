import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo } from "react";
import {
  productFormSchema,
  ProductFormValues,
  defaultProductFormValues,
  createTierValidation,
  apiProductToFormValues,
  formValuesToApiProduct,
  TIER_CONSTRAINTS,
} from "@/lib/schemas/product.schema";
import { Tier } from "@/lib/types";

export interface UseProductFormOptions {
  tier?: Tier;
  initialData?: Partial<ProductFormValues>;
  onDirtyChange?: (isDirty: boolean) => void;
}

export interface UseProductFormReturn {
  form: UseFormReturn<ProductFormValues>;
  isDirty: boolean;
  isValid: boolean;
  constraints: typeof TIER_CONSTRAINTS[Tier];
  resetForm: (data?: Partial<ProductFormValues>) => void;
  populateForm: (product: Parameters<typeof apiProductToFormValues>[0]) => void;
  getApiValues: () => ReturnType<typeof formValuesToApiProduct>;
  // Field helpers
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  canAddCategory: boolean;
  addFeature: (feature: string) => void;
  removeFeature: (feature: string) => void;
  canAddFeature: boolean;
  addLanguage: (language: string) => void;
  removeLanguage: (language: string) => void;
  addGalleryImage: (url: string) => void;
  removeGalleryImage: (index: number) => void;
  canAddGallery: boolean;
  canUseVideo: boolean;
  canUseDemo: boolean;
  // Progress tracking
  completedFields: number;
  totalRequiredFields: number;
  completionPercentage: number;
}

const REQUIRED_FIELDS = ["productName", "shortDesc", "mainCategory", "logo"] as const;

export function useProductForm(options: UseProductFormOptions = {}): UseProductFormReturn {
  const { tier = "freemium", initialData, onDirtyChange } = options;

  // Get constraints for the tier
  const constraints = TIER_CONSTRAINTS[tier];

  // Create the schema with tier validation
  const schema = useMemo(() => createTierValidation(tier), [tier]);

  // Initialize form with react-hook-form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultProductFormValues,
      ...initialData,
    },
    mode: "onChange",
  });

  const { watch, setValue, reset, formState } = form;
  const { isDirty, isValid } = formState;

  // Watch form values for helpers
  const categories = watch("categories");
  const features = watch("features");
  const gallery = watch("gallery");

  // Notify parent of dirty state changes
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Reset form to defaults or new data
  const resetForm = useCallback(
    (data?: Partial<ProductFormValues>) => {
      reset({
        ...defaultProductFormValues,
        ...data,
      });
    },
    [reset]
  );

  // Populate form from API product data
  const populateForm = useCallback(
    (product: Parameters<typeof apiProductToFormValues>[0]) => {
      const values = apiProductToFormValues(product);
      reset(values);
    },
    [reset]
  );

  // Get values ready for API submission
  const getApiValues = useCallback(() => {
    return formValuesToApiProduct(form.getValues());
  }, [form]);

  // Category helpers
  const canAddCategory = categories.length < constraints.maxCategories - 1; // -1 for main category

  const addCategory = useCallback(
    (category: string) => {
      if (canAddCategory && !categories.includes(category)) {
        setValue("categories", [...categories, category], { shouldDirty: true, shouldValidate: true });
      }
    },
    [categories, canAddCategory, setValue]
  );

  const removeCategory = useCallback(
    (category: string) => {
      setValue(
        "categories",
        categories.filter((c) => c !== category),
        { shouldDirty: true, shouldValidate: true }
      );
    },
    [categories, setValue]
  );

  // Feature helpers
  const canAddFeature = features.length < constraints.maxFeatures;

  const addFeature = useCallback(
    (feature: string) => {
      if (canAddFeature && !features.includes(feature)) {
        setValue("features", [...features, feature], { shouldDirty: true, shouldValidate: true });
      }
    },
    [features, canAddFeature, setValue]
  );

  const removeFeature = useCallback(
    (feature: string) => {
      setValue(
        "features",
        features.filter((f) => f !== feature),
        { shouldDirty: true, shouldValidate: true }
      );
    },
    [features, setValue]
  );

  // Language helpers
  const languages = watch("languages");

  const addLanguage = useCallback(
    (language: string) => {
      if (!languages.includes(language)) {
        setValue("languages", [...languages, language], { shouldDirty: true, shouldValidate: true });
      }
    },
    [languages, setValue]
  );

  const removeLanguage = useCallback(
    (language: string) => {
      setValue(
        "languages",
        languages.filter((l) => l !== language),
        { shouldDirty: true, shouldValidate: true }
      );
    },
    [languages, setValue]
  );

  // Gallery helpers
  const canAddGallery = constraints.allowGallery && gallery.length < 10;

  const addGalleryImage = useCallback(
    (url: string) => {
      if (canAddGallery) {
        setValue("gallery", [...gallery, url], { shouldDirty: true, shouldValidate: true });
      }
    },
    [gallery, canAddGallery, setValue]
  );

  const removeGalleryImage = useCallback(
    (index: number) => {
      setValue(
        "gallery",
        gallery.filter((_, i) => i !== index),
        { shouldDirty: true, shouldValidate: true }
      );
    },
    [gallery, setValue]
  );

  // Feature flags based on tier
  const canUseVideo = constraints.allowVideo;
  const canUseDemo = constraints.allowDemo;

  // Progress tracking
  const formValues = watch();

  const completedFields = useMemo(() => {
    let count = 0;
    if (formValues.productName?.trim()) count++;
    if (formValues.shortDesc?.trim()) count++;
    if (formValues.mainCategory) count++;
    if (formValues.logo) count++;
    return count;
  }, [formValues]);

  const totalRequiredFields = REQUIRED_FIELDS.length;
  const completionPercentage = Math.round((completedFields / totalRequiredFields) * 100);

  return {
    form,
    isDirty,
    isValid,
    constraints,
    resetForm,
    populateForm,
    getApiValues,
    addCategory,
    removeCategory,
    canAddCategory,
    addFeature,
    removeFeature,
    canAddFeature,
    addLanguage,
    removeLanguage,
    addGalleryImage,
    removeGalleryImage,
    canAddGallery,
    canUseVideo,
    canUseDemo,
    completedFields,
    totalRequiredFields,
    completionPercentage,
  };
}

export default useProductForm;
