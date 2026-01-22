
import { useState, useMemo, useEffect } from "react";
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
import { getProducts } from "@/api/supabaseApi";

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

  const [displayProducts, setDisplayProducts] = useState<any[]>(products);
  const [loading, setLoading] = useState(false);

  // Update displayProducts when initial props change (if no filters are active)
  useEffect(() => {
    const hasActiveFilters = selectedCategory !== "all" || selectedLanguage !== "all" || selectedCountry !== "all";
    if (!hasActiveFilters && products.length > 0) {
      setDisplayProducts(products);
    }
  }, [products]);

  // Server-side filtering
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      const hasActiveFilters = selectedCategory !== "all" || selectedLanguage !== "all" || selectedCountry !== "all";

      if (!hasActiveFilters) {
        // If no filters, revert to the initial popular products passed via props
        if (products.length > 0) {
          setDisplayProducts(products);
        }
        return;
      }

      setLoading(true);
      try {
        const categoryFilter = selectedCategory !== "all" ? selectedCategory : null;
        const languageFilter = selectedLanguage !== "all" ? selectedLanguage : null;
        const codeMap: Record<string, string> = {
          "Turkey": "TR",
          "United States": "US",
          "United Kingdom": "UK",
          "Germany": "DE",
          "Netherlands": "NL",
          "Global": "Global",
          "Remote": "Remote"
        };
        const countryFilter = selectedCountry !== "all" ? (codeMap[selectedCountry] || selectedCountry) : null;

        // Fetch top 12 matches for the landing page using the new RPC
        const data = await getProducts({
          n: 12,
          page: 1,
          categoryFilter,
          languageFilter,
          countryFilter
        });

        setDisplayProducts(data);
      } catch (err) {
        console.error("Error filtering products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, selectedLanguage, selectedCountry, products]);

  // Format products for display
  const mappedProducts = useMemo(() => {
    return displayProducts.map((product) => ({
      product_id: product.product_id,
      image: product.logo,
      category: product.main_category,
      name: product.product_name,
      description: product.short_desc,
      tier: (product.subscription || product.vendor_subscription || "freemium").toLowerCase() as Tier,
      isVerified: product.is_verified,
    }));
  }, [displayProducts]);

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
            {mappedProducts.length > 0 ? (
              mappedProducts.map((product, index) => (
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
