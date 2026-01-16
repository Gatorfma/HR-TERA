import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { VendorPackage } from "@/data/vendors";
import { Button } from "@/components/ui/button";

interface VendorPackagesProps {
  packages: VendorPackage[];
}

const VendorPackages = ({ packages }: VendorPackagesProps) => {
  if (!packages || packages.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <h2 className="text-xl font-heading font-bold text-foreground mb-6">
        Packages & Pricing
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        {packages.map((pkg, index) => (
          <div 
            key={index} 
            className={`rounded-xl border p-5 ${
              index === 1 
                ? "border-primary bg-primary/5" 
                : "border-border"
            }`}
          >
            <h3 className="font-heading font-bold text-lg text-foreground mb-1">
              {pkg.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {pkg.description}
            </p>
            {pkg.startingPrice && (
              <p className="text-2xl font-bold text-foreground mb-4">
                {pkg.startingPrice}
              </p>
            )}
            <ul className="space-y-2 mb-5">
              {pkg.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              variant={index === 1 ? "default" : "outline"}
              className={`w-full rounded-full ${
                index === 1 
                  ? "bg-primary text-[#111827] hover:bg-primary/90" 
                  : ""
              }`}
            >
              Get Started
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default VendorPackages;
