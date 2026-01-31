import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, FolderOpen, MessageSquare, FileText, Mail, Globe, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Vendor } from "@/data/vendors";
import ProductCard from "@/components/ProductCard";

// Import existing section components
import VendorTestimonials from "./VendorTestimonials";
import VendorCaseStudies from "./VendorCaseStudies";
import VendorPackages from "./VendorPackages";
import VendorProcess from "./VendorProcess";
import VendorTeam from "./VendorTeam";
import VendorFeaturedContentSection from "./VendorFeaturedContent";
import VendorCampaigns from "./VendorCampaigns";
import VendorContactForm from "./VendorContactForm";

interface VendorTabsProps {
  vendor: Vendor;
  vendorProducts: any[];
}

type TabValue = "overview" | "services" | "portfolio" | "reviews" | "resources" | "contact";

const VendorTabs = ({ vendor, vendorProducts }: VendorTabsProps) => {
  const location = useLocation();
  const isPlusOrAbove = vendor.vendorTier === "plus" || vendor.vendorTier === "premium";
  const isPremium = vendor.vendorTier === "premium";

  // Determine which tabs should be visible
  const hasPortfolio = isPlusOrAbove && (
    (vendor.portfolioItems && vendor.portfolioItems.length > 0) ||
    (vendor.clientLogos && vendor.clientLogos.length > 0) ||
    (isPremium && vendor.caseStudies && vendor.caseStudies.length > 0)
  );
  const hasResources = isPlusOrAbove && vendor.featuredContent && vendor.featuredContent.length > 0;

  // Get initial tab from URL hash
  const getInitialTab = (): TabValue => {
    const hash = location.hash.replace("#", "") as TabValue;
    const validTabs: TabValue[] = ["overview", "services", "portfolio", "reviews", "resources", "contact"];
    if (validTabs.includes(hash)) {
      if (hash === "portfolio" && !hasPortfolio) return "overview";
      if (hash === "resources" && !hasResources) return "overview";
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
    { value: "overview" as const, label: "Overview", visible: true },
    { value: "services" as const, label: "Services & Industries", visible: true },
    { value: "portfolio" as const, label: "Portfolio & Case Studies", visible: hasPortfolio },
    { value: "reviews" as const, label: "Reviews", visible: true },
    { value: "resources" as const, label: "Resources", visible: hasResources },
    { value: "contact" as const, label: "Contact", visible: true },
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
              {/* About Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{vendor.fullDescription}</p>
                {isPlusOrAbove && vendor.extendedAbout && (
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {vendor.extendedAbout}
                  </div>
                )}
              </motion.div>

              {/* Basic Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <h3 className="font-heading font-bold text-lg text-foreground mb-4">Quick Facts</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="font-medium text-foreground">{vendor.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Website</div>
                      <a 
                        href={vendor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {vendor.website.replace('https://', '')}
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Hero Stats for Premium */}
              {isPremium && vendor.heroStats && (
                <div className="grid sm:grid-cols-3 gap-4">
                  {vendor.heroStats.map((stat, i) => (
                    <div key={i} className="bg-primary/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Products by Vendor */}
              {vendorProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <h2 className="text-xl font-heading font-bold text-foreground mb-4">Products by {vendor.name}</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {vendorProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        slug={product.slug}
                        image={product.image}
                        category={product.category}
                        name={product.name}
                        description={product.description}
                        index={index}
                        tier={product.vendorTier}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </TabsContent>

            {/* Services & Industries Tab */}
            <TabsContent value="services" className="mt-0 space-y-8">
              {/* Services Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">Services</h2>
                {isPlusOrAbove && vendor.serviceDescriptions ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {vendor.serviceDescriptions.map((service, i) => (
                      <div key={i} className="bg-muted/50 rounded-xl p-4">
                        <h3 className="font-medium text-foreground mb-1">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {vendor.services.map((service, i) => (
                      <span key={i} className="bg-muted text-foreground px-4 py-2 rounded-full text-sm font-medium">
                        {service}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Industries & Regions (Plus+) */}
              {isPlusOrAbove && (vendor.industries || vendor.regions) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <div className="grid sm:grid-cols-2 gap-6">
                    {vendor.industries && (
                      <div>
                        <h3 className="font-heading font-bold text-foreground mb-3">Industries</h3>
                        <div className="flex flex-wrap gap-2">
                          {vendor.industries.map((ind, i) => (
                            <span key={i} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                              {ind}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {vendor.regions && (
                      <div>
                        <h3 className="font-heading font-bold text-foreground mb-3">Regions</h3>
                        <div className="flex flex-wrap gap-2">
                          {vendor.regions.map((reg, i) => (
                            <span key={i} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                              {reg}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Packages (Premium) */}
              {isPremium && vendor.packages && <VendorPackages packages={vendor.packages} />}

              {/* Process (Premium) */}
              {isPremium && vendor.processSteps && <VendorProcess steps={vendor.processSteps} />}
            </TabsContent>

            {/* Portfolio & Case Studies Tab */}
            <TabsContent value="portfolio" className="mt-0 space-y-8">
              {/* Client Logos (Plus+) */}
              {isPlusOrAbove && vendor.clientLogos && vendor.clientLogos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <h3 className="font-heading font-bold text-lg text-foreground mb-4">Trusted By</h3>
                  <div className="flex flex-wrap gap-4">
                    {vendor.clientLogos.map((logo, i) => (
                      <div key={i} className="w-16 h-16 rounded-lg bg-muted overflow-hidden">
                        <img src={logo} alt="Client" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Portfolio (Plus+) */}
              {isPlusOrAbove && vendor.portfolioItems && vendor.portfolioItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <h2 className="text-xl font-heading font-bold text-foreground mb-4">Portfolio</h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {vendor.portfolioItems.map((item, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-border">
                        <div className="aspect-[4/3] bg-muted">
                          <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-foreground text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Case Studies (Premium) */}
              {isPremium && vendor.caseStudies && <VendorCaseStudies caseStudies={vendor.caseStudies} />}

              {/* Team (Premium) */}
              {isPremium && vendor.team && <VendorTeam team={vendor.team} />}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-0 space-y-8">
              {isPlusOrAbove && vendor.testimonials && vendor.testimonials.length > 0 ? (
                <VendorTestimonials testimonials={vendor.testimonials} />
              ) : (
                <div className="bg-card rounded-xl border border-border p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">Be the first to leave a review for this vendor!</p>
                </div>
              )}
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="mt-0 space-y-8">
              {isPremium && vendor.featuredContent && (
                <VendorFeaturedContentSection content={vendor.featuredContent} />
              )}

              {/* Campaigns (Premium) */}
              {isPremium && vendor.campaigns && <VendorCampaigns campaigns={vendor.campaigns} />}
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="mt-0 space-y-8">
              {isPlusOrAbove ? (
                <VendorContactForm vendorName={vendor.name} isPremium={isPremium} />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border p-8 text-center"
                >
                  <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Contact {vendor.name}</h3>
                  <p className="text-muted-foreground mb-6">Get in touch with this vendor via email.</p>
                  <Button asChild>
                    <a href={`mailto:${vendor.email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                </motion.div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorTabs;
