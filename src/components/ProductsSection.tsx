
import { useState, useMemo } from "react";
import { ArrowUpRight, Search, LayoutGrid, Globe, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Tier, DashboardProduct } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { PRODUCT_CATEGORIES } from "@/lib/admin-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductsSectionProps {
  products?: any[]; // Using any to accommodate the joined result with extra fields
}

// Common languages
const LANGUAGES = [
  "Turkish",
  "English",
  "German",
  "Spanish",
  "French"
];

// Common countries
const COUNTRIES = [
  "Turkey",
  "United States",
  "United Kingdom",
  "Germany",
  "Netherlands",
  "Remote",
  "Global"
];

const ProductsSection = ({ products = [] }: ProductsSectionProps) => {
  const { t } = useLanguage();

  // Filtering State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");

  // Map API products to ProductCard format and Filter in real-time
  const filteredProducts = useMemo(() => {
    let result = products;

    const hasActiveFilters = selectedCategory !== "all" || selectedLanguage !== "all" || selectedCountry !== "all";

    if (!hasActiveFilters) {
      // DEFAULT VIEW: Show only Gold products when no filters are active
      result = result.filter(p => {
        const tier = (p.subscription || p.vendor_subscription || "freemium").toLowerCase();
        return tier === "gold";
      });
    } else {
      // FILTERED VIEW: Search across ALL products (Gold, Silver, Free)

      // Filter by Category
      if (selectedCategory && selectedCategory !== "all") {
        result = result.filter(p => p.main_category === selectedCategory);
      }

      // Filter by Language
      if (selectedLanguage && selectedLanguage !== "all") {
        result = result.filter(p =>
          p.languages?.some((l: string) => l.toLowerCase() === selectedLanguage.toLowerCase())
        );
      }

      // Filter by Country
      if (selectedCountry && selectedCountry !== "all") {
        const codeMap: Record<string, string> = {
          "Turkey": "TR",
          "United States": "US",
          "United Kingdom": "GB",
          "Germany": "DE",
          "Netherlands": "NL",
          "Global": "Global",
          "Remote": "Remote"
        };
        const targetCode = codeMap[selectedCountry] || selectedCountry;

        result = result.filter(p => {
          if (!p.headquarters) return false;
          // Handle "City, CC" or just "CC"
          const parts = p.headquarters.split(",");
          const locationCode = parts[parts.length - 1].trim();
          return locationCode.toLowerCase() === targetCode.toLowerCase();
        });
      }
    }

    return result.map((product) => ({
      product_id: product.product_id,
      image: product.logo,
      category: product.main_category,
      name: product.product_name,
      description: product.short_desc,
      tier: (product.subscription || product.vendor_subscription || "freemium").toLowerCase() as Tier,
      isVerified: product.is_verified,
    }));
  }, [products, selectedCategory, selectedLanguage, selectedCountry]);

  // Limit initially shown products if no filter is active to keep it "Popular", 
  // but if filtering, show all matches (or up to a reasonable limit like 12)
  const displayProducts = filteredProducts.slice(0, 12);
  const hasActiveFilters = selectedCategory !== "all" || selectedLanguage !== "all" || selectedCountry !== "all";

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedLanguage("all");
    setSelectedCountry("all");
  };

  if (products.length === 0) return null;

  return (
    <section id="products" className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          {/* Header Row */}
          <div className="flex flex-col md:flex-row items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                {t("products.title")}
              </h2>
              <p className="text-muted-foreground mt-2">
                {t("products.subtitle")}
              </p>
            </div>

            <Button
              variant="outline"
              className="hidden md:flex rounded-full border-border text-foreground hover:bg-muted"
              asChild
            >
              <Link to="/products">
                {t("products.browseAll")}
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] h-9 rounded-full bg-background border-input text-xs font-medium focus:ring-1 focus:ring-primary">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/70" />
                  <SelectValue placeholder={t("products.category")} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Language */}
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[140px] h-9 rounded-full bg-background border-input text-xs font-medium focus:ring-1 focus:ring-primary">
                <div className="flex items-center gap-2 truncate">
                  <Globe className="w-3 h-3 text-muted-foreground" />
                  <SelectValue placeholder="Language" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Country */}
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[140px] h-9 rounded-full bg-background border-input text-xs font-medium focus:ring-1 focus:ring-primary">
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <SelectValue placeholder="Country" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 px-3 rounded-full text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
                <X className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* Results Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {displayProducts.length > 0 ? (
              displayProducts.map((product, index) => (
                <motion.div
                  key={product.product_id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCard
                    product_id={product.product_id}
                    image={product.image}
                    category={product.category}
                    name={product.name}
                    description={product.description}
                    index={index}
                    tier={product.tier}
                    isVerified={product.isVerified}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-12 text-center text-muted-foreground"
              >
                No solutions found matching your filters.
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Mobile Browse All Button */}
        <div className="mt-8 flex justify-center md:hidden">
          <Button
            variant="outline"
            className="rounded-full border-border text-foreground hover:bg-muted w-full max-w-xs"
            asChild
          >
            <Link to="/products">
              {t("products.browseAll")}
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
