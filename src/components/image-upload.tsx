"use client";

import { useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
  entityType: "spot" | "landmark";
  entityId: string;
  existingImages: Array<{ id: number; url: string; isPrimary: boolean }>;
  onImagesChange: (images: Array<{ id: number; url: string; isPrimary: boolean }>) => void;
  onDelete?: (imageId: number) => Promise<void>;
}

export function ImageUpload({
  entityType,
  entityId,
  existingImages,
  onImagesChange,
  onDelete,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entityType", entityType);
      formData.append("entityId", entityId);
      formData.append("isPrimary", existingImages.length === 0 ? "true" : "false");

      const response = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      
      // Add new image to list
      const newImages = [
        ...existingImages,
        {
          id: data.id,
          url: data.url,
          isPrimary: data.isPrimary,
        },
      ];

      onImagesChange(newImages);
      toast.success("Image uploaded successfully");
      e.target.value = ""; // Reset input
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlUpload = async () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("url", imageUrl);
      formData.append("entityType", entityType);
      formData.append("entityId", entityId);
      formData.append("isPrimary", existingImages.length === 0 ? "true" : "false");

      const response = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      
      // Add new image to list
      const newImages = [
        ...existingImages,
        {
          id: data.id,
          url: data.url,
          isPrimary: data.isPrimary,
        },
      ];

      onImagesChange(newImages);
      setImageUrl("");
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!onDelete) return;

    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      await onDelete(imageId);
      // Remove image from list
      const newImages = existingImages.filter((img) => img.id !== imageId);
      onImagesChange(newImages);
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Failed to delete image");
      console.error(error);
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    // Update isPrimary in the list
    const newImages = existingImages.map((img) => ({
      ...img,
      isPrimary: img.id === imageId,
    }));
    onImagesChange(newImages);

    // Update in database
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to set primary image");
      }
    } catch (error) {
      toast.error("Failed to set primary image");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {existingImages.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
            >
              <img
                src={image.url}
                alt={`Image ${image.id}`}
                className="h-full w-full object-cover"
              />
              {image.isPrimary && (
                <div className="absolute left-2 top-2 rounded bg-orange-600 px-2 py-1 text-xs font-medium text-white">
                  Primary
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex h-full items-center justify-center gap-2">
                  {!image.isPrimary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetPrimary(image.id)}
                      className="bg-white/90 hover:bg-white"
                    >
                      Set Primary
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Section */}
      <div className="rounded-lg border border-dashed p-4">
        <div className="mb-4 flex gap-2">
          <Button
            type="button"
            variant={uploadMode === "file" ? "default" : "outline"}
            size="sm"
            onClick={() => setUploadMode("file")}
          >
            Upload File
          </Button>
          <Button
            type="button"
            variant={uploadMode === "url" ? "default" : "outline"}
            size="sm"
            onClick={() => setUploadMode("url")}
          >
            From URL
          </Button>
        </div>

        {uploadMode === "file" ? (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 transition-colors hover:bg-muted/50">
            <Upload className="size-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-muted-foreground">
              PNG, JPG, GIF up to 10MB
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            {uploading && (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-orange-600" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </div>
            )}
          </label>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={uploading}
              />
              <Button
                type="button"
                onClick={handleUrlUpload}
                disabled={uploading || !imageUrl.trim()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

