import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { seed } from "@/db/seed";

export async function POST() {
  try {
    // Check if user is admin
    await requireAdmin();

    // Run seed
    await seed();

    return NextResponse.json({ 
      success: true, 
      message: "Database seeded successfully" 
    });
  } catch (error) {
    console.error("Error running seed:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("No users found")) {
        return NextResponse.json(
          { error: "No users found. Please create a user first." },
          { status: 400 }
        );
      }
      if (error.message.includes("not authenticated") || error.message.includes("admin")) {
        return NextResponse.json(
          { error: "Unauthorized. Admin access required." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to seed database", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
