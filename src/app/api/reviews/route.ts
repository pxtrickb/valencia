import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { reviews, user, spots, landmarks } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

// GET - Fetch reviews for a specific item or all reviews by current user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get("itemType");
    const itemId = searchParams.get("itemId");
    const userOnly = searchParams.get("userOnly") === "true";
    const latest = searchParams.get("latest");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const itemTypeOnly = searchParams.get("itemTypeOnly"); // e.g., "spot" or "landmark"

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If fetching reviews by itemType only (for calculating ratings)
    if (itemTypeOnly && (itemTypeOnly === "spot" || itemTypeOnly === "landmark")) {
      const allReviews = await db
        .select({
          id: reviews.id,
          itemId: reviews.itemId,
          rating: reviews.rating,
        })
        .from(reviews)
        .where(eq(reviews.itemType, itemTypeOnly as "spot" | "landmark"));

      return NextResponse.json(allReviews);
    }

    // If fetching latest reviews across all items
    if (latest === "true") {
      const latestReviews = await db
        .select({
          id: reviews.id,
          userId: reviews.userId,
          itemType: reviews.itemType,
          itemId: reviews.itemId,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .orderBy(desc(reviews.createdAt))
        .limit(limit);

      // Get user info for all reviews
      const userIds = Array.from(new Set(latestReviews.map((r) => r.userId)));
      const userInfos = await Promise.all(
        userIds.map((uid) =>
          db
            .select({
              id: user.id,
              name: user.name,
              email: user.email,
            })
            .from(user)
            .where(eq(user.id, uid))
            .limit(1)
        )
      );

      const userMap = new Map(
        userInfos.flat().map((u) => [
          u.id,
          {
            name: u.name || u.email?.split("@")[0] || "User",
            initials:
              u.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || u.email?.[0].toUpperCase() || "U",
          },
        ])
      );

      // Get item info (spots or landmarks) for each review
      // Fetch all spots and landmarks to build maps (this is fine for landing page usage)
      const allSpots = await db.select({ id: spots.id, name: spots.name, category: spots.category }).from(spots);
      const allLandmarks = await db.select({ id: landmarks.id, title: landmarks.title, category: landmarks.category }).from(landmarks);

      const spotMap = new Map(allSpots.map((s) => [s.id, { name: s.name, category: s.category }]));
      const landmarkMap = new Map(allLandmarks.map((l) => [l.id, { name: l.title, category: l.category }]));

      // Format reviews with user and item info
      const formattedReviews = latestReviews.map((review) => {
        const userInfo = userMap.get(review.userId) || {
          name: "Anonymous",
          initials: "A",
        };

        const itemInfo =
          review.itemType === "spot"
            ? spotMap.get(review.itemId)
            : landmarkMap.get(review.itemId);

        const reviewDate = new Date(review.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let dateString = "Just now";
        if (diffDays === 0) {
          dateString = "Today";
        } else if (diffDays === 1) {
          dateString = "1 day ago";
        } else if (diffDays < 7) {
          dateString = `${diffDays} days ago`;
        } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          dateString = weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
        } else {
          const months = Math.floor(diffDays / 30);
          dateString = months === 1 ? "1 month ago" : `${months} months ago`;
        }

        return {
          id: review.id,
          userName: userInfo.name,
          userInitials: userInfo.initials,
          spotName: itemInfo?.name || (review.itemType === "spot" ? "Spot" : "Landmark"),
          spotCategory: itemInfo?.category || (review.itemType === "spot" ? "Spot" : "Landmark"),
          rating: review.rating,
          reviewText: review.comment,
          date: dateString,
          itemType: review.itemType,
          itemId: review.itemId,
        };
      });

      return NextResponse.json(formattedReviews);
    }

    // If fetching user's own reviews, require authentication
    if (userOnly) {
      if (!session) {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        );
      }

      const userId = session.user.id;

      // Get all reviews by this user
      const userReviewsList = await db
        .select({
          id: reviews.id,
          itemType: reviews.itemType,
          itemId: reviews.itemId,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .where(eq(reviews.userId, userId))
        .orderBy(desc(reviews.createdAt));

      // Get user info for all reviews
      const userInfo = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      const userName = userInfo[0]?.name || userInfo[0]?.email?.split("@")[0] || "User";
      const userInitials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

      // Format reviews with user info and item details
      const formattedReviews = userReviewsList.map((review) => {
        const reviewDate = new Date(review.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let dateString = "Just now";
        if (diffDays === 0) {
          dateString = "Today";
        } else if (diffDays === 1) {
          dateString = "1 day ago";
        } else if (diffDays < 7) {
          dateString = `${diffDays} days ago`;
        } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          dateString = weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
        } else {
          const months = Math.floor(diffDays / 30);
          dateString = months === 1 ? "1 month ago" : `${months} months ago`;
        }

        return {
          id: review.id,
          type: review.itemType,
          itemId: review.itemId,
          name: review.itemType === "spot" ? "Spot" : "Landmark", // Will be resolved on client
          rating: review.rating,
          comment: review.comment,
          date: dateString,
          link: `/${review.itemType}s/${review.itemId}`,
          userName,
          userInitials,
        };
      });

      return NextResponse.json(formattedReviews);
    }

    // Fetch reviews for a specific item
    if (itemType && itemId) {
      // Validate itemType
      if (itemType !== "spot" && itemType !== "landmark") {
        return NextResponse.json(
          { error: "Invalid item type" },
          { status: 400 }
        );
      }

      const currentUserId = session?.user.id || null;

      const itemReviews = await db
        .select({
          id: reviews.id,
          userId: reviews.userId,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .where(
          and(
            eq(reviews.itemType, itemType as "spot" | "landmark"),
            eq(reviews.itemId, itemId)
          )
        )
        .orderBy(desc(reviews.createdAt));

      // Sort so user's own review appears first if authenticated
      const sortedReviews = currentUserId
        ? [
            ...itemReviews.filter((r) => r.userId === currentUserId),
            ...itemReviews.filter((r) => r.userId !== currentUserId),
          ]
        : itemReviews;

      // Get user info for all reviews
      const userIds = Array.from(new Set(itemReviews.map((r) => r.userId)));
      const userInfos = await Promise.all(
        userIds.map((uid) =>
          db
            .select({
              id: user.id,
              name: user.name,
              email: user.email,
            })
            .from(user)
            .where(eq(user.id, uid))
            .limit(1)
        )
      );

      const userMap = new Map(
        userInfos.flat().map((u) => [
          u.id,
          {
            name: u.name || u.email?.split("@")[0] || "User",
            initials:
              u.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || u.email?.[0].toUpperCase() || "U",
          },
        ])
      );

      // Format reviews with user info
      const formattedReviews = sortedReviews.map((review) => {
        const userInfo = userMap.get(review.userId) || {
          name: "Anonymous",
          initials: "A",
        };

        const reviewDate = new Date(review.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let dateString = "Just now";
        if (diffDays === 0) {
          dateString = "Today";
        } else if (diffDays === 1) {
          dateString = "1 day ago";
        } else if (diffDays < 7) {
          dateString = `${diffDays} days ago`;
        } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          dateString = weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
        } else {
          const months = Math.floor(diffDays / 30);
          dateString = months === 1 ? "1 month ago" : `${months} months ago`;
        }

        return {
          id: review.id,
          userId: review.userId,
          userName: userInfo.name,
          userInitials: userInfo.initials,
          rating: review.rating,
          reviewText: review.comment,
          date: dateString,
        };
      });

      return NextResponse.json(formattedReviews);
    }

    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Create a new review
const createReviewSchema = z.object({
  itemType: z.enum(["spot", "landmark"]),
  itemId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate request body
    const validatedData = createReviewSchema.parse(body);

    // Check if user already has a review for this item
    const existingReview = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          eq(reviews.itemType, validatedData.itemType),
          eq(reviews.itemId, validatedData.itemId)
        )
      )
      .limit(1);

    if (existingReview.length > 0) {
      // Update existing review
      await db
        .update(reviews)
        .set({
          rating: validatedData.rating,
          comment: validatedData.comment,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, existingReview[0].id));

      const updatedReview = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, existingReview[0].id))
        .limit(1);

      return NextResponse.json(
        {
          id: updatedReview[0].id,
          message: "Review updated successfully",
        },
        { status: 200 }
      );
    }

    // Create new review
    const result = await db
      .insert(reviews)
      .values({
        userId,
        itemType: validatedData.itemType,
        itemId: validatedData.itemId,
        rating: validatedData.rating,
        comment: validatedData.comment,
      })
      .returning();

    return NextResponse.json(
      {
        id: result[0].id,
        message: "Review created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
