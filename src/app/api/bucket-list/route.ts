import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { bucketList, spots, landmarks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// GET - Fetch all bucket list items for the authenticated user
export async function GET() {
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

    const userBucketList = await db
      .select()
      .from(bucketList)
      .where(eq(bucketList.userId, userId));

    // Fetch details for each item
    const itemsWithDetails = await Promise.all(
      userBucketList.map(async (item) => {
        if (item.itemType === "spot") {
          const spot = await db
            .select({
              id: spots.id,
              name: spots.name,
              category: spots.shortCategory,
              location: spots.location,
            })
            .from(spots)
            .where(eq(spots.id, item.itemId))
            .limit(1);

          if (spot.length === 0) return null;

          return {
            id: item.id,
            itemId: spot[0].id,
            type: "spot" as const,
            name: spot[0].name,
            category: spot[0].category,
            location: spot[0].location,
            visited: item.status === "visited",
            link: `/spots/${spot[0].id}`,
          };
        } else {
          const landmark = await db
            .select({
              id: landmarks.id,
              title: landmarks.title,
              category: landmarks.category,
              location: landmarks.location,
            })
            .from(landmarks)
            .where(eq(landmarks.id, item.itemId))
            .limit(1);

          if (landmark.length === 0) return null;

          return {
            id: item.id,
            itemId: landmark[0].id,
            type: "landmark" as const,
            title: landmark[0].title,
            category: landmark[0].category,
            location: landmark[0].location,
            visited: item.status === "visited",
            link: `/landmarks/${landmark[0].id}`,
          };
        }
      })
    );

    // Filter out null items (spots/landmarks that no longer exist)
    const validItems = itemsWithDetails.filter(
      (item): item is NonNullable<typeof item> => item !== null
    );

    return NextResponse.json(validItems);
  } catch (error) {
    console.error("Error fetching bucket list:", error);
    return NextResponse.json(
      { error: "Failed to fetch bucket list" },
      { status: 500 }
    );
  }
}

// POST - Add or update bucket list item
const updateBucketListSchema = z.object({
  itemType: z.enum(["spot", "landmark"]),
  itemId: z.string(),
  status: z.enum(["bucketlisted", "visited"]),
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
    const validatedData = updateBucketListSchema.parse(body);

    // Check if item already exists in bucket list
    const existingItem = await db
      .select()
      .from(bucketList)
      .where(
        and(
          eq(bucketList.userId, userId),
          eq(bucketList.itemType, validatedData.itemType),
          eq(bucketList.itemId, validatedData.itemId)
        )
      )
      .limit(1);

    if (existingItem.length > 0) {
      // Update existing item
      await db
        .update(bucketList)
        .set({
          status: validatedData.status,
          updatedAt: new Date(),
        })
        .where(eq(bucketList.id, existingItem[0].id));

      return NextResponse.json({
        id: existingItem[0].id,
        itemType: validatedData.itemType,
        itemId: validatedData.itemId,
        status: validatedData.status,
      });
    } else {
      // Insert new item
      const result = await db
        .insert(bucketList)
        .values({
          userId,
          itemType: validatedData.itemType,
          itemId: validatedData.itemId,
          status: validatedData.status,
        })
        .returning();

      return NextResponse.json(
        {
          id: result[0].id,
          itemType: result[0].itemType,
          itemId: result[0].itemId,
          status: result[0].status,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating bucket list:", error);
    return NextResponse.json(
      { error: "Failed to update bucket list" },
      { status: 500 }
    );
  }
}
