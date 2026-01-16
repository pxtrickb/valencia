import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import db from "@/db";
import { businesses } from "@/db/schema";
import { desc } from "drizzle-orm";

// GET - Admin get all businesses
export async function GET() {
  try {
    await requireAdmin();

    const allBusinesses = await db
      .select()
      .from(businesses)
      .orderBy(desc(businesses.createdAt));

    return NextResponse.json(allBusinesses);
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
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}
