"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Review = {
  id: number;
  userName: string;
  userInitials: string;
  spotName: string;
  spotCategory: string;
  rating: number;
  reviewText: string;
  date: string;
  itemType: string;
  itemId: string;
};

export function LatestReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/reviews?latest=true&limit=10");
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, []);

  useEffect(() => {
    function updateCardsPerView() {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    }

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const maxIndex = Math.max(0, reviews.length - cardsPerView);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <section className="bg-gradient-to-b from-background to-amber-50/20 py-24">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-orange-600">
            COMMUNITY
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Latest Reviews
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            See what our community is saying about their favorite spots and
            landmarks in Valencia.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center">
              <Loader2 className="mb-4 size-8 animate-spin text-orange-600" />
              <p className="text-muted-foreground">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div
                className="flex gap-6 transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
                }}
              >
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="min-w-0 flex-shrink-0"
                    style={{ width: `${100 / cardsPerView}%` }}
                  >
                    <Card className="h-full border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                      {/* User Info */}
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                          {review.userInitials}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">
                            {review.userName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {review.date}
                          </div>
                        </div>
                      </div>

                      {/* Spot Info */}
                      <div className="mb-3">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange-600">
                          {review.spotCategory}
                        </div>
                        <Link href={`/${review.itemType}s/${review.itemId}`}>
                          <h3 className="text-lg font-bold text-foreground hover:text-orange-600 transition-colors">
                            {review.spotName}
                          </h3>
                        </Link>
                      </div>

                      {/* Rating */}
                      <div className="mb-4 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-4",
                              i < review.rating
                                ? "fill-orange-500 text-orange-500"
                                : "fill-muted text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>

                      {/* Review Text */}
                      <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                        {review.reviewText}
                      </p>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {!isLoading && reviews.length > cardsPerView && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-orange-50 md:-left-4"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="size-5 text-foreground" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-orange-50 md:-right-4"
                aria-label="Next reviews"
              >
                <ChevronRight className="size-5 text-foreground" />
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {!isLoading && reviews.length > cardsPerView && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "w-8 bg-orange-600"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
