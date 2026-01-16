"use client";

import { useState, useEffect } from "react";
import { ListPlus, CheckCircle2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type BucketListStatus = "none" | "bucketlisted" | "visited";

type BucketListButtonProps = {
  itemId: string | number;
  itemType: "spot" | "landmark";
  className?: string;
};

export function BucketListButton({
  itemId,
  itemType,
  className,
}: BucketListButtonProps) {
  const [currentStatus, setCurrentStatus] = useState<BucketListStatus>("none");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch initial status from API
  useEffect(() => {
    async function fetchStatus() {
      try {
        setIsFetching(true);
        const response = await fetch(
          `/api/bucket-list/${itemType}/${itemId}`
        );
        if (response.ok) {
          const data = await response.json();
          setCurrentStatus(data.status || "none");
        } else {
          setCurrentStatus("none");
        }
      } catch (error) {
        console.error("Error fetching bucket list status:", error);
        setCurrentStatus("none");
      } finally {
        setIsFetching(false);
      }
    }

    fetchStatus();
  }, [itemId, itemType]);

  const handleAddToBucketList = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/bucket-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemType,
          itemId: String(itemId),
          status: "bucketlisted",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to bucket list");
      }

      setCurrentStatus("bucketlisted");
      toast.success("Added to bucket list!");
    } catch (error) {
      toast.error("Failed to add to bucket list. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsVisited = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/bucket-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemType,
          itemId: String(itemId),
          status: "visited",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as visited");
      }

      setCurrentStatus("visited");
      toast.success("Marked as visited!");
    } catch (error) {
      toast.error("Failed to mark as visited. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsNotVisited = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/bucket-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemType,
          itemId: String(itemId),
          status: "bucketlisted",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setCurrentStatus("bucketlisted");
      toast.success("Marked as not visited!");
    } catch (error) {
      toast.error("Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/bucket-list/${itemType}/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove from bucket list");
      }

      setCurrentStatus("none");
      toast.success("Removed from bucket list!");
    } catch (error) {
      toast.error("Failed to remove from bucket list. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching
  if (isFetching) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className={cn("bg-background/90 backdrop-blur-sm", className)}
        aria-label="Loading"
      >
        <Loader2 className="size-4 animate-spin" />
      </Button>
    );
  }

  // If not in bucket list, show simple button
  if (currentStatus === "none") {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleAddToBucketList}
        disabled={isLoading}
        className={cn("bg-background/90 backdrop-blur-sm hover:bg-background", className)}
        aria-label="Add to bucket list"
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ListPlus className="size-4" />
        )}
      </Button>
    );
  }

  // If in bucket list or visited, show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={isLoading}
          className={cn(
            "bg-background/90 backdrop-blur-sm hover:bg-background",
            currentStatus === "visited" && "border-green-500/50 bg-green-500/10",
            className
          )}
          aria-label="Bucket list options"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : currentStatus === "visited" ? (
            <CheckCircle2 className="size-4 text-green-600" />
          ) : (
            <ListPlus className="size-4 text-orange-600" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus === "bucketlisted" ? (
          <>
            <DropdownMenuItem onClick={handleMarkAsVisited}>
              <CheckCircle2 className="mr-2 size-4" />
              Mark as visited
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRemove} variant="destructive">
              <X className="mr-2 size-4" />
              Remove from bucket list
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={handleMarkAsNotVisited}>
              <ListPlus className="mr-2 size-4" />
              Mark as not visited
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRemove} variant="destructive">
              <X className="mr-2 size-4" />
              Remove from bucket list
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
