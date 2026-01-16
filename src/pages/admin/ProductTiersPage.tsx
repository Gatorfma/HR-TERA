import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, DollarSign, GripVertical, Plus, Trash2, ArrowUp, ArrowDown, Crown, Star, Sparkles, Check, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/api/supabaseClient";

interface TierPricing {
  slug: string;
  name: string;
  isActive: boolean;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  highlightLabel: string;
  tagline: string;
}

interface TierFeature {
  id: string;
  title: string;
  description: string;
  isIncluded: boolean;
  badge?: string;
}

interface TierFeatures {
  slug: string;
  headline: string;
  features: TierFeature[];
}

type TierConfigRow = {
  tier: string;
  is_active: boolean | null;
  monthly_price: number | string | null;
  yearly_price: number | string | null;
  currency: string | null;
  highlight_label: string | null;
  tagline: string | null;
  headline: string | null;
  features: unknown;
};

type TierFeatureJson = {
  id?: string;
  title?: string;
  description?: string;
  isIncluded?: boolean;
  badge?: string | null;
};

const TIER_NAMES: Record<string, string> = {
  freemium: "Freemium",
  silver: "Silver",
  gold: "Gold",
};

const INITIAL_PRICING: TierPricing[] = [
  {
    slug: "freemium",
    name: "Freemium",
    isActive: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: "USD",
    highlightLabel: "",
    tagline: "Başlamak için temel listeleme.",
  },
  {
    slug: "silver",
    name: "Silver",
    isActive: true,
    monthlyPrice: 99,
    yearlyPrice: 999,
    currency: "USD",
    highlightLabel: "En Çok Tercih Edilen",
    tagline: "Öne çıkma + analitik.",
  },
  {
    slug: "gold",
    name: "Gold",
    isActive: true,
    monthlyPrice: 199,
    yearlyPrice: 1999,
    currency: "USD",
    highlightLabel: "En İyi Değer",
    tagline: "Premium görünürlük + destek.",
  },
];

const INITIAL_FEATURES: TierFeatures[] = [
  {
    slug: "freemium",
    headline: "Hızlı başlangıç için ideal.",
    features: [
      { id: "f1", title: "Ürün adı, logo ve kısa açıklama", description: "Temel ürün bilgileri", isIncluded: true },
      { id: "f2", title: "1 kategori", description: "Tek kategoride listeleme", isIncluded: true },
      { id: "f3", title: "3 özellik etiketi", description: "Öne çıkan özellikler", isIncluded: true },
      { id: "f4", title: "Website linki", description: "Ürün web sitesi bağlantısı", isIncluded: true },
      { id: "f5", title: "Temel görünürlük", description: "Listeleme ve arama sonuçları", isIncluded: true },
      { id: "f6", title: "Ücretsiz başlangıç", description: "Kredi kartı gerektirmez", isIncluded: true, badge: "Ücretsiz" },
    ],
  },
  {
    slug: "silver",
    headline: "Büyüyen ekipler için daha fazla görünürlük.",
    features: [
      { id: "s1", title: "Freemium'daki her şey", description: "Tüm temel özellikler dahil", isIncluded: true },
      { id: "s2", title: "Genişletilmiş ürün sayfası", description: "Uzun açıklama ve daha fazla alan", isIncluded: true },
      { id: "s3", title: "3 kategori", description: "Birden fazla kategoride listeleme", isIncluded: true },
      { id: "s4", title: "Galeri görselleri", description: "Ürün ekran görüntüleri ve medya", isIncluded: true },
      { id: "s5", title: "Entegrasyon alanları", description: "Uyumluluk ve entegrasyon bilgileri", isIncluded: true },
      { id: "s6", title: "Temel performans analitiği", description: "Görüntülenme istatistikleri", isIncluded: true, badge: "Yeni" },
      { id: "s7", title: "Öne çıkarma", description: "Liste ve kategori sayfalarında öne çıkma", isIncluded: true },
    ],
  },
  {
    slug: "gold",
    headline: "Kurumsal düzeyde premium partnerlik.",
    features: [
      { id: "g1", title: "Silver'daki her şey", description: "Tüm Silver özellikleri dahil", isIncluded: true },
      { id: "g2", title: "Vaka çalışmaları", description: "Detaylı müşteri referansları", isIncluded: true },
      { id: "g3", title: "Paket ve fiyatlandırma", description: "Fiyatlandırma bölümü", isIncluded: true },
      { id: "g4", title: "Gelişmiş analitik", description: "Görüntülenme, tıklama, dönüşüm", isIncluded: true, badge: "Premium" },
      { id: "g5", title: "Kampanya alanları", description: "Promosyon ve kampanya bölümleri", isIncluded: true },
      { id: "g6", title: "VIP destek", description: "Öncelikli destek hattı", isIncluded: true },
      { id: "g7", title: "Demo butonu", description: "Calendly / demo randevu entegrasyonu", isIncluded: true },
    ],
  },
];

const ProductTiersPage = () => {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState<TierPricing[]>(INITIAL_PRICING);
  const [features, setFeatures] = useState<TierFeatures[]>(INITIAL_FEATURES);
  const [activeTab, setActiveTab] = useState("freemium");
  const [loading, setLoading] = useState(true);
  const [savingPricing, setSavingPricing] = useState(false);
  const [savingFeatures, setSavingFeatures] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toNumber = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return 0;
    const parsed = typeof value === "string" ? Number(value) : value;
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const normalizeFeatures = (tierSlug: string, raw: unknown, fallback: TierFeature[]) => {
    if (!Array.isArray(raw)) return fallback;
    return raw.map((item, index) => {
      const feature = (item ?? {}) as TierFeatureJson;
      return {
        id: feature.id ?? `${tierSlug}-feature-${index + 1}`,
        title: feature.title ?? "",
        description: feature.description ?? "",
        isIncluded: feature.isIncluded ?? true,
        badge: feature.badge ?? undefined,
      };
    });
  };

  const loadTierConfig = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_get_tier_config");

    if (error) {
      toast({
        title: "Tier bilgileri yüklenemedi",
        description: error.message,
        variant: "destructive",
      });
      setPricing(INITIAL_PRICING);
      setFeatures(INITIAL_FEATURES);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as TierConfigRow[];
    if (rows.length === 0) {
      setPricing(INITIAL_PRICING);
      setFeatures(INITIAL_FEATURES);
      setLoading(false);
      return;
    }

    const updatedPricing = INITIAL_PRICING.map((tier) => {
      const row = rows.find((item) => item.tier === tier.slug);
      if (!row) return tier;
      return {
        ...tier,
        name: TIER_NAMES[tier.slug] ?? tier.name,
        isActive: tier.slug === "freemium" ? true : row.is_active ?? tier.isActive,
        monthlyPrice: toNumber(row.monthly_price),
        yearlyPrice: toNumber(row.yearly_price),
        currency: row.currency ?? tier.currency,
        highlightLabel: row.highlight_label ?? "",
        tagline: row.tagline ?? "",
      };
    });

    const updatedFeatures = INITIAL_FEATURES.map((tierFeature) => {
      const row = rows.find((item) => item.tier === tierFeature.slug);
      if (!row) return tierFeature;
      return {
        ...tierFeature,
        headline: row.headline ?? tierFeature.headline,
        features: normalizeFeatures(tierFeature.slug, row.features, tierFeature.features),
      };
    });

    setPricing(updatedPricing);
    setFeatures(updatedFeatures);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadTierConfig();
  }, [loadTierConfig]);

  const buildTierPayload = useCallback(() => {
    return pricing.map((tier) => {
      const tierFeature = features.find((item) => item.slug === tier.slug);
      return {
        tier: tier.slug,
        is_active: tier.isActive,
        monthly_price: tier.monthlyPrice,
        yearly_price: tier.yearlyPrice,
        currency: tier.currency,
        highlight_label: tier.highlightLabel,
        tagline: tier.tagline,
        headline: tierFeature?.headline ?? "",
        features: (tierFeature?.features ?? []).map((feature) => ({
          id: feature.id,
          title: feature.title,
          description: feature.description,
          isIncluded: feature.isIncluded,
          badge: feature.badge ?? null,
        })),
      };
    });
  }, [features, pricing]);

  const getTierIcon = (slug: string) => {
    switch (slug) {
      case "freemium":
        return <Sparkles className="h-5 w-5" />;
      case "silver":
        return <Star className="h-5 w-5" />;
      case "gold":
        return <Crown className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getTierColor = (slug: string) => {
    switch (slug) {
      case "freemium":
        return "text-muted-foreground";
      case "silver":
        return "text-slate-500";
      case "gold":
        return "text-amber-500";
      default:
        return "text-foreground";
    }
  };

  const handlePricingChange = (slug: string, field: keyof TierPricing, value: string | number | boolean) => {
    setPricing(prev => prev.map(tier => 
      tier.slug === slug ? { ...tier, [field]: value } : tier
    ));
  };

  const handleFeaturesHeadlineChange = (slug: string, headline: string) => {
    setFeatures(prev => prev.map(tier =>
      tier.slug === slug ? { ...tier, headline } : tier
    ));
  };

  const handleFeatureChange = (tierSlug: string, featureId: string, field: keyof TierFeature, value: string | boolean) => {
    setFeatures(prev => prev.map(tier => {
      if (tier.slug !== tierSlug) return tier;
      return {
        ...tier,
        features: tier.features.map(f =>
          f.id === featureId ? { ...f, [field]: value } : f
        ),
      };
    }));
  };

  const addFeature = (tierSlug: string) => {
    const newFeature: TierFeature = {
      id: `${tierSlug}-${Date.now()}`,
      title: "",
      description: "",
      isIncluded: true,
    };
    setFeatures(prev => prev.map(tier =>
      tier.slug === tierSlug
        ? { ...tier, features: [...tier.features, newFeature] }
        : tier
    ));
  };

  const removeFeature = (tierSlug: string, featureId: string) => {
    setFeatures(prev => prev.map(tier =>
      tier.slug === tierSlug
        ? { ...tier, features: tier.features.filter(f => f.id !== featureId) }
        : tier
    ));
  };

  const moveFeature = (tierSlug: string, featureId: string, direction: "up" | "down") => {
    setFeatures(prev => prev.map(tier => {
      if (tier.slug !== tierSlug) return tier;
      const idx = tier.features.findIndex(f => f.id === featureId);
      if (idx === -1) return tier;
      if (direction === "up" && idx === 0) return tier;
      if (direction === "down" && idx === tier.features.length - 1) return tier;
      
      const newFeatures = [...tier.features];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      [newFeatures[idx], newFeatures[swapIdx]] = [newFeatures[swapIdx], newFeatures[idx]];
      return { ...tier, features: newFeatures };
    }));
  };

  const savePricing = async () => {
    setSavingPricing(true);
    const { error } = await supabase.rpc("admin_upsert_tier_config", {
      p_tiers: buildTierPayload(),
    });
    setSavingPricing(false);

    if (error) {
      toast({
        title: "Fiyatlar kaydedilemedi",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Fiyatlar Kaydedildi",
      description: "Tier fiyatları başarıyla güncellendi.",
    });
    loadTierConfig();
  };

  const saveFeatures = async () => {
    setSavingFeatures(true);
    const { error } = await supabase.rpc("admin_upsert_tier_config", {
      p_tiers: buildTierPayload(),
    });
    setSavingFeatures(false);

    if (error) {
      toast({
        title: "Özellikler kaydedilemedi",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Özellikler Kaydedildi",
      description: "Tüm paket özellikleri başarıyla güncellendi.",
    });
    loadTierConfig();
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => navigate("/admin")} className="hover:text-foreground transition-colors">
            Admin Paneli
          </button>
          <span>/</span>
          <button onClick={() => navigate("/admin/products")} className="hover:text-foreground transition-colors">
            Ürün Ayarları
          </button>
          <span>/</span>
          <span className="text-foreground">Tier Fiyatları</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/admin/products")} className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Tier Fiyatları</h1>
          <p className="text-muted-foreground mt-2">Freemium/Silver/Gold fiyatlarını ve avantajlarını yönetin.</p>
        </div>

        {/* Pricing Table Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Fiyatlandırma</CardTitle>
                <CardDescription>Aylık / yıllık fiyatlar ve temel ayarlar.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tier</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Durum</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Aylık Fiyat</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Yıllık Fiyat</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Öne Çıkan Etiket</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Kısa Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.map((tier) => (
                    <tr key={tier.slug} className="border-b border-border last:border-0">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <span className={getTierColor(tier.slug)}>{getTierIcon(tier.slug)}</span>
                          <span className="font-medium text-foreground">{tier.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={tier.isActive}
                            onCheckedChange={(checked) => handlePricingChange(tier.slug, "isActive", checked)}
                            disabled={tier.slug === "freemium"}
                          />
                          <span className="text-sm text-muted-foreground">
                            {tier.isActive ? "Aktif" : "Pasif"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        {tier.slug === "freemium" ? (
                          <Badge variant="secondary">Ücretsiz</Badge>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">$</span>
                            <Input
                              type="number"
                              value={tier.monthlyPrice}
                              onChange={(e) => handlePricingChange(tier.slug, "monthlyPrice", parseInt(e.target.value) || 0)}
                              className="w-24"
                              min={0}
                            />
                            <span className="text-sm text-muted-foreground">/ay</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-2">
                        {tier.slug === "freemium" ? (
                          <Badge variant="secondary">Ücretsiz</Badge>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">$</span>
                            <Input
                              type="number"
                              value={tier.yearlyPrice}
                              onChange={(e) => handlePricingChange(tier.slug, "yearlyPrice", parseInt(e.target.value) || 0)}
                              className="w-24"
                              min={0}
                            />
                            <span className="text-sm text-muted-foreground">/yıl</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-2">
                        <Input
                          value={tier.highlightLabel}
                          onChange={(e) => handlePricingChange(tier.slug, "highlightLabel", e.target.value)}
                          placeholder="Örn: En Popüler"
                          className="w-40"
                        />
                      </td>
                      <td className="py-4 px-2">
                        <Input
                          value={tier.tagline}
                          onChange={(e) => handlePricingChange(tier.slug, "tagline", e.target.value)}
                          placeholder="Kısa açıklama"
                          className="w-48"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6">
              <Button
                onClick={savePricing}
                className="bg-primary hover:bg-primary/90"
                disabled={loading || savingPricing}
              >
                {savingPricing ? "Kaydediliyor..." : "Fiyatları Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Package Features Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Paket Özellikleri</CardTitle>
            <CardDescription>
              Her tier'ın sunduğu özellikleri belirleyin. Bu liste fiyatlandırma sayfasında ve satış içeriklerinde kullanılacak.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                {pricing.map((tier) => (
                  <TabsTrigger key={tier.slug} value={tier.slug} className="gap-2">
                    <span className={getTierColor(tier.slug)}>{getTierIcon(tier.slug)}</span>
                    {tier.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {features.map((tierFeature) => (
                <TabsContent key={tierFeature.slug} value={tierFeature.slug} className="space-y-6">
                  {/* Headline */}
                  <div className="space-y-2">
                    <Label>Öne Çıkan Başlık</Label>
                    <Input
                      value={tierFeature.headline}
                      onChange={(e) => handleFeaturesHeadlineChange(tierFeature.slug, e.target.value)}
                      placeholder="Bu tier için ana başlık"
                    />
                  </div>

                  {/* Features List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Özellikler Listesi</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addFeature(tierFeature.slug)}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Özellik Ekle
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {tierFeature.features.map((feature, idx) => (
                        <div
                          key={feature.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card"
                        >
                          <div className="flex flex-col gap-1 pt-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => moveFeature(tierFeature.slug, feature.id, "up")}
                              disabled={idx === 0}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => moveFeature(tierFeature.slug, feature.id, "down")}
                              disabled={idx === tierFeature.features.length - 1}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Başlık</Label>
                              <Input
                                value={feature.title}
                                onChange={(e) => handleFeatureChange(tierFeature.slug, feature.id, "title", e.target.value)}
                                placeholder="Özellik adı"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Açıklama</Label>
                              <Input
                                value={feature.description}
                                onChange={(e) => handleFeatureChange(tierFeature.slug, feature.id, "description", e.target.value)}
                                placeholder="Kısa açıklama"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Etiket (Opsiyonel)</Label>
                              <Input
                                value={feature.badge || ""}
                                onChange={(e) => handleFeatureChange(tierFeature.slug, feature.id, "badge", e.target.value)}
                                placeholder="Yeni, Premium..."
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-6">
                            <Switch
                              checked={feature.isIncluded}
                              onCheckedChange={(checked) => handleFeatureChange(tierFeature.slug, feature.id, "isIncluded", checked)}
                            />
                            <span className="text-xs text-muted-foreground">
                              {feature.isIncluded ? "Dahil" : "Hariç"}
                            </span>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive pt-6"
                            onClick={() => removeFeature(tierFeature.slug, feature.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {tierFeature.features.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                          <p>Henüz özellik eklenmedi.</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addFeature(tierFeature.slug)}
                            className="mt-2"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            İlk Özelliği Ekle
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-end mt-6">
              <Button
                onClick={saveFeatures}
                className="bg-primary hover:bg-primary/90"
                disabled={loading || savingFeatures}
              >
                {savingFeatures ? "Kaydediliyor..." : "Tüm Paket Özelliklerini Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Fiyatlandırma Önizleme</CardTitle>
            <CardDescription>Fiyatlandırma kartlarının vendor'lara nasıl görüneceği.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pricing.filter(t => t.isActive).map((tier) => {
                const tierFeatureData = features.find(f => f.slug === tier.slug);
                return (
                  <div
                    key={tier.slug}
                    className={`relative p-6 rounded-xl border-2 ${
                      tier.slug === "gold"
                        ? "border-amber-500 bg-amber-500/5"
                        : tier.slug === "silver"
                        ? "border-slate-400 bg-slate-500/5"
                        : "border-border bg-card"
                    }`}
                  >
                    {tier.highlightLabel && (
                      <Badge
                        className={`absolute -top-3 left-1/2 -translate-x-1/2 ${
                          tier.slug === "gold"
                            ? "bg-amber-500 text-white"
                            : tier.slug === "silver"
                            ? "bg-slate-500 text-white"
                            : "bg-primary"
                        }`}
                      >
                        {tier.highlightLabel}
                      </Badge>
                    )}

                    <div className="text-center mb-4">
                      <div className={`inline-flex p-2 rounded-full mb-2 ${getTierColor(tier.slug)}`}>
                        {getTierIcon(tier.slug)}
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground">{tier.tagline}</p>
                    </div>

                    <div className="text-center mb-4">
                      {tier.slug === "freemium" ? (
                        <div className="text-3xl font-bold text-foreground">Ücretsiz</div>
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-foreground">
                            ${tier.monthlyPrice}
                            <span className="text-sm font-normal text-muted-foreground">/ay</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            veya ${tier.yearlyPrice}/yıl
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      {tierFeatureData?.features.slice(0, 5).map((feature) => (
                        <div key={feature.id} className="flex items-start gap-2 text-sm">
                          {feature.isIncluded ? (
                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          )}
                          <span className={feature.isIncluded ? "text-foreground" : "text-muted-foreground"}>
                            {feature.title}
                            {feature.badge && (
                              <Badge variant="outline" className="ml-1 text-xs py-0">
                                {feature.badge}
                              </Badge>
                            )}
                          </span>
                        </div>
                      ))}
                      {(tierFeatureData?.features.length || 0) > 5 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{(tierFeatureData?.features.length || 0) - 5} daha fazla özellik
                        </p>
                      )}
                    </div>

                    <Button
                      className={`w-full ${
                        tier.slug === "gold"
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : tier.slug === "silver"
                          ? "bg-slate-500 hover:bg-slate-600 text-white"
                          : ""
                      }`}
                      variant={tier.slug === "freemium" ? "outline" : "default"}
                    >
                      {tier.slug === "freemium" ? "Ücretsiz Başla" : "Planı Seç"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ProductTiersPage;
