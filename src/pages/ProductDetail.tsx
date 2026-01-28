import { useParams, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, ExternalLink, Mail, Play, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProductBySlug, getSimilarProducts as getStaticSimilarProducts, Product } from "@/data/products";
import {
  getProductDetails,
  getSimilarProducts as getApiSimilarProducts,
  getVendorDetails,
} from "@/api/supabaseApi";
import SimilarProductsSection from "@/components/product-detail/SimilarProductsSection";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tier } from "@/lib/types";
import { logProductEvent } from "@/lib/analytics";
import { useLanguage } from "@/contexts/LanguageContext";

// Tier-specific components
import TierBadge from "@/components/product-detail/TierBadge";
import ProductTabs from "@/components/product-detail/ProductTabs";
import UnclaimedVendorSection from "@/components/product-detail/UnclaimedVendorSection";

// Helper to check if a string is a UUID
const isUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Helper to format date from API
const formatDate = (dateStr: string | null, t: (key: string) => string) => {
  if (!dateStr) return t("productDetail.notAvailable");
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// Interface for API product response
interface ApiProduct {
  product_id: string;
  vendor_id: string;
  product_name: string;
  product_website: string | null;
  main_category: string;
  categories: string[] | null;
  features: string[] | null;
  short_desc: string;
  long_desc: string | null;
  logo: string | null;
  video_url: string | null;
  gallery: string[] | null;
  pricing: string | null;
  languages: string[] | null;
  demo_link: string | null;
  release_date: string | null;
  rating: number | null;
  product_created_at: string;
  product_updated_at: string;
  // Vendor fields
  vendor_user_id: string | null;
  is_verified: boolean;
  company_name: string;
  company_desc: string | null;
  headquarters: string | null;
  vendor_website: string | null;
  subscription: string;
}

// Interface for similar product from API
interface ApiSimilarProduct {
  product_id: string;
  product_name: string;
  main_category: string;
  categories: string[] | null;
  short_desc: string;
  logo: string | null;
  pricing: string | null;
  rating: number | null;
  vendor_id: string;
  is_verified: boolean;
  company_name: string;
  subscription: string;
}

// Vendor details from getVendorDetails RPC
interface VendorDetails {
  vendor_id: string;
  user_id: string | null;
  is_verified: boolean | null;
  linkedin_link: string | null;
  instagram_link: string | null;
  website_link: string | null;
  logo: string | null;
  company_name: string | null;
  company_size: string | null;
  company_motto: string | null;
  company_desc: string | null;
  headquarters: string | null;
  founded_at: string | null; // date comes back as string
  subscription: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Convert API product to the format expected by components
const mapApiToProduct = (apiProduct: ApiProduct, t: (key: string) => string): Product => {
  const isVendorClaimed = apiProduct.vendor_user_id !== null;

  const vendorTier = isVendorClaimed
    ? ((apiProduct.subscription?.toLowerCase() || "freemium") as Tier)
    : ("freemium" as Tier);

  return {
    id: apiProduct.product_id,
    slug: apiProduct.product_id,
    image: apiProduct.logo || "/placeholder.svg",
    category: apiProduct.main_category,
    categories: apiProduct.categories || [apiProduct.main_category],
    name: apiProduct.product_name,
    price: apiProduct.pricing || t("productDetail.contact"),
    description: apiProduct.short_desc,
    fullDescription: apiProduct.long_desc || apiProduct.short_desc,
    features: apiProduct.features || [],
    screenshots: apiProduct.gallery || [apiProduct.logo || "/placeholder.svg"],
    videoUrl: apiProduct.video_url || undefined,
    vendor: {
      name: apiProduct.company_name,
      slug: apiProduct.vendor_id,
      logo: apiProduct.logo || "/placeholder.svg",
      description: apiProduct.company_desc || "",
      website: apiProduct.vendor_website || undefined,
      location: apiProduct.headquarters || undefined,
    },
    isVendorClaimed,
    vendorTier,
    releaseDate: formatDate(apiProduct.release_date, t),
    lastUpdated: formatDate(apiProduct.product_updated_at, t),
    modules: apiProduct.features || [],
    integrations: [],
    availableCountries: [],
    languages: apiProduct.languages || [],
    compliance: [],
    externalWebsite: apiProduct.product_website || undefined,
  };
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { t } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [vendorDetails, setVendorDetails] = useState<VendorDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [ownershipDialogOpen, setOwnershipDialogOpen] = useState(false);

  const productId = slug && isUUID(slug) ? slug : null;

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      if (!slug) {
        setError(t("productDetail.noProductId"));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (isUUID(slug)) {
          console.log("Fetching product details for UUID:", slug);
          const apiProduct = await getProductDetails(slug);
          console.log("API response:", apiProduct);
          if (apiProduct) {
            const mappedProduct = mapApiToProduct(apiProduct, t);
            setProduct(mappedProduct);

            // Fetch full vendor details (logo, headquarters, size, linkedin, motto, etc.)
            if (apiProduct.vendor_id) {
              try {
                const vd = await getVendorDetails(apiProduct.vendor_id);
                setVendorDetails(vd ?? null);

                // Optionally enrich product.vendor fields using vendorDetails (only if present)
                if (vd) {
                  setProduct((prev) => {
                    if (!prev?.vendor) return prev;
                    return {
                      ...prev,
                      vendor: {
                        ...prev.vendor,
                        logo: vd.logo || prev.vendor.logo,
                        location: vd.headquarters || prev.vendor.location,
                        website: vd.website_link || prev.vendor.website,
                        name: vd.company_name || prev.vendor.name,
                        description: vd.company_desc || prev.vendor.description,
                      },
                    };
                  });
                }
              } catch (e) {
                console.error("Error fetching vendor details:", e);
                setVendorDetails(null);
              }
            }

            const apiSimilar = await getApiSimilarProducts(slug, 4);
            const mappedSimilar = apiSimilar.map((p: ApiSimilarProduct) => ({
              id: p.product_id,
              slug: p.product_id,
              image: p.logo || "/placeholder.svg",
              category: p.main_category,
              categories: p.categories || [p.main_category],
              name: p.product_name,
              price: p.pricing || t("productDetail.contact"),
              description: p.short_desc,
              vendorTier: (p.subscription?.toLowerCase() || "freemium") as Tier,
            }));
            setSimilarProducts(mappedSimilar);
          } else {
            setError(t("productDetail.productNotFound"));
          }
        } else {
          const staticProduct = getProductBySlug(slug);
          if (staticProduct) {
            setProduct(staticProduct);
            const staticSimilar = getStaticSimilarProducts(staticProduct, 4);
            setSimilarProducts(staticSimilar);

            // For static products, we can still try to fetch vendor details if vendor slug looks like UUID
            if (staticProduct.vendor?.slug && isUUID(staticProduct.vendor.slug)) {
              try {
                const vd = await getVendorDetails(staticProduct.vendor.slug);
                setVendorDetails(vd ?? null);

                if (vd) {
                  setProduct((prev) => {
                    if (!prev?.vendor) return prev;
                    return {
                      ...prev,
                      vendor: {
                        ...prev.vendor,
                        logo: vd.logo || prev.vendor.logo,
                        location: vd.headquarters || prev.vendor.location,
                        website: vd.website_link || prev.vendor.website,
                        name: vd.company_name || prev.vendor.name,
                        description: vd.company_desc || prev.vendor.description,
                      },
                    };
                  });
                }
              } catch (e) {
                console.error("Error fetching vendor details:", e);
                setVendorDetails(null);
              }
            } else {
              setVendorDetails(null);
            }
          } else {
            setError(t("productDetail.productNotFound"));
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(t("productDetail.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    void fetchProduct();
  }, [slug, t]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t("productDetail.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <div className="text-center px-4">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">{t("productDetail.notFound")}</h1>
            <p className="text-muted-foreground mb-6">{error || t("productDetail.notFoundDesc")}</p>
            <Link to="/products" className="text-primary hover:underline">
              {t("productDetail.browseAll")}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleProductCtaClick = (ctaType: string) => {
    if (!productId) return;
    void logProductEvent({
      productId,
      eventType: "product_cta_click",
      path: `${location.pathname}${location.search}`,
      referrer: document.referrer || null,
      metadata: { cta_type: ctaType },
    }).catch((error) => {
      console.error("Failed to log product event", error);
    });
  };

  // Determine if product is unclaimed (vendor has no user_id)
  const isUnclaimed = !product.isVendorClaimed;

  // For unclaimed products, force freemium tier behavior
  const effectiveTier = isUnclaimed ? "freemium" : product.vendorTier;
  const tier = effectiveTier;
  const isPlusOrPremium = tier === "plus" || tier === "premium";
  const isPremium = tier === "premium";
  const categories = product.categories || [product.category];

  const vendorLogo = vendorDetails?.logo || product.vendor?.logo;
  const vendorHQ = vendorDetails?.headquarters || product.vendor?.location;
  const vendorSize = vendorDetails?.company_size || null;
  const vendorLinkedIn = vendorDetails?.linkedin_link || null;
  const vendorMotto = vendorDetails?.company_motto || null;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <div
          className={`relative overflow-hidden ${
            isPremium ? "bg-gradient-to-br from-primary/5 via-background to-primary/10" : ""
          }`}
        >
          {isPremium && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
          )}

          <div className="container relative">
            {/* Breadcrumb */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <Breadcrumb>
                <BreadcrumbList className="flex flex-wrap">
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/" className="text-muted-foreground hover:text-foreground">
                        {t("productDetail.home")}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>

                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/products" className="text-muted-foreground hover:text-foreground">
                        {t("nav.products")}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>

                  <BreadcrumbItem className="min-w-0">
                    <BreadcrumbPage className="text-foreground font-medium break-words">{product.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </motion.div>

            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 ${
                isPremium
                  ? "p-6 rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-sm shadow-[0_0_30px_hsl(var(--primary)/0.1)]"
                  : ""
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                {/* Logo & Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-4 mb-4 min-w-0">
                    {vendorLogo ? (
                      <img
                        src={vendorLogo}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center border border-border shrink-0">
                        <span className="text-2xl font-bold text-muted-foreground">{product.name.charAt(0)}</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {!isUnclaimed && <TierBadge tier={tier} showFeatured={isPremium} />}

                      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2 break-words">
                        {product.name}
                      </h1>

                      <p className="text-lg text-muted-foreground mt-1 break-words">{product.description}</p>
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categories.slice(0, tier === "freemium" ? 1 : 3).map((cat, i) => (
                      <Link
                        key={i}
                        to={`/products?category=${cat.toLowerCase()}`}
                        className="px-3 py-1 bg-primary/10 text-slate-700 rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap gap-3">
                    {isUnclaimed ? null : isPremium ? (
                      <>
                        <Button
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          size="lg"
                          onClick={() => handleProductCtaClick("request_demo")}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {t("productDetail.requestDemo")}
                        </Button>

                        <Button variant="outline" size="lg" asChild>
                          <a
                            href={product.externalWebsite || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleProductCtaClick("visit_website")}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t("productDetail.visitWebsite")}
                          </a>
                        </Button>

                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={() => handleProductCtaClick("download_brochure")}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {t("productDetail.downloadBrochure")}
                        </Button>
                      </>
                    ) : isPlusOrPremium ? (
                      <>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg" asChild>
                          <a
                            href={product.vendor?.website || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleProductCtaClick("visit_website")}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t("productDetail.visitWebsite")}
                          </a>
                        </Button>

                        <Button variant="outline" size="lg" onClick={() => handleProductCtaClick("contact_vendor")}>
                          <Mail className="w-4 h-4 mr-2" />
                          {t("productDetail.contactVendor")}
                        </Button>
                      </>
                    ) : (
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg" asChild>
                        <a
                          href={product.vendor?.website || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleProductCtaClick("visit_website")}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {t("productDetail.visitWebsite")}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Hero Image (Plus/Premium only) */}
                {isPlusOrPremium && product.screenshots && product.screenshots.length > 0 && (
                  <div className="lg:w-[45%] min-w-0">
                    <div className="rounded-xl overflow-hidden border border-border">
                      <img
                        src={product.screenshots[activeScreenshot]}
                        alt={product.name}
                        className="w-full aspect-video object-cover"
                      />
                    </div>

                    {product.screenshots.length > 1 && (
                      <div className="flex gap-2 mt-3">
                        {product.screenshots.slice(0, 3).map((ss, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveScreenshot(i)}
                            aria-label={`${t("productDetail.viewScreenshot")} ${i + 1}`}
                            className={`flex-1 rounded-lg overflow-hidden border-2 transition-all ${
                              activeScreenshot === i ? "border-primary" : "border-border"
                            }`}
                          >
                            <img src={ss} alt="" className="w-full aspect-video object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Left Column - Main Content with Tabs */}
            <div className="lg:col-span-2 min-w-0">
              <ProductTabs product={product} isUnclaimed={isUnclaimed} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-28 space-y-6"
              >
                {/* Vendor Info */}
                {product.vendor && (
                  <div className="bg-card rounded-2xl border border-border p-6 min-w-0">
                    <h3 className="font-heading font-bold text-lg text-foreground mb-4">{t("productDetail.vendor")}</h3>

                    {/* Vendor Details */}
                    <div className="mb-4 min-w-0">
                      <Link
                        to={`/vendors/${product.vendor.slug}`}
                        className="flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-muted transition-colors min-w-0"
                      >
                        <img
                          src={vendorLogo || "/placeholder.svg"}
                          alt={product.vendor.name}
                          className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground block truncate">
                            {vendorDetails?.company_name || product.vendor.name}
                          </span>
                          {!isUnclaimed && (
                            <span className="text-xs text-muted-foreground">{t("productDetail.viewProfile")}</span>
                          )}
                        </div>
                      </Link>

                      {vendorMotto && (
                        <p className="text-sm text-muted-foreground mt-3 italic break-words">“{vendorMotto}”</p>
                      )}

                      {(vendorHQ || vendorSize) && (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {vendorHQ && (
                            <div className="rounded-xl border border-border bg-muted/30 p-3">
                              <p className="text-xs text-muted-foreground">Headquarters</p>
                              <p className="text-sm font-medium text-foreground break-words">{vendorHQ}</p>
                            </div>
                          )}
                          {vendorSize && (
                            <div className="rounded-xl border border-border bg-muted/30 p-3">
                              <p className="text-xs text-muted-foreground">Company size</p>
                              <p className="text-sm font-medium text-foreground break-words">{vendorSize}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Website (prefer vendorDetails.website_link, fallback product.vendor.website) */}
                      {(vendorDetails?.website_link || product.vendor.website) && (
                        <a
                          href={(vendorDetails?.website_link || product.vendor.website) as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-4 min-w-0"
                        >
                          <ExternalLink className="w-4 h-4 shrink-0" />
                          <span className="truncate">
                            {(vendorDetails?.website_link || product.vendor.website)?.replace(/^https?:\/\//, "")}
                          </span>
                        </a>
                      )}

                      {/* LinkedIn */}
                      {vendorLinkedIn && (
                        <a
                          href={vendorLinkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-2 min-w-0"
                        >
                          <ExternalLink className="w-4 h-4 shrink-0" />
                          <span className="truncate">
                            {vendorLinkedIn.replace(/^https?:\/\//, "").replace(/^www\./, "")}
                          </span>
                        </a>
                      )}
                    </div>

                    {/* Claim Button - Only shown for unclaimed vendors */}
                    {isUnclaimed && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-3">{t("productDetail.claimPrompt")}</p>
                        <Button
                          size="sm"
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-8"
                          onClick={() => {
                            handleProductCtaClick("vendor_apply");
                            setOwnershipDialogOpen(true);
                          }}
                        >
                          {t("productDetail.claimProduct")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Similar Products Section */}
          {similarProducts.length > 0 && <SimilarProductsSection products={similarProducts} />}
        </div>

        {isUnclaimed && (
          <Dialog open={ownershipDialogOpen} onOpenChange={setOwnershipDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <UnclaimedVendorSection claimedVendorId={product.vendor?.slug ?? null} />
            </DialogContent>
          </Dialog>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
