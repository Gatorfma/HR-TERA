import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ExternalLink, Star, Image, MessageSquare, DollarSign, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Product, Tier } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";

// Import existing section components
import IntegrationsSection from "./IntegrationsSection";
import AvailabilitySection from "./AvailabilitySection";
import ComplianceSection from "./ComplianceSection";
import ProductGallery from "./ProductGallery";
import ReviewsSection from "./ReviewsSection";
import UseCasesSection from "./UseCasesSection";
import ImplementationSection from "./ImplementationSection";
import ImpactMetricsSection from "./ImpactMetricsSection";
import FeaturedContentSection from "./FeaturedContentSection";
import DemoRequestSection from "./DemoRequestSection";
import CampaignsSection from "./CampaignsSection";

interface ProductTabsProps {
  product: Product;
  isUnclaimed?: boolean;
}

type TabValue = "overview" | "features" | "media" | "reviews" | "pricing" | "vendor";

const ProductTabs = ({ product, isUnclaimed = false }: ProductTabsProps) => {
  const location = useLocation();
  const { t } = useLanguage();
  
  // Force freemium tier for unclaimed products
  const effectiveTier = isUnclaimed ? "freemium" : product.vendorTier;
  const tier = effectiveTier;
  const isSilverOrGold = tier === "silver" || tier === "gold";
  const isGold = tier === "gold";

  // Determine which tabs should be visible
  const hasMedia = isSilverOrGold && product.screenshots && product.screenshots.length > 0;
  const hasReviews = isSilverOrGold && product.reviews;
  const hasPricing = product.price && product.price !== "Contact";
  const hasVendor = !isUnclaimed && !!product.vendor;

  // Get initial tab from URL hash
  const getInitialTab = (): TabValue => {
    const hash = location.hash.replace("#", "") as TabValue;
    const validTabs: TabValue[] = ["overview", "features", "media", "reviews", "pricing", "vendor"];
    if (validTabs.includes(hash)) {
      // Check if the tab should be visible
      if (hash === "media" && !hasMedia) return "overview";
      return hash;
    }
    return "overview";
  };

  const [activeTab, setActiveTab] = useState<TabValue>(getInitialTab);

  // Update URL hash when tab changes
  useEffect(() => {
    window.history.replaceState(null, "", `#${activeTab}`);
  }, [activeTab]);

  const tabs = [
    { value: "overview" as const, label: t("productTabs.overview"), icon: null, visible: true },
    { value: "features" as const, label: t("productTabs.features"), icon: null, visible: true },
    { value: "media" as const, label: t("productTabs.media"), icon: Image, visible: hasMedia },
    { value: "reviews" as const, label: t("productTabs.reviews"), icon: MessageSquare, visible: true },
    { value: "pricing" as const, label: t("productTabs.pricing"), icon: DollarSign, visible: true },
  ];

  const visibleTabs = tabs.filter(tab => tab.visible);

  return (
    <div className="mt-8">
      {/* Sticky Tab Bar */}
      <div className="sticky top-[72px] z-40 bg-background/95 backdrop-blur-sm border-b border-border -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-1 overflow-x-auto flex-nowrap scrollbar-hide">
            {visibleTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap font-medium"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          <div className="py-8">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-heading font-bold text-foreground mb-4">{t("productTabs.overview")}</h2>
                {isSilverOrGold && product.detailedOverview ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">{product.fullDescription}</p>
                    {product.detailedOverview.whoIsItFor && (
                      <div className="bg-card rounded-xl border border-border p-6">
                        <h3 className="font-semibold text-foreground mb-2">{t("productTabs.whoIsItFor")}</h3>
                        <p className="text-muted-foreground leading-relaxed">{product.detailedOverview.whoIsItFor}</p>
                      </div>
                    )}
                    {product.detailedOverview.whatDoesItSolve && (
                      <div className="bg-card rounded-xl border border-border p-6">
                        <h3 className="font-semibold text-foreground mb-2">{t("productTabs.whatDoesItSolve")}</h3>
                        <p className="text-muted-foreground leading-relaxed">{product.detailedOverview.whatDoesItSolve}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground leading-relaxed">{product.fullDescription}</p>
                )}
              </motion.div>

              {/* High-level stats for Gold */}
              {isGold && product.impactMetrics && (
                <div className="grid sm:grid-cols-3 gap-4">
                  {product.impactMetrics.slice(0, 3).map((metric, i) => (
                    <div key={i} className="bg-primary/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{metric.value}</div>
                      <div className="text-sm text-muted-foreground">{metric.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Features & Use Cases Tab */}
            <TabsContent value="features" className="mt-0 space-y-8">
              {/* Key Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">{t("productTabs.keyFeatures")}</h2>
                <ul className="grid gap-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Use Cases (Gold only) */}
              {isGold && product.useCases && <UseCasesSection useCases={product.useCases} />}

              {/* Integrations (Silver+) */}
              {isSilverOrGold && product.integrations && <IntegrationsSection integrations={product.integrations} />}

              {/* Availability (Silver+) */}
              {isSilverOrGold && <AvailabilitySection countries={product.availableCountries} languages={product.languages} />}

              {/* Compliance (Silver+) */}
              {isSilverOrGold && product.compliance && <ComplianceSection compliance={product.compliance} />}

              {/* Implementation (Gold only) */}
              {isGold && product.implementationSteps && <ImplementationSection steps={product.implementationSteps} />}
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="mt-0">
              {hasMedia && (
                <ProductGallery 
                  screenshots={product.screenshots} 
                  productName={product.name}
                  videoUrl={isGold ? product.videoUrl : undefined}
                />
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-0 space-y-8">
              {hasReviews && product.reviews && product.reviews.length > 0 ? (
                <ReviewsSection reviews={product.reviews} />
              ) : (
                <div className="bg-card rounded-xl border border-border p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t("productTabs.noReviews")}</h3>
                  <p className="text-muted-foreground">{t("productTabs.beFirstReview")}</p>
                </div>
              )}
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">{t("productTabs.pricing")}</h2>
                
                {hasPricing ? (
                  <div className="bg-card rounded-xl border border-border p-8">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-bold text-foreground">{product.price}</span>
                      <span className="text-muted-foreground">{t("productTabs.perMonth")}</span>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      {isGold 
                        ? t("productTabs.enterprisePricing")
                        : t("productTabs.flexiblePricing")}
                    </p>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      {t("productTabs.getStarted")}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <DollarSign className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">{t("productTabs.contactForPricing")}</h3>
                    <p className="text-muted-foreground mb-6">{t("productTabs.customizedPricing")}</p>
                    <Button variant="outline">{t("productDetail.contactVendor")}</Button>
                  </div>
                )}

                {/* Campaigns (Gold only) */}
                {isGold && product.campaigns && <CampaignsSection campaigns={product.campaigns} />}

                {/* Featured Content (Gold only) */}
                {isGold && product.featuredContent && <FeaturedContentSection content={product.featuredContent} />}
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductTabs;
