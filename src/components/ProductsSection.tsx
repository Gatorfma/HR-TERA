import { ArrowUpRight, Globe, Languages, LayoutGrid, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Tier, DashboardProduct } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductsSectionProps {
  products?: DashboardProduct[];
  categories?: string[];
  countries?: string[];
  languages?: string[];
  selectedCategory?: string;
  selectedCountry?: string;
  selectedLanguage?: string;
  onCategoryChange?: (category: string) => void;
  onCountryChange?: (country: string) => void;
  onLanguageChange?: (language: string) => void;
}

const ProductsSection = ({ 
  products = [],
  categories = [],
  countries = [],
  languages = [],
  selectedCategory = "all",
  selectedCountry = "all",
  selectedLanguage = "all",
  onCategoryChange,
  onCountryChange,
  onLanguageChange,
}: ProductsSectionProps) => {
  const { t } = useLanguage();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Map API products to ProductCard format
  const mappedProducts = products
    .map((product) => ({
      product_id: product.product_id,
      image: product.logo,
      category: product.main_category,
      name: product.product_name,
      description: product.short_desc,
      tier: product.subscription.toLowerCase() as Tier,
      isVerified: product.is_verified,
    }));

  if (mappedProducts.length === 0 && selectedCategory === "all" && selectedCountry === "all" && selectedLanguage === "all") return null;

  return (
    <section id="products" className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-6 mb-10"
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {t("products.title")}
            </h2>
            <div className="flex items-center gap-2">
              {/* Mobile Filter Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                className="desktop:hidden rounded-full border-border text-foreground hover:bg-muted"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="rounded-full border-border text-foreground hover:bg-muted" 
                asChild
              >
                <Link to="/products">
                  {t("products.browseAll")}
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Desktop Filters - Always Visible */}
          <div className="hidden desktop:flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-muted-foreground" />
              <Select
                value={selectedCategory}
                onValueChange={(value) => onCategoryChange?.(value)}
              >
                <SelectTrigger className="w-[180px] h-9 text-sm">
                  <SelectValue placeholder={t("products.category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products.allProducts")}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country Filter */}
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <Select
                value={selectedCountry}
                onValueChange={(value) => onCountryChange?.(value)}
              >
                <SelectTrigger className="w-[180px] h-9 text-sm">
                  <SelectValue placeholder={t("products.filterCountry")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products.allCountries")}</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-muted-foreground" />
              <Select
                value={selectedLanguage}
                onValueChange={(value) => onLanguageChange?.(value)}
              >
                <SelectTrigger className="w-[180px] h-9 text-sm">
                  <SelectValue placeholder={t("products.filterLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products.allLanguages")}</SelectItem>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile Filters - Toggleable */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="desktop:hidden flex flex-col gap-3 overflow-hidden"
              >
                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => onCategoryChange?.(value)}
                  >
                    <SelectTrigger className="flex-1 h-9 text-sm">
                      <SelectValue placeholder={t("products.category")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("products.allProducts")}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Country Filter */}
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <Select
                    value={selectedCountry}
                    onValueChange={(value) => onCountryChange?.(value)}
                  >
                    <SelectTrigger className="flex-1 h-9 text-sm">
                      <SelectValue placeholder={t("products.filterCountry")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("products.allCountries")}</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Language Filter */}
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-muted-foreground" />
                  <Select
                    value={selectedLanguage}
                    onValueChange={(value) => onLanguageChange?.(value)}
                  >
                    <SelectTrigger className="flex-1 h-9 text-sm">
                      <SelectValue placeholder={t("products.filterLanguage")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("products.allLanguages")}</SelectItem>
                      {languages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {mappedProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mappedProducts.map((product, index) => (
              <ProductCard
                key={product.product_id}
                product_id={product.product_id}
                image={product.image}
                category={product.category}
                name={product.name}
                description={product.description}
                index={index}
                tier={product.tier}
                isVerified={product.isVerified}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("products.noProducts")}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;