import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Package,
  Building2,
  Link as LinkIcon,
  Tag,
  Eye,
  Calendar,
  Clock,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import ImageUpload from "@/components/admin/ImageUpload";
import { adminGetProducts, adminUpdateProduct, adminSearchVendors } from "@/api/adminProductsApi";
import { getAllCategories } from "@/api/supabaseApi";
import { AdminProductView, ListingStatus, ProductCategory, VendorSearchResult } from "@/lib/admin-types";
import { Tier } from "@/lib/types";

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

  // Edited form fields
  const [editedProductName, setEditedProductName] = useState("");
  const [editedWebsiteLink, setEditedWebsiteLink] = useState("");
  const [editedShortDesc, setEditedShortDesc] = useState("");
  const [editedLongDesc, setEditedLongDesc] = useState("");
  const [editedMainCategory, setEditedMainCategory] = useState<ProductCategory | "">("");
  const [editedCategories, setEditedCategories] = useState<ProductCategory[]>([]);
  const [editedFeatures, setEditedFeatures] = useState("");
  const [editedLogo, setEditedLogo] = useState("");
  const [editedVideoUrl, setEditedVideoUrl] = useState("");
  const [editedGallery, setEditedGallery] = useState<string[]>([]);
  const [editedPricing, setEditedPricing] = useState("");
  const [editedLanguages, setEditedLanguages] = useState("");
  const [editedDemoLink, setEditedDemoLink] = useState("");
  const [editedReleaseDate, setEditedReleaseDate] = useState("");
  const [editedListingStatus, setEditedListingStatus] = useState<ListingStatus>("pending");

  // Vendor search state
  const [vendorSearchInput, setVendorSearchInput] = useState("");
  const [vendorSearchResults, setVendorSearchResults] = useState<VendorSearchResult[]>([]);
  const [isSearchingVendors, setIsSearchingVendors] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorSearchResult | null>(null);
  const debouncedVendorSearch = useDebounce(vendorSearchInput, 300);

  // Fetch products
  const fetchProducts = useCallback(async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminGetProducts({
        page,
        pageSize: PRODUCTS_PER_PAGE,
        searchQuery: search || null,
        statusFilter: null,
        tierFilter: null,
      });

      setProducts(response.products);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
      setCurrentPage(page);

      // Auto-select first product if none selected
      if (response.products.length > 0 && !selectedProduct) {
        const first = response.products[0];
        setSelectedProduct(first);
        syncFormFields(first);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ürünler yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProduct]);

  // Sync form fields from selected product
  const syncFormFields = (product: AdminProductView) => {
    setEditedProductName(product.product_name || "");
    setEditedWebsiteLink(product.website_link || "");
    setEditedShortDesc(product.short_desc || "");
    setEditedLongDesc(product.long_desc || "");
    setEditedMainCategory(product.main_category || "");
    setEditedCategories(product.categories || []);
    setEditedFeatures((product.features || []).join(", "));
    setEditedLogo(product.logo || "");
    setEditedVideoUrl(product.video_url || "");
    setEditedGallery(product.gallery || []);
    setEditedPricing(product.pricing || "");
    setEditedLanguages((product.languages || []).join(", "));
    setEditedDemoLink(product.demo_link || "");
    setEditedReleaseDate(product.release_date || "");
    setEditedListingStatus(product.listing_status || "pending");
    // Set current vendor info
    setSelectedVendor({
      vendor_id: product.vendor_id,
      company_name: product.company_name,
      subscription: product.subscription,
      is_verified: product.is_verified,
      headquarters: null,
    });
    setVendorSearchInput("");
    setVendorSearchResults([]);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts(1);
    // Fetch categories
    getAllCategories().then(setAvailableCategories).catch(console.error);
  }, []);

  // Refetch when search changes
  useEffect(() => {
    fetchProducts(1, debouncedSearch);
  }, [debouncedSearch]);

  // Search vendors when input changes
  useEffect(() => {
    if (debouncedVendorSearch.length >= 2) {
      setIsSearchingVendors(true);
      adminSearchVendors(debouncedVendorSearch).then((results) => {
        setVendorSearchResults(results);
        setIsSearchingVendors(false);
      });
    } else {
      setVendorSearchResults([]);
    }
  }, [debouncedVendorSearch]);

  const handleSelectProduct = (product: AdminProductView) => {
    setSelectedProduct(product);
    syncFormFields(product);
  };

  const handleSelectVendor = (vendor: VendorSearchResult) => {
    setSelectedVendor(vendor);
    setVendorSearchInput("");
    setVendorSearchResults([]);
  };

  const handleSave = async () => {
    if (!selectedProduct) return;

    setIsSaving(true);
    try {
      // Parse arrays
      const featuresArray = editedFeatures.split(",").map((f) => f.trim()).filter((f) => f);
      const languagesArray = editedLanguages.split(",").map((l) => l.trim()).filter((l) => l);

      // Check if vendor changed
      const vendorChanged = selectedVendor?.vendor_id !== selectedProduct.vendor_id;

      await adminUpdateProduct({
        productId: selectedProduct.product_id,
        vendorId: vendorChanged ? selectedVendor?.vendor_id : null,
        productName: editedProductName || null,
        websiteLink: editedWebsiteLink || null,
        shortDesc: editedShortDesc || null,
        longDesc: editedLongDesc || null,
        mainCategory: editedMainCategory || null,
        categories: editedCategories.length > 0 ? editedCategories : null,
        features: featuresArray.length > 0 ? featuresArray : null,
        logo: editedLogo || null,
        videoUrl: editedVideoUrl || null,
        gallery: editedGallery.length > 0 ? editedGallery : null,
        pricing: editedPricing || null,
        languages: languagesArray.length > 0 ? languagesArray : null,
        demoLink: editedDemoLink || null,
        releaseDate: editedReleaseDate || null,
        listingStatus: editedListingStatus || null,
      });

      const vendorMsg = vendorChanged ? " Vendor değiştirildi." : "";
      toast({
        title: "Ürün güncellendi",
        description: `${editedProductName} bilgileri kaydedildi.${vendorMsg}`,
      });

      // Refresh list and update selected product
      await fetchProducts(currentPage, debouncedSearch);
      
      // Update selectedProduct with new vendor info
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("tr-TR");
  };

  // Effective tier from selected vendor
  const effectiveTier = selectedVendor?.subscription || "freemium";
  const maxCategories = effectiveTier === "freemium" ? 1 : 3;

  // Loading skeleton
  const ProductListSkeleton = () => (
    <div className="space-y-2 p-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded" />
        </div>
      ))}
    </div>
  );

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
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/products")}
          className="-ml-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>

        <h1 className="text-3xl font-bold text-foreground">Ürün Düzenleme</h1>
        <p className="text-muted-foreground mt-2 mb-8">
          Sistemdeki ürün kayıtlarını görüntüleyin ve düzenleyin.
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
                  placeholder="Ürün adı ara…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
              <ScrollArea className="flex-1">
                {isLoading ? (
                  <ProductListSkeleton />
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
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          selectedProduct?.product_id === product.product_id
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

          {/* Right Side - Product Details */}
          <div className="lg:col-span-2 space-y-4">
            {selectedProduct ? (
              <>
                {/* Ürün Bilgileri (readonly) */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Ürün Bilgileri</CardTitle>
                    </div>
                    <CardDescription>Ürün detayları (salt okunur)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Oluşturulma Tarihi
                        </Label>
                        <Input
                          value={formatDate(selectedProduct.product_created_at)}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Son Güncelleme
                        </Label>
                        <Input
                          value={formatDate(selectedProduct.product_updated_at)}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Yayın Durumu</Label>
                        <Select
                          value={editedListingStatus}
                          onValueChange={(value: ListingStatus) => setEditedListingStatus(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Beklemede</SelectItem>
                            <SelectItem value="approved">Onaylandı</SelectItem>
                            <SelectItem value="rejected">Reddedildi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <Input
                          value={selectedProduct.rating?.toFixed(1) || "N/A"}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vendor Atama */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Vendor Atama</CardTitle>
                      {selectedVendor?.vendor_id !== selectedProduct.vendor_id && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                          Değiştirildi
                        </Badge>
                      )}
                    </div>
                    <CardDescription>Ürünün bağlı olduğu şirket</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current vendor */}
                    {selectedVendor ? (
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/20 text-primary text-xs">
                              {selectedVendor.company_name?.slice(0, 2).toUpperCase() || "V"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {selectedVendor.company_name || "İsimsiz Vendor"}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`text-[10px] capitalize ${getTierBadgeColor(
                                  selectedVendor.subscription
                                )}`}
                              >
                                {selectedVendor.subscription}
                              </Badge>
                              {selectedVendor.is_verified && (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                        {selectedVendor.vendor_id !== selectedProduct.vendor_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Reset to original vendor
                              setSelectedVendor({
                                vendor_id: selectedProduct.vendor_id,
                                company_name: selectedProduct.company_name,
                                subscription: selectedProduct.subscription,
                                is_verified: selectedProduct.is_verified,
                                headquarters: null,
                              });
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg border border-dashed text-center text-muted-foreground">
                        <p className="text-sm">Vendor bağlı değil</p>
                      </div>
                    )}

                    {/* Vendor search */}
                    <div className="space-y-2">
                      <Label>Vendor Ara</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Şirket adı ile ara..."
                          value={vendorSearchInput}
                          onChange={(e) => setVendorSearchInput(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Search results */}
                    {isSearchingVendors && (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    )}

                    {!isSearchingVendors && vendorSearchResults.length > 0 && (
                      <div className="space-y-1 border rounded-lg max-h-[200px] overflow-y-auto">
                        {vendorSearchResults.map((vendor) => (
                          <div
                            key={vendor.vendor_id}
                            className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                  {vendor.company_name?.slice(0, 2).toUpperCase() || "V"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {vendor.company_name || "İsimsiz"}
                                </p>
                                <Badge
                                  className={`text-[10px] capitalize ${getTierBadgeColor(
                                    vendor.subscription
                                  )}`}
                                >
                                  {vendor.subscription}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSelectVendor(vendor)}
                            >
                              Seç
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isSearchingVendors &&
                      vendorSearchInput.length >= 2 &&
                      vendorSearchResults.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          Vendor bulunamadı
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Temel Bilgiler */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Temel Bilgiler</CardTitle>
                    </div>
                    <CardDescription>Ürün bilgilerini düzenleyin</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productName">Ürün Adı *</Label>
                        <Input
                          id="productName"
                          value={editedProductName}
                          onChange={(e) => setEditedProductName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="websiteLink">Web Sitesi</Label>
                        <Input
                          id="websiteLink"
                          value={editedWebsiteLink}
                          onChange={(e) => setEditedWebsiteLink(e.target.value)}
                          placeholder="https://"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="shortDesc">Kısa Açıklama *</Label>
                        <Textarea
                          id="shortDesc"
                          value={editedShortDesc}
                          onChange={(e) => setEditedShortDesc(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="longDesc">Detaylı Açıklama</Label>
                        <Textarea
                          id="longDesc"
                          value={editedLongDesc}
                          onChange={(e) => setEditedLongDesc(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ana Kategori *</Label>
                        <Select
                          value={editedMainCategory}
                          onValueChange={(value: ProductCategory) => setEditedMainCategory(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Ek Kategoriler ({editedCategories.length}/{maxCategories})
                        </Label>
                        <Select
                          value=""
                          onValueChange={(value: ProductCategory) => {
                            if (!editedCategories.includes(value) && editedCategories.length < maxCategories) {
                              setEditedCategories([...editedCategories, value]);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kategori ekle..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCategories
                              .filter((c) => !editedCategories.includes(c))
                              .map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {editedCategories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {editedCategories.map((cat) => (
                              <Badge
                                key={cat}
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() =>
                                  setEditedCategories(editedCategories.filter((c) => c !== cat))
                                }
                              >
                                {cat} <X className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="features">Özellikler (virgülle ayırın)</Label>
                        <Textarea
                          id="features"
                          value={editedFeatures}
                          onChange={(e) => setEditedFeatures(e.target.value)}
                          placeholder="AI Asistan, Raporlama, Entegrasyonlar..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bağlantılar & Medya */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Bağlantılar & Medya</CardTitle>
                    </div>
                    <CardDescription>Logo, video ve galeri</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Logo *</Label>
                        <ImageUpload
                          value={editedLogo}
                          onChange={(value) => setEditedLogo(value)}
                          previewSize="sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="demoLink">Demo Link</Label>
                        <Input
                          id="demoLink"
                          value={editedDemoLink}
                          onChange={(e) => setEditedDemoLink(e.target.value)}
                          placeholder="https://calendly.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="videoUrl">Video URL</Label>
                        <Input
                          id="videoUrl"
                          value={editedVideoUrl}
                          onChange={(e) => setEditedVideoUrl(e.target.value)}
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pricing">Fiyatlandırma</Label>
                        <Input
                          id="pricing"
                          value={editedPricing}
                          onChange={(e) => setEditedPricing(e.target.value)}
                          placeholder="Free, $99/ay, vb."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="languages">Desteklenen Diller (virgülle)</Label>
                        <Input
                          id="languages"
                          value={editedLanguages}
                          onChange={(e) => setEditedLanguages(e.target.value)}
                          placeholder="Türkçe, English..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="releaseDate">Yayınlanma Tarihi</Label>
                        <Input
                          id="releaseDate"
                          type="date"
                          value={editedReleaseDate}
                          onChange={(e) => setEditedReleaseDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Galeri</Label>
                        <ImageUpload
                          multiple
                          value={editedGallery}
                          onChange={(value) => setEditedGallery(value)}
                          maxImages={10}
                          showUrlInput={true}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Kaydet
                    </Button>
                  </CardContent>
                </Card>
              </>
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
    </AdminLayout>
  );
};

export default ProductEditPage;
