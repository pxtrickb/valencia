import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { businesses, spots, images } from "@/db/schema";
import { eq } from "drizzle-orm";
import cuid from "cuid";
import { z } from "zod";

// GET - Fetch all businesses for the authenticated user
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

    const userBusinesses = await db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, userId));

    if (userBusinesses.length === 0) {
      return NextResponse.json([]);
    }

    // Get spots for all user's businesses (handle each business separately since inArray may not work with nullable fields)
    const businessIds = userBusinesses.map(b => b.id);
    const allSpotsPromises = businessIds.map(businessId =>
      db.select().from(spots).where(eq(spots.businessId, businessId))
    );
    const allSpotsResults = await Promise.all(allSpotsPromises);
    const businessSpots = allSpotsResults.flat();

    // Group spots by businessId
    const spotsByBusiness = businessSpots.reduce((acc, spot) => {
      if (!spot.businessId) return acc;
      if (!acc[spot.businessId]) {
        acc[spot.businessId] = [];
      }
      acc[spot.businessId].push(spot);
      return acc;
    }, {} as Record<string, typeof businessSpots>);

    // Attach spots to businesses
    const businessesWithSpots = userBusinesses.map((business) => ({
      id: business.id,
      name: business.name,
      identifier: business.identifier,
      email: business.email,
      phone: business.phone,
      website: business.website,
      status: business.status,
      spots: (spotsByBusiness[business.id] || []).map((spot) => ({
        id: spot.id,
        name: spot.name,
        category: spot.shortCategory,
        location: spot.location,
        link: `/spots/${spot.id}`,
      })),
    }));

    return NextResponse.json(businessesWithSpots);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}

// POST - Create a new business
const createBusinessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  identifier: z.string().min(1, "Business identifier is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
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
    const validatedData = createBusinessSchema.parse(body);

    const businessId = cuid();

    await db.insert(businesses).values({
      id: businessId,
      userId,
      name: validatedData.name,
      identifier: validatedData.identifier,
      email: validatedData.email,
      phone: validatedData.phone,
      website: validatedData.website || null,
      status: "pending",
    });

    const newBusiness = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);

    return NextResponse.json(
      {
        id: newBusiness[0].id,
        name: newBusiness[0].name,
        identifier: newBusiness[0].identifier,
        email: newBusiness[0].email,
        phone: newBusiness[0].phone,
        website: newBusiness[0].website,
        status: newBusiness[0].status,
        spots: [],
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    console.error("Error creating business:", error);
    return NextResponse.json(
      { error: "Failed to create business" },
      { status: 500 }
    );
  }
}


