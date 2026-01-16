"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Star,
  Clock,
  ArrowLeft,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
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

type LandmarkData = {
  id: string;
  category: string;
  title: string;
  description: string;
  fullDescription?: string;
  location: string;
  address: string;
  hours: Record<string, string> | null;
  admission?: string;
  website: string | null;
  image: string;
  images?: string[];
};

type Review = {
  id: number;
  userId: string;
  userName: string;
  userInitials: string;
  rating: number;
  reviewText: string;
  date: string;
};

// getRelatedLandmarks function removed - now handled in component with API fetch

export default function LandmarkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [landmark, setLandmark] = useState<LandmarkData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [relatedLandmarks, setRelatedLandmarks] = useState<Array<{
    id: string;
    title: string;
    category: string;
    location: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const landmarkId = params.id as string;

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const isAuthenticated = !!session;

  // Fetch reviews for the landmark
  const fetchReviews = async () => {
    if (!landmarkId) return;
    
    try {
      setIsLoadingReviews(true);
      const response = await fetch(
        `/api/reviews?itemType=landmark&itemId=${landmarkId}`
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

  // Helper function to format hours for display
  const formatHours = (hours: Record<string, string> | null): string => {
    if (!hours) return "Hours not available";
    if (hours.monday === "24/7") return "24/7";
    return hours.monday || "Hours vary";
  };

  // Helper function to get hours display value
  const getHoursDisplay = (hours: Record<string, string> | null): string => {
    if (!hours) return "Hours vary";
    if (hours.monday === "24/7") return "Open 24 hours";
    return hours.monday || "Hours vary";
  };

  useEffect(() => {
    async function fetchLandmark() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/landmarks/${landmarkId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Landmark not found");
          } else {
            throw new Error("Failed to fetch landmark");
          }
          return;
        }
        const data = await response.json();
        setLandmark(data);

        // Fetch all landmarks for related landmarks
        const allResponse = await fetch("/api/landmarks");
        if (allResponse.ok) {
          const allData = await allResponse.json();
          const related = allData
            .filter((l: LandmarkData) => 
              l.id !== data.id &&
              (l.category === data.category || l.location === data.location)
            )
            .slice(0, 3)
            .map((l: LandmarkData) => ({
              id: l.id,
              title: l.title,
              category: l.category,
              location: l.location,
            }));
          setRelatedLandmarks(related);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    if (landmarkId) {
      fetchLandmark();
    }
  }, [landmarkId]);

  // Fetch reviews when landmark is loaded
  useEffect(() => {
    if (landmark) {
      fetchReviews();
    }
  }, [landmark]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-8 animate-spin text-orange-600" />
          <p className="text-muted-foreground">Loading landmark...</p>
        </div>
      </div>
    );
  }

  if (error || !landmark) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">
            {error || "Landmark Not Found"}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {error || "The landmark you&apos;re looking for doesn&apos;t exist."}
          </p>
          <Button asChild>
            <Link href="/landmarks">Back to Landmarks</Link>
          </Button>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (landmark.images?.length ?? 1) - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (landmark.images?.length ?? 1) - 1 : prev - 1
    );
  };

  // Keep currentImageIndex for hero carousel, but use lightbox for gallery

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-amber-50/30 to-background">
      {/* Full-width Hero Image with Carousel */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* Image Carousel */}
        <div className="relative h-full w-full">
          {landmark.images && landmark.images.length > 0 ? (
            <>
              <div className="relative h-full w-full bg-gradient-to-br from-blue-600 to-blue-800">
                <img
                  src={landmark.images[currentImageIndex]}
                  alt={landmark.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Navigation Arrows */}
              {landmark.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 backdrop-blur-sm transition-all hover:bg-white/30"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="size-6 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 backdrop-blur-sm transition-all hover:bg-white/30"
                    aria-label="Next image"
                  >
                    <ChevronRight className="size-6 text-white" />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {landmark.images.length > 1 && (
                <div className="absolute bottom-4 mb-20 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                  {landmark.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        "h-2 rounded-full transition-all",
                        idx === currentImageIndex
                          ? "w-8 bg-white"
                          : "w-2 bg-white/50"
                      )}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-blue-600 to-blue-800" />
          )}
        </div>

        {/* Back Button */}
        <div className="absolute left-4 top-4 z-20 md:left-8 md:top-8">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-white/20 bg-background/90 backdrop-blur-sm hover:bg-background"
          >
            <Link href="/landmarks">
              <ArrowLeft className="mr-2 size-4" />
              Back to Landmarks
            </Link>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="absolute right-4 top-4 z-20 flex gap-2 md:right-8 md:top-8">
          <Button
            variant="outline"
            size="icon"
            className="border-white/20 bg-background/90 backdrop-blur-sm hover:bg-background"
          >
            <Share2 className="size-4" />
          </Button>
          <BucketListButton
            itemId={landmarkId}
            itemType="landmark"
            className="border-white/20 bg-background/90 backdrop-blur-sm hover:bg-background"
          />
        </div>

        {/* Content Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8 md:p-12">
          <div className="mx-auto max-w-5xl mb-20">
            <div className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-sm">
              {landmark.category}
            </div>
            <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl lg:text-7xl">
              {landmark.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-base text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="size-5" />
                <span>{landmark.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-5" />
                <span>{formatHours(landmark.hours)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Single Column Layout */}
      <section className="relative -mt-20 z-10">
        <div className="mx-auto max-w-5xl px-4 pb-24">
          {/* Key Info Cards - Horizontal Layout */}
          <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border bg-card/95 p-6 shadow-md backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 text-orange-600" />
                <span>Location</span>
              </div>
              <p className="text-base font-medium text-foreground">
                {landmark.address}
              </p>
            </Card>
            <Card className="border bg-card/95 p-6 shadow-md backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 text-orange-600" />
                <span>Opening Hours</span>
              </div>
              <p className="text-base font-medium text-foreground">
                {getHoursDisplay(landmark.hours)}
              </p>
            </Card>
            <Card className="border bg-card/95 p-6 shadow-md backdrop-blur-sm">
              <div className="mb-2 text-sm text-muted-foreground">Admission</div>
              <p className="text-base font-medium text-foreground">
                {landmark.admission || "Free"}
              </p>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mb-12 grid gap-6 sm:grid-cols-2">
            <Button
              asChild
              size="lg"
              className="h-14 bg-orange-600 text-lg font-medium hover:bg-orange-700"
            >
              <Link
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  landmark.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Directions
                <ExternalLink className="ml-2 size-5" />
              </Link>
            </Button>
            {landmark.website && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 border-2 text-lg font-medium"
              >
                <Link
                  href={landmark.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Official Website
                  <ExternalLink className="ml-2 size-5" />
                </Link>
              </Button>
            )}
          </div>

          {/* Description Section */}
          <Card className="mb-12 border bg-card/95 p-8 shadow-lg backdrop-blur-sm">
            <h2 className="mb-6 text-3xl font-bold text-foreground">About</h2>
            <div className="prose max-w-none">
              <p className="leading-relaxed text-muted-foreground whitespace-pre-line text-lg">
                {landmark.fullDescription || landmark.description}
              </p>
            </div>
          </Card>

          {/* Photo Gallery */}
          {landmark.images && landmark.images.length > 0 && (
            <Card className="mb-12 border bg-card/95 p-8 shadow-lg backdrop-blur-sm">
              <h2 className="mb-6 text-3xl font-bold text-foreground">
                Photo Gallery
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {landmark.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setLightboxIndex(idx);
                      setLightboxOpen(true);
                    }}
                    className="group relative aspect-video overflow-hidden rounded-lg transition-transform hover:scale-105 shadow-md cursor-pointer bg-gradient-to-br from-orange-200 to-orange-300"
                  >
                    <img
                      src={img}
                      alt={`${landmark.title} - Photo ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-2 left-2 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                      Photo {idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Reviews Section */}
          <Card className="mb-12 border bg-card/95 p-8 shadow-lg backdrop-blur-sm">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-foreground">
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
                          `/landmarks/${landmarkId}`
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
                <div className="space-y-8">
                  {reviews.map((review, idx) => {
                    const isOwnReview = session?.user.id === review.userId;
                    return (
                      <div key={review.id}>
                        <div className="mb-4 flex items-start gap-4">
                          <div className="flex size-12 items-center justify-center rounded-full bg-orange-100 text-base font-semibold text-orange-700">
                            {review.userInitials}
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <span className="text-lg font-semibold text-foreground">
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
                            <div className="mb-3 text-sm text-muted-foreground">
                              {review.date}
                            </div>
                            <p className="leading-relaxed text-muted-foreground">
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
                        {idx < reviews.length - 1 && <Separator />}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>

          {/* Related Landmarks */}
          {relatedLandmarks.length > 0 && (
            <Card className="border bg-card/95 p-8 shadow-lg backdrop-blur-sm">
              <h3 className="mb-6 text-2xl font-bold text-foreground">
                Related Landmarks
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedLandmarks.map((related) => (
                  <Link
                    key={related.id}
                    href={`/landmarks/${related.id}`}
                    className="group rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-600">
                      {related.category}
                    </div>
                    <div className="mb-2 text-lg font-semibold text-foreground">
                      {related.title}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span>{related.location}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Review Dialog - Only show if authenticated */}
      {isAuthenticated && landmark && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={(open) => {
            setReviewDialogOpen(open);
            if (!open) {
              setEditingReview(null);
            }
          }}
          itemType="landmark"
          itemId={landmarkId}
          landmarkName={landmark.title}
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
      {lightboxOpen && landmark && landmark.images && landmark.images.length > 0 && (
        <ImageLightbox
          images={landmark.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
