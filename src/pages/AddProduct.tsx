import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProductApplications } from "@/contexts/ProductApplicationsContext";
import { getAllCategories } from "@/api/supabaseApi";

// New imports
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
  FormActions,
  CompactFormProgress,
  ProductPreviewCard,
  ProductPreviewDialog,
  UnsavedChangesDialog,
  KeyboardShortcutsDialog,
  SkipLinks,
} from "@/components/product-form";
import { Tier } from "@/lib/types";

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { addApplication } = useProductApplications();

  const vendorTier: Tier = (user?.vendorTier as Tier) || "freemium";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Use the new form hook
  const {
    form,
    isDirty,
    isValid,
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
    tier: vendorTier,
  });

  // Unsaved changes warning
  const { showDialog, confirmLeave, cancelLeave, checkUnsavedChanges } = useUnsavedChanges({
    isDirty,
  });

  // Keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    shortcuts: createProductFormShortcuts({
      onSave: () => handleSubmit(),
      onPreview: () => setShowPreview(true),
      onCancel: () => {
        if (showPreview) setShowPreview(false);
        else if (showShortcuts) setShowShortcuts(false);
        else navigate("/profile?tab=products");
      },
      onShowHelp: () => setShowShortcuts(true),
    }),
  });

  // Fetch categories
  useEffect(() => {
    getAllCategories()
      .then(setAvailableCategories)
      .catch(console.error);
  }, []);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleSubmit = async () => {
    const isFormValid = await form.trigger();
    if (!isFormValid) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const apiValues = getApiValues();
      const mainCategory = form.getValues("mainCategory");
      const categories = form.getValues("categories");

      await addApplication({
        vendorId: user?.vendorId || "",
        name: apiValues.productName,
        shortDescription: apiValues.shortDesc,
        websiteUrl: apiValues.websiteLink || "",
        logo: apiValues.logo,
        motto: undefined, // Not in form
        calendlyLink: canUseDemo ? apiValues.demoLink || undefined : undefined,
        categories: [mainCategory, ...categories].filter(Boolean),
        features: apiValues.features || [],
        galleryImages: canAddGallery ? apiValues.gallery || [] : [],
        productTier: vendorTier,
      });

      toast({
        title: "Başvuru Gönderildi",
        description: "Çözüm başvurunuz alındı. İnceleme sonrası size bilgi vereceğiz.",
      });

      navigate("/profile?tab=applications");
    } catch (err) {
      console.error("[AddProduct] Failed to submit product request:", err);
      const message = err instanceof Error ? err.message : "Lütfen bilgilerinizi kontrol edip tekrar deneyin.";
      toast({
        title: "Başvuru gönderilemedi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const blocked = checkUnsavedChanges(() => navigate("/profile?tab=products"));
    if (!blocked) {
      navigate("/profile?tab=products");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TooltipProvider>
        <SkipLinks />

        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/profile">Profil</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/profile?tab=products">Ürünlerim</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Yeni Ürün Ekle</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile?tab=products")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">
                  Yeni Ürün Ekle
                </h1>
                <p className="text-muted-foreground text-sm">
                  Ürün bilgilerinizi doldurun ve başvurunuzu gönderin
                </p>
              </div>
            </div>

            <Form {...form}>
              <ProductFormLayout>
                <ProductFormMain>
                  {/* Basic Info */}
                  <BasicInfoSection form={form} />

                  {/* Categories */}
                  <CategorySection
                    form={form}
                    categories={availableCategories}
                    tier={vendorTier}
                    addCategory={addCategory}
                    removeCategory={removeCategory}
                    canAddCategory={canAddCategory}
                  />

                  {/* Features */}
                  <FeaturesSection
                    form={form}
                    tier={vendorTier}
                    addFeature={addFeature}
                    removeFeature={removeFeature}
                    canAddFeature={canAddFeature}
                  />

                  {/* Media */}
                  <MediaSection
                    form={form}
                    tier={vendorTier}
                    canUseVideo={canUseVideo}
                    canAddGallery={canAddGallery}
                    addGalleryImage={addGalleryImage}
                    removeGalleryImage={removeGalleryImage}
                  />

                  {/* Links */}
                  <LinksSection
                    form={form}
                    tier={vendorTier}
                    canUseDemo={canUseDemo}
                    addLanguage={addLanguage}
                    removeLanguage={removeLanguage}
                  />

                  {/* Actions */}
                  <Card>
                    <CardContent className="pt-6">
                      <FormActions
                        onSave={handleSubmit}
                        onCancel={handleCancel}
                        onPreview={() => setShowPreview(true)}
                        onShowShortcuts={() => setShowShortcuts(true)}
                        isSaving={isSubmitting}
                        isDirty={isDirty}
                        isValid={isValid}
                        saveLabel="Başvuru Gönder"
                      />
                    </CardContent>
                  </Card>
                </ProductFormMain>

                <ProductFormSidebar>
                  {/* Progress */}
                  <CompactFormProgress
                    completedFields={completedFields}
                    totalRequiredFields={totalRequiredFields}
                    completionPercentage={completionPercentage}
                  />

                  {/* Live Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-heading flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Canli Önizleme
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ProductPreviewCard
                        values={form.watch()}
                        tier={vendorTier}
                        onClick={() => setShowPreview(true)}
                      />

                      {/* Tier Info */}
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Bu ürün{" "}
                          <span className="font-semibold capitalize">
                            {vendorTier}
                          </span>{" "}
                          paketi ile listelenecektir.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </ProductFormSidebar>
              </ProductFormLayout>
            </Form>
          </div>
        </main>

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
          tier={vendorTier}
        />
      </TooltipProvider>

      <Footer />
    </div>
  );
};

export default AddProduct;
