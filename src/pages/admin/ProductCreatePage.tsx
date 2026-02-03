import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Save, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminCreateProduct, adminGetVendors } from "@/api/adminProductsApi";
import { getAllCategories } from "@/api/supabaseApi";
import { ProductCategory, VendorSearchResult } from "@/lib/admin-types";
import { Tier } from "@/lib/types";

// New imports from product-form components
import { useProductForm } from "@/hooks/useProductForm";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useKeyboardShortcuts, createProductFormShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  ProductFormLayout,
  ProductFormMain,
  ProductFormSidebar,
  BasicInfoSection,
  CategorySection,
  FeaturesSection,
  MediaSection,
  LinksSection,
  VendorAssignSection,
  StatusSection,
  FormActions,
  UnsavedChangesDialog,
  KeyboardShortcutsDialog,
  ProductPreviewDialog,
  ProductPreviewCard,
  SkipLinks,
  CompactFormProgress,
} from "@/components/product-form";

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const [availableCategories, setAvailableCategories] = useState<ProductCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Vendor state
  const [selectedVendor, setSelectedVendor] = useState<VendorSearchResult | null>(null);
  const [vendorError, setVendorError] = useState<string | undefined>();

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Get effective tier from selected vendor
  const effectiveTier: Tier = selectedVendor?.subscription || "freemium";

  // Use the new form hook
  const {
    form,
    isDirty,
    isValid,
    constraints,
    resetForm,
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
  } = useProductForm({
    tier: effectiveTier,
  });

  // Unsaved changes warning
  const { showDialog, confirmLeave, cancelLeave, checkUnsavedChanges } = useUnsavedChanges({
    isDirty,
  });

  // Keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    shortcuts: createProductFormShortcuts({
      onSave: () => handleSave(),
      onPreview: () => setShowPreview(true),
      onCancel: () => {
        if (showPreview) setShowPreview(false);
        else if (showShortcuts) setShowShortcuts(false);
        else navigate("/admin/products");
      },
      onShowHelp: () => setShowShortcuts(true),
    }),
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    getAllCategories().then(setAvailableCategories).catch(console.error);
  }, []);


  // Handle vendor selection
  const handleSelectVendor = (vendor: VendorSearchResult) => {
    setSelectedVendor(vendor);
    setVendorError(undefined);
  };

  // Clear vendor
  const handleClearVendor = () => {
    setSelectedVendor(null);
  };

  // Handle save
  const handleSave = useCallback(async () => {
    // Validate vendor first
    if (!selectedVendor) {
      setVendorError("Vendor seciniz");
      toast({
        title: "Validasyon Hatası",
        description: "Lütfen bir vendor seçin",
        variant: "destructive",
      });
      return;
    }

    const isFormValid = await form.trigger();
    if (!isFormValid) {
      toast({
        title: "Validasyon Hatası",
        description: "Lütfen tüm zorunlu alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const apiValues = getApiValues();

      await adminCreateProduct({
        vendorId: selectedVendor.vendor_id,
        productName: apiValues.productName,
        shortDesc: apiValues.shortDesc,
        logo: apiValues.logo,
        mainCategory: apiValues.mainCategory,
        websiteLink: apiValues.websiteLink || undefined,
        longDesc: apiValues.longDesc || undefined,
        categories: apiValues.categories || undefined,
        features: apiValues.features || undefined,
        videoUrl: apiValues.videoUrl || undefined,
        gallery: apiValues.gallery || undefined,
        pricing: apiValues.pricing || undefined,
        languages: apiValues.languages || undefined,
        demoLink: apiValues.demoLink || undefined,
        listingStatus: apiValues.listingStatus || 'pending',
      });

      toast({
        title: "Ürün oluşturuldu",
        description: `"${apiValues.productName}" ürünü başarıyla eklendi.`,
      });

      navigate("/admin/products");
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err?.message || "Ürün oluşturulamadı",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [selectedVendor, form, getApiValues, navigate]);

  // Handle cancel with unsaved changes check
  const handleCancel = () => {
    const blocked = checkUnsavedChanges(() => navigate("/admin/products"));
    if (!blocked) {
      navigate("/admin/products");
    }
  };

  return (
    <AdminLayout>
      <TooltipProvider>
        <SkipLinks />

        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/admin">Admin</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/admin/products">Ürünler</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Yeni Ürün</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-3xl font-bold text-foreground">Yeni Ürün Oluştur</h1>
          <p className="text-muted-foreground mt-2 mb-8">
            Ürün bilgilerini girin ve kaydedin.
          </p>

          <Form {...form}>
            <ProductFormLayout>
              <ProductFormMain>
                {/* Vendor Assignment - Required for create */}
                <VendorAssignSection
                  selectedVendor={selectedVendor}
                  onSelectVendor={handleSelectVendor}
                  onClearVendor={handleClearVendor}
                  searchVendors={adminGetVendors}
                  error={vendorError}
                />

                {/* Basic Info */}
                <BasicInfoSection form={form} />

                {/* Categories */}
                <CategorySection
                  form={form}
                  categories={availableCategories}
                  tier={effectiveTier}
                  addCategory={addCategory}
                  removeCategory={removeCategory}
                  canAddCategory={canAddCategory}
                />

                {/* Features */}
                <FeaturesSection
                  form={form}
                  tier={effectiveTier}
                  addFeature={addFeature}
                  removeFeature={removeFeature}
                  canAddFeature={canAddFeature}
                />

                {/* Media */}
                <MediaSection
                  form={form}
                  tier={effectiveTier}
                  canUseVideo={canUseVideo}
                  canAddGallery={canAddGallery}
                  addGalleryImage={addGalleryImage}
                  removeGalleryImage={removeGalleryImage}
                />

                {/* Links */}
                <LinksSection
                  form={form}
                  tier={effectiveTier}
                  canUseDemo={canUseDemo}
                  addLanguage={addLanguage}
                  removeLanguage={removeLanguage}
                  mode="create"
                />

                {/* Status */}
                <StatusSection form={form} />

                {/* Save Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Save className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Kaydet</CardTitle>
                    </div>
                    <CardDescription>Urunu sisteme ekleyin</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormActions
                      onSave={handleSave}
                      onCancel={handleCancel}
                      onPreview={() => setShowPreview(true)}
                      onShowShortcuts={() => setShowShortcuts(true)}
                      isSaving={isSaving}
                      isDirty={isDirty}
                      isValid={isValid && !!selectedVendor}
                      saveLabel="Oluştur"
                    />
                  </CardContent>
                </Card>
              </ProductFormMain>

              <ProductFormSidebar>
                {/* Progress */}
                <CompactFormProgress
                  completedFields={completedFields + (selectedVendor ? 1 : 0)}
                  totalRequiredFields={totalRequiredFields + 1}
                  completionPercentage={Math.round(
                    ((completedFields + (selectedVendor ? 1 : 0)) /
                      (totalRequiredFields + 1)) *
                    100
                  )}
                />

                {/* Preview Card */}
                <ProductPreviewCard
                  values={form.watch()}
                  tier={effectiveTier}
                  onClick={() => setShowPreview(true)}
                />
              </ProductFormSidebar>
            </ProductFormLayout>
          </Form>
        </div>

        {/* Dialogs */}
        <UnsavedChangesDialog
          open={showDialog}
          onConfirm={confirmLeave}
          onCancel={cancelLeave}
        />

        <KeyboardShortcutsDialog
          open={showShortcuts}
          onOpenChange={setShowShortcuts}
          shortcuts={shortcuts}
        />

        <ProductPreviewDialog
          open={showPreview}
          onOpenChange={setShowPreview}
          values={form.getValues()}
          tier={effectiveTier}
          companyName={selectedVendor?.company_name || undefined}
        />
      </TooltipProvider>
    </AdminLayout>
  );
};

export default ProductCreatePage;
