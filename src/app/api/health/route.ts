import { NextResponse } from "next/server";
import { existsSync, access, constants } from "fs/promises";
import { join } from "path";
import db from "@/db";
import { sql } from "drizzle-orm";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    database: {
      status: "ok" | "error";
      message: string;
      responseTime?: number;
    };
    filesystem: {
      status: "ok" | "error";
      message: string;
      imagesDirectory: {
        exists: boolean;
        writable: boolean;
      };
    };
    environment: {
      status: "ok" | "warning";
      message: string;
      variables: {
        nodeEnv: string;
        dbFileName: boolean;
        betterAuthSecret: boolean;
      };
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status: "ok",
        message: "Database connection successful",
      },
      filesystem: {
        status: "ok",
        message: "Filesystem accessible",
        imagesDirectory: {
          exists: false,
          writable: false,
        },
      },
      environment: {
        status: "ok",
        message: "Environment variables configured",
        variables: {
          nodeEnv: process.env.NODE_ENV || "not set",
          dbFileName: !!process.env.DB_FILE_NAME,
          betterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
        },
      },
    },
  };

  // Check database connection
  try {
    const dbStartTime = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbResponseTime = Date.now() - dbStartTime;
    healthStatus.checks.database.responseTime = dbResponseTime;
    healthStatus.checks.database.status = "ok";
    healthStatus.checks.database.message = `Database connection successful (${dbResponseTime}ms)`;
  } catch (error) {
    healthStatus.checks.database.status = "error";
    healthStatus.checks.database.message = `Database connection failed: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
    healthStatus.status = "unhealthy";
  }

  // Check filesystem access
  try {
    const imagesDir = join(process.cwd(), "usercontent", "images");
    const dirExists = existsSync(imagesDir);
    healthStatus.checks.filesystem.imagesDirectory.exists = dirExists;

    if (dirExists) {
      try {
        await access(imagesDir, constants.W_OK);
        healthStatus.checks.filesystem.imagesDirectory.writable = true;
        healthStatus.checks.filesystem.status = "ok";
        healthStatus.checks.filesystem.message = "Images directory exists and is writable";
      } catch (error) {
        healthStatus.checks.filesystem.imagesDirectory.writable = false;
        healthStatus.checks.filesystem.status = "error";
        healthStatus.checks.filesystem.message = "Images directory exists but is not writable";
        if (healthStatus.status === "healthy") {
          healthStatus.status = "degraded";
        }
      }
    } else {
      healthStatus.checks.filesystem.status = "error";
      healthStatus.checks.filesystem.message = "Images directory does not exist";
      if (healthStatus.status === "healthy") {
        healthStatus.status = "degraded";
      }
    }
  } catch (error) {
    healthStatus.checks.filesystem.status = "error";
    healthStatus.checks.filesystem.message = `Filesystem check failed: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
    if (healthStatus.status === "healthy") {
      healthStatus.status = "degraded";
    }
  }

  // Check environment variables
  const missingVars: string[] = [];
  if (!process.env.DB_FILE_NAME) {
    missingVars.push("DB_FILE_NAME");
  }
  if (!process.env.BETTER_AUTH_SECRET) {
    missingVars.push("BETTER_AUTH_SECRET");
  }

  if (missingVars.length > 0) {
    healthStatus.checks.environment.status = "warning";
    healthStatus.checks.environment.message = `Missing environment variables: ${missingVars.join(", ")}`;
    if (healthStatus.status === "healthy") {
      healthStatus.status = "degraded";
    }
  } else {
    healthStatus.checks.environment.message = "All required environment variables are set";
  }

  const totalResponseTime = Date.now() - startTime;
  const statusCode =
    healthStatus.status === "healthy"
      ? 200
      : healthStatus.status === "degraded"
      ? 200
      : 503;

  return NextResponse.json(
    {
      ...healthStatus,
      responseTime: totalResponseTime,
    },
    { status: statusCode }
  );
}

