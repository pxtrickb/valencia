import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import db from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Check if the current user is an admin
 * Returns true if user has role "admin", false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return false;
    }

    const userRecord = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    return userRecord[0]?.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get the current user's admin status
 * Returns the role string or null
 */
export async function getCurrentUserRole(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return null;
    }

    const userRecord = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    return userRecord[0]?.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * Check if the current user is an admin and throw if not
 * Use this in API routes that require admin access
 */
export async function requireAdmin(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Not authenticated");
  }

  const userRecord = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (userRecord[0]?.role !== "admin") {
    throw new Error("Admin access required");
  }

  return session.user.id;
}

/**
 * Assign admin role to the first user created (if no admins exist)
 * Call this after user creation
 */
export async function assignAdminIfFirstUser(userId: string): Promise<void> {
  try {
    // Check if any admin exists
    const existingAdmins = await db
      .select()
      .from(user)
      .where(eq(user.role, "admin"))
      .limit(1);

    // If no admin exists, make this user an admin
    if (existingAdmins.length === 0) {
      await db
        .update(user)
        .set({ role: "admin" })
        .where(eq(user.id, userId));
    }
  } catch (error) {
    console.error("Error assigning admin role:", error);
    // Don't throw - user creation should succeed even if admin assignment fails
  }
}
