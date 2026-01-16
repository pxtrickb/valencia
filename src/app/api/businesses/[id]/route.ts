import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { businesses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// GET - Fetch a single business by ID (only if user owns it)
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
    const { id } = await params;

    const business = await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.id, id), eq(businesses.userId, userId)))
      .limit(1);

    if (business.length === 0) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: business[0].id,
      name: business[0].name,
      identifier: business[0].identifier,
      email: business[0].email,
      phone: business[0].phone,
      website: business[0].website,
      status: business[0].status,
    });
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { error: "Failed to fetch business" },
      { status: 500 }
    );
  }
}

// PUT - Update a business
const updateBusinessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

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

    const userId = session.user.id;
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateBusinessSchema.parse(body);

    // Verify business belongs to user
    const existingBusiness = await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.id, id), eq(businesses.userId, userId)))
      .limit(1);

    if (existingBusiness.length === 0) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Update business (identifier and status cannot be changed by user)
    await db
      .update(businesses)
      .set({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        website: validatedData.website || null,
      })
      .where(eq(businesses.id, id));

    const updatedBusiness = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);

    return NextResponse.json({
      id: updatedBusiness[0].id,
      name: updatedBusiness[0].name,
      identifier: updatedBusiness[0].identifier,
      email: updatedBusiness[0].email,
      phone: updatedBusiness[0].phone,
      website: updatedBusiness[0].website,
      status: updatedBusiness[0].status,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: "Failed to update business" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a business
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

    const userId = session.user.id;
    const { id } = await params;

    // Verify business belongs to user
    const existingBusiness = await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.id, id), eq(businesses.userId, userId)))
      .limit(1);

    if (existingBusiness.length === 0) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Delete business (spots will have businessId set to null due to onDelete: "set null")
    await db.delete(businesses).where(eq(businesses.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting business:", error);
    return NextResponse.json(
      { error: "Failed to delete business" },
      { status: 500 }
    );
  }
}


