import { useState, useMemo, useEffect } from "react";
import { Search, Crown, Award, Filter, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tier, VendorCardData } from "@/lib/types";
import ListingTierBadge from "@/components/ListingTierBadge";
import { getVendors } from "@/api/supabaseApi";
import { useLanguage } from "@/contexts/LanguageContext";

const Vendors = () => {
  const { t } = useLanguage();
  
  const tierOptions: { value: Tier | "all"; label: string; icon?: React.ReactNode }[] = [
    { value: "all", label: t("products.allTiers") },
    { value: "premium", label: t("products.premium"), icon: <Crown className="w-3.5 h-3.5" /> },
    { value: "plus", label: t("products.plus"), icon: <Award className="w-3.5 h-3.5" /> },
    { value: "freemium", label: t("products.free") },
  ];
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState<VendorCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get tier filter from URL
  const tierFromUrl = searchParams.get("tier");

  const [selectedTier, setSelectedTier] = useState<Tier | "all">(() => {
    if (tierFromUrl && ["premium", "plus", "freemium"].includes(tierFromUrl)) {
      return tierFromUrl as Tier;
    }
    return "all";
  });

  // Fetch vendors from database
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getVendors({ n: 100, page: 1, searchQuery: null });
        setVendors(data as VendorCardData[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Tedarikçiler yüklenirken hata oluştu");
        console.error("Error fetching vendors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // Update tier filter when URL changes
  useEffect(() => {
    if (tierFromUrl && ["premium", "plus", "freemium"].includes(tierFromUrl)) {
      setSelectedTier(tierFromUrl as Tier);
    } else if (!tierFromUrl) {
      setSelectedTier("all");
    }
  }, [tierFromUrl]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle tier selection - update URL
  const handleTierSelect = (tier: Tier | "all") => {
    setSelectedTier(tier);
    const params: Record<string, string> = {};
    if (tier !== "all") {
      params.tier = tier;
    }
    setSearchParams(params);
  };

  const filteredVendors = useMemo(() => {
    return vendors
      .filter((vendor) => {
        const matchesTier =
          selectedTier === "all" || vendor.subscription === selectedTier;
        const matchesSearch =
          searchQuery === "" ||
          (vendor.company_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vendor.company_desc || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vendor.headquarters || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTier && matchesSearch;
      })
      // Sort by tier: Premium first, then Plus, then Freemium
      .sort((a, b) => {
        const tierOrder: Record<Tier, number> = { premium: 0, plus: 1, freemium: 2 };
        return tierOrder[a.subscription] - tierOrder[b.subscription];
      });
  }, [vendors, selectedTier, searchQuery]);

  const clearFilters = () => {
    setSelectedTier("all");
    setSearchQuery("");
    setSearchParams({});
  };

  const hasActiveFilters = selectedTier !== "all" || searchQuery !== "";

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
                    {t("vendors.vendorTier")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tierOptions.map((tier) => (
                      <button
                        key={tier.value}
                        onClick={() => handleTierSelect(tier.value)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-1.5 ${
                          selectedTier === tier.value
                            ? tier.value === "premium"
                              ? "bg-[#ADFF00] text-[#111827] shadow-sm"
                              : tier.value === "plus"
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
                    placeholder={t("vendors.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-card border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 shadow-sm"
                  />
                </div>
              </div>

              {/* Results count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("vendors.showing")} <span className="font-medium text-foreground">{filteredVendors.length}</span> {t("vendors.vendorsCount")}
                </p>
              </div>

              {/* Vendors Grid */}
              <div className="min-h-[600px]">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center py-16">
                    <p className="text-destructive text-lg">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 text-primary hover:underline font-medium"
                    >
                      Tekrar Dene
                    </button>
                  </div>
                ) : filteredVendors.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">{t("vendors.noVendors")}</p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-primary hover:underline font-medium"
                    >
                      {t("products.clearFilters")}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map((vendor) => (
                      <Link
                        key={vendor.vendor_id}
                        to={`/vendors/${vendor.vendor_id}`}
                        className="group"
                      >
                        <article className="bg-card rounded-2xl overflow-hidden shadow-card border border-border transition-all duration-250 ease-in-out hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full">
                          {/* Header with logo placeholder */}
                          <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 relative flex items-center justify-center">
                            <span className="text-6xl font-bold text-primary/30">
                              {(vendor.company_name || "V").charAt(0)}
                            </span>
                            {vendor.subscription !== "freemium" && (
                              <div className="absolute top-2.5 left-2.5">
                                <ListingTierBadge tier={vendor.subscription} />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            {/* Name */}
                            <h3 className="font-heading font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors duration-200">
                              {vendor.company_name || "Tedarikçi"}
                            </h3>

                            {/* Motto */}
                            {vendor.company_motto && (
                              <p className="text-sm text-primary font-medium mb-2 line-clamp-1">
                                {vendor.company_motto}
                              </p>
                            )}

                            {/* Description */}
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                              {vendor.company_desc || "Açıklama yok"}
                            </p>

                            {/* Meta Row */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              {vendor.headquarters && (
                                <span className="flex items-center gap-1">
                                  📍 {vendor.headquarters}
                                </span>
                              )}
                              {vendor.company_size && (
                                <span className="font-medium text-foreground">
                                  {vendor.company_size} çalışan
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
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

export default Vendors;
