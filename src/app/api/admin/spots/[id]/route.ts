import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin";
import db from "@/db";
import { spots } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSpotSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  shortCategory: z.string().optional(),
  description: z.string().optional(),
  fullDescription: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  priceRange: z.string().nullable().optional(),
  hours: z.record(z.string(), z.string()).nullable().optional(),
  phone: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  image: z.string().optional(),
});

// GET - Admin get spot details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const spot = await db
      .select()
      .from(spots)
      .where(eq(spots.id, id))
      .limit(1);

    if (spot.length === 0) {
      return NextResponse.json(
        { error: "Spot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(spot[0]);
  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    console.error("Error fetching spot:", error);
    return NextResponse.json(
      { error: "Failed to fetch spot" },
      { status: 500 }
    );
  }
}

// PUT - Admin update spot
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateSpotSchema.parse(body);

    // Check if spot exists
    const existingSpot = await db
      .select()
      .from(spots)
      .where(eq(spots.id, id))
      .limit(1);

    if (existingSpot.length === 0) {
      return NextResponse.json(
        { error: "Spot not found" },
        { status: 404 }
      );
    }

    // Parse hours if provided
    const updateData: any = { ...validatedData };
    if (validatedData.hours !== undefined) {
      updateData.hours =
        validatedData.hours === null
          ? null
          : JSON.stringify(validatedData.hours);
    }

    // Update the spot
    await db
      .update(spots)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(spots.id, id));

    // Fetch updated spot
    const updatedSpot = await db
      .select()
      .from(spots)
      .where(eq(spots.id, id))
      .limit(1);

    return NextResponse.json(updatedSpot[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    console.error("Error updating spot:", error);
    return NextResponse.json(
      { error: "Failed to update spot" },
      { status: 500 }
    );
  }
}

// DELETE - Admin delete spot
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    // Check if spot exists
    const spot = await db
      .select()
      .from(spots)
      .where(eq(spots.id, id))
      .limit(1);

    if (spot.length === 0) {
      return NextResponse.json(
        { error: "Spot not found" },
        { status: 404 }
      );
    }

    // Delete the spot (cascade will handle related reviews, images, etc.)
    await db.delete(spots).where(eq(spots.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    console.error("Error deleting spot:", error);
    return NextResponse.json(
      { error: "Failed to delete spot" },
      { status: 500 }
    );
  }
}
