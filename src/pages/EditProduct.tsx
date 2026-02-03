import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Eye, Loader2 } from "lucide-react";
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
import ListingTierBadge from "@/components/ListingTierBadge";
import { getMyProducts, updateMyProduct, getAllCategories } from "@/api/supabaseApi";

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

interface ApiProduct {
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
  listing_status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  subscription: string;
}

const EditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const vendorTier: Tier = (user?.vendorTier as Tier) || "freemium";

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [originalProduct, setOriginalProduct] = useState<ApiProduct | null>(null);

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Use the new form hook
  const {
    form,
    isDirty,
    isValid,
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
    enabled: !loading,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Fetch categories
  useEffect(() => {
    getAllCategories()
      .then(setAvailableCategories)
      .catch(console.error);
  }, []);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId || !isAuthenticated) return;

      try {
        setLoading(true);
        const products: ApiProduct[] = await getMyProducts();
        const product = products.find((p) => p.product_id === productId);

        if (!product) {
          toast({
            title: "Hata",
            description: "Çözüm bulunamadı veya erişim yetkiniz yok.",
            variant: "destructive",
          });
          navigate("/profile?tab=products");
          return;
        }

        setOriginalProduct(product);

        // Populate form
        populateForm({
          product_name: product.product_name,
          short_desc: product.short_desc,
          long_desc: product.long_desc,
          main_category: product.main_category,
          categories: product.categories,
          features: product.features,
          logo: product.logo || "",
          gallery: product.gallery,
          video_url: product.video_url,
          website_link: product.website_link,
          demo_link: product.demo_link,
          pricing: product.pricing,
          languages: product.languages,
          release_date: product.release_date,
          listing_status: product.listing_status,
        });
      } catch (err) {
        console.error("[EditProduct] Failed to load product:", err);
        toast({
          title: "Hata",
          description: "Çözüm bilgileri yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
        navigate("/profile?tab=products");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, isAuthenticated, navigate, toast, populateForm]);

  const handleSubmit = async () => {
    if (!productId) return;

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

      await updateMyProduct({
        productId,
        productName: apiValues.productName,
        shortDesc: apiValues.shortDesc,
        longDesc: apiValues.longDesc,
        logo: apiValues.logo,
        mainCategory: mainCategory as any,
        websiteLink: apiValues.websiteLink,
        categories: categories.length > 0 ? categories as any : null,
        features: apiValues.features,
        videoUrl: canUseVideo ? apiValues.videoUrl : null,
        gallery: canAddGallery ? apiValues.gallery : null,
        pricing: apiValues.pricing,
        languages: apiValues.languages,
        demoLink: canUseDemo ? apiValues.demoLink : null,
      });

      toast({
        title: "Başarılı",
        description: "Çözüm bilgileri güncellendi.",
      });

      // Reset form dirty state
      form.reset(form.getValues());

      navigate("/profile?tab=products");
    } catch (err) {
      console.error("[EditProduct] Failed to update product:", err);
      const message = err instanceof Error ? err.message : "Lütfen bilgilerinizi kontrol edip tekrar deneyin.";
      toast({
        title: "Güncelleme başarısız",
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

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Çözüm bilgileri yükleniyor...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                  <BreadcrumbPage>
                    {form.watch("productName") || "Ürünü Düzenle"}
                  </BreadcrumbPage>
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
                  Ürünü Düzenle
                </h1>
                <p className="text-muted-foreground text-sm">
                  Ürün bilgilerinizi güncelleyin
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
                        saveLabel="Degisiklikleri Kaydet"
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
                        Canli Onizleme
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

export default EditProduct;
