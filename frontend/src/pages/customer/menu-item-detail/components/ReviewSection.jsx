import React from "react";
import Icon from "../../../../components/AppIcon";
import Avatar from "../../../../components/ui/Avatar";

const ReviewSection = ({ reviews, overallRating, ratingDistribution }) => {
  const getRatingPercentage = (count, total) => {
    return total > 0 ? (count / total) * 100 : 0;
  };

  const totalReviews = ratingDistribution?.reduce(
    (sum, item) => sum + item?.count,
    0
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground">
        Customer Reviews
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-1 p-4 md:p-6 bg-card rounded-lg md:rounded-xl border border-border">
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
          {reviews?.map((review) => (
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
              <p className="text-sm md:text-base text-foreground leading-relaxed">
                {review?.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
