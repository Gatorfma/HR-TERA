import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form } from "@/components/ui/form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Search,
  Package,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminGetProducts, adminUpdateProduct, adminGetVendors } from "@/api/adminProductsApi";
import { getAllCategories } from "@/api/supabaseApi";
import { AdminProductView, ListingStatus, ProductCategory, VendorSearchResult } from "@/lib/admin-types";
import { Tier } from "@/lib/types";

// New imports from product-form components
import { useProductForm } from "@/hooks/useProductForm";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useKeyboardShortcuts, createProductFormShortcuts } from "@/hooks/useKeyboardShortcuts";
import { apiProductToFormValues, formValuesToApiProduct } from "@/lib/schemas/product.schema";
import {
  BasicInfoSection,
  CategorySection,
  FeaturesSection,
  MediaSection,
  LinksSection,
  VendorAssignSection,
  StatusSection,
  FormActions,
  ProductListSkeleton,
  UnsavedChangesDialog,
  KeyboardShortcutsDialog,
  ProductPreviewDialog,
  SkipLinks,
  CompactFormProgress,
} from "@/components/product-form";

const PRODUCTS_PER_PAGE = 20;

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const ProductEditPage = () => {
  const navigate = useNavigate();

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Products state
  const [products, setProducts] = useState<AdminProductView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected product state
  const [selectedProduct, setSelectedProduct] = useState<AdminProductView | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<ProductCategory[]>([]);

  // Vendor state
  const [selectedVendor, setSelectedVendor] = useState<VendorSearchResult | null>(null);

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
      },
      onShowHelp: () => setShowShortcuts(true),
    }),
    enabled: !!selectedProduct,
  });

  // Ürün seçimi ve form doldurma
  const doSelectProduct = useCallback((product: AdminProductView) => {
    setSelectedProduct(product);

    // Form'u ürün verileriyle doldur
    populateForm({
      product_name: product.product_name,
      short_desc: product.short_desc,
      long_desc: product.long_desc,
      main_category: product.main_category,
      categories: product.categories,
      features: product.features,
      logo: product.logo,
      gallery: product.gallery,
      video_url: product.video_url,
      website_link: product.website_link,
      demo_link: product.demo_link,
      pricing: product.pricing,
      languages: product.languages,
      release_date: product.release_date,
      listing_status: product.listing_status,
      rating: product.rating,
    });

    // Vendor bilgilerini ayarla
    setSelectedVendor({
      vendor_id: product.vendor_id,
      company_name: product.company_name,
      subscription: product.subscription,
      is_verified: product.is_verified,
      headquarters: null,
    });
  }, [populateForm]);

  // Kaydedilmemiş değişiklik kontrolüyle ürün seçimi
  const handleSelectProduct = useCallback((product: AdminProductView) => {
    // Aynı ürün seçiliyse bir şey yapma
    if (selectedProduct?.product_id === product.product_id) return;

    // Geçiş yapmadan önce kaydedilmemiş değişiklikleri kontrol et
    const blocked = checkUnsavedChanges(() => doSelectProduct(product));
    if (!blocked) {
      doSelectProduct(product);
    }
  }, [selectedProduct, checkUnsavedChanges, doSelectProduct]);

  // Ürünleri getir
  const fetchProducts = useCallback(async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminGetProducts({
        page,
        pageSize: PRODUCTS_PER_PAGE,
        searchQuery: search || undefined,
      });

      setProducts(response.products);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
      setCurrentPage(page);

      // Hiç ürün seçili değilse ilk ürünü otomatik seç
      if (response.products.length > 0 && !selectedProduct) {
        const first = response.products[0];
        doSelectProduct(first);
      }
    } catch (err: any) {
      setError(err?.message || "Ürünler yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProduct, doSelectProduct]);

  // Handle vendor selection
  const handleSelectVendor = (vendor: VendorSearchResult) => {
    setSelectedVendor(vendor);
  };

  // Clear vendor (reset to original)
  const handleClearVendor = () => {
    setSelectedVendor(null);
  };


  // Handle save
  const handleSave = async () => {
    if (!selectedProduct) return;

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
      const vendorChanged = selectedVendor?.vendor_id !== selectedProduct.vendor_id;

      await adminUpdateProduct({
        productId: selectedProduct.product_id,
        vendorId: vendorChanged ? selectedVendor?.vendor_id : undefined,
        productName: apiValues.productName,
        websiteLink: apiValues.websiteLink || undefined,
        shortDesc: apiValues.shortDesc,
        longDesc: apiValues.longDesc || undefined,
        mainCategory: apiValues.mainCategory,
        categories: apiValues.categories || undefined,
        features: apiValues.features || undefined,
        logo: apiValues.logo,
        videoUrl: apiValues.videoUrl || undefined,
        gallery: apiValues.gallery || undefined,
        pricing: apiValues.pricing || undefined,
        languages: apiValues.languages || undefined,
        demoLink: apiValues.demoLink || undefined,
        releaseDate: apiValues.releaseDate || undefined,
        listingStatus: apiValues.listingStatus,
        rating: apiValues.rating,
      });

      const vendorMsg = vendorChanged ? " Şirket değiştirildi." : "";
      toast({
        title: "Ürün güncellendi",
        description: `${apiValues.productName} bilgileri kaydedildi.${vendorMsg}`,
      });

      // Refresh list
      await fetchProducts(currentPage, debouncedSearch);

      // Reset form dirty state
      form.reset(form.getValues());

      // Update selected product with new vendor info
      if (vendorChanged && selectedVendor) {
        setSelectedProduct((prev) =>
          prev
            ? {
              ...prev,
              vendor_id: selectedVendor.vendor_id,
              company_name: selectedVendor.company_name,
              subscription: selectedVendor.subscription,
              is_verified: selectedVendor.is_verified,
            }
            : null
        );
      }
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Kaydetme başarısız oldu",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel - revert to original product data
  const handleCancel = () => {
    if (selectedProduct) {
      doSelectProduct(selectedProduct);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts(1);
    getAllCategories().then(setAvailableCategories).catch(console.error);
  }, []);

  // Refetch when search changes
  useEffect(() => {
    fetchProducts(1, debouncedSearch);
  }, [debouncedSearch]);

  const getTierBadgeColor = (tier: Tier) => {
    switch (tier) {
      case "premium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "plus":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-green-100 text-green-800 border-green-300";
    }
  };

  const getStatusBadgeColor = (status: ListingStatus) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = (status: ListingStatus) => {
    switch (status) {
      case "approved":
        return "Onaylandı";
      case "pending":
        return "Beklemede";
      case "rejected":
        return "Reddedildi";
      default:
        return status;
    }
  };

  // Error state
  if (error && !isLoading && products.length === 0) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg text-foreground">Hata</h3>
                <p className="text-muted-foreground mt-1">{error}</p>
              </div>
              <Button onClick={() => fetchProducts(1)}>Tekrar Dene</Button>
            </div>
          </Card>
        </div>
      </AdminLayout>
    );
  }

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
                <BreadcrumbPage>
                  {selectedProduct?.product_name || "Ürün Düzenleme"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-3xl font-bold text-foreground">Ürün Düzenleme</h1>
          <p className="text-muted-foreground mt-2 mb-8">
            Sistemdeki ürün kayıtlarını görüntüleyip düzenleyin.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Product List */}
            <Card className="lg:col-span-1 flex flex-col max-h-[80vh]">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-lg">Ürünler</CardTitle>
                <CardDescription>
                  Sistemdeki ürünleri yönetin ({totalCount} ürün)
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Ürün adı ara..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
                <ScrollArea className="flex-1">
                  {isLoading ? (
                    <ProductListSkeleton count={5} />
                  ) : products.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <p>Ürün bulunamadı.</p>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {products.map((product) => (
                        <button
                          key={product.product_id}
                          onClick={() => handleSelectProduct(product)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${selectedProduct?.product_id === product.product_id
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted"
                            }`}
                        >
                          <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarImage src={product.logo} className="object-cover" />
                            <AvatarFallback className="bg-primary/20 text-primary text-sm rounded-lg">
                              {product.product_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {product.product_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {product.company_name || "Sahipsiz"}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <Badge
                              className={`text-[10px] px-1.5 py-0 capitalize ${getTierBadgeColor(
                                product.subscription
                              )}`}
                            >
                              {product.subscription}
                            </Badge>
                            <Badge
                              className={`text-[10px] px-1.5 py-0 ${getStatusBadgeColor(
                                product.listing_status
                              )}`}
                            >
                              {getStatusLabel(product.listing_status)}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-3 border-t flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchProducts(currentPage - 1, debouncedSearch)}
                      disabled={currentPage <= 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchProducts(currentPage + 1, debouncedSearch)}
                      disabled={currentPage >= totalPages || isLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Side - Product Form */}
            <div className="lg:col-span-2 space-y-4">
              {selectedProduct ? (
                <Form {...form}>
                  {/* Progress indicator */}
                  <CompactFormProgress
                    completedFields={completedFields}
                    totalRequiredFields={totalRequiredFields}
                    completionPercentage={completionPercentage}
                  />

                  {/* Status Section */}
                  <StatusSection
                    form={form}
                    createdAt={selectedProduct.product_created_at}
                    updatedAt={selectedProduct.product_updated_at}
                    rating={selectedProduct.rating}
                  />

                  {/* Vendor Assignment */}
                  <VendorAssignSection
                    selectedVendor={selectedVendor}
                    onSelectVendor={handleSelectVendor}
                    onClearVendor={handleClearVendor}
                    searchVendors={adminGetVendors}
                    originalVendorId={selectedProduct.vendor_id}
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
                    mode="edit"
                  />

                  {/* Actions */}
                  <Card id="form-actions">
                    <CardContent className="pt-6">
                      <FormActions
                        onSave={handleSave}
                        onCancel={handleCancel}
                        onPreview={() => setShowPreview(true)}
                        onShowShortcuts={() => setShowShortcuts(true)}
                        isSaving={isSaving}
                        isDirty={isDirty}
                        isValid={isValid}
                      />
                    </CardContent>
                  </Card>
                </Form>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-[400px]">
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <p className="text-muted-foreground">
                        Detayları görmek için bir ürün seçin
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
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

export default ProductEditPage;
