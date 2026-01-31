import { Crown, Award, Star } from "lucide-react";
import { Tier } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";

interface TierBadgeProps {
  tier: Tier;
  showFeatured?: boolean;
}

const TierBadge = ({ tier, showFeatured = false }: TierBadgeProps) => {
  const { t } = useLanguage();

  if (tier === "freemium") return null;

  const config = {
    plus: {
      label: "Plus",
      icon: Award,
      className: "bg-zinc-200 text-zinc-700 border-zinc-300",
    },
    premium: {
      label: "Premium",
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
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${tierConfig.className}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {tierConfig.label}
      </span>
    </div>
  );
};

export default TierBadge;
