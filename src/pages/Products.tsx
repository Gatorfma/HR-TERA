import { useState, useMemo, useEffect } from "react";
import { BadgeCheck, Search, Crown, Award, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tier } from "@/lib/types";
import ListingTierBadge from "@/components/ListingTierBadge";
import { getProducts, getProductCountFiltered } from "@/api/supabaseApi";
import type { DashboardProduct } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { PRODUCT_CATEGORIES } from "@/lib/admin-types";

const PRODUCTS_PER_PAGE = 12;

// Map API product to component product structure
interface Product {
  id: string;
  image: string;
  category: string;
  name: string;
  description: string;
  vendorTier: Tier;
  isVerified?: boolean;
}

const Products = () => {
  const { t } = useLanguage();
  
  const tierOptions: { value: Tier | "all"; label: string; icon?: React.ReactNode }[] = [
    { value: "all", label: t("products.allTiers") },
    { value: "gold", label: t("products.gold"), icon: <Crown className="w-3.5 h-3.5" /> },
    { value: "silver", label: t("products.silver"), icon: <Award className="w-3.5 h-3.5" /> },
    { value: "freemium", label: t("products.free") },
  ];
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  // Get filters from URL
  const categoryFromUrl = searchParams.get("category");
  const tierFromUrl = searchParams.get("tier");
  const pageFromUrl = searchParams.get("page");
  
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedTier, setSelectedTier] = useState<Tier | "all">("all");

  // Initialize categories from PRODUCT_CATEGORIES
  useEffect(() => {
    setAllCategories(["All Products", ...PRODUCT_CATEGORIES]);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update filters when URL changes
  useEffect(() => {
    if (categoryFromUrl) {
      const matched = allCategories.find(
        (cat) => cat.toLowerCase() === categoryFromUrl.toLowerCase()
      );
      if (matched) {
        setSelectedCategory(matched);
      } else {
        setSelectedCategory("All Products");
      }
    } else {
      setSelectedCategory("All Products");
    }
    
    if (tierFromUrl && ["gold", "silver", "freemium"].includes(tierFromUrl)) {
      setSelectedTier(tierFromUrl as Tier);
    } else {
      setSelectedTier("all");
    }

    if (pageFromUrl) {
      const page = parseInt(pageFromUrl, 10);
      if (page > 0) {
        setCurrentPage(page);
      }
    } else {
      setCurrentPage(1);
    }
  }, [categoryFromUrl, tierFromUrl, pageFromUrl, allCategories]);

  // Fetch products with pagination and filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Prepare filters for database
        const productFilter = debouncedSearchQuery.trim() || null;
        const categoryFilter = selectedCategory !== "All Products" ? selectedCategory : null;
        const tierFilter = selectedTier !== "all" ? selectedTier : null;

        // Fetch products with pagination
        const apiProducts = await getProducts({
          n: PRODUCTS_PER_PAGE,
          page: currentPage,
          productFilter,
          vendorFilter: null,
          categoryFilter,
          tierFilter,
        });

        // Fetch total count with same filters
        const count = await getProductCountFiltered({
          productFilter,
          vendorFilter: null,
          categoryFilter,
          tierFilter,
        });

        // Map API products to component structure
        const mappedProducts: Product[] = apiProducts.map((apiProduct: DashboardProduct) => ({
          id: apiProduct.product_id,
          image: apiProduct.logo,
          category: apiProduct.main_category,
          name: apiProduct.product_name,
          description: apiProduct.short_desc,
          vendorTier: (apiProduct.subscription?.toLowerCase() || "freemium") as Tier,
          isVerified: apiProduct.is_verified,
        }));

        setProducts(mappedProducts);
        setTotalCount(count);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, debouncedSearchQuery, selectedCategory, selectedTier]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  // Handle category selection - update URL and reset to page 1
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    const params: Record<string, string> = {};
    if (category !== "All Products") {
      params.category = category.toLowerCase();
    }
    if (selectedTier !== "all") {
      params.tier = selectedTier;
    }
    setSearchParams(params);
  };

  // Handle tier selection - update URL and reset to page 1
  const handleTierSelect = (tier: Tier | "all") => {
    setSelectedTier(tier);
    setCurrentPage(1);
    const params: Record<string, string> = {};
    if (selectedCategory !== "All Products") {
      params.category = selectedCategory.toLowerCase();
    }
    if (tier !== "all") {
      params.tier = tier;
    }
    setSearchParams(params);
  };

  // Handle search - debounced and reset to page 1
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const params: Record<string, string> = {};
      if (selectedCategory !== "All Products") {
        params.category = selectedCategory.toLowerCase();
      }
      if (selectedTier !== "all") {
        params.tier = selectedTier;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      params.page = newPage.toString();
      setSearchParams(params);
      window.scrollTo(0, 0);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("All Products");
    setSelectedTier("all");
    setSearchQuery("");
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory !== "All Products" || selectedTier !== "all" || searchQuery !== "";

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      {/* Main Content */}
      <main className="pt-24 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-[260px] flex-shrink-0">
              <div className="bg-card rounded-2xl p-5 shadow-card border border-border sticky top-28 space-y-6">
                {/* Tier Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    {t("products.vendorTier")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tierOptions.map((tier) => (
                      <button
                        key={tier.value}
                        onClick={() => handleTierSelect(tier.value)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-1.5 ${
                          selectedTier === tier.value
                            ? tier.value === "gold"
                              ? "bg-[#ADFF00] text-[#111827] shadow-sm"
                              : tier.value === "silver"
                              ? "bg-[#F3F4F6] text-[#111827] border border-[#D1D5DB] shadow-sm"
                              : "bg-primary text-primary-foreground shadow-sm"
                            : "bg-background text-foreground border border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        {tier.icon}
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">{t("products.category")}</h3>
                  <div className="flex flex-wrap gap-2 max-h-96 p-2 overflow-y-auto">
                    {allCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          selectedCategory === category
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-background text-foreground border border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("products.clearAllFilters")}
                  </button>
                )}
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t("products.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-card border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 shadow-sm"
                  />
                </div>
              </div>

              {/* Results count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("products.showing")}{" "}
                  {loading ? (
                    <span className="font-medium text-foreground">...</span>
                  ) : (
                    <>
                      <span className="font-medium text-foreground">
                        {(currentPage - 1) * PRODUCTS_PER_PAGE + 1} - {Math.min(currentPage * PRODUCTS_PER_PAGE, totalCount)}
                      </span>
                      {t("products.of")}{" "}
                      <span className="font-medium text-foreground">{totalCount}</span>
                    </>
                  )}{" "}
                  {t("products.productsCount")}
                </p>
              </div>

              {/* Products Grid */}
              <div className="min-h-[600px]">
                {loading ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">{t("products.loading")}</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-16">
                    <p className="text-destructive text-lg">{t("common.error")}: {error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 text-primary hover:underline font-medium"
                    >
                      {t("products.retry")}
                    </button>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">{t("products.noProducts")}</p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-primary hover:underline font-medium"
                    >
                      {t("products.clearFilters")}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.id}`}
                          className="group"
                        >
                          <article className="bg-card rounded-2xl overflow-hidden shadow-card border border-border transition-all duration-250 ease-in-out hover:-translate-y-1 hover:shadow-lg cursor-pointer">
                            {/* Image */}
                            <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              {product.vendorTier !== "freemium" && (
                                <div className="absolute top-2.5 left-2.5">
                                  <ListingTierBadge tier={product.vendorTier} />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="p-5">
                              {/* Category & Verified Row */}
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {product.category}
                                </span>
                                {product.isVerified && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                                    <BadgeCheck className="h-3 w-3" />
                                    Verified
                                  </span>
                                )}
                              </div>

                              {/* Title */}
                              <h3 className="font-heading font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors duration-200">
                                {product.name}
                              </h3>

                              {/* Description */}
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-12">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1 || loading}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 7) {
                            pageNum = i + 1;
                          } else if (currentPage <= 4) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 3) {
                            pageNum = totalPages - 6 + i;
                          } else {
                            pageNum = currentPage - 3 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              className={`rounded-full w-10 h-10 ${
                                currentPage === pageNum
                                  ? "bg-primary text-primary-foreground"
                                  : "border-border text-foreground hover:bg-muted"
                              }`}
                              onClick={() => handlePageChange(pageNum)}
                              disabled={loading}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}

                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages || loading}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
