import { Crown, Award, Star } from "lucide-react";
import { Tier } from "@/data/products";

interface TierBadgeProps {
  tier: Tier;
  showFeatured?: boolean;
}

const TierBadge = ({ tier, showFeatured = false }: TierBadgeProps) => {
  if (tier === "freemium") return null;

  const config = {
    plus: {
      label: "Plus Vendor",
      icon: Award,
      className: "bg-zinc-200 text-zinc-700 border-zinc-300",
    },
    premium: {
      label: "Premium Vendor",
      icon: Crown,
      className: "bg-primary/20 text-primary-foreground border-primary",
      glow: true,
    },
  };

  const tierConfig = config[tier];
  const Icon = tierConfig.icon;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${tierConfig.className} ${
          tier === "premium" ? "shadow-[0_0_12px_hsl(var(--primary)/0.4)]" : ""
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        {tierConfig.label}
      </span>
      {showFeatured && tier === "premium" && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
          <Star className="w-3 h-3 fill-current" />
          Featured Solution
        </span>
      )}
    </div>
  );
};

export default TierBadge;
