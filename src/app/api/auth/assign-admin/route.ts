import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { assignAdminIfFirstUser } from "@/lib/admin";

/**
 * API endpoint to assign admin role to first user
 * This should be called after user signup (client-side or via hook)
 */
export async function POST() {
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

    // Assign admin role if this is the first user
    await assignAdminIfFirstUser(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning admin:", error);
    return NextResponse.json(
      { error: "Failed to assign admin" },
      { status: 500 }
    );
  }
}
