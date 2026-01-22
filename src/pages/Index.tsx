import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
// HomeFilterSection removed
import ProductsSection from "@/components/ProductsSection";
import BlogSection from "@/components/BlogSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import { getProducts } from "@/api/supabaseApi";
import { DashboardProduct } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";


const Index = () => {
  const [dashboardProducts, setDashboardProducts] = useState<DashboardProduct[]>([]);
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect admins to admin page on load
  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      console.log('[Index] Admin detected, redirecting to /admin');
      navigate('/admin', { replace: true });
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch top 8 products for the landing page (simulating "popular" via default sort in RPC)
        const products = await getProducts({ n: 8, page: 1 });
        setDashboardProducts(products as any);
      } catch (error) {
        console.error("Error fetching dashboard products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection products={dashboardProducts} />
      {/* HomeFilterSection removed */}
      <ProductsSection products={dashboardProducts} />
      <BlogSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
