import { useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { submitReview, editMyReview } from "@/api/reviewsApi";
import { ProductReviewDB } from "@/lib/types";

interface WriteReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  existingReview?: ProductReviewDB;
  onSuccess: () => void;
}

const WriteReviewDialog = ({
  open,
  onOpenChange,
  productId,
  productName,
  existingReview,
  onSuccess,
}: WriteReviewDialogProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEdit = !!existingReview;

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [reviewerName, setReviewerName] = useState(
    existingReview?.reviewer_name ?? user?.fullName ?? ""
  );
  const [reviewerRole, setReviewerRole] = useState(
    existingReview?.reviewer_role ?? user?.role ?? ""
  );
  const [reviewerCompany, setReviewerCompany] = useState(
    existingReview?.reviewer_company ?? user?.company ?? ""
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    if (!reviewerName.trim()) return;

    setSubmitting(true);
    try {
      if (isEdit && existingReview) {
        await editMyReview(existingReview.review_id, rating, title || undefined, body || undefined);
        toast({
          title: t("reviews.reviewUpdated"),
          description: t("reviews.reviewUpdatedDesc"),
        });
      } else {
        await submitReview({
          productId,
          rating,
          title: title || undefined,
          body: body || undefined,
          reviewerName,
          reviewerRole: reviewerRole || undefined,
          reviewerCompany: reviewerCompany || undefined,
        });
        toast({
          title: t("reviews.reviewSubmitted"),
          description: t("reviews.reviewSubmittedDesc"),
        });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("reviews.editReview") : t("reviews.writeReview")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Star Rating */}
          <div>
            <Label className="text-sm font-medium mb-2 block">{t("reviews.yourRating")}</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="review-title" className="text-sm font-medium mb-1.5 block">
              {t("reviews.reviewTitle")}
            </Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              placeholder={t("reviews.reviewTitle")}
              maxLength={100}
            />
          </div>

          {/* Body */}
          <div>
            <Label htmlFor="review-body" className="text-sm font-medium mb-1.5 block">
              {t("reviews.reviewBody")}
            </Label>
            <Textarea
              id="review-body"
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 2000))}
              placeholder={t("reviews.reviewBody")}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {body.length} / 2000
            </p>
          </div>

          {/* Reviewer info — only editable on new reviews */}
          {!isEdit && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="reviewer-name" className="text-sm font-medium mb-1.5 block">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reviewer-name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="reviewer-role" className="text-sm font-medium mb-1.5 block">
                  Role
                </Label>
                <Input
                  id="reviewer-role"
                  value={reviewerRole}
                  onChange={(e) => setReviewerRole(e.target.value)}
                  placeholder="e.g. HR Manager"
                />
              </div>
              <div>
                <Label htmlFor="reviewer-company" className="text-sm font-medium mb-1.5 block">
                  Company
                </Label>
                <Input
                  id="reviewer-company"
                  value={reviewerCompany}
                  onChange={(e) => setReviewerCompany(e.target.value)}
                  placeholder="Company name"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {submitting
              ? "…"
              : isEdit
              ? t("reviews.updateReview")
              : t("reviews.submitReview")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WriteReviewDialog;
