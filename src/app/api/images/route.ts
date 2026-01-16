import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import db from "@/db";
import { images } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET - Get images for an entity
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "Missing entityType or entityId" },
        { status: 400 }
      );
    }

    const imageRecords = await db
      .select()
      .from(images)
      .where(
        and(
          eq(images.entityType, entityType as "spot" | "landmark"),
          eq(images.entityId, entityId)
        )
      )
      .orderBy(images.orderIndex);

    return NextResponse.json(imageRecords);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

