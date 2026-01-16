import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import db from "@/db";
import { landmarks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateLandmarkSchema = z.object({
  category: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  fullDescription: z.string().optional(),
  location: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  hours: z.record(z.string(), z.string()).nullable().optional(),
  admission: z.string().optional(),
  website: z.string().nullable().optional(),
  image: z.string().optional(),
});

// PUT - Admin update landmark
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateLandmarkSchema.parse(body);

    // Check if landmark exists
    const existingLandmark = await db
      .select()
      .from(landmarks)
      .where(eq(landmarks.id, id))
      .limit(1);

    if (existingLandmark.length === 0) {
      return NextResponse.json(
        { error: "Landmark not found" },
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

    // Update the landmark
    await db
      .update(landmarks)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(landmarks.id, id));

    // Fetch updated landmark
    const updatedLandmark = await db
      .select()
      .from(landmarks)
      .where(eq(landmarks.id, id))
      .limit(1);

    return NextResponse.json(updatedLandmark[0]);
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
    console.error("Error updating landmark:", error);
    return NextResponse.json(
      { error: "Failed to update landmark" },
      { status: 500 }
    );
  }
}

// DELETE - Admin delete landmark
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    // Check if landmark exists
    const landmark = await db
      .select()
      .from(landmarks)
      .where(eq(landmarks.id, id))
      .limit(1);

    if (landmark.length === 0) {
      return NextResponse.json(
        { error: "Landmark not found" },
        { status: 404 }
      );
    }

    // Delete the landmark (cascade will handle related reviews, images, etc.)
    await db.delete(landmarks).where(eq(landmarks.id, id));

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
    console.error("Error deleting landmark:", error);
    return NextResponse.json(
      { error: "Failed to delete landmark" },
      { status: 500 }
    );
  }
}
