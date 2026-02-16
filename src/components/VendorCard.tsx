import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Tier } from "@/lib/types";
import ListingTierBadge from "./ListingTierBadge";
import LogoImage from "./ui/logo-image";

interface VendorCardProps {
  vendorID: string;
  name: string;
  image: string;
  tier: Tier;
  isVerified: boolean;
  index?: number;
}

const VendorCard = ({ vendorID, name, image, tier, isVerified, index = 0 }: VendorCardProps) => {
  return (
    <Link to={`/vendors/${vendorID}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="group cursor-pointer"
      >
        <div className="bg-secondary rounded-2xl overflow-hidden shadow-card card-hover">
          <div className="relative">
            <LogoImage variant="card" src={image} alt={name} hoverZoom fallbackText={name} />
            {tier !== "freemium" && (
              <div className="absolute top-2.5 left-2.5 z-10">
                <ListingTierBadge tier={tier} />
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-lg text-secondary-foreground">{name}</h3>
              {isVerified && (
                <span className="bg-primary text-[#111827] text-xs font-medium mx-1 px-2 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default VendorCard;