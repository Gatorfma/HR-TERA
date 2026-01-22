import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, FileCheck, Lock, Image, MessageSquare, BarChart3, Star, FileText, Link as LinkIcon, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getMyProducts } from "@/api/supabaseApi";
import { Tier } from "@/lib/types";
import ListingTierBadge from "@/components/ListingTierBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Interface for API product response
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

// Mapped product for display
interface MyProduct {
  id: string;
  slug: string;
  name: string;
  image: string;
  category: string;
  description: string;
  vendorTier: Tier;
  status: "published" | "draft" | "pending" | "rejected";
  screenshotCount: number;
  reviewCount: number;
  views: number;
  clicks: number;
  demoRequests: number;
  useCases?: unknown[];
  featuredContent?: unknown[];
}

interface LockedFeatureProps {
  children: React.ReactNode;
  requiredTier: Tier;
  currentTier: Tier;
  featureName: string;
}

const LockedFeature = ({ children, requiredTier, currentTier, featureName }: LockedFeatureProps) => {
  const tierOrder = { freemium: 0, silver: 1, gold: 2 };
  const isLocked = tierOrder[currentTier] < tierOrder[requiredTier];

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="opacity-50 cursor-not-allowed relative">
          {children}
          <Lock className="w-3 h-3 absolute -top-1 -right-1 text-muted-foreground" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} to unlock {featureName}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// Map listing_status to display status
const mapListingStatus = (status: string): "published" | "draft" | "pending" | "rejected" => {
  switch (status) {
    case "approved":
      return "published";
    case "pending":
      return "pending";
    case "rejected":
      return "rejected";
    default:
      return "draft";
  }
};

const MyProductsTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "published" | "pending" | "rejected">("all");
  const [products, setProducts] = useState<MyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiProducts: ApiProduct[] = await getMyProducts();
        
        // Map API products to display format
        const mappedProducts: MyProduct[] = apiProducts.map((p) => ({
          id: p.product_id,
          slug: p.product_id,
          name: p.product_name,
          image: p.logo || "/placeholder.svg",
          category: p.main_category,
          description: p.short_desc,
          vendorTier: (p.subscription?.toLowerCase() || "freemium") as Tier,
          status: mapListingStatus(p.listing_status),
          screenshotCount: p.gallery?.length || 0,
          reviewCount: 0, // TODO: Add reviews count when implemented
          views: 0, // TODO: Add analytics when implemented
          clicks: 0,
          demoRequests: 0,
        }));
        
        setProducts(mappedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Ürünler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProducts();
    }
  }, [user]);

  if (!user) return null;

  const filteredProducts = products.filter(p => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const tierOrder = { freemium: 0, silver: 1, gold: 2 };
  const isSilverPlus = tierOrder[user.vendorTier] >= 1;
  const isGold = user.vendorTier === "gold";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Yayında</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">İnceleniyor</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600">Reddedildi</Badge>;
      default:
        return <Badge variant="secondary">Taslak</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tier notice for freemium */}
      {user.vendorTier === "freemium" && (
        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">
            You're on the <span className="font-medium text-foreground">Freemium plan</span>. 
            Upgrade to Silver or Gold to unlock galleries, case studies, and more visibility.
            <Link to={`${import.meta.env.BASE_URL}#pricing`} className="text-primary hover:underline ml-1">
              View plans →
            </Link>
          </p>
        </div>
      )}

      {/* Header with filters and add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Tümü ({products.length})
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === "published"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Yayında
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === "pending"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            İnceleniyor
          </button>
        </div>

        <Button className="rounded-full gap-2" onClick={() => navigate("/profile/products/new")}>
          <Plus className="w-4 h-4" />
          Yeni Ürün Ekle
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Ürünler yükleniyor...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tekrar Dene
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Henüz ürün eklemediniz</h3>
          <p className="text-muted-foreground mb-4">İlk ürününüzü ekleyerek başlayın</p>
          <Button className="rounded-full gap-2" onClick={() => navigate("/profile/products/new")}>
            <Plus className="w-4 h-4" />
            Yeni Ürün Ekle
          </Button>
        </div>
      )}

      {/* Products grid */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Product image */}
                <div className="shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full md:w-32 h-24 rounded-lg object-cover bg-muted"
                  />
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <ListingTierBadge tier={product.vendorTier} />
                    {getStatusBadge(product.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

                  {/* Feature counts for Silver+ */}
                  {isSilverPlus && (
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Image className="w-3.5 h-3.5" />
                        {product.screenshotCount} görsel
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {product.reviewCount} yorum
                      </span>
                      {isGold && (
                        <>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {product.useCases?.length || 0} case study
                          </span>
                          <span className="flex items-center gap-1">
                            <LinkIcon className="w-3.5 h-3.5" />
                            {product.featuredContent?.length || 0} öne çıkan
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats for Gold */}
                {isGold && (
                  <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-2 text-sm shrink-0">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span>{product.views} görüntüleme</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BarChart3 className="w-4 h-4" />
                      <span>{product.clicks} tıklama</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary">
                      <Star className="w-4 h-4" />
                      <span>{product.demoRequests} demo</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex md:flex-col gap-2 shrink-0">
                  {product.status === "published" && (
                    <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" asChild>
                      <Link to={`/products/${product.slug}`}>
                        <Eye className="w-4 h-4" />
                        Görüntüle
                      </Link>
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5 rounded-lg"
                    onClick={() => navigate(`/profile/products/${product.id}/edit`)}
                  >
                    <Edit className="w-4 h-4" />
                    Düzenle
                  </Button>
                  <LockedFeature
                    currentTier={user.vendorTier}
                    requiredTier="silver"
                    featureName="gallery management"
                  >
                    <Button variant="outline" size="sm" className="gap-1.5 rounded-lg w-full">
                      <Image className="w-4 h-4" />
                      Galeri
                    </Button>
                  </LockedFeature>
                </div>
              </div>

              {/* Locked features indicator for freemium */}
              {user.vendorTier === "freemium" && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex flex-wrap gap-3 text-xs">
                    <LockedFeature currentTier="freemium" requiredTier="silver" featureName="integrations">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Lock className="w-3 h-3" /> Entegrasyonlar
                      </span>
                    </LockedFeature>
                    <LockedFeature currentTier="freemium" requiredTier="silver" featureName="compliance tags">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Lock className="w-3 h-3" /> Uyumluluk
                      </span>
                    </LockedFeature>
                    <LockedFeature currentTier="freemium" requiredTier="gold" featureName="case studies">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Lock className="w-3 h-3" /> Case Study
                      </span>
                    </LockedFeature>
                    <LockedFeature currentTier="freemium" requiredTier="gold" featureName="analytics">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Lock className="w-3 h-3" /> Analitik
                      </span>
                    </LockedFeature>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No results for filter */}
      {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Bu filtreye uygun ürün bulunamadı</p>
        </div>
      )}

      {/* Pending claims section */}
      <div className="bg-muted/30 rounded-xl border border-border p-4">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-muted-foreground" />
          Bekleyen Talep Başvuruları
        </h3>
        <p className="text-sm text-muted-foreground">
          Bekleyen başvuru yok. Ürünler sayfasından sahipsiz ürünleri talep edebilirsiniz.
        </p>
      </div>
    </div>
  );
};

export default MyProductsTab;
