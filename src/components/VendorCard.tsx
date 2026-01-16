import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Tier } from "@/lib/types";
import ListingTierBadge from "./ListingTierBadge";

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
          <div className="aspect-[4/3] overflow-hidden relative">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {tier !== "freemium" && (
              <div className="absolute top-2.5 left-2.5">
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