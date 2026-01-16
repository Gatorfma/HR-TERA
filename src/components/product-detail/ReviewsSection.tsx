import { motion } from "framer-motion";
import { Star, MessageSquare, Quote } from "lucide-react";
import { ProductReview } from "@/data/products";

interface ReviewsSectionProps {
  reviews: ProductReview[];
}

const ReviewsSection = ({ reviews }: ReviewsSectionProps) => {
  if (!reviews || reviews.length === 0) return null;

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <h2 className="text-2xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        Customer Reviews
      </h2>

      {/* Summary */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-foreground">
            {averageRating.toFixed(1)}
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-card rounded-xl border border-border p-5 relative"
          >
            <Quote className="absolute top-4 right-4 w-8 h-8 text-muted-foreground/20" />
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <p className="text-foreground mb-4 leading-relaxed">"{review.comment}"</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{review.reviewerName}</p>
                <p className="text-sm text-muted-foreground">
                  {review.role} at {review.company}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{review.date}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ReviewsSection;
