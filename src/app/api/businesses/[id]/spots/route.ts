import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { businesses, spots, images } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import cuid from "cuid";
import { z } from "zod";

// GET - Get all spots for a business
export async function GET(
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
    const { id: businessId } = await params;

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

    const businessSpots = await db
      .select()
      .from(spots)
      .where(eq(spots.businessId, businessId));

    return NextResponse.json(businessSpots);
  } catch (error) {
    console.error("Error fetching business spots:", error);
    return NextResponse.json(
      { error: "Failed to fetch business spots" },
      { status: 500 }
    );
  }
}

// POST - Create a new spot for a business
const createSpotSchema = z.object({
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
  hours: z.record(z.string()).optional(),
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

export async function POST(
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
    const { id: businessId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = createSpotSchema.parse(body);

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

    // Only allow creating spots if business is approved
    if (business[0].status !== "approved") {
      return NextResponse.json(
        { error: "Business must be approved to create spots" },
        { status: 403 }
      );
    }

    const spotId = cuid();
    const shortCategory = categoryToShortCategory[validatedData.category] || validatedData.category.toUpperCase();

    await db.insert(spots).values({
      id: spotId,
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
      image: "/api/placeholder/1200/600", // Default image
      businessId,
    });

    // Insert default image
    await db.insert(images).values({
      entityType: "spot",
      entityId: spotId,
      url: "/api/placeholder/1200/600",
      isPrimary: true,
      orderIndex: 0,
    });

    const newSpot = await db
      .select()
      .from(spots)
      .where(eq(spots.id, spotId))
      .limit(1);

    return NextResponse.json(newSpot[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating spot:", error);
    return NextResponse.json(
      { error: "Failed to create spot" },
      { status: 500 }
    );
  }
}



