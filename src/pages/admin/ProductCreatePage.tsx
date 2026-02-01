import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Building2,
  Link as LinkIcon,
  Tag,
  Save,
  Loader2,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import ImageUpload from "@/components/admin/ImageUpload";
import { adminCreateProduct, adminSearchVendors } from "@/api/adminProductsApi";
import { getAllCategories } from "@/api/supabaseApi";
import { ProductCategory, VendorSearchResult } from "@/lib/admin-types";
import { Tier } from "@/lib/types";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const [availableCategories, setAvailableCategories] = useState<ProductCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form fields
  const [productName, setProductName] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [mainCategory, setMainCategory] = useState<ProductCategory | "">("");
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [features, setFeatures] = useState("");
  const [logo, setLogo] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [pricing, setPricing] = useState("");
  const [languages, setLanguages] = useState("");
  const [demoLink, setDemoLink] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [listingStatus, setListingStatus] = useState<"pending" | "approved" | "rejected">("pending");

  // Vendor
  const [selectedVendor, setSelectedVendor] = useState<VendorSearchResult | null>(null);
  const [vendorSearchInput, setVendorSearchInput] = useState("");
  const [vendorSearchResults, setVendorSearchResults] = useState<VendorSearchResult[]>([]);
  const [isSearchingVendors, setIsSearchingVendors] = useState(false);
  const debouncedVendorSearch = useDebounce(vendorSearchInput, 300);

  const effectiveTier: Tier = selectedVendor?.subscription || "freemium";
  const maxCategories = effectiveTier === "freemium" ? 1 : 3;

  useEffect(() => {
    window.scrollTo(0, 0);
    getAllCategories().then(setAvailableCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (debouncedVendorSearch.length >= 2) {
      setIsSearchingVendors(true);
      adminSearchVendors(debouncedVendorSearch).then((r) => {
        setVendorSearchResults(r);
        setIsSearchingVendors(false);
      });
    } else {
      setVendorSearchResults([]);
    }
  }, [debouncedVendorSearch]);

  const handleSelectVendor = (vendor: VendorSearchResult) => {
    setSelectedVendor(vendor);
    setVendorSearchInput("");
    setVendorSearchResults([]);
  };

  const validateForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!selectedVendor) e.vendorId = "Vendor seçiniz";
    if (!productName.trim()) e.productName = "Ürün adı zorunludur";
    if (!shortDesc.trim()) e.shortDesc = "Kısa açıklama zorunludur";
    if (!logo.trim()) e.logo = "Logo zorunludur";
    if (!mainCategory) e.mainCategory = "Ana kategori zorunludur";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validateForm() || !selectedVendor) return;

    setIsSaving(true);
    try {
      const featuresArray = features.split(",").map((f) => f.trim()).filter(Boolean);
      const languagesArray = languages.split(",").map((l) => l.trim()).filter(Boolean);

      await adminCreateProduct({
        vendorId: selectedVendor.vendor_id,
        productName: productName.trim(),
        shortDesc: shortDesc.trim(),
        logo: logo.trim(),
        mainCategory: mainCategory as ProductCategory,
        websiteLink: websiteLink.trim() || null,
        longDesc: longDesc.trim() || null,
        categories: categories.length > 0 ? categories : null,
        features: featuresArray.length > 0 ? featuresArray : null,
        videoUrl: videoUrl.trim() || null,
        gallery: gallery.length > 0 ? gallery : null,
        pricing: pricing.trim() || null,
        languages: languagesArray.length > 0 ? languagesArray : null,
        demoLink: demoLink.trim() || null,
        releaseDate: releaseDate.trim() || null,
        listingStatus,
      });

      toast({
        title: "Ürün oluşturuldu",
        description: `"${productName}" ürünü başarıyla eklendi.`,
      });
      navigate("/admin/products/edit");
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Ürün oluşturulamadı",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    selectedVendor,
    productName,
    shortDesc,
    logo,
    mainCategory,
    websiteLink,
    longDesc,
    categories,
    features,
    videoUrl,
    gallery,
    pricing,
    languages,
    demoLink,
    releaseDate,
    listingStatus,
  ]);

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

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/products")}
          className="-ml-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>

        <h1 className="text-3xl font-bold text-foreground">Yeni Ürün Oluştur</h1>
        <p className="text-muted-foreground mt-2 mb-8">Ürün bilgilerini girin ve kaydedin.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Temel Bilgiler</CardTitle>
              </div>
              <CardDescription>Ürün adı, açıklama ve kategoriler</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Ürün Adı *</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className={errors.productName ? "border-red-500" : ""}
                />
                {errors.productName && <p className="text-xs text-red-500">{errors.productName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDesc">Kısa Açıklama *</Label>
                <Textarea
                  id="shortDesc"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  rows={2}
                  className={errors.shortDesc ? "border-red-500" : ""}
                />
                {errors.shortDesc && <p className="text-xs text-red-500">{errors.shortDesc}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="longDesc">Detaylı Açıklama</Label>
                <Textarea
                  id="longDesc"
                  value={longDesc}
                  onChange={(e) => setLongDesc(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Ana Kategori *</Label>
                <Select value={mainCategory} onValueChange={(v: ProductCategory) => setMainCategory(v)}>
                  <SelectTrigger className={errors.mainCategory ? "border-red-500" : ""}>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mainCategory && <p className="text-xs text-red-500">{errors.mainCategory}</p>}
              </div>
              <div className="space-y-2">
                <Label>Ek Kategoriler ({categories.length}/{maxCategories})</Label>
                <Select
                  value=""
                  onValueChange={(v: ProductCategory) => {
                    if (!categories.includes(v) && categories.length < maxCategories) {
                      setCategories([...categories, v]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori ekle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories
                      .filter((c) => !categories.includes(c))
                      .map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((c) => (
                      <Badge
                        key={c}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setCategories(categories.filter((x) => x !== c))}
                      >
                        {c} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Özellikler (virgülle ayırın)</Label>
                <Textarea
                  id="features"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="AI Asistan, Raporlama, Entegrasyonlar..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vendor Atama */}
          <Card className="flex flex-col self-start">
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Vendor Atama</CardTitle>
              </div>
              <CardDescription>Ürünün bağlı olacağı şirket *</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {selectedVendor ? (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {selectedVendor.company_name?.slice(0, 2).toUpperCase() || "V"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{selectedVendor.company_name || "İsimsiz"}</p>
                      <Badge className={`text-[10px] capitalize ${getTierBadgeColor(selectedVendor.subscription)}`}>
                        {selectedVendor.subscription}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedVendor(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-dashed text-center text-muted-foreground">
                  <p className="text-sm">Vendor seçilmedi</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Vendor Ara</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Şirket adı ile ara..."
                    value={vendorSearchInput}
                    onChange={(e) => setVendorSearchInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {isSearchingVendors && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {!isSearchingVendors && vendorSearchResults.length > 0 && (
                <div className="space-y-1 border rounded-lg max-h-[180px] overflow-y-auto">
                  {vendorSearchResults.map((v) => (
                    <div
                      key={v.vendor_id}
                      className="flex items-center justify-between p-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {v.company_name?.slice(0, 2).toUpperCase() || "V"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{v.company_name || "İsimsiz"}</p>
                          <Badge className={`text-[10px] capitalize ${getTierBadgeColor(v.subscription)}`}>
                            {v.subscription}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleSelectVendor(v)}>
                        Seç
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {!isSearchingVendors && vendorSearchInput.length >= 2 && vendorSearchResults.length === 0 && (
                <div className="py-2 text-center text-muted-foreground text-sm">Vendor bulunamadı</div>
              )}
              {errors.vendorId && <p className="text-xs text-red-500">{errors.vendorId}</p>}
            </CardContent>
          </Card>

          {/* Bağlantılar & Medya */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Bağlantılar & Medya</CardTitle>
              </div>
              <CardDescription>Logo, galeri, video ve bağlantılar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Logo *</Label>
                  <ImageUpload value={logo} onChange={setLogo} previewSize="sm" error={errors.logo} />
                  {errors.logo && <p className="text-xs text-red-500">{errors.logo}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteLink">Web Sitesi</Label>
                  <Input
                    id="websiteLink"
                    value={websiteLink}
                    onChange={(e) => setWebsiteLink(e.target.value)}
                    placeholder="https://"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demoLink">Demo Link</Label>
                  <Input
                    id="demoLink"
                    value={demoLink}
                    onChange={(e) => setDemoLink(e.target.value)}
                    placeholder="https://calendly.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricing">Fiyatlandırma</Label>
                  <Input
                    id="pricing"
                    value={pricing}
                    onChange={(e) => setPricing(e.target.value)}
                    placeholder="Free, $99/ay, vb."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages">Desteklenen Diller (virgülle)</Label>
                  <Input
                    id="languages"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="Türkçe, English..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="releaseDate">Yayınlanma Tarihi</Label>
                  <Input
                    id="releaseDate"
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Yayın Durumu</Label>
                  <Select value={listingStatus} onValueChange={(v: "pending" | "approved" | "rejected") => setListingStatus(v)}>
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
              </div>
              <div className="space-y-2">
                <Label>Galeri</Label>
                <ImageUpload multiple value={gallery} onChange={setGallery} maxImages={10} showUrlInput />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kaydet */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Kaydet</CardTitle>
            </div>
            <CardDescription>Ürünü veritabanına ekle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground mb-6">
              <p className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Ürün tier'ı seçilen vendor'ın tier'ına göre belirlenir.
              </p>
              <p>• Oluşturulduktan sonra Ürün Düzenleme sayfasından düzenleyebilirsiniz.</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate("/admin/products")}>
                İptal
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ProductCreatePage;
