import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import ListingTierBadge from "@/components/ListingTierBadge";
import { Tier } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrendingCardProps {
  rank: number;
  productId: string;
  name: string;
  logo: string;
  category: string;
  vendorName: string;
  tier: Tier;
  engagementScore: number;
  growthPercentage: number;
  previousScore: number;
  isVerified?: boolean;
}

const TrendingCard = ({
  rank,
  productId,
  name,
  logo,
  category,
  vendorName,
  tier,
  engagementScore,
  growthPercentage,
  previousScore,
  isVerified,
}: TrendingCardProps) => {
  const { t } = useLanguage();

  // When previous_score is 0, the SQL returns 100% by default — that's meaningless.
  // Show a "New" badge instead.
  const isNew = previousScore === 0;

  const getGrowthColor = () => {
    if (growthPercentage > 0) return "text-emerald-600";
    if (growthPercentage < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const getGrowthIcon = () => {
    if (growthPercentage > 0) return <TrendingUp className="w-3.5 h-3.5" />;
    if (growthPercentage < 0) return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  return (
    <Link to={`/products/${productId}`} className="group">
      <div className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-card border border-border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        {/* Rank */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">#{rank}</span>
        </div>

        {/* Logo */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
          <img
            src={logo}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-heading font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
            {tier !== "freemium" && <ListingTierBadge tier={tier} />}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {category} &middot; {vendorName}
          </p>
        </div>

        {/* Metrics */}
        <div className="flex-shrink-0 text-right">
          {isNew ? (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{t("trending.new")}</span>
            </div>
          ) : (
            <div className={`flex items-center gap-1 justify-end ${getGrowthColor()}`}>
              {getGrowthIcon()}
              <span className="text-sm font-semibold">
                {growthPercentage > 0 ? "+" : ""}
                {growthPercentage}%
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            {engagementScore.toLocaleString()} {t("trending.views")}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default TrendingCard;
