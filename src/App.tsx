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
import Newsfeed from "./pages/Newsfeed";
import NewsfeedPost from "./pages/NewsfeedPost";
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
import ReviewRequestsPage from "./pages/admin/ReviewRequestsPage";
import AdminNewsfeed from "./pages/admin/AdminNewsfeed";
import NewsfeedEditPage from "./pages/admin/NewsfeedEditPage";
import Profile from "./pages/Profile";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import FAQ from "./pages/FAQ";
import KVKK from "./pages/KVKK";
import PrivacySecurity from "./pages/PrivacySecurity";
import TermsOfUse from "./pages/TermsOfUse";
import VendorTerms from "./pages/VendorTerms";
import Story from "./pages/Story";
import Contact from "./pages/Contact";
import Trending from "./pages/Trending";
import Compare from "./pages/Compare";
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
                <Route path="/newsfeed" element={<Newsfeed />} />
                <Route path="/newsfeed/:slug" element={<NewsfeedPost />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/edit" element={<ProductEditPage />} />
                <Route path="/admin/products/new" element={<ProductCreatePage />} />
                <Route path="/admin/products/requests" element={<ProductRequestsPage />} />
                <Route path="/admin/products/tiers" element={<ProductTiersPage />} />
                <Route path="/admin/products/analytics" element={<ProductAnalyticsPage />} />
                <Route path="/admin/products/bulk-upload" element={<ProductBulkUploadPage />} />
                <Route path="/admin/products/reviews" element={<ReviewRequestsPage />} />
                <Route path="/admin/companies/edit" element={<CompanyEditPage />} />
                <Route path="/admin/companies/new" element={<CompanyCreatePage />} />
                <Route path="/admin/companies/bulk-upload" element={<CompanyBulkUploadPage />} />
                <Route path="/admin/newsfeed" element={<AdminNewsfeed />} />
                <Route path="/admin/newsfeed/edit" element={<NewsfeedEditPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/products/new" element={<AddProduct />} />
                <Route path="/profile/products/:productId/edit" element={<EditProduct />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/kvkk" element={<KVKK />} />
                <Route path="/privacy-security" element={<PrivacySecurity />} />
                <Route path="/terms-of-use" element={<TermsOfUse />} />
                <Route path="/vendor-terms" element={<VendorTerms />} />
                <Route path="/story" element={<Story />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/compare" element={<Compare />} />
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
