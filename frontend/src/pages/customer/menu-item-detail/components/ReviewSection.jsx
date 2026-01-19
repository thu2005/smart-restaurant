import React, { useState } from "react";
import Icon from "../../../../components/AppIcon";
import Avatar from "../../../../components/ui/Avatar";
import Button from "../../../../components/ui/Button";
import { toast } from "sonner";
import menuService from "../../../../services/menuService";
import { useCustomerAuth } from "../../../../contexts/CustomerAuthContext";

const ReviewSection = ({
  reviews,
  overallRating,
  ratingDistribution,
  itemId,
  restaurantId,
  onReviewAdded,
}) => {
  const { isAuthenticated } = useCustomerAuth();
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const getRatingPercentage = (count, total) => {
    return total > 0 ? (count / total) * 100 : 0;
  };

  const totalReviews = ratingDistribution?.reduce(
    (sum, item) => sum + item?.count,
    0
  );

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to write a review");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    try {
      setIsSubmitting(true);
      await menuService.createReview({
        menuItemId: itemId,
        restaurantId: restaurantId,
        rating,
        comment,
      });
      toast.success("Review submitted successfully");
      setIsAddingReview(false);
      setComment("");
      setRating(5);
      if (onReviewAdded) onReviewAdded();
    } catch (error) {
      // Don't log expected validation errors (400) to console
      if (!error.response || error.response.status !== 400) {
        console.error(error);
      }
      
      const msg = error.response?.data?.message || "Failed to submit review";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground">
          Customer Reviews
        </h2>
        {isAuthenticated && !isAddingReview && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingReview(true)}
            iconName="Edit"
          >
            Write a Review
          </Button>
        )}
      </div>

      {isAddingReview && (
        <div className="p-4 md:p-6 bg-card rounded-lg md:rounded-xl border border-border mb-6 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none transition-colors"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                  >
                    <Icon
                      name="Star"
                      size={24}
                      className={
                        star <= (hoveredStar || rating)
                          ? "text-[var(--color-warning)] fill-current"
                          : "text-[var(--color-muted)]"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this dish..."
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddingReview(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Submit Review
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-1 p-4 md:p-6 bg-card rounded-lg md:rounded-xl border border-border h-fit">
          <div className="text-center space-y-3">
            <div className="text-4xl md:text-5xl font-heading font-bold text-foreground data-text">
              {overallRating?.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5]?.map((star) => (
                <Icon
                  key={star}
                  name="Star"
                  size={20}
                  className={
                    star <= Math.round(overallRating)
                      ? "text-[var(--color-warning)] fill-current"
                      : "text-[var(--color-muted)]"
                  }
                />
              ))}
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              Based on {totalReviews} reviews
            </p>
          </div>

          <div className="mt-4 md:mt-6 space-y-2">
            {ratingDistribution?.map((item) => (
              <div key={item?.stars} className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-muted-foreground w-8 data-text">
                  {item?.stars}★
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning transition-smooth"
                    style={{
                      width: `${getRatingPercentage(
                        item?.count,
                        totalReviews
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-xs md:text-sm text-muted-foreground w-8 text-right data-text">
                  {item?.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {reviews?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border">
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            reviews?.map((review) => (
              <div
                key={review?.id}
                className="p-4 md:p-6 bg-card rounded-lg md:rounded-xl border border-border"
              >
                <div className="flex items-start gap-3 md:gap-4 mb-3">
                  <Avatar
                    user={{
                      avatar: review?.userAvatar,
                      fullName: review?.userName,
                    }}
                    size="md"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm md:text-base font-medium text-foreground">
                        {review?.userName}
                      </h4>
                      <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                        {review?.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5]?.map((star) => (
                        <Icon
                          key={star}
                          name="Star"
                          size={14}
                          className={
                            star <= review?.rating
                              ? "text-[var(--color-warning)] fill-current"
                              : "text-[var(--color-muted)]"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm md:text-base text-foreground leading-relaxed whitespace-pre-wrap">
                  {review?.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
