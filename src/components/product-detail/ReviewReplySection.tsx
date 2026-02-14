import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { submitReply } from "@/api/reviewsApi";
import { useToast } from "@/hooks/use-toast";
import { ReviewReplyDB } from "@/lib/types";

interface ReviewReplySectionProps {
  reviewId: string;
  replies: ReviewReplyDB[];
  replyCount: number;
  onReplySubmitted: () => void;
}

const ReviewReplySection = ({
  reviewId,
  replies,
  replyCount,
  onReplySubmitted,
}: ReviewReplySectionProps) => {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyBody.trim() || replyBody.trim().length < 5) return;
    setSubmitting(true);
    try {
      await submitReply(reviewId, replyBody.trim(), user?.fullName ?? "User");
      toast({
        title: t("reviews.replySubmitted"),
        description: t("reviews.replySubmittedDesc"),
      });
      setReplyBody("");
      onReplySubmitted();
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

  if (replyCount === 0 && !isAuthenticated) return null;

  return (
    <div className="mt-3 border-t border-border pt-3">
      {replyCount > 0 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {replyCount} {t("reviews.replies")}
        </button>
      )}

      {expanded && (
        <div className="mt-3 space-y-3 pl-4 border-l-2 border-border">
          {replies.map((reply) => (
            <div key={reply.review_id} className="text-sm">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-foreground">{reply.reviewer_name}</span>
                {reply.reviewer_role && (
                  <span className="text-muted-foreground text-xs">{reply.reviewer_role}</span>
                )}
                {reply.status === "pending" && (
                  <Badge variant="outline" className="text-xs border-amber-400 text-amber-600 bg-amber-50">
                    {t("reviews.pendingApproval")}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed">{reply.body}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(reply.created_at).toLocaleDateString(language === "tr" ? "tr-TR" : "en-US")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      {isAuthenticated ? (
        <div className="mt-3 space-y-2">
          <Textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value.slice(0, 2000))}
            placeholder={t("reviews.replyPlaceholder")}
            rows={2}
            className="resize-none text-sm"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmitReply}
              disabled={submitting || replyBody.trim().length < 5}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {submitting ? "…" : t("reviews.reply")}
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          {t("reviews.loginToReview")}
        </p>
      )}
    </div>
  );
};

export default ReviewReplySection;
