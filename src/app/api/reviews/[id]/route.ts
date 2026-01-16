import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { reviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// DELETE - Delete a review (only if it belongs to the current user)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const reviewId = parseInt(id, 10);

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "Invalid review ID" },
        { status: 400 }
      );
    }

    // Check if review exists and belongs to user
    const review = await db
      .select()
      .from(reviews)
      .where(
        and(eq(reviews.id, reviewId), eq(reviews.userId, userId))
      )
      .limit(1);

    if (review.length === 0) {
      return NextResponse.json(
        { error: "Review not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the review
    await db.delete(reviews).where(eq(reviews.id, reviewId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
