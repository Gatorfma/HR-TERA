import { Crown } from "lucide-react";
import { Tier } from "@/lib/types";

interface ListingTierBadgeProps {
  tier: Tier;
  className?: string;
}

const ListingTierBadge = ({ tier, className = "" }: ListingTierBadgeProps) => {
  if (tier === "freemium") return null;

  if (tier === "gold") {
    return (
      <span 
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary text-[#111827] ${className}`}
      >
        <Crown className="w-3 h-3" />
        Gold
      </span>
    );
  }

  if (tier === "silver") {
    return (
      <span 
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3F4F6] text-[#111827] border border-[#D1D5DB] ${className}`}
      >
        Silver
      </span>
    );
  }

  return null;
};

export default ListingTierBadge;
