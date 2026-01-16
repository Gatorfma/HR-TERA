import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Mail, MapPin, Calendar, Users, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getVendorDetails, getVendorProducts } from "@/api/supabaseApi";
import { VendorDetailData, VendorProductData, Tier } from "@/lib/types";
import ListingTierBadge from "@/components/ListingTierBadge";
import { isValidUuid, logVendorEvent } from "@/lib/analytics";

const VendorDetail = () => {
  const { slug } = useParams<{ slug: string }>(); // slug is actually vendor_id
  const location = useLocation();
  const [vendor, setVendor] = useState<VendorDetailData | null>(null);
  const [products, setProducts] = useState<VendorProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const vendorId = slug && isValidUuid(slug) ? slug : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchVendor = async () => {
      if (!slug) {
        setError("Tedarikçi ID'si bulunamadı");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch vendor details and products in parallel
        const [vendorData, productsData] = await Promise.all([
          getVendorDetails(slug),
          getVendorProducts(slug)
        ]);
        
        if (!vendorData) {
          setError("Tedarikçi bulunamadı");
        } else {
          setVendor(vendorData);
          setProducts(productsData || []);
        }
      } catch (err) {
        console.error("Error fetching vendor:", err);
        setError(err instanceof Error ? err.message : "Tedarikçi yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendor();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">Tedarikçi Bulunamadı</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link to="/vendors" className="text-primary hover:underline">
            Tedarikçilere Dön
          </Link>
        </div>
      </div>
    );
  }

  const tier: Tier = vendor.subscription || "freemium";
  const isSilverOrAbove = tier === "silver" || tier === "gold";
  const isGold = tier === "gold";

  const handleVendorCtaClick = (ctaType: string) => {
    if (!vendorId) return;
    void logVendorEvent({
      vendorId,
      eventType: "vendor_cta_click",
      path: `${location.pathname}${location.search}`,
      referrer: document.referrer || null,
      metadata: { cta_type: ctaType },
    }).catch((error) => {
      console.error("Failed to log vendor event", error);
    });
  };

  // Parse company size for display
  const getEmployeeCount = (size: string | null) => {
    if (!size) return null;
    return size;
  };

  // Format founded date
  const getFoundedYear = (date: string | null) => {
    if (!date) return null;
    return new Date(date).getFullYear();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              to="/vendors"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Tedarikçilere Dön
            </Link>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-card rounded-2xl border overflow-hidden mb-6 ${
              isGold ? "border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.15)]" : "border-border"
            }`}
          >
            {/* Cover Image for Silver+ */}
            {isSilverOrAbove && (
              <div className="aspect-[3/1] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-9xl font-bold text-primary/20">
                  {(vendor.company_name || "V").charAt(0)}
                </span>
              </div>
            )}
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                {/* Left Side */}
                <div className="flex-1">
                  <div className="flex items-start gap-5 mb-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-primary/10 border border-border flex-shrink-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">
                        {(vendor.company_name || "V").charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                          {vendor.company_name || "Tedarikçi"}
                        </h1>
                        <ListingTierBadge tier={tier} />
                      </div>
                      {vendor.company_motto && (
                        <p className="text-primary font-medium mb-1">{vendor.company_motto}</p>
                      )}
                      {vendor.headquarters && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {vendor.headquarters}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {vendor.company_desc && (
                    <p className="text-muted-foreground mb-4">
                      {vendor.company_desc}
                    </p>
                  )}
                </div>

                {/* Right Side - CTAs */}
                <div className="lg:w-[280px] flex flex-col gap-3">
                  {vendor.website_link && (
                    <Button className="w-full rounded-full bg-primary text-[#111827] hover:bg-primary/90 font-semibold" size="lg" asChild>
                      <a
                        href={vendor.website_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleVendorCtaClick("visit_website")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Web Sitesine Git
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-border"
                    size="lg"
                    onClick={() => handleVendorCtaClick("contact_vendor")}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    İletişim
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Products */}
            <div className="lg:col-span-2 space-y-6">
              {/* Products Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <h2 className="font-heading font-bold text-xl text-foreground mb-4">
                  Ürünler ({products.length})
                </h2>
                
                {products.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Bu tedarikçinin henüz onaylanmış ürünü yok.
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <Link
                        key={product.product_id}
                        to={`/products/${product.product_id}`}
                        className="group"
                      >
                        <div className="border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                              {product.logo ? (
                                <img src={product.logo} alt={product.product_name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-lg font-bold text-muted-foreground">
                                  {product.product_name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {product.product_name}
                              </h3>
                              <p className="text-xs text-muted-foreground truncate">
                                {product.main_category}
                              </p>
                              {product.pricing && (
                                <span className="text-xs font-medium text-primary">
                                  {product.pricing}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="bg-card rounded-2xl border border-border p-6 sticky top-28"
              >
                <h3 className="font-heading font-bold text-lg text-foreground mb-4">Detaylar</h3>
                <div className="space-y-4 mb-6">
                  {getFoundedYear(vendor.founded_at) && (
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Kuruluş
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {getFoundedYear(vendor.founded_at)}
                      </span>
                    </div>
                  )}
                  {getEmployeeCount(vendor.company_size) && (
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Çalışan Sayısı
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {getEmployeeCount(vendor.company_size)}
                      </span>
                    </div>
                  )}
                  {vendor.headquarters && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Lokasyon
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {vendor.headquarters}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="font-heading font-bold text-lg text-foreground mb-4 pt-4 border-t border-border">
                  İletişim
                </h3>
                <div className="space-y-3">
                  {vendor.website_link && (
                    <a 
                      href={vendor.website_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => handleVendorCtaClick("visit_website")}
                    >
                      <Globe className="w-4 h-4 text-primary" />
                      <span className="truncate">{vendor.website_link.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                  {vendor.linkedin_link && (
                    <a 
                      href={vendor.linkedin_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => handleVendorCtaClick("visit_linkedin")}
                    >
                      <ExternalLink className="w-4 h-4 text-primary" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {vendor.instagram_link && (
                    <a 
                      href={vendor.instagram_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => handleVendorCtaClick("visit_instagram")}
                    >
                      <ExternalLink className="w-4 h-4 text-primary" />
                      <span>Instagram</span>
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorDetail;
