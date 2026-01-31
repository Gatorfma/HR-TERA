import { useEffect, useState } from "react";
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
import { Search, Package, Building2, Eye, Layers, Image as ImageIcon, ExternalLink, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminGetProducts, adminUpdateProduct } from "@/api/adminProductsApi";
import { getAllCategories } from "@/api/supabaseApi";
import { AdminProductView, ListingStatus, ProductCategory } from "@/lib/admin-types";
import { Tier } from "@/lib/types";

const PRODUCTS_PER_PAGE = 10;

const ProductEditPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | Tier>("all");
  
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
  const [editedProduct, setEditedProduct] = useState<AdminProductView | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<ProductCategory[]>([]);

  // Fetch products from database
  const fetchProducts = async (page: number = currentPage) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminGetProducts({
        page,
        pageSize: PRODUCTS_PER_PAGE,
        searchQuery: searchQuery || null,
        statusFilter: null,
        tierFilter: tierFilter === "all" ? null : tierFilter,
      });
      
      setProducts(response.products);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
      setCurrentPage(page);
      
      // Auto-select first product if none selected or if selected product is not in list
      if (response.products.length > 0) {
        const selectedStillExists = response.products.some(p => p.product_id === selectedProduct?.product_id);
        if (!selectedProduct || !selectedStillExists) {
          setSelectedProduct(response.products[0]);
          setEditedProduct({ ...response.products[0] });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ürünler yüklenirken hata oluştu");
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts(1);
    // Fetch categories from database
    const fetchCategories = async () => {
      try {
        const categories = await getAllCategories();
        setAvailableCategories(categories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Refetch when filters change (with debounce for search), reset to page 1
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProducts(1);
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, tierFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchProducts(newPage);
    }
  };

  const handleSelectProduct = (product: AdminProductView) => {
    setSelectedProduct(product);
    setEditedProduct({ ...product });
  };

  const handleSaveBasicInfo = async () => {
    if (!editedProduct) return;
    
    setIsSaving(true);
    try {
      await adminUpdateProduct({
        productId: editedProduct.product_id,
        productName: editedProduct.product_name,
        websiteLink: editedProduct.website_link,
        shortDesc: editedProduct.short_desc,
        mainCategory: editedProduct.main_category,
        categories: editedProduct.categories,
        features: editedProduct.features,
        logo: editedProduct.logo,
      });
      
      toast({
        title: "Temel bilgiler güncellendi",
        description: `${editedProduct.product_name} için bilgiler kaydedildi.`,
      });
      
      // Refresh products list
      await fetchProducts();
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

  const handleSaveVisibility = async () => {
    if (!editedProduct) return;
    
    setIsSaving(true);
    try {
      await adminUpdateProduct({
        productId: editedProduct.product_id,
        listingStatus: editedProduct.listing_status,
      });
      
      toast({
        title: "Görünürlük güncellendi",
        description: `${editedProduct.product_name} için durum ayarları kaydedildi.`,
      });
      
      // Refresh products list
      await fetchProducts();
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

  const handleSaveContent = async () => {
    if (!editedProduct) return;
    
    setIsSaving(true);
    try {
      await adminUpdateProduct({
        productId: editedProduct.product_id,
        longDesc: editedProduct.long_desc,
        videoUrl: editedProduct.video_url,
        gallery: editedProduct.gallery,
      });
      
      toast({
        title: "İçerik güncellendi",
        description: `${editedProduct.product_name} için içerik ve medya kaydedildi.`,
      });
      
      // Refresh products list
      await fetchProducts();
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
      case "approved": return "Onaylandı";
      case "pending": return "Beklemede";
      case "rejected": return "Reddedildi";
      default: return status;
    }
  };

  const handleCategoryToggle = (category: ProductCategory) => {
    if (!editedProduct) return;
    const currentCategories = editedProduct.categories || [editedProduct.main_category];
    const maxCategories = editedProduct.subscription === "freemium" ? 1 : 3;
    
    if (currentCategories.includes(category)) {
      if (currentCategories.length > 1) {
        setEditedProduct({
          ...editedProduct,
          categories: currentCategories.filter(c => c !== category),
          main_category: currentCategories.filter(c => c !== category)[0]
        });
      }
    } else if (currentCategories.length < maxCategories) {
      setEditedProduct({
        ...editedProduct,
        categories: [...currentCategories, category],
        main_category: currentCategories[0]
      });
    }
  };

  const handleFeatureChange = (value: string) => {
    if (!editedProduct) return;
    // Split by comma and trim
    const features = value.split(',').map(f => f.trim()).filter(f => f.length > 0);
    setEditedProduct({
      ...editedProduct,
      features: features.length > 0 ? features : null
    });
  };

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
        <p className="text-muted-foreground mt-2 mb-8">Sistemdeki ürün kayıtlarını görüntüleyin ve düzenleyin.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Product List */}
          <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ürünler</CardTitle>
                <CardDescription>Sistemdeki ürün kayıtlarını yönetin</CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Ürün adı, tedarikçi veya kategori ara…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Select value={tierFilter} onValueChange={(v) => setTierFilter(v as typeof tierFilter)}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm tierler</SelectItem>
                      <SelectItem value="freemium">Freemium</SelectItem>
                      <SelectItem value="plus">Plus</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground self-center ml-auto">
                    {totalCount} ürün
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center text-red-500">
                      <p>{error}</p>
                      <Button variant="outline" size="sm" onClick={() => fetchProducts()} className="mt-2">
                        Tekrar Dene
                      </Button>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Ürün bulunamadı
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
                            <p className="font-medium text-sm text-foreground truncate">{product.product_name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {product.company_name || "Sahipsiz / Doğrulanmamış"}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <Badge className={`text-[10px] px-1.5 py-0 capitalize ${getTierBadgeColor(product.subscription)}`}>
                              {product.subscription}
                            </Badge>
                            <Badge className={`text-[10px] px-1.5 py-0 ${getStatusBadgeColor(product.listing_status)}`}>
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
                  <div className="flex items-center justify-between p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Sayfa {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Side - Product Details */}
            <div className="lg:col-span-2 space-y-4">
              {editedProduct ? (
                <>
                  {/* Product Title Header */}
                  <div className="flex items-center gap-3 pb-2 border-b">
                    <Avatar className="h-12 w-12 rounded-lg">
                      <AvatarImage src={editedProduct.logo} className="object-cover" />
                      <AvatarFallback className="bg-primary/20 text-primary rounded-lg">
                        {editedProduct.product_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{editedProduct.product_name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {editedProduct.company_name || "Sahipsiz"} • {editedProduct.main_category}
                      </p>
                    </div>
                    <Badge className={`ml-auto capitalize ${getTierBadgeColor(editedProduct.subscription)}`}>
                      {editedProduct.subscription}
                    </Badge>
                  </div>

                  {/* Temel Bilgiler */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Temel Bilgiler</CardTitle>
                      </div>
                      <CardDescription>Paket kısıtlarını aşmadan temel ürün bilgilerini düzenleyin.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="productName">Ürün Adı *</Label>
                          <Input
                            id="productName"
                            value={editedProduct.product_name}
                            onChange={(e) => setEditedProduct({ ...editedProduct, product_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="websiteUrl">Web Sitesi</Label>
                          <Input
                            id="websiteUrl"
                            value={editedProduct.website_link || ""}
                            onChange={(e) => setEditedProduct({ ...editedProduct, website_link: e.target.value })}
                            placeholder="https://"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Kısa Açıklama *</Label>
                        <Textarea
                          id="description"
                          value={editedProduct.short_desc}
                          onChange={(e) => setEditedProduct({ ...editedProduct, short_desc: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="logo">Logo (Base64 veya URL)</Label>
                        <Input
                          id="logo"
                          value={editedProduct.logo}
                          onChange={(e) => setEditedProduct({ ...editedProduct, logo: e.target.value })}
                          placeholder="data:image/... veya https://..."
                        />
                      </div>

                      {/* Main Category */}
                      <div className="space-y-2">
                        <Label>Ana Kategori *</Label>
                        <Select
                          value={editedProduct.main_category}
                          onValueChange={(value: ProductCategory) =>
                            setEditedProduct({ ...editedProduct, main_category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Categories */}
                      <div className="space-y-2">
                        <Label>
                          Ek Kategoriler ({(editedProduct.categories || []).length}/{editedProduct.subscription === "freemium" ? 1 : 3})
                        </Label>
                        <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                          {availableCategories.map((category) => {
                            const isSelected = (editedProduct.categories || []).includes(category);
                            return (
                              <Badge
                                key={category}
                                variant={isSelected ? "default" : "outline"}
                                className={`cursor-pointer text-xs ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                                onClick={() => handleCategoryToggle(category)}
                              >
                                {category}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        <Label htmlFor="features">Özellikler (virgülle ayırın)</Label>
                        <Textarea
                          id="features"
                          value={(editedProduct.features || []).join(', ')}
                          onChange={(e) => handleFeatureChange(e.target.value)}
                          placeholder="AI Asistan, Raporlama, Entegrasyonlar..."
                          rows={2}
                        />
                      </div>

                      <Button 
                        onClick={handleSaveBasicInfo} 
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isSaving}
                      >
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Kaydet
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Tier & Vendor */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Tier & Vendor</CardTitle>
                      </div>
                      <CardDescription>Ürünün paketini ve sahipliğini görüntüleyin.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tier (Vendor'dan devralınır)</Label>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getTierBadgeColor(editedProduct.subscription)} capitalize`}>
                              {editedProduct.subscription}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Vendor ayarlarından değiştirilebilir
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Vendor</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={editedProduct.company_name || "Sahipsiz"}
                              disabled
                              className="bg-muted flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {editedProduct.is_verified ? "Doğrulanmış vendor" : "Sahipsiz / Doğrulanmamış"}
                        </span>
                        <Badge className={editedProduct.is_verified ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                          {editedProduct.is_verified ? "Doğrulanmış" : "Sahipsiz"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Görünürlük & Durum */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Görünürlük & Durum</CardTitle>
                      </div>
                      <CardDescription>Ürünün listelerde nasıl göründüğünü yönetin.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Yayın Durumu</Label>
                          <Select
                            value={editedProduct.listing_status}
                            onValueChange={(value: ListingStatus) =>
                              setEditedProduct({ ...editedProduct, listing_status: value })
                            }
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
                            value={editedProduct.rating?.toFixed(1) || "N/A"}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Oluşturulma Tarihi</Label>
                          <Input
                            value={new Date(editedProduct.product_created_at).toLocaleDateString('tr-TR')}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Son Güncelleme</Label>
                          <Input
                            value={new Date(editedProduct.product_updated_at).toLocaleDateString('tr-TR')}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleSaveVisibility} 
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isSaving}
                      >
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Kaydet
                      </Button>
                    </CardContent>
                  </Card>

                  {/* İçerik & Medya */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">İçerik & Medya</CardTitle>
                      </div>
                      <CardDescription>Açıklamalar, galeri ve ileri seviye içerikleri düzenleyin.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullDescription">Detaylı Açıklama</Label>
                        <Textarea
                          id="fullDescription"
                          value={editedProduct.long_desc || ""}
                          onChange={(e) => setEditedProduct({ ...editedProduct, long_desc: e.target.value })}
                          rows={4}
                        />
                      </div>

                      {/* Video URL */}
                      <div className="space-y-2">
                        <Label htmlFor="videoUrl">
                          Video URL
                          {editedProduct.subscription !== "premium" && (
                            <span className="text-xs text-muted-foreground ml-2">(Sadece Premium için)</span>
                          )}
                        </Label>
                        <Input
                          id="videoUrl"
                          value={editedProduct.video_url || ""}
                          onChange={(e) => setEditedProduct({ ...editedProduct, video_url: e.target.value })}
                          disabled={editedProduct.subscription !== "premium"}
                          placeholder="https://youtube.com/..."
                          className={editedProduct.subscription !== "premium" ? "bg-muted" : ""}
                        />
                      </div>

                      {/* Demo Link */}
                      <div className="space-y-2">
                        <Label htmlFor="demoLink">Demo Link</Label>
                        <Input
                          id="demoLink"
                          value={editedProduct.demo_link || ""}
                          onChange={(e) => setEditedProduct({ ...editedProduct, demo_link: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>

                      {/* Pricing */}
                      <div className="space-y-2">
                        <Label htmlFor="pricing">Fiyatlandırma</Label>
                        <Input
                          id="pricing"
                          value={editedProduct.pricing || ""}
                          onChange={(e) => setEditedProduct({ ...editedProduct, pricing: e.target.value })}
                          placeholder="Free, $99/ay, vb."
                        />
                      </div>

                      {/* Languages */}
                      <div className="space-y-2">
                        <Label htmlFor="languages">Desteklenen Diller (virgülle ayırın)</Label>
                        <Input
                          id="languages"
                          value={(editedProduct.languages || []).join(', ')}
                          onChange={(e) => setEditedProduct({ 
                            ...editedProduct, 
                            languages: e.target.value.split(',').map(l => l.trim()).filter(l => l.length > 0) 
                          })}
                          placeholder="Türkçe, English, Deutsch..."
                        />
                      </div>

                      <Button 
                        onClick={handleSaveContent} 
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isSaving}
                      >
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Kaydet
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Quick Links */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Hızlı Erişim</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {editedProduct.website_link && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(editedProduct.website_link!, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ürün web sitesine git
                          </Button>
                        )}
                        {editedProduct.demo_link && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(editedProduct.demo_link!, "_blank")}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Demo sayfasına git
                          </Button>
                        )}
                        <div className="w-full text-xs text-muted-foreground mt-2">
                          <span className="font-medium">Product ID:</span> {editedProduct.product_id}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-[400px]">
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                      <p className="text-muted-foreground">Detayları görmek için bir ürün seçin</p>
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
