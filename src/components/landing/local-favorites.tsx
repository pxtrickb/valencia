"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Spot = {
  id: string;
  name: string;
  category: string;
  shortCategory: string;
  description: string;
  location: string;
  image: string;
};

type Review = {
  id: number;
  itemId: string;
  rating: number;
};

type CategoryInfo = {
  name: string;
  count: number;
  color: string;
};

export function LocalFavorites() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // Fetch spots
        const spotsResponse = await fetch("/api/spots");
        if (!spotsResponse.ok) {
          throw new Error("Failed to fetch spots");
        }
        const spotsData = await spotsResponse.json();
        setSpots(spotsData);

        // Fetch all reviews for spots to calculate ratings
        const reviewsResponse = await fetch("/api/reviews?itemTypeOnly=spot");
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate category counts
  const categories = useMemo<CategoryInfo[]>(() => {
    const categoryMap = new Map<string, number>();
    
    spots.forEach((spot) => {
      const category = spot.category;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    // Map categories to colors
    const colorMap: Record<string, string> = {
      Restaurant: "bg-orange-500",
      Café: "bg-blue-500",
      Museum: "bg-red-500",
      Shop: "bg-slate-400",
    };

    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        color: colorMap[name] || "bg-gray-500",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4); // Show top 4 categories
  }, [spots]);

  // Calculate ratings for spots and get featured spots
  const featuredSpots = useMemo(() => {
    if (spots.length === 0) return [];

    // Calculate average rating and review count for each spot
    const spotRatings = new Map<string, { total: number; count: number }>();
    
    reviews.forEach((review) => {
      const existing = spotRatings.get(review.itemId) || { total: 0, count: 0 };
      spotRatings.set(review.itemId, {
        total: existing.total + review.rating,
        count: existing.count + 1,
      });
    });

    // Add spots with their ratings
    const spotsWithRatings = spots.map((spot) => {
      const ratingInfo = spotRatings.get(spot.id);
      const rating = ratingInfo
        ? ratingInfo.total / ratingInfo.count
        : 0;
      const reviewCount = ratingInfo?.count || 0;

      return {
        ...spot,
        rating,
        reviewCount,
      };
    });

    // Sort by rating (if equal, by review count) and take top 2
    return spotsWithRatings
      .sort((a, b) => {
        if (a.rating !== b.rating) {
          return b.rating - a.rating;
        }
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, 3);
  }, [spots, reviews]);
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left Column */}
          <div>
            <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-orange-600">
              LOCAL FAVORITES
            </div>
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Hidden Gems & Popular Spots
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Discover the best restaurants, cafés, museums, and shops curated
              by locals and verified by visitors like you.
            </p>

            {/* Category Grid */}
            {isLoading ? (
              <div className="mb-8 flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-orange-600" />
              </div>
            ) : (
              <div className="mb-8 grid grid-cols-2 gap-4">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Card
                      key={category.name}
                      className="group relative overflow-hidden border bg-muted/50 p-4 transition-all hover:bg-muted hover:shadow-md"
                    >
                      <div
                        className={cn(
                          "mb-2 size-2 rounded-full",
                          category.color
                        )}
                      />
                      <div className="text-sm font-semibold text-foreground">
                        {category.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {category.count} {category.count === 1 ? "place" : "places"}
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 py-4 text-center text-sm text-muted-foreground">
                    No categories available yet
                  </div>
                )}
              </div>
            )}

            {/* CTA Button */}
            <Button
              asChild
              size="lg"
              className="group h-12 gap-2 bg-orange-600 px-6 shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
            >
              <Link href="/spots">
                Explore All Spots
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Right Column - Featured Spots */}
          <div className="flex flex-col gap-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-orange-600" />
              </div>
            ) : featuredSpots.length > 0 ? (
              featuredSpots.map((spot) => (
                <Link key={spot.id} href={`/spots/${spot.id}`}>
                  <Card className="group py-0 overflow-hidden border shadow-sm transition-all hover:shadow-md">
                    <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-orange-200 to-orange-300 md:aspect-auto">
                        {spot.image && (
                          <img
                            src={spot.image}
                            alt={spot.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-600">
                          {spot.shortCategory}
                        </div>
                        {spot.rating > 0 && (
                          <div className="mb-2 flex items-center gap-2">
                            <Star className="size-4 fill-orange-500 text-orange-500" />
                            <span className="text-sm font-semibold text-foreground">
                              {spot.rating.toFixed(1)}
                            </span>
                            {spot.reviewCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ({spot.reviewCount.toLocaleString()})
                              </span>
                            )}
                          </div>
                        )}
                        <h3 className="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-orange-600">
                          {spot.name}
                        </h3>
                        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                          {spot.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3.5" />
                          <span>{spot.location}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="flex items-center justify-center py-12 text-center text-sm text-muted-foreground">
                No featured spots available yet
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
