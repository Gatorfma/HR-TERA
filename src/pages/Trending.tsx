import { useState, useEffect } from "react";
import { Flame, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrendingCard from "@/components/TrendingCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTrendingProducts, getAllCategories } from "@/api/supabaseApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tier } from "@/lib/types";

interface TrendingProduct {
  product_id: string;
  product_name: string;
  short_desc: string;
  logo: string;
  main_category: string;
  subscription: string;
  is_verified: boolean;
  vendor_name: string;
  engagement_score: number;
  previous_score: number;
  growth_percentage: number;
  rating?: number;
}

type Period = "week" | "month" | "year";

const Trending = () => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<Period>("month");
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch categories once
  useEffect(() => {
    getAllCategories()
      .then((data: string[]) => {
        setCategories(data ?? []);
      })
      .catch(() => setCategories([]));
  }, []);

  // Fetch trending products whenever period or category changes
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTrendingProducts(period, 20, selectedCategory);
        setProducts(data);
      } catch (err) {
        console.error("Error fetching trending products:", err);
        setError(err instanceof Error ? err.message : "Failed to load trending data");
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [period, selectedCategory]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const periodOptions: { value: Period; label: string }[] = [
    { value: "week", label: t("trending.thisWeek") },
    { value: "month", label: t("trending.thisMonth") },
    { value: "year", label: t("trending.thisYear") },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
              {t("trending.title")}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("trending.subtitle")}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            {/* Period selector */}
            <div className="flex gap-2">
              {periodOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPeriod(opt.value)}
                  className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    period === opt.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-foreground border border-border hover:border-primary/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Category dropdown */}
            {categories.length > 0 && (
              <Select
                value={selectedCategory ?? "all"}
                onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[180px] rounded-full">
                  <SelectValue placeholder={t("trending.allCategories")} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-auto">
                  <SelectItem value="all">{t("trending.allCategories")}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Results */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-destructive">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <Flame className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">{t("trending.empty")}</p>
              </div>
            ) : (
              products.map((product, index) => (
                <TrendingCard
                  key={product.product_id}
                  rank={index + 1}
                  productId={product.product_id}
                  name={product.product_name}
                  logo={product.logo}
                  category={product.main_category}
                  vendorName={product.vendor_name}
                  tier={(product.subscription?.toLowerCase() || "freemium") as Tier}
                  engagementScore={product.engagement_score}
                  growthPercentage={product.growth_percentage}
                  previousScore={product.previous_score}
                  isVerified={product.is_verified}
                  rating={product.rating}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Trending;
