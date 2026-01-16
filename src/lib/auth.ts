import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/db"; // your drizzle instance
import * as schema from "@/db/schema";
import { assignAdminIfFirstUser } from "./admin";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    plugins: [admin()],
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    // Assign admin role to first user created
                    await assignAdminIfFirstUser(user.id);
                },
            },
        },
    },
    advanced: {
        cookiePrefix: "valencia",
    }
});