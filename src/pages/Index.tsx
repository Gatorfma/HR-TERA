import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
import BlogSection from "@/components/BlogSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import { getProducts, getAllCountries, getAllLanguages, getAllCategories } from "@/api/supabaseApi";
import { DashboardProduct } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";


const Index = () => {
  const [dashboardProducts, setDashboardProducts] = useState<DashboardProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<DashboardProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect admins to admin page on load
  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      console.log('[Index] Admin detected, redirecting to /admin');
      navigate('/admin', { replace: true });
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

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
        n: 8,
        page: 1,
        categoryFilter,
        countryFilter,
        languageFilter,
      });
      setFilteredProducts(products);
    } catch (error) {
      console.error("Error fetching filtered products:", error);
    }
  }, [selectedCategory, selectedCountry, selectedLanguage]);

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
      <BlogSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
