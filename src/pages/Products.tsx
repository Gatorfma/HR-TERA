import { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Globe, Languages, BotMessageSquare, ChevronDown, Check } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Tier } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { getProducts, getProductCountFiltered, getAllCategories, getAllCountries, getAllLanguages } from "@/api/supabaseApi";
import type { DashboardProduct } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

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

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allCountries, setAllCountries] = useState<string[]>([]);
  const [allLanguages, setAllLanguages] = useState<string[]>([]);

  // Get filters from URL
  const categoryFromUrl = searchParams.get("category");
  const tierFromUrl = searchParams.get("tier");
  const countryFromUrl = searchParams.get("country");
  const languageFromUrl = searchParams.get("language");
  const aiFromUrl = searchParams.get("ai");
  const pageFromUrl = searchParams.get("page");
  const searchFromUrl = searchParams.get("search");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTier, setSelectedTier] = useState<Tier | "all">("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [aiOnly, setAiOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch filter options from database
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [categories, countries, languages] = await Promise.all([
          getAllCategories(),
          getAllCountries(),
          getAllLanguages(),
        ]);
        setAllCategories(categories);
        setAllCountries(countries || []);
        setAllLanguages(languages || []);
      } catch (err) {
        console.error("Error fetching filter options:", err);
        setAllCategories([]);
        setAllCountries([]);
        setAllLanguages([]);
      }
    };
    fetchFilterOptions();
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
      const matched = allCategories.find((cat) => cat.toLowerCase() === categoryFromUrl.toLowerCase());
      if (matched) {
        setSelectedCategory(matched);
      } else {
        setSelectedCategory("all");
      }
    } else {
      setSelectedCategory("all");
    }
    
    if (tierFromUrl && ["premium", "plus", "freemium"].includes(tierFromUrl)) {
      setSelectedTier(tierFromUrl as Tier);
    } else {
      setSelectedTier("all");
    }

    if (countryFromUrl && allCountries.includes(countryFromUrl)) {
      setSelectedCountry(countryFromUrl);
    } else {
      setSelectedCountry("all");
    }

    if (languageFromUrl && allLanguages.includes(languageFromUrl)) {
      setSelectedLanguage(languageFromUrl);
    } else {
      setSelectedLanguage("all");
    }

    if (pageFromUrl) {
      const page = parseInt(pageFromUrl, 10);
      if (page > 0) {
        setCurrentPage(page);
      }
    } else {
      setCurrentPage(1);
    }

    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }

    if (aiFromUrl === "true") {
      setAiOnly(true);
    } else {
      setAiOnly(false);
    }
  }, [categoryFromUrl, tierFromUrl, countryFromUrl, languageFromUrl, aiFromUrl, pageFromUrl, searchFromUrl, allCategories, allCountries, allLanguages]);

  // Fetch products with pagination and filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Prepare filters for database
        const productFilter = debouncedSearchQuery.trim() || null;
        const categoryFilter = selectedCategory !== "all" ? selectedCategory : null;
        const tierFilter = selectedTier !== "all" ? selectedTier : null;
        const countryFilter = selectedCountry !== "all" ? selectedCountry : null;
        const languageFilter = selectedLanguage !== "all" ? selectedLanguage : null;

        // Fetch products with pagination
        const apiProducts = await getProducts({
          n: PRODUCTS_PER_PAGE,
          page: currentPage,
          productFilter,
          vendorFilter: null,
          categoryFilter,
          languageFilter,
          countryFilter,
          tierFilter,
          aiOnly,
        });

        // Fetch total count with same filters
        const count = await getProductCountFiltered({
          productFilter,
          vendorFilter: null,
          categoryFilter,
          languageFilter,
          countryFilter,
          tierFilter,
          aiOnly,
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
        setError(err instanceof Error ? err.message : t("products.fail"));
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, debouncedSearchQuery, selectedCategory, selectedTier, selectedCountry, selectedLanguage, aiOnly]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  // Build URL params helper
  const buildUrlParams = (overrides: Partial<{
    category: string;
    tier: Tier | "all";
    country: string;
    language: string;
    ai: boolean;
    search: string;
    page: number;
  }> = {}) => {
    const params: Record<string, string> = {};
    const category = overrides.category ?? selectedCategory;
    const tier = overrides.tier ?? selectedTier;
    const country = overrides.country ?? selectedCountry;
    const language = overrides.language ?? selectedLanguage;
    const ai = overrides.ai ?? aiOnly;
    const search = overrides.search ?? searchQuery;
    const page = overrides.page ?? currentPage;

    if (category !== "all") params.category = category.toLowerCase();
    if (tier !== "all") params.tier = tier;
    if (country !== "all") params.country = country;
    if (language !== "all") params.language = language;
    if (ai) params.ai = "true";
    if (search.trim()) params.search = search.trim();
    if (page > 1) params.page = page.toString();

    return params;
  };

  // Handle category selection - update URL and reset to page 1
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSearchParams(buildUrlParams({ category, page: 1 }));
  };

  // Handle tier selection - update URL and reset to page 1
  const handleTierSelect = (tier: Tier | "all") => {
    setSelectedTier(tier);
    setCurrentPage(1);
    setSearchParams(buildUrlParams({ tier, page: 1 }));
  };

  // Handle country selection - update URL and reset to page 1
  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setCurrentPage(1);
    setSearchParams(buildUrlParams({ country, page: 1 }));
  };

  // Handle language selection - update URL and reset to page 1
  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setCurrentPage(1);
    setSearchParams(buildUrlParams({ language, page: 1 }));
  };

  // Handle AI filter selection - update URL and reset to page 1
  const handleAiSelect = (value: boolean) => {
    setAiOnly(value);
    setCurrentPage(1);
    setSearchParams(buildUrlParams({ ai: value, page: 1 }));
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
      setSearchParams(buildUrlParams({ page: newPage }));
      window.scrollTo(0, 0);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedTier("all");
    setSelectedCountry("all");
    setSelectedLanguage("all");
    setAiOnly(false);
    setSearchQuery("");
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedTier !== "all" || selectedCountry !== "all" || selectedLanguage !== "all" || aiOnly || searchQuery !== "";

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      {/* Main Content */}
      <main className="pt-24 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block lg:w-[260px] flex-shrink-0">
              <div className="bg-card rounded-2xl p-5 shadow-card border border-border sticky top-28 space-y-6">
                {/* Tier Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    {t("products.vendorTier")}
                  </h3>
                  <Select
                    value={selectedTier}
                    onValueChange={(value) => handleTierSelect(value as Tier | "all")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("products.vendorTier")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("products.allTiers")}</SelectItem>
                      <SelectItem value="premium">{t("products.premium")}</SelectItem>
                      <SelectItem value="plus">{t("products.plus")}</SelectItem>
                      <SelectItem value="freemium">{t("products.free")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">{t("products.category")}</h3>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => handleCategorySelect(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("products.category")} />
                    </SelectTrigger>
                    <SelectContent className="max-w-[calc(100vw-2rem)] max-h-[300px] overflow-auto">
                      <SelectItem value="all">{t("trending.allCategories")}</SelectItem>
                      {allCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Country Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t("products.filterCountry")}
                  </h3>
                  <Select
                    value={selectedCountry}
                    onValueChange={(value) => handleCountrySelect(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("products.filterCountry")} />
                    </SelectTrigger>
                    <SelectContent className="max-w-[calc(100vw-2rem)] max-h-[300px] overflow-auto">
                      <SelectItem value="all">{t("products.allCountries")}</SelectItem>
                      {allCountries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Language Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    {t("products.filterLanguage")}
                  </h3>
                  <Select
                    value={selectedLanguage}
                    onValueChange={(value) => handleLanguageSelect(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("products.filterLanguage")} />
                    </SelectTrigger>
                    <SelectContent className="max-w-[calc(100vw-2rem)] max-h-[300px] overflow-auto">
                      <SelectItem value="all">{t("products.allLanguages")}</SelectItem>
                      {allLanguages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* AI Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <BotMessageSquare className="w-4 h-4" />
                    {t("products.aiFilter")}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <span className={`flex items-center gap-2 ${aiOnly ? "text-foreground" : "text-muted-foreground"}`}>
                        {t("products.aiFilter")}
                        {aiOnly && <Check className="h-4 w-4 text-primary" />}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[220px] p-2">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <Checkbox
                          checked={aiOnly}
                          onCheckedChange={(checked) => handleAiSelect(checked === true)}
                        />
                        {t("products.aiPowered")}
                      </label>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              {/* Search Bar with Mobile Filter Toggle */}
              <div className="mb-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={t("products.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-card border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                  </div>
                  {/* Mobile Filter Toggle Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden h-14 w-14 rounded-full border-border text-foreground hover:bg-muted flex-shrink-0"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                  >
                    <Filter className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Mobile Filters */}
              <AnimatePresence>
                {showMobileFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="lg:hidden mb-6 overflow-hidden"
                  >
                    <div className="bg-card rounded-2xl p-5 shadow-card border border-border space-y-4">
                      {/* Tier Filter */}
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Filter className="w-4 h-4" />
                          {t("products.vendorTier")}
                        </h3>
                        <Select
                          value={selectedTier}
                          onValueChange={(value) => handleTierSelect(value as Tier | "all")}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("products.vendorTier")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t("products.allTiers")}</SelectItem>
                            <SelectItem value="premium">{t("products.premium")}</SelectItem>
                            <SelectItem value="plus">{t("products.plus")}</SelectItem>
                            <SelectItem value="freemium">{t("products.free")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Category Filter */}
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2">{t("products.category")}</h3>
                        <Select
                          value={selectedCategory}
                          onValueChange={(value) => handleCategorySelect(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("products.category")} />
                          </SelectTrigger>
                          <SelectContent className="max-w-[calc(100vw-2rem)] max-h-[300px] overflow-auto">
                            <SelectItem value="all">{t("trending.allCategories")}</SelectItem>
                            {allCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Country Filter */}
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          {t("products.filterCountry")}
                        </h3>
                        <Select
                          value={selectedCountry}
                          onValueChange={(value) => handleCountrySelect(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("products.filterCountry")} />
                          </SelectTrigger>
                          <SelectContent className="max-w-[calc(100vw-2rem)] max-h-[300px] overflow-auto">
                            <SelectItem value="all">{t("products.allCountries")}</SelectItem>
                            {allCountries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Language Filter */}
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Languages className="w-4 h-4" />
                          {t("products.filterLanguage")}
                        </h3>
                        <Select
                          value={selectedLanguage}
                          onValueChange={(value) => handleLanguageSelect(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("products.filterLanguage")} />
                          </SelectTrigger>
                          <SelectContent className="max-w-[calc(100vw-2rem)] max-h-[300px] overflow-auto">
                            <SelectItem value="all">{t("products.allLanguages")}</SelectItem>
                            {allLanguages.map((language) => (
                              <SelectItem key={language} value={language}>
                                {language}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* AI Filter */}
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <BotMessageSquare className="w-4 h-4" />
                          {t("products.aiFilter")}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <span className={`flex items-center gap-2 ${aiOnly ? "text-foreground" : "text-muted-foreground"}`}>
                              {t("products.aiFilter")}
                              {aiOnly && <Check className="h-4 w-4 text-primary" />}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[calc(100vw-4rem)] p-2">
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                              <Checkbox
                                checked={aiOnly}
                                onCheckedChange={(checked) => handleAiSelect(checked === true)}
                              />
                              {t("products.aiPowered")}
                            </label>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("products.showing")}{" "}
                  {loading ? (
                    <span className="font-medium text-foreground">...</span>
                  ) : (
                    <>
                      <span className="font-medium text-foreground">
                        {(currentPage - 1) * PRODUCTS_PER_PAGE + 1} -{" "}
                        {Math.min(currentPage * PRODUCTS_PER_PAGE, totalCount)}
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
                    <p className="text-destructive text-lg">
                      {t("common.error")}: {error}
                    </p>
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
                    <button onClick={clearFilters} className="mt-4 text-primary hover:underline font-medium">
                      {t("products.clearFilters")}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product, i) => (
                        <ProductCard
                          key={product.id}
                          product_id={product.id}
                          image={product.image}
                          category={product.category}
                          name={product.name}
                          description={product.description}
                          tier={product.vendorTier}
                          isVerified={product.isVerified}
                          index={i}
                        />
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