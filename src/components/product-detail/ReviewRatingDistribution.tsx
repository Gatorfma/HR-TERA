import { Star } from "lucide-react";
import { ProductReviewDB } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReviewRatingDistributionProps {
  reviews: ProductReviewDB[];
}

const ReviewRatingDistribution = ({ reviews }: ReviewRatingDistributionProps) => {
  const { t } = useLanguage();
  const approved = reviews.filter((r) => r.status === "approved");
  const total = approved.length;

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: approved.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground font-medium mb-2">{t("reviews.distribution")}</p>
      {counts.map(({ star, count }) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 w-14 flex-shrink-0">
              <span className="text-xs text-muted-foreground w-3 text-right">{star}</span>
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 ml-0.5" />
            </div>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewRatingDistribution;
