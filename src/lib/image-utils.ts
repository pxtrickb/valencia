import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

/**
 * Ensure the upload directory exists
 */
export async function ensureUploadDir() {
  const uploadDir = join(process.cwd(), "usercontent", "images");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

/**
 * Download image from URL and save locally
 * Returns the local URL path (e.g., /usercontent/images/filename.jpg)
 */
export async function downloadAndSaveImage(
  url: string,
  filename: string
): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to download image from URL ${url}: ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadDir = await ensureUploadDir();
  const filePath = join(uploadDir, filename);
  await writeFile(filePath, buffer);

  return `/usercontent/images/${filename}`;
}

/**
 * Generate a unique filename from a URL
 */
export function generateFilenameFromUrl(url: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  
  // Try to get extension from URL
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const ext = pathname.split(".").pop()?.toLowerCase() || "jpg";
    
    // Validate extension
    const validExts = ["jpg", "jpeg", "png", "gif", "webp"];
    const finalExt = validExts.includes(ext) ? ext : "jpg";
    
    return `${timestamp}-${random}.${finalExt}`;
  } catch {
    // If URL parsing fails, default to jpg
    return `${timestamp}-${random}.jpg`;
  }
}

/**
 * Process an image URL: if it's a real URL, download it; otherwise return as-is
 */
export async function processImageUrl(url: string): Promise<string> {
  // If it's already a local path, return as-is
  if (url.startsWith("/")) {
    return url;
  }

  // If it's a URL, download it
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const filename = generateFilenameFromUrl(url);
    return await downloadAndSaveImage(url, filename);
  }

  // Otherwise return as-is (might be a placeholder or relative path)
  return url;
}
