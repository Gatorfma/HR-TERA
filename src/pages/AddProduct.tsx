import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Lock, Info, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProductApplications } from "@/contexts/ProductApplicationsContext";
import ListingTierBadge from "@/components/ListingTierBadge";
import { getAllCategories } from "@/api/supabaseApi";

const AVAILABLE_FEATURES = [
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
];

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { addApplication } = useProductApplications();

  const vendorTier = user?.vendorTier || "freemium";
  const maxCategories = vendorTier === "freemium" ? 1 : 3;
  const maxFeatures = 3;

  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    websiteUrl: "",
    logo: "",
    motto: "",
    calendlyLink: "",
    categories: [] as string[],
    features: [] as string[],
    galleryImages: [] as string[],
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Fetch categories from database
  useEffect(() => {
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

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData((prev) => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => {
      if (prev.features.includes(feature)) {
        return { ...prev, features: prev.features.filter((f) => f !== feature) };
      }
      if (prev.features.length >= maxFeatures) return prev;
      return { ...prev, features: [...prev.features, feature] };
    });
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => {
      if (prev.categories.includes(category)) {
        return { ...prev, categories: prev.categories.filter((c) => c !== category) };
      }
      if (prev.categories.length >= maxCategories) return prev;
      return { ...prev, categories: [...prev.categories, category] };
    });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast({ title: "Hata", description: "Ürün adı gereklidir.", variant: "destructive" });
      return;
    }
    if (!formData.shortDescription.trim()) {
      toast({ title: "Hata", description: "Kısa açıklama gereklidir.", variant: "destructive" });
      return;
    }
    if (!formData.websiteUrl.trim() || !isValidUrl(formData.websiteUrl)) {
      toast({ title: "Hata", description: "Geçerli bir web sitesi URL'si girin.", variant: "destructive" });
      return;
    }
    if (!formData.logo) {
      toast({ title: "Hata", description: "Logo yüklemek zorunludur.", variant: "destructive" });
      return;
    }
    if (formData.categories.length === 0) {
      toast({ title: "Hata", description: "En az bir kategori seçmelisiniz.", variant: "destructive" });
      return;
    }
    if (vendorTier === "premium" && formData.calendlyLink && !isValidUrl(formData.calendlyLink)) {
      toast({ title: "Hata", description: "Geçerli bir Calendly linki girin.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addApplication({
        vendorId: user?.vendorId || "",
        name: formData.name,
        shortDescription: formData.shortDescription,
        websiteUrl: formData.websiteUrl,
        logo: formData.logo,
        motto: vendorTier !== "freemium" ? formData.motto : undefined,
        calendlyLink: vendorTier === "premium" ? formData.calendlyLink : undefined,
        categories: formData.categories,
        features: formData.features,
        galleryImages: vendorTier !== "freemium" ? formData.galleryImages : [],
        productTier: vendorTier,
      });

      toast({
        title: "Başvuru Gönderildi",
        description: "Ürün başvurunuz alındı. İnceleme sonrası size bilgi vereceğiz.",
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

  const LockedField = ({ requiredTier, label }: { requiredTier: "plus" | "premium"; label: string }) => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
      <Lock className="w-4 h-4" />
      <span>
        {label} {requiredTier === "plus" ? "Plus ve Premium" : "sadece Premium"} paketleri için açıktır.
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile?tab=products")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Yeni Ürün Ekle</h1>
              <p className="text-muted-foreground text-sm">Ürün bilgilerinizi doldurun ve başvurunuzu gönderin</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Main Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Temel Bilgiler */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-heading">Temel Bilgiler</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column Fields */}
                      <div className="space-y-4">
                        {/* Ürün Adı */}
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            Ürün Adı <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="name"
                            placeholder="Örn: TalentHub"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                          />
                        </div>

                        {/* Kısa Açıklama */}
                        <div className="space-y-2">
                          <Label htmlFor="shortDescription">
                            Kısa Açıklama <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            id="shortDescription"
                            placeholder="Ürününüzü kısaca tanımlayın"
                            rows={3}
                            value={formData.shortDescription}
                            onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                          />
                        </div>

                        {/* Web Sitesi */}
                        <div className="space-y-2">
                          <Label htmlFor="websiteUrl">
                            Web Sitesi <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="websiteUrl"
                            type="url"
                            placeholder="https://"
                            value={formData.websiteUrl}
                            onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                          />
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-2">
                          <Label>
                            Logo (JPG, PNG, JPEG) <span className="text-destructive">*</span>
                          </Label>
                          <div className="flex items-center gap-4">
                            {logoPreview ? (
                              <div className="relative">
                                <img
                                  src={logoPreview}
                                  alt="Logo preview"
                                  className="w-16 h-16 rounded-lg object-cover border border-border"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLogoPreview(null);
                                    setFormData((prev) => ({ ...prev, logo: "" }));
                                  }}
                                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex items-center justify-center w-16 h-16 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                                <Upload className="w-5 h-5 text-muted-foreground" />
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/jpg"
                                  className="hidden"
                                  onChange={handleLogoUpload}
                                />
                              </label>
                            )}
                            <span className="text-sm text-muted-foreground">Maks. 2MB, 200x200px önerilir</span>
                          </div>
                        </div>

                        {/* Motto (Plus/Premium) */}
                        <div className="space-y-2">
                          <Label htmlFor="motto" className="flex items-center gap-2">
                            Motto
                            {vendorTier === "freemium" && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-4 h-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>Plus ve Premium paketleri için açıktır</TooltipContent>
                              </Tooltip>
                            )}
                          </Label>
                          {vendorTier === "freemium" ? (
                            <LockedField requiredTier="plus" label="Motto alanı" />
                          ) : (
                            <Input
                              id="motto"
                              placeholder="Ürününüzün sloganı"
                              value={formData.motto}
                              onChange={(e) => handleInputChange("motto", e.target.value)}
                            />
                          )}
                        </div>
                      </div>

                      {/* Right Column Fields */}
                      <div className="space-y-4">
                        {/* Calendly Link (Premium) */}
                        <div className="space-y-2">
                          <Label htmlFor="calendlyLink" className="flex items-center gap-2">
                            Calendly Linki
                            {vendorTier !== "premium" && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-4 h-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>Sadece Premium paketinde kullanılabilir</TooltipContent>
                              </Tooltip>
                            )}
                          </Label>
                          {vendorTier !== "premium" ? (
                            <LockedField requiredTier="premium" label="Calendly linki" />
                          ) : (
                            <Input
                              id="calendlyLink"
                              type="url"
                              placeholder="https://calendly.com/..."
                              value={formData.calendlyLink}
                              onChange={(e) => handleInputChange("calendlyLink", e.target.value)}
                            />
                          )}
                        </div>

                        {/* Kategoriler */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Kategoriler ({formData.categories.length}/{maxCategories})
                            <span className="text-destructive">*</span>
                          </Label>
                          <div className="flex flex-wrap gap-2 p-3 border border-input rounded-lg bg-background min-h-[100px]">
                            {availableCategories.map((category) => {
                              const isSelected = formData.categories.includes(category);
                              const isDisabled = !isSelected && formData.categories.length >= maxCategories;
                              return (
                                <Badge
                                  key={category}
                                  variant={isSelected ? "default" : "outline"}
                                  className={`cursor-pointer transition-all ${
                                    isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/20"
                                  } ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                                  onClick={() => !isDisabled && toggleCategory(category)}
                                >
                                  {category}
                                </Badge>
                              );
                            })}
                          </div>
                          {vendorTier === "freemium" && (
                            <p className="text-xs text-muted-foreground">
                              Freemium planda 1 kategori seçebilirsiniz. Daha fazlası için yükseltin.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Özellikler - Full Width */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Özellikler ({formData.features.length}/{maxFeatures})
                      </Label>
                      <div className="flex flex-wrap gap-2 p-3 border border-input rounded-lg bg-background">
                        {AVAILABLE_FEATURES.map((feature) => {
                          const isSelected = formData.features.includes(feature);
                          const isDisabled = !isSelected && formData.features.length >= maxFeatures;
                          return (
                            <Badge
                              key={feature}
                              variant={isSelected ? "default" : "outline"}
                              className={`cursor-pointer transition-all ${
                                isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/20"
                              } ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                              onClick={() => !isDisabled && toggleFeature(feature)}
                            >
                              {feature}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    {/* Galeri Görselleri (Plus/Premium) */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Galeri Görselleri ({formData.galleryImages.length}/5)
                        {vendorTier === "freemium" && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>Plus ve Premium paketleri için açıktır</TooltipContent>
                          </Tooltip>
                        )}
                      </Label>
                      {vendorTier === "freemium" ? (
                        <LockedField requiredTier="plus" label="Galeri" />
                      ) : (
                        <div className="flex items-center gap-4 p-4 border-2 border-dashed border-border rounded-lg">
                          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                            <Upload className="w-5 h-5" />
                            <span>Görsel yüklemek için tıklayın</span>
                            <input type="file" accept="image/*" multiple className="hidden" />
                          </label>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex items-center justify-between">
                  <Button type="button" variant="outline" onClick={() => navigate("/profile?tab=products")}>
                    İptal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Gönderiliyor..." : "Başvuru Gönder"}
                  </Button>
                </div>
              </div>

              {/* Right Column - Live Preview */}
              <div className="lg:col-span-1">
                <div className="sticky top-28">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-heading flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Canlı Önizleme
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-card rounded-xl overflow-hidden shadow-card border border-border">
                        {/* Preview Card */}
                        <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                          {logoPreview ? (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                              <img
                                src={logoPreview}
                                alt="Product preview"
                                className="w-20 h-20 rounded-xl object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <span className="text-sm">Logo önizlemesi</span>
                            </div>
                          )}
                          {vendorTier !== "freemium" && (
                            <div className="absolute top-2.5 left-2.5">
                              <ListingTierBadge tier={vendorTier} />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              {formData.categories[0] || "Kategori"}
                            </span>
                            <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              Free
                            </span>
                          </div>
                          <h3 className="font-heading font-bold text-foreground mb-1">
                            {formData.name || "Ürün Adı"}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {formData.shortDescription || "Ürün açıklaması burada görünecek..."}
                          </p>
                          {vendorTier !== "freemium" && formData.motto && (
                            <p className="text-xs text-primary mt-2 italic">"{formData.motto}"</p>
                          )}
                        </div>
                      </div>

                      {/* Tier Info */}
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Bu ürün <span className="font-semibold capitalize">{vendorTier}</span> paketi ile
                          listelenecektir.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddProduct;
