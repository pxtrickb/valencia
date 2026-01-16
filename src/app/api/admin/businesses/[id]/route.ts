import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import db from "@/db";
import { businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateBusinessSchema = z.object({
  name: z.string().min(1).optional(),
  identifier: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  website: z.string().nullable().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

// PUT - Admin update business
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateBusinessSchema.parse(body);

    // Check if business exists
    const existingBusiness = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);

    if (existingBusiness.length === 0) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Update the business
    await db
      .update(businesses)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, id));

    // Fetch updated business
    const updatedBusiness = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);

    return NextResponse.json(updatedBusiness[0]);
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
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: "Failed to update business" },
      { status: 500 }
    );
  }
}

// DELETE - Admin delete business
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    // Check if business exists
    const business = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);

    if (business.length === 0) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Delete the business (cascade will handle related spots)
    await db.delete(businesses).where(eq(businesses.id, id));

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
    console.error("Error deleting business:", error);
    return NextResponse.json(
      { error: "Failed to delete business" },
      { status: 500 }
    );
  }
}
