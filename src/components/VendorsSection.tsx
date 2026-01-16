import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorCard from "./VendorCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DashboardProduct, Tier } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface VendorsSectionProps {
  vendors: DashboardProduct[];
}

const VendorsSection = ({ vendors }: VendorsSectionProps) => {
  const { t } = useLanguage();
  
  if (vendors.length === 0) return null;

  return (
    <section id="vendors" className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {t("vendors.title")}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t("vendors.subtitle")}
            </p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-full border-border text-foreground hover:bg-muted" 
            asChild
          >
            <Link to="/vendors">
              {t("vendors.browseAll")}
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vendors.map((vendor, index) => (
            <VendorCard
              key={vendor.vendor_id}
              vendorID={vendor.vendor_id}
              name={vendor.company_name}
              image={vendor.logo}
              tier={vendor.subscription.toLowerCase() as Tier}
              isVerified={vendor.is_verified}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default VendorsSection;