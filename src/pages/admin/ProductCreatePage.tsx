import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Link as LinkIcon, Tag, Sparkles, Save, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminCreateProduct, adminLookupVendor } from "@/api/adminProductsApi";
import { getAllCategories } from "@/api/supabaseApi";
import { ProductCategory, AdminVendorLookup } from "@/lib/admin-types";
import { Tier } from "@/lib/types";

interface FormData {
  vendorId: string;
  productName: string;
  shortDesc: string;
  longDesc: string;
  websiteUrl: string;
  demoLink: string;
  logo: string;
  galleryUrls: string;
  mainCategory: ProductCategory | "";
  categories: ProductCategory[];
  features: string[];
  pricing: string;
  languages: string;
}

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    vendorId: "",
    productName: "",
    shortDesc: "",
    longDesc: "",
    websiteUrl: "",
    demoLink: "",
    logo: "",
    galleryUrls: "",
    mainCategory: "",
    categories: [],
    features: [],
    pricing: "",
    languages: "",
  });

  const [vendorStatus, setVendorStatus] = useState<"none" | "loading" | "valid" | "invalid">("none");
  const [resolvedVendor, setResolvedVendor] = useState<AdminVendorLookup | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categorySearch, setCategorySearch] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
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

  // Determine effective tier
  const effectiveTier: Tier = resolvedVendor?.subscription || "freemium";
  const maxCategories = effectiveTier === "freemium" ? 1 : 3;

  // Handle Vendor ID blur - lookup vendor
  const handleVendorIdBlur = async () => {
    if (!formData.vendorId.trim()) {
      setVendorStatus("none");
      setResolvedVendor(null);
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(formData.vendorId.trim())) {
      setVendorStatus("invalid");
      setResolvedVendor(null);
      return;
    }

    setVendorStatus("loading");
    try {
      const vendor = await adminLookupVendor(formData.vendorId.trim());
      if (vendor) {
        setVendorStatus("valid");
        setResolvedVendor(vendor);
      } else {
        setVendorStatus("invalid");
        setResolvedVendor(null);
      }
    } catch (err) {
      setVendorStatus("invalid");
      setResolvedVendor(null);
    }
  };

  const handleCategoryToggle = (category: ProductCategory) => {
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(c => c !== category)
      });
    } else if (formData.categories.length < maxCategories) {
      setFormData({
        ...formData,
        categories: [...formData.categories, category]
      });
    }
  };

  const handleAddFeature = () => {
    const feature = featureInput.trim();
    if (feature && formData.features.length < 10 && !formData.features.includes(feature)) {
      setFormData({
        ...formData,
        features: [...formData.features, feature]
      });
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter(f => f !== feature)
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendorId.trim()) {
      newErrors.vendorId = "Vendor ID zorunludur";
    } else if (vendorStatus !== "valid") {
      newErrors.vendorId = "Geçerli bir Vendor ID giriniz";
    }
    if (!formData.productName.trim()) {
      newErrors.productName = "Ürün adı zorunludur";
    }
    if (!formData.shortDesc.trim()) {
      newErrors.shortDesc = "Kısa açıklama zorunludur";
    }
    if (!formData.logo.trim()) {
      newErrors.logo = "Logo zorunludur";
    }
    if (!formData.mainCategory) {
      newErrors.mainCategory = "Ana kategori zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Hata",
        description: "Lütfen zorunlu alanları doldurunuz.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Parse gallery URLs
      const galleryArray = formData.galleryUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      // Parse languages
      const languagesArray = formData.languages
        .split(',')
        .map(lang => lang.trim())
        .filter(lang => lang.length > 0);

      const productId = await adminCreateProduct({
        vendorId: formData.vendorId.trim(),
        productName: formData.productName.trim(),
        shortDesc: formData.shortDesc.trim(),
        logo: formData.logo.trim(),
        mainCategory: formData.mainCategory as ProductCategory,
        websiteLink: formData.websiteUrl.trim() || null,
        longDesc: formData.longDesc.trim() || null,
        categories: formData.categories.length > 0 ? formData.categories : null,
        features: formData.features.length > 0 ? formData.features : null,
        gallery: galleryArray.length > 0 ? galleryArray : null,
        pricing: formData.pricing.trim() || null,
        languages: languagesArray.length > 0 ? languagesArray : null,
        demoLink: formData.demoLink.trim() || null,
        listingStatus: "pending",
      });

      toast({
        title: "Ürün başarıyla oluşturuldu",
        description: `"${formData.productName}" ürünü ${effectiveTier} tier'ında eklendi.`,
      });

      // Navigate to edit page for the new product
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
  };

  const filteredCategories = availableCategories.filter(c =>
    c.toLowerCase().includes(categorySearch.toLowerCase())
  );

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

        <h1 className="text-3xl font-bold text-foreground">Yeni Ürün Oluştur</h1>
        <p className="text-muted-foreground mt-2 mb-8">Ürünü hızlıca ekleyin.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Kimlik Bilgileri */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Kimlik Bilgileri</CardTitle>
                    <CardDescription>Temel ürün bilgileri</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Vendor ID */}
                <div className="space-y-2">
                  <Label htmlFor="vendorId">Vendor ID *</Label>
                  <Input
                    id="vendorId"
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    onBlur={handleVendorIdBlur}
                    placeholder="Vendor UUID"
                    className={errors.vendorId ? "border-red-500" : ""}
                  />
                  {vendorStatus === "loading" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Vendor aranıyor...</span>
                    </div>
                  )}
                  {vendorStatus === "valid" && resolvedVendor && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        Vendor: {resolvedVendor.company_name || "İsimsiz"} 
                        <Badge className="ml-2 capitalize">{resolvedVendor.subscription}</Badge>
                      </span>
                    </div>
                  )}
                  {vendorStatus === "invalid" && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>Geçersiz Vendor ID</span>
                    </div>
                  )}
                  {errors.vendorId && (
                    <p className="text-xs text-red-500">{errors.vendorId}</p>
                  )}
                </div>

                {/* Ürün Adı */}
                <div className="space-y-2">
                  <Label htmlFor="productName">Ürün Adı *</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="Ürün adı"
                    className={errors.productName ? "border-red-500" : ""}
                  />
                  {errors.productName && (
                    <p className="text-xs text-red-500">{errors.productName}</p>
                  )}
                </div>

                {/* Kısa Açıklama */}
                <div className="space-y-2">
                  <Label htmlFor="shortDesc">Kısa Açıklama *</Label>
                  <Textarea
                    id="shortDesc"
                    value={formData.shortDesc}
                    onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                    placeholder="Ürünün kısa açıklaması"
                    rows={2}
                    className={errors.shortDesc ? "border-red-500" : ""}
                  />
                  {errors.shortDesc && (
                    <p className="text-xs text-red-500">{errors.shortDesc}</p>
                  )}
                </div>

                {/* Detaylı Açıklama */}
                <div className="space-y-2">
                  <Label htmlFor="longDesc">Detaylı Açıklama</Label>
                  <Textarea
                    id="longDesc"
                    value={formData.longDesc}
                    onChange={(e) => setFormData({ ...formData, longDesc: e.target.value })}
                    placeholder="Ürün hakkında detaylı açıklama"
                    rows={4}
                  />
                </div>

                {/* Fiyatlandırma */}
                <div className="space-y-2">
                  <Label htmlFor="pricing">Fiyatlandırma</Label>
                  <Input
                    id="pricing"
                    value={formData.pricing}
                    onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                    placeholder="Free, $99/ay, vb."
                  />
                </div>

                {/* Diller */}
                <div className="space-y-2">
                  <Label htmlFor="languages">Desteklenen Diller (virgülle ayırın)</Label>
                  <Input
                    id="languages"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="Türkçe, English, Deutsch..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ana Kategori ve Ek Kategoriler */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Tag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Kategoriler</CardTitle>
                    <CardDescription>Ana kategori ve ek kategoriler seçin</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ana Kategori */}
                <div className="space-y-2">
                  <Label>Ana Kategori *</Label>
                  <Select
                    value={formData.mainCategory}
                    onValueChange={(value: ProductCategory) =>
                      setFormData({ ...formData, mainCategory: value })
                    }
                  >
                    <SelectTrigger className={errors.mainCategory ? "border-red-500" : ""}>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.mainCategory && (
                    <p className="text-xs text-red-500">{errors.mainCategory}</p>
                  )}
                </div>

                {/* Ek Kategoriler */}
                <div className="space-y-2">
                  <Label>Ek Kategoriler ({formData.categories.length}/{maxCategories})</Label>
                  <Input
                    placeholder="Kategori ara..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="mb-3"
                  />
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                    {filteredCategories.map((category) => {
                      const isSelected = formData.categories.includes(category);
                      const isDisabled = !isSelected && formData.categories.length >= maxCategories;
                      return (
                        <Badge
                          key={category}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer transition-colors text-xs ${
                            isSelected ? "bg-primary text-primary-foreground" : ""
                          } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={() => !isDisabled && handleCategoryToggle(category)}
                        >
                          {category}
                        </Badge>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Freemium: 1 kategori, Silver/Gold: en fazla 3 kategori.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Bağlantılar */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <LinkIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Bağlantılar & Medya</CardTitle>
                    <CardDescription>Website, logo ve galeri</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website Linki</Label>
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://"
                  />
                </div>

                {/* Demo Link */}
                <div className="space-y-2">
                  <Label htmlFor="demoLink">Demo / Calendly Linki</Label>
                  <Input
                    id="demoLink"
                    value={formData.demoLink}
                    onChange={(e) => setFormData({ ...formData, demoLink: e.target.value })}
                    placeholder="https://calendly.com/..."
                  />
                </div>

                {/* Logo */}
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo * (URL veya Base64)</Label>
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://example.com/logo.png veya data:image/..."
                    className={errors.logo ? "border-red-500" : ""}
                  />
                  {errors.logo && (
                    <p className="text-xs text-red-500">{errors.logo}</p>
                  )}
                  {formData.logo && !errors.logo && (
                    <div className="w-16 h-16 rounded-lg border overflow-hidden bg-muted">
                      <img
                        src={formData.logo}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  )}
                </div>

                {/* Gallery */}
                <div className="space-y-2">
                  <Label htmlFor="galleryUrls">Galeri (satır başına 1 URL)</Label>
                  <Textarea
                    id="galleryUrls"
                    value={formData.galleryUrls}
                    onChange={(e) => setFormData({ ...formData, galleryUrls: e.target.value })}
                    placeholder="https://example.com/screenshot1.png&#10;https://example.com/screenshot2.png"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Her satır bir görsel URL'sini temsil eder.</p>
                </div>
              </CardContent>
            </Card>

            {/* Özellikler */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Özellikler ({formData.features.length})</CardTitle>
                    <CardDescription>Ürün özelliklerini ekleyin</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Özellik ekle..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddFeature}>
                    Ekle
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature) => (
                    <Badge
                      key={feature}
                      variant="default"
                      className="bg-primary text-primary-foreground cursor-pointer"
                      onClick={() => handleRemoveFeature(feature)}
                    >
                      {feature} ✕
                    </Badge>
                  ))}
                </div>
                {formData.features.length === 0 && (
                  <p className="text-xs text-muted-foreground">Henüz özellik eklenmedi</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Card: Kaydet */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Save className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Kaydet</CardTitle>
                <CardDescription>Ürünü veritabanına ekle</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground mb-6">
              <p className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Ürün "Beklemede" durumunda oluşturulacak ve onay bekleyecek.
              </p>
              <p>• Ürün tier'ı vendor'ın tier'ına göre belirlenir.</p>
              <p>• Oluşturulduktan sonra "Ürün Düzenleme" sayfasından düzenleyebilirsiniz.</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate("/admin/products")}>
                İptal
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
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
