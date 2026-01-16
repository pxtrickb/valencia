"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Star,
  Heart,
  Building2,
  MapPin,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Loader2,
  ListPlus,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/image-upload";
import { authClient } from "@/lib/authClient";
import { cn } from "@/lib/utils";

type UserReview = {
  id: number;
  type: "spot" | "landmark";
  name: string;
  rating: number;
  comment: string;
  date: string;
  link: string;
};

type BucketListItem = {
  id: number;
  itemId: string;
  type: "spot" | "landmark";
  name?: string;
  title?: string;
  category: string;
  location: string;
  visited: boolean;
  link: string;
};

// Mock data removed - now fetching from database via API

type Business = {
  id: string;
  name: string;
  identifier: string;
  email: string;
  phone: string;
  website: string | null;
  status: "pending" | "approved" | "rejected";
  spots: Array<{
    id: string;
    name: string;
    category: string;
    location: string;
    link: string;
  }>;
};

type Tab = "reviews" | "bucketlist" | "businesses";

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("reviews");
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [bucketList, setBucketList] = useState<BucketListItem[]>([]);
  const [isLoadingBucketList, setIsLoadingBucketList] = useState(true);
  const [bucketListError, setBucketListError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
  const [businessesError, setBusinessesError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  // Handle URL query parameters to set tab and open modal
  useEffect(() => {
    const tab = searchParams?.get("tab");
    const openModal = searchParams?.get("openModal");

    if (tab === "businesses") {
      setActiveTab("businesses");
    }

    if (openModal === "true" && tab === "businesses") {
      // Wait for session to load before opening modal
      if (!isPending && session) {
        setShowBusinessForm(true);
        // Clean up URL parameters
        router.replace("/profile", { scroll: false });
      }
    }
  }, [searchParams, isPending, session, router]);

  // Fetch user reviews from API
  useEffect(() => {
    async function fetchReviews() {
      if (!session) {
        setIsLoadingReviews(false);
        return;
      }

      try {
        setIsLoadingReviews(true);
        setReviewsError(null);
        const response = await fetch("/api/reviews?userOnly=true");
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data = await response.json();
        
        // Fetch item names for each review
        const reviewsWithNames = await Promise.all(
          data.map(async (review: any) => {
            try {
              const itemResponse = await fetch(
                `/api/${review.type}s/${review.itemId}`
              );
              if (itemResponse.ok) {
                const itemData = await itemResponse.json();
                return {
                  ...review,
                  name: review.type === "spot" ? itemData.name : itemData.title,
                };
              }
              return review;
            } catch (err) {
              console.error("Error fetching item name:", err);
              return review;
            }
          })
        );
        
        setUserReviews(reviewsWithNames);
      } catch (err) {
        setReviewsError(
          err instanceof Error ? err.message : "An error occurred"
        );
        console.error("Error fetching reviews:", err);
      } finally {
        setIsLoadingReviews(false);
      }
    }

    if (!isPending) {
      fetchReviews();
    }
  }, [session, isPending]);

  // Fetch bucket list from API
  useEffect(() => {
    async function fetchBucketList() {
      if (!session) {
        setIsLoadingBucketList(false);
        return;
      }

      try {
        setIsLoadingBucketList(true);
        setBucketListError(null);
        const response = await fetch("/api/bucket-list");
        if (!response.ok) {
          throw new Error("Failed to fetch bucket list");
        }
        const data = await response.json();
        setBucketList(data);
      } catch (err) {
        setBucketListError(
          err instanceof Error ? err.message : "An error occurred"
        );
        console.error("Error fetching bucket list:", err);
      } finally {
        setIsLoadingBucketList(false);
      }
    }

    if (!isPending) {
      fetchBucketList();
    }
  }, [session, isPending]);

  // Fetch businesses when component mounts or user changes
  useEffect(() => {
    async function fetchBusinesses() {
      if (!session) return;
      
      try {
        setIsLoadingBusinesses(true);
        setBusinessesError(null);
        const response = await fetch("/api/businesses");
        if (!response.ok) {
          throw new Error("Failed to fetch businesses");
        }
        const data = await response.json();
        setBusinesses(data);
      } catch (err) {
        setBusinessesError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoadingBusinesses(false);
      }
    }

    fetchBusinesses();
  }, [session]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    // Preserve query parameters in callback URL
    const queryString = searchParams?.toString() || "";
    const callbackURL = queryString ? `/profile?${queryString}` : "/profile";
    router.push(`/signin?callbackURL=${encodeURIComponent(callbackURL)}`);
    return null;
  }

  const user = session.user as
    | { name?: string | null; email?: string | null; image?: string | null }
    | undefined;

  const displayName = user?.name || user?.email || "User";
  const initials =
    (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "reviews", label: "My Reviews", count: userReviews.length },
    {
      id: "bucketlist",
      label: "Bucket List",
      count: bucketList.length,
    },
    {
      id: "businesses",
      label: "My Businesses",
      count: businesses.length,
    },
  ];

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess() {
            toast.success("Signed out successfully");
            router.push("/");
          },
          onError() {
            toast.error("Failed to sign out. Please try again.");
            setIsSigningOut(false);
          },
        },
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
      setIsSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-amber-50/20 to-background">
      {/* Header */}
      <section className="border-b border-border/50 bg-background/80 pt-24 pb-12 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-2xl font-bold text-white shadow-lg">
              {initials}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
                {displayName}
              </h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground">
                    {userReviews.length}
                  </span>{" "}
                  Reviews
                </div>
                <div>
                  <span className="font-semibold text-foreground">
                    {bucketList.length}
                  </span>{" "}
                  Bucket List
                </div>
                <div>
                  <span className="font-semibold text-foreground">
                    {businesses.length}
                  </span>{" "}
                  Businesses
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <div className="flex items-center">
              <Button
                onClick={handleSignOut}
                disabled={isSigningOut}
                variant="outline"
                className="gap-2"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="size-4" />
                    Sign Out
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      activeTab === tab.id
                        ? "bg-orange-100 text-orange-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4">
          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {isLoadingReviews ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <Loader2 className="mb-4 size-8 animate-spin text-orange-600" />
                  <p className="text-muted-foreground">Loading reviews...</p>
                </div>
              ) : reviewsError ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <div className="mb-4 text-6xl">⚠️</div>
                  <h2 className="mb-2 text-2xl font-bold text-foreground">
                    Error loading reviews
                  </h2>
                  <p className="mb-6 text-muted-foreground">{reviewsError}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Try again
                  </Button>
                </div>
              ) : userReviews.length === 0 ? (
                <Card className="border bg-card/95 p-12 text-center shadow-sm">
                  <Star className="mx-auto mb-4 size-12 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    No reviews yet
                  </h3>
                  <p className="mb-6 text-muted-foreground">
                    Start exploring Valencia and share your experiences!
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button asChild variant="outline">
                      <Link href="/landmarks">Explore Landmarks</Link>
                    </Button>
                    <Button asChild className="bg-orange-600 hover:bg-orange-700">
                      <Link href="/spots">Discover Spots</Link>
                    </Button>
                  </div>
                </Card>
              ) : (
                userReviews.map((review) => (
                  <Card
                    key={review.id}
                    className="border bg-card/95 p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-3">
                          <Link
                            href={review.link}
                            className="text-lg font-semibold text-foreground hover:text-orange-600 transition-colors"
                          >
                            {review.name}
                          </Link>
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium uppercase text-orange-700">
                            {review.type}
                          </span>
                        </div>
                        <div className="mb-3 flex items-center gap-1">
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
                          <span className="ml-2 text-sm text-muted-foreground">
                            {review.date}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          aria-label="Edit review"
                          onClick={async () => {
                            // Open edit dialog - we need to navigate to the item page
                            // or we could add a dialog here, but navigating is simpler
                            router.push(review.link);
                          }}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-destructive hover:text-destructive"
                          aria-label="Delete review"
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
                                  toast.success("Review deleted successfully");
                                  // Refresh reviews
                                  const reviewsResponse = await fetch(
                                    "/api/reviews?userOnly=true"
                                  );
                                  if (reviewsResponse.ok) {
                                    const data = await reviewsResponse.json();
                                    const reviewsWithNames = await Promise.all(
                                      data.map(async (r: any) => {
                                        try {
                                          const itemResponse = await fetch(
                                            `/api/${r.type}s/${r.itemId}`
                                          );
                                          if (itemResponse.ok) {
                                            const itemData = await itemResponse.json();
                                            return {
                                              ...r,
                                              name:
                                                r.type === "spot"
                                                  ? itemData.name
                                                  : itemData.title,
                                            };
                                          }
                                          return r;
                                        } catch (err) {
                                          console.error("Error fetching item name:", err);
                                          return r;
                                        }
                                      })
                                    );
                                    setUserReviews(reviewsWithNames);
                                  }
                                } else {
                                  throw new Error("Failed to delete review");
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
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Bucket List Tab */}
          {activeTab === "bucketlist" && (() => {
            if (isLoadingBucketList) {
              return (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <Loader2 className="mb-4 size-8 animate-spin text-orange-600" />
                  <p className="text-muted-foreground">Loading bucket list...</p>
                </div>
              );
            }

            if (bucketListError) {
              return (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <div className="mb-4 text-6xl">⚠️</div>
                  <h2 className="mb-2 text-2xl font-bold text-foreground">
                    Error loading bucket list
                  </h2>
                  <p className="mb-6 text-muted-foreground">{bucketListError}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Try again
                  </Button>
                </div>
              );
            }

            const notVisited = bucketList.filter((item) => !item.visited);
            const visited = bucketList.filter((item) => item.visited);

            if (bucketList.length === 0) {
              return (
                <Card className="border bg-card/95 p-12 text-center shadow-sm">
                  <ListPlus className="mx-auto mb-4 size-12 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    Your bucket list is empty
                  </h3>
                  <p className="mb-6 text-muted-foreground">
                    Start adding places you want to visit!
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button asChild variant="outline">
                      <Link href="/landmarks">Explore Landmarks</Link>
                    </Button>
                    <Button asChild className="bg-orange-600 hover:bg-orange-700">
                      <Link href="/spots">Discover Spots</Link>
                    </Button>
                  </div>
                </Card>
              );
            }

            return (
              <div className="space-y-8">
                {/* Not Yet Visited */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">
                      Not Yet Visited ({notVisited.length})
                    </h2>
                  </div>
                  {notVisited.length === 0 ? (
                    <Card className="border bg-card/95 p-8 text-center shadow-sm">
                      <CheckCircle2 className="mx-auto mb-4 size-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        All bucket list items have been visited! Great job!
                      </p>
                    </Card>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {notVisited.map((item) => (
                        <Link key={item.id} href={item.link}>
                          <Card className="group relative h-full border bg-card/95 p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                                {item.category}
                              </div>
                              <div className="rounded-full bg-orange-100 p-1.5">
                                <ListPlus className="size-3 text-orange-600" />
                              </div>
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-foreground">
                              {item.type === "spot" ? item.name : item.title}
                            </h3>
                            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="size-3.5" />
                              <span>{item.location}</span>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {visited.length > 0 && <Separator />}

                {/* Visited */}
                {visited.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-foreground">
                        Visited ({visited.length})
                      </h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {visited.map((item) => (
                        <Link key={item.id} href={item.link}>
                          <Card className="group relative h-full border bg-card/95 p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="text-xs font-semibold uppercase tracking-wider text-green-600">
                                {item.category}
                              </div>
                              <div className="rounded-full bg-green-100 p-1.5">
                                <CheckCircle2 className="size-3 text-green-600" />
                              </div>
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-foreground">
                              {item.type === "spot" ? item.name : item.title}
                            </h3>
                            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="size-3.5" />
                              <span>{item.location}</span>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Businesses Tab */}
          {activeTab === "businesses" && (
            <div className="space-y-6">
              {isLoadingBusinesses ? (
                <Card className="border bg-card/95 p-12 text-center shadow-sm">
                  <Loader2 className="mx-auto mb-4 size-8 animate-spin text-orange-600" />
                  <p className="text-muted-foreground">Loading businesses...</p>
                </Card>
              ) : businessesError ? (
                <Card className="border bg-card/95 p-12 text-center shadow-sm">
                  <div className="mb-4 text-6xl">⚠️</div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    Error loading businesses
                  </h3>
                  <p className="mb-6 text-muted-foreground">{businessesError}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Try again
                  </Button>
                </Card>
              ) : businesses.length === 0 && !showBusinessForm ? (
                <Card className="border bg-card/95 p-12 text-center shadow-sm">
                  <Building2 className="mx-auto mb-4 size-12 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    No businesses yet
                  </h3>
                  <p className="mb-6 text-muted-foreground">
                    Apply to list your business on Valencia Tourism and reach
                    thousands of visitors.
                  </p>
                  <Button
                    onClick={() => setShowBusinessForm(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                    size="lg"
                  >
                    <Plus className="mr-2 size-4" />
                    Apply for Business Account
                  </Button>
                </Card>
              ) : showBusinessForm ? (
                <BusinessApplicationForm
                  onCancel={() => setShowBusinessForm(false)}
                  onSubmit={async () => {
                    setShowBusinessForm(false);
                    // Refresh businesses list
                    const response = await fetch("/api/businesses");
                    if (response.ok) {
                      const data = await response.json();
                      setBusinesses(data);
                    }
                  }}
                />
              ) : (
                businesses.map((business) => (
                  <BusinessCard 
                    key={business.id} 
                    business={business}
                    onUpdate={() => {
                      // Refresh businesses list
                      fetch("/api/businesses")
                        .then(res => res.json())
                        .then(data => setBusinesses(data))
                        .catch(err => setBusinessesError(err.message));
                    }}
                  />
                ))
              )}

              {businesses.length > 0 && !showBusinessForm && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowBusinessForm(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="size-4" />
                    Add Another Business
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="size-8 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}

// Edit Business Dialog
const editBusinessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type EditBusinessValues = z.infer<typeof editBusinessSchema>;

function EditBusinessDialog({
  open,
  onOpenChange,
  business,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: {
    id: string;
    name: string;
    email: string;
    phone: string;
    website: string | null;
  };
  onSave: (values: EditBusinessValues) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const form = useForm<EditBusinessValues>({
    resolver: zodResolver(editBusinessSchema),
    defaultValues: {
      name: business.name,
      email: business.email,
      phone: business.phone,
      website: business.website || "",
    },
  });

  // Reset form when dialog opens or business changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: business.name,
        email: business.email,
        phone: business.phone,
        website: business.website || "",
      });
    }
  }, [open, business.name, business.email, business.phone, business.website]);

  async function handleSubmit(values: EditBusinessValues) {
    setIsSubmitting(true);
    try {
      await onSave(values);
      toast.success("Business updated successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update business. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete();
      toast.success("Business deleted successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete business. Please try again."
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Business</DialogTitle>
          <DialogDescription>
            Update your business information. Changes will be reviewed if
            necessary.
          </DialogDescription>
        </DialogHeader>

        {showDeleteConfirm ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="font-medium text-destructive">
                Are you sure you want to delete this business?
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                This action cannot be undone. All spots associated with this
                business will also be removed.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Business"
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Valencia Tapas Co." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          placeholder="[email protected]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Phone *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+34 963 123 456" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          {...field}
                          placeholder="https://example.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mr-auto"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete Business
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Add Spot Dialog
const addSpotSchema = z.object({
  name: z.string().min(1, "Spot name is required"),
  category: z.enum([
    "Restaurant",
    "Café",
    "Bar",
    "Tapas Bar",
    "Bakery",
    "Ice Cream Shop",
    "Market",
    "Grocery Store",
    "Shop",
    "Boutique",
    "Museum",
    "Art Gallery",
    "Theater",
    "Cinema",
    "Park",
    "Beach",
    "Nightclub",
    "Hotel",
    "Hostel",
    "Spa",
    "Gym",
    "Sports Venue",
    "Library",
    "Other"
  ]).refine((val) => val !== undefined, {
    message: "Please select a category",
  }),
  location: z.string().min(1, "Location is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  priceRange: z.enum(["$", "$$", "$$$"]).refine((val) => val !== undefined, {
    message: "Please select a price range",
  }),
});

type AddSpotValues = z.infer<typeof addSpotSchema>;

function AddSpotDialog({
  open,
  onOpenChange,
  businessId,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  onSubmit: (values: AddSpotValues) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spotImages, setSpotImages] = useState<Array<{ id: number; url: string; isPrimary: boolean }>>([]);
  const [createdSpotId, setCreatedSpotId] = useState<string | null>(null);

  const form = useForm<AddSpotValues>({
    resolver: zodResolver(addSpotSchema),
    defaultValues: {
      name: "",
      category: undefined,
      location: "",
      description: "",
      priceRange: undefined,
    },
  });

  async function handleSubmit(values: AddSpotValues) {
    setIsSubmitting(true);
    try {
      // Create spot first
      const response = await fetch(`/api/businesses/${businessId}/spots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create spot");
      }

      const newSpot = await response.json();
      setCreatedSpotId(newSpot.id);

      // Call onSubmit to trigger parent refresh
      await onSubmit(values);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add spot. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!open) {
      form.reset();
      setSpotImages([]);
      setCreatedSpotId(null);
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Spot</DialogTitle>
          <DialogDescription>
            Create a new spot listing for your business.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spot Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Tapas Bar Central" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select category</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Café">Café</option>
                        <option value="Bar">Bar</option>
                        <option value="Tapas Bar">Tapas Bar</option>
                        <option value="Bakery">Bakery</option>
                        <option value="Ice Cream Shop">Ice Cream Shop</option>
                        <option value="Market">Market</option>
                        <option value="Grocery Store">Grocery Store</option>
                        <option value="Shop">Shop</option>
                        <option value="Boutique">Boutique</option>
                        <option value="Museum">Museum</option>
                        <option value="Art Gallery">Art Gallery</option>
                        <option value="Theater">Theater</option>
                        <option value="Cinema">Cinema</option>
                        <option value="Park">Park</option>
                        <option value="Beach">Beach</option>
                        <option value="Nightclub">Nightclub</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Spa">Spa</option>
                        <option value="Gym">Gym</option>
                        <option value="Sports Venue">Sports Venue</option>
                        <option value="Library">Library</option>
                        <option value="Other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priceRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Range *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select price range</option>
                        <option value="$">$ - Budget</option>
                        <option value="$$">$$ - Moderate</option>
                        <option value="$$$">$$$ - Expensive</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., El Carmen" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={4}
                      placeholder="Describe your spot..."
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage />
                    <span
                      className={cn(
                        "text-xs text-muted-foreground",
                        field.value.length > 500 && "text-destructive"
                      )}
                    >
                      {field.value.length}/500
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Image Upload Section - Show after spot is created */}
            {createdSpotId && (
              <div className="space-y-2">
                <FormLabel>Images</FormLabel>
                <ImageUpload
                  entityType="spot"
                  entityId={createdSpotId}
                  existingImages={spotImages}
                  onImagesChange={setSpotImages}
                  onDelete={async (imageId) => {
                    const response = await fetch(`/api/images/${imageId}`, {
                      method: "DELETE",
                    });
                    if (!response.ok) {
                      throw new Error("Failed to delete image");
                    }
                  }}
                />
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (createdSpotId) {
                    // Spot is created, just close
                    form.reset();
                    setSpotImages([]);
                    setCreatedSpotId(null);
                    onOpenChange(false);
                  } else {
                    form.reset();
                    onOpenChange(false);
                  }
                }}
                disabled={isSubmitting}
              >
                {createdSpotId ? "Done" : "Cancel"}
              </Button>
              {!createdSpotId && (
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Spot"
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Spot Dialog
const editSpotSchema = addSpotSchema;

type EditSpotValues = z.infer<typeof editSpotSchema>;

function EditSpotDialog({
  open,
  onOpenChange,
  spot,
  businessId,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spot: {
    id: string;
    name: string;
    category: string;
    location: string;
    link: string;
  };
  businessId: string;
  onSubmit: (values: EditSpotValues) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [spotImages, setSpotImages] = useState<Array<{ id: number; url: string; isPrimary: boolean }>>([]);

  // Map short category to full category
  const categoryMap: Record<string, string> = {
    RESTAURANT: "Restaurant",
    "TAPAS BAR": "Tapas Bar",
    CAFÉ: "Café",
    BAR: "Bar",
    BAKERY: "Bakery",
    "ICE CREAM SHOP": "Ice Cream Shop",
    MARKET: "Market",
    "GROCERY STORE": "Grocery Store",
    SHOP: "Shop",
    BOUTIQUE: "Boutique",
    MUSEUM: "Museum",
    "ART GALLERY": "Art Gallery",
    THEATER: "Theater",
    CINEMA: "Cinema",
    PARK: "Park",
    BEACH: "Beach",
    NIGHTCLUB: "Nightclub",
    HOTEL: "Hotel",
    HOSTEL: "Hostel",
    SPA: "Spa",
    GYM: "Gym",
    "SPORTS VENUE": "Sports Venue",
    LIBRARY: "Library",
    OTHER: "Other",
  };

  const [isLoadingSpot, setIsLoadingSpot] = useState(false);
  const [spotData, setSpotData] = useState<{
    description: string;
    priceRange: "$" | "$$" | "$$$";
    address?: string;
  } | null>(null);

  // Fetch spot data when dialog opens
  useEffect(() => {
    async function fetchSpotData() {
      if (!open || !spot.id) return;
      
      try {
        setIsLoadingSpot(true);
        const [spotResponse, imagesResponse] = await Promise.all([
          fetch(`/api/spots/${spot.id}`),
          fetch(`/api/images?entityType=spot&entityId=${spot.id}`),
        ]);
        
        if (spotResponse.ok) {
          const data = await spotResponse.json();
          setSpotData({
            description: data.description || "",
            priceRange: (data.priceRange as "$" | "$$" | "$$$") || "$$",
            address: data.address,
          });
        }

        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          setSpotImages(imagesData);
        }
      } catch (err) {
        console.error("Error fetching spot data:", err);
      } finally {
        setIsLoadingSpot(false);
      }
    }

    fetchSpotData();
  }, [open, spot.id]);

  const form = useForm<EditSpotValues>({
    resolver: zodResolver(editSpotSchema),
    defaultValues: {
      name: spot.name,
      category: categoryMap[spot.category] || (spot.category as any) || "Restaurant",
      location: spot.location,
      description: spotData?.description || "",
      priceRange: spotData?.priceRange || "$$",
    },
  });

  // Reset form when dialog opens or spot changes
  useEffect(() => {
    if (open && spotData) {
      form.reset({
        name: spot.name, 
        category: categoryMap[spot.category] || (spot.category as any) || "Restaurant",
        location: spot.location,
        description: spotData.description,
        priceRange: spotData.priceRange as "$" | "$$" | "$$$",
      });
      setShowDeleteConfirm(false);
    }
  }, [open, spot.id, spot.name, spot.category, spot.location, spotData]);

  async function handleSubmit(values: EditSpotValues) {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      toast.success("Spot updated successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update spot. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete();
      toast.success("Spot deleted successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete spot. Please try again."
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Spot</DialogTitle>
          <DialogDescription>
            Update your spot information.
          </DialogDescription>
        </DialogHeader>

        {isLoadingSpot || !spotData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-orange-600" />
            <span className="ml-2 text-muted-foreground">Loading spot data...</span>
          </div>
        ) : showDeleteConfirm ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="font-medium text-destructive">
                Are you sure you want to delete this spot?
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                This action cannot be undone. All reviews for this spot will
                also be removed.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Spot"
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
              noValidate
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spot Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Tapas Bar Central" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="Restaurant">Restaurant</option>
                          <option value="Café">Café</option>
                          <option value="Bar">Bar</option>
                          <option value="Tapas Bar">Tapas Bar</option>
                          <option value="Bakery">Bakery</option>
                          <option value="Ice Cream Shop">Ice Cream Shop</option>
                          <option value="Market">Market</option>
                          <option value="Grocery Store">Grocery Store</option>
                          <option value="Shop">Shop</option>
                          <option value="Boutique">Boutique</option>
                          <option value="Museum">Museum</option>
                          <option value="Art Gallery">Art Gallery</option>
                          <option value="Theater">Theater</option>
                          <option value="Cinema">Cinema</option>
                          <option value="Park">Park</option>
                          <option value="Beach">Beach</option>
                          <option value="Nightclub">Nightclub</option>
                          <option value="Hotel">Hotel</option>
                          <option value="Hostel">Hostel</option>
                          <option value="Spa">Spa</option>
                          <option value="Gym">Gym</option>
                          <option value="Sports Venue">Sports Venue</option>
                          <option value="Library">Library</option>
                          <option value="Other">Other</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Range *</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="$">$ - Budget</option>
                          <option value="$$">$$ - Moderate</option>
                          <option value="$$$">$$$ - Expensive</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., El Carmen" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={4}
                        placeholder="Describe your spot..."
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      />
                    </FormControl>
                    <div className="flex items-center justify-between">
                      <FormMessage />
                      <span
                        className={cn(
                          "text-xs text-muted-foreground",
                          field.value.length > 500 && "text-destructive"
                        )}
                      >
                        {field.value.length}/500
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              {/* Image Upload Section */}
              {!isLoadingSpot && spot && (
                <div className="space-y-2">
                  <FormLabel>Images</FormLabel>
                  <ImageUpload
                    entityType="spot"
                    entityId={spot.id}
                    existingImages={spotImages}
                    onImagesChange={setSpotImages}
                    onDelete={async (imageId) => {
                      const response = await fetch(`/api/images/${imageId}`, {
                        method: "DELETE",
                      });
                      if (!response.ok) {
                        throw new Error("Failed to delete image");
                      }
                    }}
                  />
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mr-auto"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete Spot
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Business Card Component
function BusinessCard({
  business,
  onUpdate,
}: {
  business: Business;
  onUpdate: () => void;
}) {
  const [editBusinessOpen, setEditBusinessOpen] = useState(false);
  const [addSpotOpen, setAddSpotOpen] = useState(false);
  const [editSpotOpen, setEditSpotOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<{
    id: string;
    name: string;
    category: string;
    location: string;
    link: string;
  } | null>(null);

  const handleEditBusiness = async (values: EditBusinessValues) => {
    const response = await fetch(`/api/businesses/${business.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update business");
    }

    onUpdate();
  };

  const handleDeleteBusiness = async () => {
    const response = await fetch(`/api/businesses/${business.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete business");
    }

    onUpdate();
  };

  const handleAddSpot = async (values: AddSpotValues) => {
    // Spot is created in AddSpotDialog component
    // This just refreshes the business list
    onUpdate();
  };

  const handleEditSpot = async (values: EditSpotValues) => {
    if (!editingSpot) return;

    const response = await fetch(`/api/businesses/${business.id}/spots/${editingSpot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update spot");
    }

    onUpdate();
  };

  const handleDeleteSpot = async () => {
    if (!editingSpot) return;

    const response = await fetch(`/api/businesses/${business.id}/spots/${editingSpot.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete spot");
    }

    onUpdate();
  };

  return (
    <>
    <Card className="border bg-card/95 p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-2xl font-bold text-foreground">
              {business.name}
            </h3>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                business.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : business.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              )}
            >
              {business.status.charAt(0).toUpperCase() +
                business.status.slice(1)}
            </span>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Business ID: {business.identifier}
          </p>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Email:</span>{" "}
              <a
                href={`mailto:${business.email}`}
                className="text-foreground hover:text-orange-600 transition-colors"
              >
                {business.email}
              </a>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>{" "}
              <a
                href={`tel:${business.phone}`}
                className="text-foreground hover:text-orange-600 transition-colors"
              >
                {business.phone}
              </a>
            </div>
            {business.website && (
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Website:</span>{" "}
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-foreground hover:text-orange-600 transition-colors"
                >
                  {business.website}
                  <ExternalLink className="size-3" />
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setEditBusinessOpen(true)}
            aria-label="Edit business"
          >
            <Edit className="size-4" />
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Business Spots */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-foreground">
            Spots ({business.spots.length})
          </h4>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => setAddSpotOpen(true)}
          >
            <Plus className="size-3.5" />
            Add Spot
          </Button>
        </div>
        {business.spots.length === 0 ? (
          <Card className="border-dashed bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No spots listed yet. Add your first spot to get started!
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {business.spots.map((spot) => (
              <Card
                key={spot.id}
                className="group relative border bg-card/50 p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-600">
                      {spot.category}
                    </div>
                    <Link
                      href={spot.link}
                      className="block"
                    >
                      <h5 className="mb-2 font-semibold text-foreground hover:text-orange-600 transition-colors">
                        {spot.name}
                      </h5>
                    </Link>
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      <span>{spot.location}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => {
                      setEditingSpot(spot);
                      setEditSpotOpen(true);
                    }}
                    aria-label="Edit spot"
                  >
                    <Edit className="size-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EditBusinessDialog
        open={editBusinessOpen}
        onOpenChange={setEditBusinessOpen}
        business={business}
        onSave={handleEditBusiness}
        onDelete={handleDeleteBusiness}
      />

      <AddSpotDialog
        open={addSpotOpen}
        onOpenChange={setAddSpotOpen}
        businessId={business.id}
        onSubmit={handleAddSpot}
      />

      {editingSpot && (
        <EditSpotDialog
          open={editSpotOpen}
          onOpenChange={(open) => {
            setEditSpotOpen(open);
            if (!open) setEditingSpot(null);
          }}
          spot={editingSpot}
          businessId={business.id}
          onSubmit={handleEditSpot}
          onDelete={handleDeleteSpot}
        />
      )}
    </Card>
    </>
  );
}

// Business Application Form Component
const businessApplicationSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  identifier: z.string().min(1, "Business identifier is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type BusinessApplicationValues = z.infer<typeof businessApplicationSchema>;

function BusinessApplicationForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<BusinessApplicationValues>({
    resolver: zodResolver(businessApplicationSchema),
    defaultValues: {
      name: "",
      identifier: "",
      email: "",
      phone: "",
      website: "",
    },
  });

  const handleSubmit = async (values: BusinessApplicationValues) => {
    setIsSubmitting(true);
    setServerError(null);
    
    try {
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create business");
      }

      toast.success("Business application submitted successfully!");
      form.reset();
      onSubmit();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit application";
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border bg-card/95 p-8 shadow-sm">
      <h3 className="mb-6 text-2xl font-bold text-foreground">
        Business Application
      </h3>
      {serverError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {serverError}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Valencia Tapas Co." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Identifier / Tax ID *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., B-12345678" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="[email protected]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Phone *</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} placeholder="+34 963 123 456" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input type="url" {...field} placeholder="https://example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-900">
          <p className="font-medium mb-1">Application Process</p>
          <p className="text-amber-800">
            Your application will be reviewed by our team. Once approved, you&apos;ll
            be able to create and manage spots for your business. This usually takes
            1-3 business days.
          </p>
        </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}

