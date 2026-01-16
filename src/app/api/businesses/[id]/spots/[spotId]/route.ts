import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { businesses, spots } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// PUT - Update a spot
const updateSpotSchema = z.object({
  name: z.string().min(1, "Spot name is required"),
  category: z.enum([
    "Restaurant",
    "Café",
    "Bar",
    "Tapas Bar",
    "Bakery",
    "Ice Cream Shop",
    "Market",
    "Grocery Store",
    "Shop",
    "Boutique",
    "Museum",
    "Art Gallery",
    "Theater",
    "Cinema",
    "Park",
    "Beach",
    "Nightclub",
    "Hotel",
    "Hostel",
    "Spa",
    "Gym",
    "Sports Venue",
    "Library",
    "Other"
  ]),
  location: z.string().min(1, "Location is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  priceRange: z.enum(["$", "$$", "$$$"]),
  address: z.string().min(1, "Address is required").optional(),
  hours: z.record(z.string(), z.string()).optional(),
  phone: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  fullDescription: z.string().optional(),
});

const categoryToShortCategory: Record<string, string> = {
  Restaurant: "RESTAURANT",
  Café: "CAFÉ",
  Bar: "BAR",
  "Tapas Bar": "TAPAS BAR",
  Bakery: "BAKERY",
  "Ice Cream Shop": "ICE CREAM SHOP",
  Market: "MARKET",
  "Grocery Store": "GROCERY STORE",
  Shop: "SHOP",
  Boutique: "BOUTIQUE",
  Museum: "MUSEUM",
  "Art Gallery": "ART GALLERY",
  Theater: "THEATER",
  Cinema: "CINEMA",
  Park: "PARK",
  Beach: "BEACH",
  Nightclub: "NIGHTCLUB",
  Hotel: "HOTEL",
  Hostel: "HOSTEL",
  Spa: "SPA",
  Gym: "GYM",
  "Sports Venue": "SPORTS VENUE",
  Library: "LIBRARY",
  Other: "OTHER",
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; spotId: string }> }
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
    const { id: businessId, spotId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateSpotSchema.parse(body);

    // Verify business belongs to user
    const business = await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.id, businessId), eq(businesses.userId, userId)))
      .limit(1);

    if (business.length === 0) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Verify spot belongs to business
    const existingSpot = await db
      .select()
      .from(spots)
      .where(and(eq(spots.id, spotId), eq(spots.businessId, businessId)))
      .limit(1);

    if (existingSpot.length === 0) {
      return NextResponse.json(
        { error: "Spot not found" },
        { status: 404 }
      );
    }

    const shortCategory = categoryToShortCategory[validatedData.category] || validatedData.category.toUpperCase();

    // Update spot
    await db
      .update(spots)
      .set({
        name: validatedData.name,
        category: validatedData.category,
        shortCategory,
        description: validatedData.description,
        fullDescription: validatedData.fullDescription || null,
        location: validatedData.location,
        address: validatedData.address || validatedData.location,
        priceRange: validatedData.priceRange,
        hours: validatedData.hours ? JSON.stringify(validatedData.hours) : null,
        phone: validatedData.phone || null,
        website: validatedData.website || null,
      })
      .where(eq(spots.id, spotId));

    const updatedSpot = await db
      .select()
      .from(spots)
      .where(eq(spots.id, spotId))
      .limit(1);

    return NextResponse.json(updatedSpot[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    console.error("Error updating spot:", error);
    return NextResponse.json(
      { error: "Failed to update spot" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a spot
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; spotId: string }> }
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
    const { id: businessId, spotId } = await params;

    // Verify business belongs to user
    const business = await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.id, businessId), eq(businesses.userId, userId)))
      .limit(1);

    if (business.length === 0) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Verify spot belongs to business
    const existingSpot = await db
      .select()
      .from(spots)
      .where(and(eq(spots.id, spotId), eq(spots.businessId, businessId)))
      .limit(1);

    if (existingSpot.length === 0) {
      return NextResponse.json(
        { error: "Spot not found" },
        { status: 404 }
      );
    }

    // Delete spot (images and reviews will be handled by foreign key constraints)
    await db.delete(spots).where(eq(spots.id, spotId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting spot:", error);
    return NextResponse.json(
      { error: "Failed to delete spot" },
      { status: 500 }
    );
  }
}



