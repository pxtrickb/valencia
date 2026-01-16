import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import db from "@/db";
import { landmarks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import cuid from "cuid";

const createLandmarkSchema = z.object({
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  fullDescription: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  hours: z.record(z.string(), z.string()).nullable().optional(),
  admission: z.string().optional(),
  website: z.string().nullable().optional(),
  image: z.string().optional(),
});

// POST - Admin create landmark
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();

    // Validate request body
    const validatedData = createLandmarkSchema.parse(body);

    const landmarkId = cuid();

    // Prepare hours for storage
    const hoursString =
      validatedData.hours === null || validatedData.hours === undefined
        ? null
        : JSON.stringify(validatedData.hours);

    await db.insert(landmarks).values({
      id: landmarkId,
      category: validatedData.category,
      title: validatedData.title,
      description: validatedData.description,
      fullDescription: validatedData.fullDescription || null,
      location: validatedData.location,
      address: validatedData.address,
      hours: hoursString,
      admission: validatedData.admission || null,
      website: validatedData.website || null,
      image: validatedData.image || null,
    });

    const newLandmark = await db
      .select()
      .from(landmarks)
      .where(eq(landmarks.id, landmarkId))
      .limit(1);

    return NextResponse.json(newLandmark[0], { status: 201 });
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
    console.error("Error creating landmark:", error);
    return NextResponse.json(
      { error: "Failed to create landmark" },
      { status: 500 }
    );
  }
}
