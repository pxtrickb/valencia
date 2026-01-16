"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Please select a rating")
    .max(5, "Rating must be between 1 and 5"),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review must be less than 1000 characters"),
});

type ReviewValues = z.infer<typeof reviewSchema>;

type ReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: "spot" | "landmark";
  itemId: string;
  spotName?: string;
  landmarkName?: string;
  existingReview?: {
    id: number;
    rating: number;
    comment: string;
  } | null;
  onSuccess?: () => void; // Callback after successful submission
};

export function ReviewDialog({
  open,
  onOpenChange,
  itemType,
  itemId,
  spotName,
  landmarkName,
  existingReview,
  onSuccess,
}: ReviewDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const name = spotName || landmarkName || "this place";
  const isEditing = !!existingReview;

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || "",
    },
  });

  // Reset form when dialog opens or existingReview changes
  useEffect(() => {
    if (open) {
      form.reset({
        rating: existingReview?.rating || 0,
        comment: existingReview?.comment || "",
      });
    }
  }, [open, existingReview]);

  const watchedRating = form.watch("rating");

  async function handleSubmit(values: ReviewValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemType,
          itemId,
          rating: values.rating,
          comment: values.comment,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit review");
      }

      toast.success("Review submitted successfully!");
      form.reset();
      onOpenChange(false);
      
      // Call success callback to refresh reviews
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit review. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayRating = hoveredRating ?? watchedRating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Review" : "Write a Review"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? `Update your review for ${name}.`
              : `Share your experience at ${name} with the community.`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Rating Selection */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Your Rating
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => field.onChange(rating)}
                          onMouseEnter={() => setHoveredRating(rating)}
                          onMouseLeave={() => setHoveredRating(null)}
                          className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded"
                          aria-label={`Rate ${rating} out of 5`}
                        >
                          <Star
                            className={cn(
                              "size-8 transition-colors",
                              rating <= displayRating
                                ? "fill-orange-500 text-orange-500"
                                : "fill-muted text-muted-foreground"
                            )}
                          />
                        </button>
                      ))}
                      {watchedRating > 0 && (
                        <span className="ml-2 text-sm font-medium text-muted-foreground">
                          {watchedRating === 5
                            ? "Excellent"
                            : watchedRating === 4
                              ? "Very Good"
                              : watchedRating === 3
                                ? "Good"
                                : watchedRating === 2
                                  ? "Fair"
                                  : "Poor"}
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Review Text */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Your Review
                  </FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={6}
                      placeholder="Tell others about your experience. What did you like? What could be improved?"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage />
                    <span
                      className={cn(
                        "text-xs text-muted-foreground",
                        field.value.length > 1000 && "text-destructive"
                      )}
                    >
                      {field.value.length}/1000
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  isEditing ? "Update Review" : "Submit Review"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
