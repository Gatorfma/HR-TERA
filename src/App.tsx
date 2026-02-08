import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProductApplicationsProvider } from "@/contexts/ProductApplicationsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Vendors from "./pages/Vendors";
import VendorDetail from "./pages/VendorDetail";
import VendorApply from "./pages/VendorApply";
import SearchResults from "./pages/SearchResults";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Admin from "./pages/Admin";
import AdminProducts from "./pages/AdminProducts";
import ProductEditPage from "./pages/admin/ProductEditPage";
import ProductCreatePage from "./pages/admin/ProductCreatePage";
import ProductRequestsPage from "./pages/admin/ProductRequestsPage";
import ProductTiersPage from "./pages/admin/ProductTiersPage";
import ProductAnalyticsPage from "./pages/admin/ProductAnalyticsPage";
import ProductBulkUploadPage from "./pages/admin/ProductBulkUploadPage";
import CompanyEditPage from "./pages/admin/CompanyEditPage";
import CompanyCreatePage from "./pages/admin/CompanyCreatePage";
import CompanyBulkUploadPage from "./pages/admin/CompanyBulkUploadPage";
import Profile from "./pages/Profile";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Story from "./pages/Story";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <ProductApplicationsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <ScrollToTop />
              <AnalyticsTracker />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/vendors/:slug" element={<VendorDetail />} />
                <Route path="/vendors/apply" element={<VendorApply />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/edit" element={<ProductEditPage />} />
                <Route path="/admin/products/new" element={<ProductCreatePage />} />
                <Route path="/admin/products/requests" element={<ProductRequestsPage />} />
                <Route path="/admin/products/tiers" element={<ProductTiersPage />} />
                <Route path="/admin/products/analytics" element={<ProductAnalyticsPage />} />
                <Route path="/admin/products/bulk-upload" element={<ProductBulkUploadPage />} />
                <Route path="/admin/companies/edit" element={<CompanyEditPage />} />
                <Route path="/admin/companies/new" element={<CompanyCreatePage />} />
                <Route path="/admin/companies/bulk-upload" element={<CompanyBulkUploadPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/products/new" element={<AddProduct />} />
                <Route path="/profile/products/:productId/edit" element={<EditProduct />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/story" element={<Story />} />
                <Route path="/contact" element={<Contact />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ProductApplicationsProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
