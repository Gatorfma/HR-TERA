import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toggleReviewVote } from "@/api/reviewsApi";
import { useToast } from "@/hooks/use-toast";
import { ProductReviewDB } from "@/lib/types";
import ReviewReplySection from "./ReviewReplySection";
import WriteReviewDialog from "./WriteReviewDialog";

interface ReviewCardProps {
  review: ProductReviewDB;
  productId: string;
  productName: string;
  onRefresh: () => void;
}

const TRUNCATE_CHARS = 300;

const ReviewCard = ({ review, productId, productName, onRefresh }: ReviewCardProps) => {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [votePending, setVotePending] = useState(false);

  const isOwn = user?.id === review.user_id;
  const body = review.body ?? "";
  const isTruncatable = body.length > TRUNCATE_CHARS;
  const displayedBody = isTruncatable && !expanded ? body.slice(0, TRUNCATE_CHARS) + "…" : body;

  const handleVote = async (isHelpful: boolean) => {
    if (!isAuthenticated) {
      window.dispatchEvent(new Event("open-auth-modal"));
      return;
    }
    if (votePending) return;
    setVotePending(true);
    try {
      await toggleReviewVote(review.review_id, isHelpful);
      onRefresh();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Vote failed",
        variant: "destructive",
      });
    } finally {
      setVotePending(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      {/* Status badges */}
      {isOwn && review.status === "pending" && (
        <Badge variant="outline" className="mb-3 border-amber-400 text-amber-600 bg-amber-50">
          {t("reviews.pendingApproval")}
        </Badge>
      )}
      {isOwn && review.has_pending_edit && (
        <Badge variant="outline" className="mb-3 border-amber-400 text-amber-600 bg-amber-50">
          {t("reviews.pendingEdit")}
        </Badge>
      )}

      {/* Stars */}
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
            }`}
          />
        ))}
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold text-foreground mb-1">{review.title}</h4>
      )}

      {/* Body */}
      {body && (
        <>
          <p className="text-muted-foreground leading-relaxed mb-3">{displayedBody}</p>
          {isTruncatable && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-xs text-primary hover:underline mb-3"
            >
              {expanded ? t("reviews.readLess") : t("reviews.readMore")}
            </button>
          )}
        </>
      )}

      {/* Reviewer info + date */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-semibold text-foreground text-sm">{review.reviewer_name}</p>
          {(review.reviewer_role || review.reviewer_company) && (
            <p className="text-xs text-muted-foreground">
              {[review.reviewer_role, review.reviewer_company].filter(Boolean).join(" at ")}
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex-shrink-0">
          {new Date(review.created_at).toLocaleDateString(
            language === "tr" ? "tr-TR" : "en-US"
          )}
        </p>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 flex-wrap">
        {review.status === "approved" && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 h-7 px-2 text-xs ${
                review.my_vote === true ? "text-primary bg-primary/10" : "text-muted-foreground"
              }`}
              onClick={() => handleVote(true)}
              disabled={votePending}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {t("reviews.helpful")} {review.helpful_count > 0 && `(${review.helpful_count})`}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 h-7 px-2 text-xs ${
                review.my_vote === false ? "text-destructive bg-destructive/10" : "text-muted-foreground"
              }`}
              onClick={() => handleVote(false)}
              disabled={votePending}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              {t("reviews.notHelpful")} {review.not_helpful_count > 0 && `(${review.not_helpful_count})`}
            </Button>
          </>
        )}

        {isOwn && review.status === "approved" && !review.has_pending_edit && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 h-7 px-2 text-xs text-muted-foreground ml-auto"
            onClick={() => setShowEditDialog(true)}
          >
            <Pencil className="w-3.5 h-3.5" />
            {t("reviews.editReview")}
          </Button>
        )}
      </div>

      {/* Replies */}
      {review.status === "approved" && (
        <ReviewReplySection
          reviewId={review.review_id}
          replies={review.replies}
          replyCount={review.reply_count}
          onReplySubmitted={onRefresh}
        />
      )}

      {/* Edit dialog */}
      {showEditDialog && (
        <WriteReviewDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          productId={productId}
          productName={productName}
          existingReview={review}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};

export default ReviewCard;
