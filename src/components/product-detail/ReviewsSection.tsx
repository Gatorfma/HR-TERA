import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Star, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { getProductReviews } from "@/api/reviewsApi";
import { ProductReviewDB } from "@/lib/types";
import ReviewCard from "./ReviewCard";
import ReviewRatingDistribution from "./ReviewRatingDistribution";
import WriteReviewDialog from "./WriteReviewDialog";

type SortBy = "helpful" | "newest" | "oldest" | "highest" | "lowest";

interface ReviewsSectionProps {
  productId: string;
  productName: string;
}

const ReviewsSection = ({ productId, productName }: ReviewsSectionProps) => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState<ProductReviewDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>("helpful");
  const [showWriteDialog, setShowWriteDialog] = useState(false);
  const [pendingLoginAction, setPendingLoginAction] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getProductReviews(productId, sortBy);
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy]);

  // After login, if user was trying to write a review, open the dialog
  useEffect(() => {
    if (user && pendingLoginAction) {
      setShowWriteDialog(true);
      setPendingLoginAction(false);
    }
  }, [user, pendingLoginAction]);

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      setPendingLoginAction(true);
      window.dispatchEvent(new Event("open-auth-modal"));
    } else {
      setShowWriteDialog(true);
    }
  };

  const approvedReviews = reviews.filter((r) => r.status === "approved");
  const reviewsWithBody = approvedReviews.filter((r) => r.body && r.body.trim().length > 0);
  const ownPendingReview = reviews.find(
    (r) => r.status === "pending" && r.user_id === user?.id
  );

  const avgRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length
      : null;

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: "helpful", label: t("reviews.sortMostHelpful") },
    { value: "newest", label: t("reviews.sortNewest") },
    { value: "highest", label: t("reviews.sortHighestRated") },
    { value: "lowest", label: t("reviews.sortLowestRated") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          {t("reviews.title")}
        </h2>
        <Button
          onClick={handleWriteReviewClick}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          size="sm"
        >
          {t("reviews.writeReview")}
        </Button>
      </div>

      {/* Login prompt (shown after clicking Write Review when logged out) */}
      {pendingLoginAction && !isAuthenticated && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <LogIn className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            {t("reviews.loginToReview")}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary card */}
          {approvedReviews.length > 0 && avgRating !== null && (
            <div className="bg-card rounded-xl border border-border p-5 mb-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-foreground">
                    {avgRating.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(avgRating)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("reviews.basedOn").replace(
                        "{count}",
                        String(approvedReviews.length)
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex-1 sm:pl-6 sm:border-l sm:border-border">
                  <ReviewRatingDistribution reviews={reviews} />
                </div>
              </div>
            </div>
          )}

          {/* Sort pills */}
          {approvedReviews.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                    sortBy === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Own pending review (shown to the owner at the top) */}
          {ownPendingReview && (
            <div className="mb-4">
              <ReviewCard
                review={ownPendingReview}
                productId={productId}
                productName={productName}
                onRefresh={fetchReviews}
              />
            </div>
          )}

          {/* Approved reviews list — only show reviews that have a body */}
          {reviewsWithBody.length > 0 ? (
            <div className="space-y-4">
              {reviewsWithBody.map((review) => (
                <ReviewCard
                  key={review.review_id}
                  review={review}
                  productId={productId}
                  productName={productName}
                  onRefresh={fetchReviews}
                />
              ))}
            </div>
          ) : (
            !ownPendingReview && reviewsWithBody.length === 0 && (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t("reviews.noReviews")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("reviews.beFirstToReview")}
                </p>
                <Button
                  onClick={handleWriteReviewClick}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {t("reviews.writeReview")}
                </Button>
              </div>
            )
          )}
        </>
      )}

      {/* Write Review Dialog */}
      <WriteReviewDialog
        open={showWriteDialog}
        onOpenChange={setShowWriteDialog}
        productId={productId}
        productName={productName}
        onSuccess={fetchReviews}
      />
    </motion.div>
  );
};

export default ReviewsSection;
