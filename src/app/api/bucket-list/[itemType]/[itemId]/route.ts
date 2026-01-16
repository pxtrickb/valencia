import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { bucketList } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET - Get bucket list status for a specific item
export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemType: string; itemId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      // Return "none" if not authenticated
      return NextResponse.json({ status: "none" });
    }

    const userId = session.user.id;
    const { itemType, itemId } = await params;

    // Validate itemType
    if (itemType !== "spot" && itemType !== "landmark") {
      return NextResponse.json(
        { error: "Invalid item type" },
        { status: 400 }
      );
    }

    const bucketListItem = await db
      .select()
      .from(bucketList)
      .where(
        and(
          eq(bucketList.userId, userId),
          eq(bucketList.itemType, itemType as "spot" | "landmark"),
          eq(bucketList.itemId, itemId)
        )
      )
      .limit(1);

    if (bucketListItem.length === 0) {
      return NextResponse.json({ status: "none" });
    }

    return NextResponse.json({
      status: bucketListItem[0].status === "visited" ? "visited" : "bucketlisted",
    });
  } catch (error) {
    console.error("Error fetching bucket list status:", error);
    return NextResponse.json(
      { error: "Failed to fetch bucket list status" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from bucket list
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemType: string; itemId: string }> }
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
    const { itemType, itemId } = await params;

    // Validate itemType
    if (itemType !== "spot" && itemType !== "landmark") {
      return NextResponse.json(
        { error: "Invalid item type" },
        { status: 400 }
      );
    }

    const result = await db
      .delete(bucketList)
      .where(
        and(
          eq(bucketList.userId, userId),
          eq(bucketList.itemType, itemType as "spot" | "landmark"),
          eq(bucketList.itemId, itemId)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Item not found in bucket list" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from bucket list:", error);
    return NextResponse.json(
      { error: "Failed to remove from bucket list" },
      { status: 500 }
    );
  }
}
