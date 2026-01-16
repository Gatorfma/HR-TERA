import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { Tier } from "@/lib/types";
import ListingTierBadge from "./ListingTierBadge";

interface ProductCardProps {
  image: string;
  category: string;
  name: string;
  description: string;
  index?: number;
  product_id?: string;
  slug?: string; // Alias for backwards compatibility
  tier?: Tier;
  isVerified?: boolean;
}

const ProductCard = ({
  image,
  category,
  name,
  description,
  index = 0,
  product_id,
  slug,
  tier = "freemium",
  isVerified = false,
}: ProductCardProps) => {
  const productLink = product_id ? `/products/${product_id}` : slug ? `/products/${slug}` : "#";
  const productIdentifier = product_id || slug || "";

  return (
    <Link to={`/products/${productIdentifier}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="group cursor-pointer"
      >
        <div className="bg-card rounded-2xl overflow-hidden shadow-card card-hover border border-border">
          <div className="aspect-[4/3] overflow-hidden bg-muted relative">
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
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{category}</span>
              {isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
