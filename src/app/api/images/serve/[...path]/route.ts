import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, resolve, relative } from "path";
import { existsSync } from "fs";

// Serve images from usercontent/images directory
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filename = path.join("/");

    // Security: prevent directory traversal
    // Check for directory traversal attempts
    if (filename.includes("..")) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 }
      );
    }

    // Resolve the base directory and the requested file path
    const baseDir = resolve(process.cwd(), "usercontent", "images");
    const filePath = resolve(baseDir, filename);

    // Ensure the resolved path is within the base directory (prevent directory traversal)
    const relativePath = relative(baseDir, filePath);
    if (relativePath.startsWith("..") || relativePath.includes("..")) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 }
      );
    }

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const file = await readFile(filePath);
    const ext = filename.split(".").pop()?.toLowerCase();

    // Determine content type
    let contentType = "application/octet-stream";
    if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    else if (ext === "png") contentType = "image/png";
    else if (ext === "gif") contentType = "image/gif";
    else if (ext === "webp") contentType = "image/webp";
    else if (ext === "svg") contentType = "image/svg+xml";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 }
    );
  }
}

