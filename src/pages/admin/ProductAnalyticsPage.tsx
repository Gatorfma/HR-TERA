import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Star, BarChart3, RefreshCw, ArrowUpDown, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/api/supabaseClient";

interface ProductAnalytics {
  productId: string;
  productName: string;
  description: string;
  categories: string[];
  vendorName: string;
  tier: string;
  visits: number;
  rating: number | null;
  productLink: string;
}

type ProductAnalyticsRow = {
  product_id: string;
  product_name: string;
  short_desc: string | null;
  website_link: string | null;
  main_category: string | null;
  categories: string[] | null;
  vendor_id: string;
  vendor_name: string | null;
  subscription: string | null;
  rating: number | null;
  visits: number | string | null;
  last_viewed_at: string | null;
};

type SortField = "rating" | "visits" | "name";
type SortDirection = "asc" | "desc";

const ProductAnalyticsPage = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<ProductAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("rating");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [onlyWithRating, setOnlyWithRating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = useCallback(
    async (options?: { silent?: boolean; showToast?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }

      const { data, error } = await supabase.rpc("admin_get_product_analytics");

      if (error) {
        toast({
          title: "Analitik verileri yüklenemedi",
          description: error.message,
          variant: "destructive",
        });
        setAnalytics([]);
        setLoading(false);
        return;
      }

      const mapped = ((data ?? []) as ProductAnalyticsRow[]).map((row) => {
        const categorySet = new Set<string>();
        if (row.main_category) {
          categorySet.add(row.main_category);
        }
        (row.categories ?? []).forEach((category) => categorySet.add(category));

        const websiteLink = row.website_link?.trim();
        const productLink = websiteLink ? websiteLink : `/products/${row.product_id}`;

        return {
          productId: row.product_id,
          productName: row.product_name,
          description: row.short_desc ?? "",
          categories: Array.from(categorySet),
          vendorName: row.vendor_name ?? "Bilinmeyen Vendor",
          tier: row.subscription ?? "freemium",
          visits: Number(row.visits ?? 0),
          rating: row.rating ?? null,
          productLink,
        };
      });

      setAnalytics(mapped);
      setLoading(false);

      if (options?.showToast) {
        toast({
          title: "Veriler Yenilendi",
          description: "Analitik verileri güncellendi.",
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-product-analytics")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "analytics_events" },
        () => {
          loadAnalytics({ silent: true });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          loadAnalytics({ silent: true });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vendors" },
        () => {
          loadAnalytics({ silent: true });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAnalytics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAnalytics({ silent: true, showToast: true });
    setIsRefreshing(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filter and sort data
  const filteredAndSortedAnalytics = useMemo(() => {
    let filtered = [...analytics];

    // Apply tier filter
    if (tierFilter !== "all") {
      filtered = filtered.filter((a) => a.tier === tierFilter);
    }

    // Apply rating filter
    if (onlyWithRating) {
      filtered = filtered.filter((a) => a.rating !== null);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortField === "rating") {
        const aRating = a.rating ?? -1;
        const bRating = b.rating ?? -1;
        comparison = bRating - aRating;
        // If ratings are equal, sort by visits
        if (comparison === 0) {
          comparison = b.visits - a.visits;
        }
      } else if (sortField === "visits") {
        comparison = b.visits - a.visits;
      } else if (sortField === "name") {
        comparison = a.productName.localeCompare(b.productName);
      }

      return sortDirection === "desc" ? comparison : -comparison;
    });

    return filtered;
  }, [analytics, sortField, sortDirection, tierFilter, onlyWithRating]);

  // Calculate KPIs
  const totalVisits = analytics.reduce((sum, a) => sum + a.visits, 0);
  const productsWithRating = analytics.filter((a) => a.rating !== null);
  const averageRating = productsWithRating.length > 0
    ? (productsWithRating.reduce((sum, a) => sum + (a.rating || 0), 0) / productsWithRating.length).toFixed(1)
    : null;
  const trackedProducts = analytics.length;

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "premium":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Premium</Badge>;
      case "plus":
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/30">Plus</Badge>;
      default:
        return <Badge variant="outline">Freemium</Badge>;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === "desc" 
      ? <ChevronDown className="h-4 w-4 ml-1" /> 
      : <ChevronUp className="h-4 w-4 ml-1" />;
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
          <span className="text-foreground">Ürün Analitiği</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <Button variant="ghost" onClick={() => navigate("/admin/products")} className="mb-4 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri Dön
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Ürün Performansı</h1>
            <p className="text-muted-foreground mt-2">Ziyaret ve puan metriklerini inceleyin.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Yenile
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Visits */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Toplam Ziyaret</p>
                  <p className="text-xs text-muted-foreground/70">analytics_visits toplamı</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {loading ? "—" : totalVisits.toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Star className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Ortalama Rating</p>
                  <p className="text-xs text-muted-foreground/70">analytics_rating ortalaması</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {!loading && averageRating ? (
                      <span className="flex items-center gap-1">
                        {averageRating}
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracked Products */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <BarChart3 className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">İzlenen Ürün</p>
                  <p className="text-xs text-muted-foreground/70">Analitiği olan ürün sayısı</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {loading ? "—" : trackedProducts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>Ürün Bazlı Analitik</CardTitle>
                <CardDescription>
                  Ziyaret ve rating listesi •{" "}
                  {loading ? "Yükleniyor..." : `${filteredAndSortedAnalytics.length} ürün izleniyor`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Tier Filter */}
                <div className="flex gap-1">
                  {[
                    { value: "all", label: "Tümü" },
                    { value: "freemium", label: "Freemium" },
                    { value: "plus", label: "Plus" },
                    { value: "premium", label: "Premium" },
                  ].map((tier) => (
                    <Button
                      key={tier.value}
                      variant={tierFilter === tier.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTierFilter(tier.value)}
                      className="text-xs"
                    >
                      {tier.label}
                    </Button>
                  ))}
                </div>
                {/* Rating Filter */}
                <Button
                  variant={onlyWithRating ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOnlyWithRating(!onlyWithRating)}
                  className="text-xs"
                >
                  Sadece Rating'i Olan
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2">
                      <button
                        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => handleSort("name")}
                      >
                        Ürün
                        <SortIcon field="name" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Kategoriler</th>
                    <th className="text-right py-3 px-2">
                      <button
                        className="flex items-center justify-end w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => handleSort("visits")}
                      >
                        Ziyaret
                        <SortIcon field="visits" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-2">
                      <button
                        className="flex items-center justify-end w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => handleSort("rating")}
                      >
                        Rating
                        <SortIcon field="rating" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted-foreground">
                        <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin opacity-50" />
                        <p>Analitik verileri yükleniyor...</p>
                      </td>
                    </tr>
                  ) : filteredAndSortedAnalytics.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted-foreground">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Filtrelerinize uygun ürün bulunamadı.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedAnalytics.map((item) => (
                      <tr key={item.productId} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-start gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate max-w-[200px]">
                                {item.productName}
                              </p>
                              <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                                {item.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">{item.vendorName}</span>
                                {getTierBadge(item.tier)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {item.categories.slice(0, 2).map((cat) => (
                              <Badge key={cat} variant="secondary" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                            {item.categories.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.categories.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <span className="font-medium text-foreground">
                            {item.visits.toLocaleString("tr-TR")}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          {item.rating !== null ? (
                            <span className="inline-flex items-center gap-1 font-medium text-foreground">
                              {item.rating}
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-4 px-2 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(item.productLink, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ProductAnalyticsPage;
