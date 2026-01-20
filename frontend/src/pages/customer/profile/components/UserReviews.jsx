import React, { useEffect, useState } from "react";
import menuService from "../../../../services/menuService";
import Icon from "../../../../components/AppIcon";
import Image from "../../../../components/AppImage";
import Button from "../../../../components/ui/Button";
import Pagination from "../../../../components/ui/Pagination";

const UserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage]);

  const fetchReviews = async (page) => {
    try {
      setLoading(true);
      const data = await menuService.getMyReviews({
        page: page,
        limit: limit
      });
      setReviews(data.reviews);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch user reviews", err);
      setError("Failed to load your reviews.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive border border-destructive/20 p-6 rounded-xl text-center">
        <Icon name="AlertCircle" size={32} className="mx-auto mb-2" />
        <p>{error}</p>
        <button
          onClick={() => fetchReviews(currentPage)}
          className="mt-4 text-sm font-bold underline hover:no-underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-card/50 rounded-xl border border-dashed border-border">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground mb-4">
          <Icon name="Star" size={32} />
        </div>
        <h3 className="text-lg font-bold text-foreground">No reviews yet</h3>
        <p className="text-muted-foreground max-w-xs mx-auto mb-6">
          You haven't written any reviews yet. Order some food and let us know what you think!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-warm transition-smooth"
          >
            <div className="flex gap-4">
              {/* Item Image */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                {review.menuItem?.image ? (
                  <Image
                    src={review.menuItem.image}
                    alt={review.menuItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Icon name="Utensils" size={24} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                  <div className="min-w-0">
                    <h4 className="font-heading font-bold text-foreground truncate text-sm md:text-base">
                      {review.menuItem?.name || "Unknown Item"}
                    </h4>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {review.restaurant?.name}
                    </p>
                  </div>
                  <span className="text-[10px] md:text-xs text-muted-foreground shrink-0">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      name="Star"
                      size={14}
                      className={
                        star <= review.rating
                          ? "text-[var(--color-warning)] fill-current"
                          : "text-[var(--color-muted)]"
                      }
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-sm text-foreground line-clamp-3">
                  "{review.comment}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={loading}
      />
    </div>
  );
};

export default UserReviews;
