"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Shield,
  Users,
  Star,
  MapPin,
  Building2,
  Landmark,
  Trash2,
  Edit,
  Ban,
  UserPlus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/image-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/authClient";
import { cn } from "@/lib/utils";

type Tab = "users" | "reviews" | "spots" | "businesses" | "landmarks";

type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  banned: boolean;
  banReason: string | null;
  banExpires: number | null;
  createdAt: number;
  updatedAt: number;
};

type Review = {
  id: number;
  itemType: "spot" | "landmark";
  itemId: string;
  itemName: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
};

type Spot = {
  id: string;
  name: string;
  category: string;
  location: string;
};

type SpotFull = {
  id: string;
  name: string;
  category: string;
  shortCategory: string;
  description: string;
  fullDescription: string | null;
  location: string;
  address: string;
  priceRange: string | null;
  hours: Record<string, string> | null;
  phone: string | null;
  website: string | null;
  image: string;
};

type Business = {
  id: string;
  name: string;
  identifier: string;
  email: string;
  phone: string;
  website: string | null;
  status: "pending" | "approved" | "rejected";
};

type Landmark = {
  id: string;
  title: string;
  category: string;
  location: string;
};

type LandmarkFull = {
  id: string;
  category: string;
  title: string;
  description: string;
  fullDescription: string | null;
  location: string;
  address: string;
  hours: Record<string, string> | null;
  admission: string | null;
  website: string | null;
  image: string;
};

// Schemas
const editSpotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  priceRange: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
});

const editLandmarkSchema = z.object({
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  admission: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
});

const createLandmarkSchema = editLandmarkSchema;

const editBusinessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().nullable().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);

  // Dialog states
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);
  const [spotData, setSpotData] = useState<SpotFull | null>(null);
  const [spotImages, setSpotImages] = useState<Array<{ id: number; url: string; isPrimary: boolean }>>([]);
  const [editingLandmark, setEditingLandmark] = useState<Landmark | null>(null);
  const [landmarkData, setLandmarkData] = useState<LandmarkFull | null>(null);
  const [landmarkImages, setLandmarkImages] = useState<Array<{ id: number; url: string; isPrimary: boolean }>>([]);
  const [showCreateLandmark, setShowCreateLandmark] = useState(false);
  const [createLandmarkImages, setCreateLandmarkImages] = useState<Array<{ id: number; url: string; isPrimary: boolean }>>([]);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  // Loading states
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isLoadingSpots, setIsLoadingSpots] = useState(false);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  const [isLoadingLandmarks, setIsLoadingLandmarks] = useState(false);
  const [isLoadingSpotData, setIsLoadingSpotData] = useState(false);
  const [isLoadingLandmarkData, setIsLoadingLandmarkData] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  // Check admin status
  useEffect(() => {
    async function checkAdmin() {
      if (isPending || !session) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/admin/users");
        if (response.status === 403) {
          setIsAdmin(false);
        } else if (response.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdmin();
  }, [session, isPending]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch reviews with place names
  const fetchReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const spotsRes = await fetch("/api/spots");
      const landmarksRes = await fetch("/api/landmarks");

      if (spotsRes.ok && landmarksRes.ok) {
        const spotsData = await spotsRes.json();
        const landmarksData = await landmarksRes.json();

        const allReviews: Review[] = [];

        // Create maps for quick lookup
        const spotsMap = new Map(spotsData.map((s: any) => [s.id, s.name]));
        const landmarksMap = new Map(landmarksData.map((l: any) => [l.id, l.title]));

        for (const spot of spotsData) {
          const reviewRes = await fetch(
            `/api/reviews?itemType=spot&itemId=${spot.id}`
          );
          if (reviewRes.ok) {
            const spotReviews = await reviewRes.json();
            allReviews.push(
              ...spotReviews.map((r: any) => ({
                ...r,
                itemType: "spot" as const,
                itemId: spot.id,
                itemName: spot.name,
              }))
            );
          }
        }

        for (const landmark of landmarksData) {
          const reviewRes = await fetch(
            `/api/reviews?itemType=landmark&itemId=${landmark.id}`
          );
          if (reviewRes.ok) {
            const landmarkReviews = await reviewRes.json();
            allReviews.push(
              ...landmarkReviews.map((r: any) => ({
                ...r,
                itemType: "landmark" as const,
                itemId: landmark.id,
                itemName: landmark.title,
              }))
            );
          }
        }

        setReviews(allReviews);
      } else {
        throw new Error("Failed to fetch items");
      }
    } catch (error) {
      toast.error("Failed to fetch reviews");
      console.error(error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Fetch spots
  const fetchSpots = async () => {
    try {
      setIsLoadingSpots(true);
      const response = await fetch("/api/spots");
      if (response.ok) {
        const data = await response.json();
        setSpots(data.map((s: any) => ({ id: s.id, name: s.name, category: s.category, location: s.location })));
      } else {
        throw new Error("Failed to fetch spots");
      }
    } catch (error) {
      toast.error("Failed to fetch spots");
      console.error(error);
    } finally {
      setIsLoadingSpots(false);
    }
  };

  // Fetch businesses
  const fetchBusinesses = async () => {
    try {
      setIsLoadingBusinesses(true);
      const response = await fetch("/api/admin/businesses");
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data);
      } else {
        throw new Error("Failed to fetch businesses");
      }
    } catch (error) {
      toast.error("Failed to fetch businesses");
      console.error(error);
    } finally {
      setIsLoadingBusinesses(false);
    }
  };

  // Fetch landmarks
  const fetchLandmarks = async () => {
    try {
      setIsLoadingLandmarks(true);
      const response = await fetch("/api/landmarks");
      if (response.ok) {
        const data = await response.json();
        setLandmarks(data.map((l: any) => ({ id: l.id, title: l.title, category: l.category, location: l.location })));
      } else {
        throw new Error("Failed to fetch landmarks");
      }
    } catch (error) {
      toast.error("Failed to fetch landmarks");
      console.error(error);
    } finally {
      setIsLoadingLandmarks(false);
    }
  };

  // Fetch spot data for editing
  const fetchSpotData = async (spotId: string) => {
    try {
      setIsLoadingSpotData(true);
      const [spotResponse, imagesResponse] = await Promise.all([
        fetch(`/api/spots/${spotId}`),
        fetch(`/api/images?entityType=spot&entityId=${spotId}`),
      ]);
      
      if (spotResponse.ok) {
        const data = await spotResponse.json();
        setSpotData(data);
      } else {
        throw new Error("Failed to fetch spot data");
      }

      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        setSpotImages(imagesData);
      }
    } catch (error) {
      toast.error("Failed to fetch spot data");
      console.error(error);
    } finally {
      setIsLoadingSpotData(false);
    }
  };

  // Fetch landmark data for editing
  const fetchLandmarkData = async (landmarkId: string) => {
    try {
      setIsLoadingLandmarkData(true);
      const [landmarkResponse, imagesResponse] = await Promise.all([
        fetch(`/api/landmarks/${landmarkId}`),
        fetch(`/api/images?entityType=landmark&entityId=${landmarkId}`),
      ]);
      
      if (landmarkResponse.ok) {
        const data = await landmarkResponse.json();
        setLandmarkData(data);
      } else {
        throw new Error("Failed to fetch landmark data");
      }

      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        setLandmarkImages(imagesData);
      }
    } catch (error) {
      toast.error("Failed to fetch landmark data");
      console.error(error);
    } finally {
      setIsLoadingLandmarkData(false);
    }
  };

  // Fetch data when tab changes
  useEffect(() => {
    if (!isAdmin) return;

    switch (activeTab) {
      case "users":
        fetchUsers();
        break;
      case "reviews":
        fetchReviews();
        break;
      case "spots":
        fetchSpots();
        break;
      case "businesses":
        fetchBusinesses();
        break;
      case "landmarks":
        fetchLandmarks();
        break;
    }
  }, [activeTab, isAdmin]);

  // Handle edit spot
  const handleEditSpot = (spot: Spot) => {
    setEditingSpot(spot);
    setSpotImages([]);
    fetchSpotData(spot.id);
  };

  // Handle edit landmark
  const handleEditLandmark = (landmark: Landmark) => {
    setEditingLandmark(landmark);
    setLandmarkImages([]);
    fetchLandmarkData(landmark.id);
  };

  // Handle delete image
  const handleDeleteImage = async (imageId: number) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete image");
      }
      return Promise.resolve();
    } catch (error) {
      throw error;
    }
  };

  // Handle seed database
  const handleSeed = async () => {
    if (!confirm("Are you sure you want to seed the database? This will add landmarks, businesses, spots, and reviews.")) {
      return;
    }

    setIsSeeding(true);
    try {
      const response = await fetch("/api/admin/seed", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to seed database");
      }

      toast.success("Database seeded successfully!");
      
      // Refresh all data
      fetchSpots();
      fetchLandmarks();
      fetchBusinesses();
      fetchReviews();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to seed database"
      );
    } finally {
      setIsSeeding(false);
    }
  };

  // Check if should show seed button
  const shouldShowSeedButton = spots.length === 0 && landmarks.length === 0 && !isLoadingSpots && !isLoadingLandmarks;

  // Handle delete review
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Review deleted successfully");
        fetchReviews();
      } else {
        throw new Error("Failed to delete review");
      }
    } catch (error) {
      toast.error("Failed to delete review");
      console.error(error);
    }
  };

  // Handle delete spot
  const handleDeleteSpot = async (spotId: string) => {
    if (!confirm("Are you sure you want to delete this spot?")) return;

    try {
      const response = await fetch(`/api/admin/spots/${spotId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Spot deleted successfully");
        fetchSpots();
      } else {
        throw new Error("Failed to delete spot");
      }
    } catch (error) {
      toast.error("Failed to delete spot");
      console.error(error);
    }
  };

  // Handle delete business
  const handleDeleteBusiness = async (businessId: string) => {
    if (!confirm("Are you sure you want to delete this business?")) return;

    try {
      const response = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Business deleted successfully");
        fetchBusinesses();
      } else {
        throw new Error("Failed to delete business");
      }
    } catch (error) {
      toast.error("Failed to delete business");
      console.error(error);
    }
  };

  // Handle delete landmark
  const handleDeleteLandmark = async (landmarkId: string) => {
    if (!confirm("Are you sure you want to delete this landmark?")) return;

    try {
      const response = await fetch(`/api/admin/landmarks/${landmarkId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Landmark deleted successfully");
        fetchLandmarks();
      } else {
        throw new Error("Failed to delete landmark");
      }
    } catch (error) {
      toast.error("Failed to delete landmark");
      console.error(error);
    }
  };

  // Handle make admin
  const handleMakeAdmin = async (userId: string) => {
    if (!confirm("Are you sure you want to make this user an admin?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin" }),
      });
      if (response.ok) {
        toast.success("User is now an admin");
        fetchUsers();
      } else {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      toast.error("Failed to make user admin");
      console.error(error);
    }
  };

  // Handle ban user
  const handleBanUser = async (userId: string, ban: boolean, reason?: string) => {
    if (ban && !confirm(`Are you sure you want to ban this user?${reason ? `\nReason: ${reason}` : ""}`)) return;
    if (!ban && !confirm("Are you sure you want to unban this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banned: ban,
          banReason: ban ? reason || "Banned by admin" : null,
        }),
      });
      if (response.ok) {
        toast.success(ban ? "User banned successfully" : "User unbanned successfully");
        fetchUsers();
      } else {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      toast.error(`Failed to ${ban ? "ban" : "unban"} user`);
      console.error(error);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user account? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("User deleted successfully");
        fetchUsers();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
      console.error(error);
    }
  };

  if (isLoading || isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-8 animate-spin text-orange-600" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/signin?callbackURL=/admin");
    return null;
  }

  if (isAdmin === false) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-destructive" />
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Access Denied
          </h1>
          <p className="mb-6 text-muted-foreground">
            You do not have permission to access the admin panel.
          </p>
          <Button asChild>
            <a href="/">Go Home</a>
          </Button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "users", label: "Users", icon: Users, count: users.length },
    { id: "reviews", label: "Reviews", icon: Star, count: reviews.length },
    { id: "spots", label: "Spots", icon: MapPin, count: spots.length },
    { id: "businesses", label: "Businesses", icon: Building2, count: businesses.length },
    { id: "landmarks", label: "Landmarks", icon: Landmark, count: landmarks.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-amber-50/20 to-background">
      {/* Header */}
      <section className="border-b border-border/50 bg-background/80 pt-24 pb-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg">
                <Shield className="size-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Manage users, reviews, spots, businesses, and landmarks
                </p>
              </div>
            </div>
            {shouldShowSeedButton && (
              <Button
                onClick={handleSeed}
                disabled={isSeeding}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 size-4" />
                    Seed Database
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
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
                  <Icon className="size-4" />
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
              );
            })}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {isLoadingUsers ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <Loader2 className="mb-4 size-8 animate-spin text-orange-600" />
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <Card
                      key={user.id}
                      className="border bg-card/95 p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              {user.name}
                            </h3>
                            {user.role === "admin" && (
                              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                                Admin
                              </span>
                            )}
                            {user.banned && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                Banned
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          {user.banReason && (
                            <p className="mt-1 text-xs text-red-600">
                              Ban reason: {user.banReason}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {user.role !== "admin" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMakeAdmin(user.id)}
                            >
                              <UserPlus className="mr-2 size-4" />
                              Make Admin
                            </Button>
                          )}
                          {!user.banned ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBanUser(user.id, true)}
                            >
                              <Ban className="mr-2 size-4" />
                              Ban
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBanUser(user.id, false)}
                            >
                              Unban
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {isLoadingReviews ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <Loader2 className="mb-4 size-8 animate-spin text-orange-600" />
                  <p className="text-muted-foreground">Loading reviews...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card
                      key={review.id}
                      className="border bg-card/95 p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              {review.userName}
                            </h3>
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium uppercase text-orange-700">
                              {review.itemType}
                            </span>
                          </div>
                          <p className="mb-2 text-sm font-medium text-foreground">
                            {review.itemName}
                          </p>
                          <div className="mb-2 flex items-center gap-2">
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
                            <span className="ml-2 text-xs text-muted-foreground">
                              {review.date}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Spots Tab */}
          {activeTab === "spots" && (
            <div className="space-y-6">
              {isLoadingSpots ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <Loader2 className="mb-4 size-8 animate-spin text-orange-600" />
                  <p className="text-muted-foreground">Loading spots...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {spots.map((spot) => (
                    <Card
                      key={spot.id}
                      className="border bg-card/95 p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {spot.name}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {spot.category} • {spot.location}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSpot(spot)}
                          >
                            <Edit className="mr-2 size-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteSpot(spot.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Businesses Tab */}
          {activeTab === "businesses" && (
            <div className="space-y-6">
              {isLoadingBusinesses ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <Loader2 className="mb-4 size-8 animate-spin text-orange-600" />
                  <p className="text-muted-foreground">Loading businesses...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {businesses.map((business) => (
                    <Card
                      key={business.id}
                      className="border bg-card/95 p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              {business.name}
                            </h3>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                business.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : business.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                              )}
                            >
                              {business.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {business.email}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingBusiness(business)}
                          >
                            <Edit className="mr-2 size-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteBusiness(business.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Landmarks Tab */}
          {activeTab === "landmarks" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => setShowCreateLandmark(true)}
                >
                  <Landmark className="mr-2 size-4" />
                  Add Landmark
                </Button>
              </div>
              {isLoadingLandmarks ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <Loader2 className="mb-4 size-8 animate-spin text-orange-600" />
                  <p className="text-muted-foreground">Loading landmarks...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {landmarks.map((landmark) => (
                    <Card
                      key={landmark.id}
                      className="border bg-card/95 p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {landmark.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {landmark.category} • {landmark.location}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditLandmark(landmark)}
                          >
                            <Edit className="mr-2 size-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteLandmark(landmark.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Edit Spot Dialog */}
      <EditSpotDialog
        open={!!editingSpot}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSpot(null);
            setSpotData(null);
            setSpotImages([]);
          }
        }}
        spot={editingSpot}
        spotData={spotData}
        spotImages={spotImages}
        isLoading={isLoadingSpotData}
        onImagesChange={setSpotImages}
        onDeleteImage={handleDeleteImage}
        onSave={async (values) => {
          if (!editingSpot) return;
          const response = await fetch(`/api/admin/spots/${editingSpot.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          if (response.ok) {
            toast.success("Spot updated successfully");
            fetchSpots();
            setEditingSpot(null);
            setSpotData(null);
            setSpotImages([]);
          } else {
            throw new Error("Failed to update spot");
          }
        }}
      />

      {/* Edit Landmark Dialog */}
      <EditLandmarkDialog
        open={!!editingLandmark}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLandmark(null);
            setLandmarkData(null);
            setLandmarkImages([]);
          }
        }}
        landmark={editingLandmark}
        landmarkData={landmarkData}
        landmarkImages={landmarkImages}
        isLoading={isLoadingLandmarkData}
        onImagesChange={setLandmarkImages}
        onDeleteImage={handleDeleteImage}
        onSave={async (values) => {
          if (!editingLandmark) return;
          const response = await fetch(`/api/admin/landmarks/${editingLandmark.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          if (response.ok) {
            toast.success("Landmark updated successfully");
            fetchLandmarks();
            setEditingLandmark(null);
            setLandmarkData(null);
            setLandmarkImages([]);
          } else {
            throw new Error("Failed to update landmark");
          }
        }}
      />

      {/* Create Landmark Dialog */}
      <CreateLandmarkDialog
        open={showCreateLandmark}
        onOpenChange={(open) => {
          setShowCreateLandmark(open);
          if (!open) {
            setCreateLandmarkImages([]);
          }
        }}
        landmarkImages={createLandmarkImages}
        onImagesChange={setCreateLandmarkImages}
        onDeleteImage={handleDeleteImage}
        onSave={async (values, landmarkId) => {
          toast.success("Landmark created successfully");
          fetchLandmarks();
          setShowCreateLandmark(false);
          setCreateLandmarkImages([]);
        }}
      />

      {/* Edit Business Dialog */}
      <EditBusinessDialog
        open={!!editingBusiness}
        onOpenChange={(open) => {
          if (!open) setEditingBusiness(null);
        }}
        business={editingBusiness}
        onSave={async (values) => {
          if (!editingBusiness) return;
          const response = await fetch(`/api/admin/businesses/${editingBusiness.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          if (response.ok) {
            toast.success("Business updated successfully");
            fetchBusinesses();
            setEditingBusiness(null);
          } else {
            throw new Error("Failed to update business");
          }
        }}
      />
    </div>
  );
}

// Edit Spot Dialog Component
function EditSpotDialog({
  open,
  onOpenChange,
  spot,
  spotData,
  spotImages,
  isLoading,
  onImagesChange,
  onDeleteImage,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spot: Spot | null;
  spotData: SpotFull | null;
  spotImages: Array<{ id: number; url: string; isPrimary: boolean }>;
  isLoading: boolean;
  onImagesChange: (images: Array<{ id: number; url: string; isPrimary: boolean }>) => void;
  onDeleteImage: (imageId: number) => Promise<void>;
  onSave: (values: z.infer<typeof editSpotSchema>) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof editSpotSchema>>({
    resolver: zodResolver(editSpotSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      location: "",
      address: "",
      priceRange: null,
      phone: null,
      website: null,
    },
  });

  useEffect(() => {
    if (open && spotData) {
      form.reset({
        name: spotData.name,
        category: spotData.category,
        description: spotData.description,
        location: spotData.location,
        address: spotData.address,
        priceRange: spotData.priceRange,
        phone: spotData.phone,
        website: spotData.website,
      });
    }
  }, [open, spotData, form]);

  async function handleSubmit(values: z.infer<typeof editSpotSchema>) {
    setIsSubmitting(true);
    try {
      await onSave(values);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update spot");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!spot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Spot</DialogTitle>
          <DialogDescription>
            Update spot information.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-orange-600" />
            <span className="ml-2 text-muted-foreground">Loading spot data...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Price Range</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="$" />
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
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
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload Section */}
              {spot && !isLoading && spotData && (
                <div className="space-y-2">
                  <FormLabel>Images</FormLabel>
                  <ImageUpload
                    entityType="spot"
                    entityId={spot.id}
                    existingImages={spotImages}
                    onImagesChange={onImagesChange}
                    onDelete={onDeleteImage}
                  />
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
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

// Edit Landmark Dialog Component
function EditLandmarkDialog({
  open,
  onOpenChange,
  landmark,
  landmarkData,
  landmarkImages,
  isLoading,
  onImagesChange,
  onDeleteImage,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  landmark: Landmark | null;
  landmarkData: LandmarkFull | null;
  landmarkImages: Array<{ id: number; url: string; isPrimary: boolean }>;
  isLoading: boolean;
  onImagesChange: (images: Array<{ id: number; url: string; isPrimary: boolean }>) => void;
  onDeleteImage: (imageId: number) => Promise<void>;
  onSave: (values: z.infer<typeof editLandmarkSchema>) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof editLandmarkSchema>>({
    resolver: zodResolver(editLandmarkSchema),
    defaultValues: {
      category: "",
      title: "",
      description: "",
      location: "",
      address: "",
      admission: null,
      website: null,
    },
  });

  useEffect(() => {
    if (open && landmarkData) {
      form.reset({
        category: landmarkData.category,
        title: landmarkData.title,
        description: landmarkData.description,
        location: landmarkData.location,
        address: landmarkData.address,
        admission: landmarkData.admission,
        website: landmarkData.website,
      });
    }
  }, [open, landmarkData, form]);

  async function handleSubmit(values: z.infer<typeof editLandmarkSchema>) {
    setIsSubmitting(true);
    try {
      await onSave(values);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update landmark");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!landmark) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Landmark</DialogTitle>
          <DialogDescription>
            Update landmark information.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-orange-600" />
            <span className="ml-2 text-muted-foreground">Loading landmark data...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="admission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
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
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload Section */}
              {landmark && !isLoading && landmarkData && (
                <div className="space-y-2">
                  <FormLabel>Images</FormLabel>
                  <ImageUpload
                    entityType="landmark"
                    entityId={landmark.id}
                    existingImages={landmarkImages}
                    onImagesChange={onImagesChange}
                    onDelete={onDeleteImage}
                  />
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
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

// Create Landmark Dialog Component
function CreateLandmarkDialog({
  open,
  onOpenChange,
  landmarkImages,
  onImagesChange,
  onDeleteImage,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  landmarkImages: Array<{ id: number; url: string; isPrimary: boolean }>;
  onImagesChange: (images: Array<{ id: number; url: string; isPrimary: boolean }>) => void;
  onDeleteImage: (imageId: number) => Promise<void>;
  onSave: (values: z.infer<typeof createLandmarkSchema>, landmarkId: string) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof createLandmarkSchema>>({
    resolver: zodResolver(createLandmarkSchema),
    defaultValues: {
      category: "",
      title: "",
      description: "",
      location: "",
      address: "",
      admission: null,
      website: null,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        category: "",
        title: "",
        description: "",
        location: "",
        address: "",
        admission: null,
        website: null,
      });
    }
  }, [open, form]);

  const [createdLandmarkId, setCreatedLandmarkId] = useState<string | null>(null);

  async function handleSubmit(values: z.infer<typeof createLandmarkSchema>) {
    setIsSubmitting(true);
    try {
      // First create the landmark
      const response = await fetch("/api/admin/landmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create landmark");
      }

      const newLandmark = await response.json();
      setCreatedLandmarkId(newLandmark.id);

      await onSave(values, newLandmark.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create landmark");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!open) {
      setCreatedLandmarkId(null);
      onImagesChange([]);
    }
  }, [open, onImagesChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Landmark</DialogTitle>
          <DialogDescription>
            Add a new landmark to the platform.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., GOTHIC MASTERPIECE" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Valencia Cathedral" />
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
                      placeholder="Brief description of the landmark"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Old Town" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full street address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="admission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admission</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="e.g., €8, Free" />
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
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="https://example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload Section - Only show after landmark is created */}
            {createdLandmarkId && (
              <div className="space-y-2">
                <FormLabel>Images</FormLabel>
                <ImageUpload
                  entityType="landmark"
                  entityId={createdLandmarkId}
                  existingImages={landmarkImages}
                  onImagesChange={onImagesChange}
                  onDelete={onDeleteImage}
                />
              </div>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (createdLandmarkId) {
                    // If landmark is created, call onSave and close
                    onSave(form.getValues(), createdLandmarkId).then(() => {
                      form.reset();
                      setCreatedLandmarkId(null);
                      onImagesChange([]);
                      onOpenChange(false);
                    }).catch(() => {
                      // Error already shown by onSave
                    });
                  } else {
                    onOpenChange(false);
                  }
                }}
              >
                {createdLandmarkId ? "Done" : "Cancel"}
              </Button>
              {!createdLandmarkId && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Landmark"
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

// Edit Business Dialog Component
function EditBusinessDialog({
  open,
  onOpenChange,
  business,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: Business | null;
  onSave: (values: z.infer<typeof editBusinessSchema>) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof editBusinessSchema>>({
    resolver: zodResolver(editBusinessSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      website: null,
      status: "pending",
    },
  });

  useEffect(() => {
    if (open && business) {
      form.reset({
        name: business.name,
        email: business.email,
        phone: business.phone,
        website: business.website,
        status: business.status,
      });
    }
  }, [open, business, form]);

  async function handleSubmit(values: z.infer<typeof editBusinessSchema>) {
    setIsSubmitting(true);
    try {
      await onSave(values);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update business");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!business) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Business</DialogTitle>
          <DialogDescription>
            Update business information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
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
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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
      </DialogContent>
    </Dialog>
  );
}
