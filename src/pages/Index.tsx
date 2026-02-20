import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
import NewsfeedSection from "@/components/NewsfeedSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import { getProducts, getAllCountries, getAllLanguages, getAllCategories } from "@/api/supabaseApi";
import { DashboardProduct } from "@/lib/types";


const Index = () => {
  const [dashboardProducts, setDashboardProducts] = useState<DashboardProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<DashboardProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/desktop (matches tailwind 'desktop' breakpoint at 1000px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch filter options (categories, countries, and languages)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [categoriesData, countriesData, languagesData] = await Promise.all([
          getAllCategories(),
          getAllCountries(),
          getAllLanguages(),
        ]);
        console.log("Filter options fetched:", { categoriesData, countriesData, languagesData });
        setCategories(categoriesData || []);
        setCountries(countriesData || []);
        setLanguages(languagesData || []);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch products for hero section (unfiltered)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getProducts({ n: 16, page: 1 });
        setDashboardProducts(products);
      } catch (error) {
        console.error("Error fetching dashboard products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Fetch filtered products for ProductsSection
  const fetchFilteredProducts = useCallback(async () => {
    try {
      const categoryFilter = selectedCategory !== "all" ? selectedCategory : null;
      const countryFilter = selectedCountry !== "all" ? selectedCountry : null;
      const languageFilter = selectedLanguage !== "all" ? selectedLanguage : null;

      const products = await getProducts({
        n: isMobile ? 4 : 8,
        page: 1,
        categoryFilter,
        countryFilter,
        languageFilter,
      });
      setFilteredProducts(products);
    } catch (error) {
      console.error("Error fetching filtered products:", error);
    }
  }, [selectedCategory, selectedCountry, selectedLanguage, isMobile]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSelectedCountry("all");
    setSelectedLanguage("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection products={dashboardProducts} />
      <ProductsSection 
        products={filteredProducts}
        categories={categories}
        countries={countries}
        languages={languages}
        selectedCategory={selectedCategory}
        selectedCountry={selectedCountry}
        selectedLanguage={selectedLanguage}
        onCategoryChange={handleCategoryChange}
        onCountryChange={handleCountryChange}
        onLanguageChange={handleLanguageChange}
        onClearFilters={handleClearFilters}
      />
      <NewsfeedSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
