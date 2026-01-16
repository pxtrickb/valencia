import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { auth } from "@/lib/auth";
import db from "@/db";
import { images } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

const uploadImageSchema = z.object({
  entityType: z.enum(["spot", "landmark"]),
  entityId: z.string(),
  url: z.string().url().optional(),
  isPrimary: z.boolean().optional(),
});

// Ensure upload directory exists
async function ensureUploadDir() {
  const uploadDir = join(process.cwd(), "usercontent", "images");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

// Download image from URL and save locally
async function downloadAndSaveImage(url: string, filename: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image from URL: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadDir = await ensureUploadDir();
  const filePath = join(uploadDir, filename);
  await writeFile(filePath, buffer);

  return `/usercontent/images/${filename}`;
}

// Save uploaded file
async function saveUploadedFile(file: File, filename: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = await ensureUploadDir();
  const filePath = join(uploadDir, filename);
  await writeFile(filePath, buffer);

  return `/usercontent/images/${filename}`;
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const ext = originalName.split(".").pop() || "jpg";
  return `${timestamp}-${random}.${ext}`;
}

// POST - Upload image (file or URL)
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

    const formData = await request.formData();
    const entityType = formData.get("entityType") as string;
    const entityId = formData.get("entityId") as string;
    const url = formData.get("url") as string | null;
    const isPrimary = formData.get("isPrimary") === "true";
    const file = formData.get("file") as File | null;

    // Validate input
    if (!entityType || !entityId || (!url && !file)) {
      return NextResponse.json(
        { error: "Missing required fields: entityType, entityId, and either url or file" },
        { status: 400 }
      );
    }

    const validatedData = uploadImageSchema.parse({
      entityType,
      entityId,
      url: url || undefined,
      isPrimary,
    });

    let imageUrl: string;

    if (file) {
      // Upload from file
      const filename = generateFilename(file.name);
      imageUrl = await saveUploadedFile(file, filename);
    } else if (url) {
      // Download from URL
      const filename = generateFilename(url.split("/").pop() || "image.jpg");
      imageUrl = await downloadAndSaveImage(url, filename);
    } else {
      return NextResponse.json(
        { error: "Either file or url must be provided" },
        { status: 400 }
      );
    }

    // If this is marked as primary, unset other primary images for this entity
    if (validatedData.isPrimary) {
      const existingPrimary = await db
        .select()
        .from(images)
        .where(
          and(
            eq(images.entityType, validatedData.entityType),
            eq(images.entityId, validatedData.entityId),
            eq(images.isPrimary, true)
          )
        )
        .limit(1);

      if (existingPrimary.length > 0) {
        await db
          .update(images)
          .set({ isPrimary: false })
          .where(eq(images.id, existingPrimary[0].id));
      }
    }

    // Get the highest order index for this entity
    const existingImages = await db
      .select()
      .from(images)
      .where(
        and(
          eq(images.entityType, validatedData.entityType),
          eq(images.entityId, validatedData.entityId)
        )
      )
      .orderBy(desc(images.orderIndex))
      .limit(1);

    const orderIndex = existingImages.length > 0 ? existingImages[0].orderIndex + 1 : 0;

    // Insert image record
    const [newImage] = await db
      .insert(images)
      .values({
        entityType: validatedData.entityType,
        entityId: validatedData.entityId,
        url: imageUrl,
        isPrimary: validatedData.isPrimary || false,
        orderIndex,
      })
      .returning();

    return NextResponse.json({
      id: newImage.id,
      url: newImage.url,
      isPrimary: newImage.isPrimary,
      orderIndex: newImage.orderIndex,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

