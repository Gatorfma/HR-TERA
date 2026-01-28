import { Crown, Award } from "lucide-react";
import { Tier } from "@/data/products";

interface TierBadgeProps {
  tier: Tier;
  size?: "sm" | "md" | "lg";
}

const TierBadge = ({ tier, size = "md" }: TierBadgeProps) => {
  if (tier === "freemium") return null;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-sm gap-2"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  if (tier === "premium") {
    return (
      <span 
        className={`inline-flex items-center rounded-full font-semibold bg-primary text-[#111827] ${sizeClasses[size]}`}
      >
        <Crown className={iconSizes[size]} />
        Premium Partner
      </span>
    );
  }

  if (tier === "plus") {
    return (
      <span 
        className={`inline-flex items-center rounded-full font-semibold bg-[#F3F4F6] text-[#111827] border border-[#D1D5DB] ${sizeClasses[size]}`}
      >
        <Award className={iconSizes[size]} />
        Plus Vendor
      </span>
    );
  }

  return null;
};

export default TierBadge;
