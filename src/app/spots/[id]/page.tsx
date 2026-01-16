"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Star,
  Clock,
  DollarSign,
  ArrowLeft,
  Share2,
  ExternalLink,
  Loader2,
  Building2,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReviewDialog } from "@/components/review-dialog";
import { BucketListButton } from "@/components/bucket-list-button";
import { ImageLightbox } from "@/components/image-lightbox";
import { authClient } from "@/lib/authClient";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SpotData = {
  id: string;
  name: string;
  category: string;
  shortCategory: string;
  description: string;
  fullDescription: string;
  location: string;
  address: string;
  priceRange: string | null;
  hours: Record<string, string> | null;
  phone: string | null;
  website: string | null;
  image: string;
  images: string[];
  business?: {
    id: string;
    name: string;
    identifier: string;
  } | null;
};

// Mock data removed - now fetching from database via API
// All spots are now fetched from /api/spots

type Review = {
  id: number;
  userId: string;
  userName: string;
  userInitials: string;
  rating: number;
  reviewText: string;
  date: string;
};

// Helper function to get related spots
// getRelatedSpots function removed - now handled in component with API fetch

export default function SpotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [spot, setSpot] = useState<SpotData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [relatedSpots, setRelatedSpots] = useState<Array<{
    id: string;
    name: string;
    category: string;
    shortCategory: string;
    location: string;
    priceRange: string | null;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const spotId = params.id as string;

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const isAuthenticated = !!session;

  // Helper function to format hours for display
  const formatHours = (hours: Record<string, string> | null): string => {
    if (!hours) return "Hours not available";
    if (hours.monday === "24/7") return "24/7";
    return hours.monday || "Hours vary";
  };

  // Fetch reviews for the spot
  const fetchReviews = async () => {
    if (!spotId) return;
    
    try {
      setIsLoadingReviews(true);
      const response = await fetch(
        `/api/reviews?itemType=spot&itemId=${spotId}`
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    async function fetchSpot() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/spots/${spotId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Spot not found");
          } else {
            throw new Error("Failed to fetch spot");
          }
          return;
        }
        const data = await response.json();
        setSpot(data);

        // Fetch all spots for related spots
        const allResponse = await fetch("/api/spots");
        if (allResponse.ok) {
          const allData = await allResponse.json();
          const related = allData
            .filter((s: SpotData) => 
              s.id !== data.id && s.category === data.category
            )
            .slice(0, 2)
            .map((s: SpotData) => ({
              id: s.id,
              name: s.name,
              category: s.category,
              shortCategory: s.shortCategory,
              location: s.location,
              priceRange: s.priceRange,
            }));
          setRelatedSpots(related);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    if (spotId) {
      fetchSpot();
    }
  }, [spotId]);

  // Fetch reviews when spot is loaded
  useEffect(() => {
    if (spot) {
      fetchReviews();
    }
  }, [spot]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-8 animate-spin text-orange-600" />
          <p className="text-muted-foreground">Loading spot...</p>
        </div>
      </div>
    );
  }

  if (error || !spot) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">
            {error || "Spot Not Found"}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {error || "The spot you&apos;re looking for doesn&apos;t exist."}
          </p>
          <Button asChild>
            <Link href="/spots">Back to Spots</Link>
          </Button>
        </div>
      </div>
    );
  }

  const priceLabel =
    spot.priceRange === "$"
      ? "Budget-friendly"
      : spot.priceRange === "$$"
        ? "Mid-range"
        : spot.priceRange === "$$$"
          ? "Premium"
          : "Price varies";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-amber-50/10 to-background">
      {/* Hero Image Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600">
          {spot.image && (
            <img
              src={spot.image}
              alt={spot.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Back Button */}
        <div className="absolute left-4 top-4 z-10 md:left-8 md:top-8">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="bg-background/90 backdrop-blur-sm hover:bg-background"
          >
            <Link href="/spots">
              <ArrowLeft className="mr-2 size-4" />
              Back to Spots
            </Link>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="absolute right-4 top-4 z-10 flex gap-2 md:right-8 md:top-8">
          <Button
            variant="outline"
            size="icon"
            className="bg-background/90 backdrop-blur-sm hover:bg-background"
          >
            <Share2 className="size-4" />
          </Button>
          <BucketListButton
            itemId={spotId}
            itemType="spot"
            className="bg-background/90 backdrop-blur-sm hover:bg-background"
          />
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 text-white md:p-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-3 inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-sm">
              {spot.shortCategory}
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
              {spot.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                <span>{spot.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="size-4" />
                <span>{priceLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content Column */}
            <div className="lg:col-span-2">
              {/* Description */}
              <Card className="mb-8 border-0 bg-card/90 p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  About
                </h2>
                <p className="leading-relaxed text-muted-foreground whitespace-pre-line">
                  {spot.fullDescription || spot.description}
                </p>
              </Card>

              {/* Image Gallery */}
              {spot.images && spot.images.length > 0 && (
                <Card className="mb-8 border-0 bg-card/90 p-6 shadow-sm">
                  <h2 className="mb-4 text-2xl font-bold text-foreground">
                    Photos
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {spot.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-orange-200 to-orange-300 cursor-pointer transition-transform hover:scale-105"
                        onClick={() => {
                          setLightboxIndex(idx);
                          setLightboxOpen(true);
                        }}
                      >
                        <img
                          src={img}
                          alt={`${spot.name} - Photo ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Reviews Section */}
              <Card className="border-0 bg-card/90 p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">
                    Reviews
                  </h2>
                  {!isSessionLoading && (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (isAuthenticated) {
                          // Check if user already has a review
                          const userReview = reviews.find(
                            (r) => r.userId === session?.user.id
                          );
                          if (userReview) {
                            setEditingReview(userReview);
                          } else {
                            setEditingReview(null);
                          }
                          setReviewDialogOpen(true);
                        } else {
                          router.push(
                            `/signin?callbackURL=${encodeURIComponent(
                              `/spots/${spotId}`
                            )}`
                          );
                        }
                      }}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isAuthenticated && reviews.some((r) => r.userId === session?.user.id)
                        ? "Edit Your Review"
                        : isAuthenticated
                          ? "Write a Review"
                          : "Sign in to Review"}
                    </Button>
                  )}
                </div>

                {isLoadingReviews ? (
                  <div className="py-12 text-center">
                    <Loader2 className="mx-auto mb-4 size-8 animate-spin text-orange-600" />
                    <p className="text-muted-foreground">Loading reviews...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No reviews yet. Be the first to write one!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {reviews.map((review, idx) => {
                        const isOwnReview = session?.user.id === review.userId;
                        return (
                          <div key={review.id}>
                            <div className="mb-3 flex items-start gap-3">
                              <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                                {review.userInitials}
                              </div>
                              <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  <span className="font-semibold text-foreground">
                                    {review.userName}
                                  </span>
                                  {isOwnReview && (
                                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                                      Your review
                                    </span>
                                  )}
                                  <div className="flex items-center gap-1">
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
                                </div>
                                <div className="mb-2 text-xs text-muted-foreground">
                                  {review.date}
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {review.reviewText}
                                </p>
                              </div>
                              {isOwnReview && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => {
                                      setEditingReview(review);
                                      setReviewDialogOpen(true);
                                    }}
                                    aria-label="Edit review"
                                  >
                                    <Edit className="size-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-destructive hover:text-destructive"
                                    onClick={async () => {
                                      if (
                                        confirm(
                                          "Are you sure you want to delete this review?"
                                        )
                                      ) {
                                        try {
                                          const response = await fetch(
                                            `/api/reviews/${review.id}`,
                                            {
                                              method: "DELETE",
                                            }
                                          );
                                          if (response.ok) {
                                            toast.success(
                                              "Review deleted successfully"
                                            );
                                            fetchReviews();
                                          } else {
                                            throw new Error(
                                              "Failed to delete review"
                                            );
                                          }
                                        } catch (error) {
                                          toast.error(
                                            error instanceof Error
                                              ? error.message
                                              : "Failed to delete review"
                                          );
                                        }
                                      }
                                    }}
                                    aria-label="Delete review"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            {idx < reviews.length - 1 && (
                              <Separator className="mt-6" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Info Card */}
                <Card className="border-0 bg-card/90 p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-bold text-foreground">
                    Quick Info
                  </h3>
                  <div className="space-y-4">
                    {/* Location */}
                    <div>
                      <div className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
                        <MapPin className="size-4 text-orange-600" />
                        Location
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {spot.address || spot.location}
                      </p>
                    </div>

                    {/* Hours */}
                    {spot.hours && (
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                          <Clock className="size-4 text-orange-600" />
                          Opening Hours
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>{formatHours(spot.hours)}</div>
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    {spot.phone && (
                      <div>
                        <div className="mb-1 text-sm font-medium text-foreground">
                          Phone
                        </div>
                        <a
                          href={`tel:${spot.phone}`}
                          className="text-sm text-orange-600 hover:underline"
                        >
                          {spot.phone}
                        </a>
                      </div>
                    )}

                    {/* Website */}
                    {spot.website && (
                      <div>
                        <div className="mb-1 text-sm font-medium text-foreground">
                          Website
                        </div>
                        <a
                          href={spot.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-orange-600 hover:underline"
                        >
                          Visit Website
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Business Card */}
                {spot.business && (
                  <Card className="border-0 bg-card/90 p-6 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <Building2 className="size-5 text-orange-600" />
                      <h3 className="text-lg font-bold text-foreground">
                        Business
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {spot.business.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {spot.business.identifier}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* CTA Buttons */}
                <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50/50 p-6 shadow-sm">
                  <Button
                    asChild
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    size="lg"
                  >
                    <Link
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        spot.address || spot.location
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get Directions
                      <ExternalLink className="ml-2 size-5" />
                    </Link>
                  </Button>
                </Card>

                {/* Related Spots */}
                {relatedSpots.length > 0 && (
                  <Card className="border-0 bg-card/90 p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-foreground">
                      Similar Spots
                    </h3>
                    <div className="space-y-4">
                      {relatedSpots.map((relatedSpot) => (
                        <Link
                          key={relatedSpot.id}
                          href={`/spots/${relatedSpot.id}`}
                          className="block rounded-lg border p-3 transition-colors hover:bg-accent"
                        >
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange-600">
                            {relatedSpot.shortCategory}
                          </div>
                          <div className="mb-1 font-semibold text-foreground">
                            {relatedSpot.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{relatedSpot.location}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Review Dialog - Only show if authenticated */}
      {isAuthenticated && spot && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={(open) => {
            setReviewDialogOpen(open);
            if (!open) {
              setEditingReview(null);
            }
          }}
          itemType="spot"
          itemId={spotId}
          spotName={spot.name}
          existingReview={editingReview ? {
            id: editingReview.id,
            rating: editingReview.rating,
            comment: editingReview.reviewText,
          } : null}
          onSuccess={() => {
            fetchReviews();
            setEditingReview(null);
          }}
        />
      )}

      {/* Image Lightbox */}
      {lightboxOpen && spot && spot.images && spot.images.length > 0 && (
        <ImageLightbox
          images={spot.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
