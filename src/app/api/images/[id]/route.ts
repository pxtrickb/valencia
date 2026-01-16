import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { unlink } from "fs/promises";
import { join } from "path";
import { z } from "zod";
import { auth } from "@/lib/auth";
import db from "@/db";
import { images } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const updateImageSchema = z.object({
  isPrimary: z.boolean().optional(),
});

// PUT - Update image (e.g., set as primary)
export async function PUT(
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

    const { id } = await params;
    const imageId = parseInt(id, 10);

    if (isNaN(imageId)) {
      return NextResponse.json(
        { error: "Invalid image ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateImageSchema.parse(body);

    // Get image record
    const imageRecords = await db
      .select()
      .from(images)
      .where(eq(images.id, imageId))
      .limit(1);

    if (imageRecords.length === 0) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    const image = imageRecords[0];

    // If setting as primary, unset other primary images for this entity
    if (validatedData.isPrimary === true) {
      const existingPrimary = await db
        .select()
        .from(images)
        .where(
          and(
            eq(images.entityType, image.entityType),
            eq(images.entityId, image.entityId),
            eq(images.isPrimary, true),
            eq(images.id, imageId)
          )
        )
        .limit(1);

      if (existingPrimary.length === 0) {
        // Unset all other primary images
        await db
          .update(images)
          .set({ isPrimary: false })
          .where(
            and(
              eq(images.entityType, image.entityType),
              eq(images.entityId, image.entityId),
              eq(images.isPrimary, true)
            )
          );
      }

      // Set this image as primary
      await db
        .update(images)
        .set({ isPrimary: true })
        .where(eq(images.id, imageId));
    } else if (validatedData.isPrimary === false) {
      await db
        .update(images)
        .set({ isPrimary: false })
        .where(eq(images.id, imageId));
    }

    // Fetch updated image
    const updatedImage = await db
      .select()
      .from(images)
      .where(eq(images.id, imageId))
      .limit(1);

    return NextResponse.json(updatedImage[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating image:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}

// DELETE - Delete image (from DB and filesystem)
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

    const { id } = await params;
    const imageId = parseInt(id, 10);

    if (isNaN(imageId)) {
      return NextResponse.json(
        { error: "Invalid image ID" },
        { status: 400 }
      );
    }

    // Get image record
    const imageRecords = await db
      .select()
      .from(images)
      .where(eq(images.id, imageId))
      .limit(1);

    if (imageRecords.length === 0) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    const image = imageRecords[0];

    // Delete from filesystem if it's a local file
    if (image.url.startsWith("/usercontent/images/")) {
      try {
        const filePath = join(process.cwd(), image.url);
        await unlink(filePath);
      } catch (fileError) {
        // Log but don't fail if file doesn't exist
        console.warn("Failed to delete image file:", fileError);
      }
    }

    // Delete from database
    await db.delete(images).where(eq(images.id, imageId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}

