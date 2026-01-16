"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Clock, MapPin, Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Landmark = {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  hours: Record<string, string> | null;
  image: string;
};

export default function LandmarksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLandmarks() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/landmarks");
        if (!response.ok) {
          throw new Error("Failed to fetch landmarks");
        }
        const data = await response.json();
        setLandmarks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLandmarks();
  }, []);

  const filteredLandmarks = useMemo(() => {
    return landmarks.filter((landmark) => {
      const matchesSearch =
        searchQuery === "" ||
        landmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        landmark.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        landmark.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" || landmark.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [landmarks, searchQuery, selectedCategory]);

  // Extract unique categories from landmarks
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(landmarks.map(l => l.category)));
    return ["ALL", ...uniqueCategories.sort()];
  }, [landmarks]);

  // Helper function to format hours for display
  const formatHours = (hours: Record<string, string> | null): string => {
    if (!hours) return "Hours not available";
    if (hours.monday === "24/7") return "24/7";
    return hours.monday || "Hours vary";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-amber-50/20 to-background">
      {/* Header */}
      <section className="border-b border-border/50 bg-background/80 backdrop-blur-sm pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 max-w-2xl">
            <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-orange-600">
              EXPLORE
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Iconic Landmarks
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Discover Valencia&apos;s most iconic landmarks, from ancient Gothic
              architecture to futuristic masterpieces that define the city&apos;s
              unique character.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search landmarks by name, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-10 pr-10 text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className={cn(
                  "transition-all",
                  selectedCategory === category
                    ? "bg-orange-600 text-white shadow-md hover:bg-orange-700"
                    : "hover:bg-accent"
                )}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Results Count */}
          <div className="mt-6 text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredLandmarks.length}</span>{" "}
            {filteredLandmarks.length === 1 ? "landmark" : "landmarks"}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== "ALL" && ` in ${selectedCategory}`}
          </div>
        </div>
      </section>

      {/* Landmarks Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          {isLoading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <Loader2 className="mb-4 size-8 animate-spin text-orange-600" />
              <p className="text-muted-foreground">Loading landmarks...</p>
            </div>
          ) : error ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <div className="mb-4 text-6xl">⚠️</div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">
                Error loading landmarks
              </h2>
              <p className="mb-6 text-muted-foreground">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try again
              </Button>
            </div>
          ) : filteredLandmarks.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">
                No landmarks found
              </h2>
              <p className="mb-6 text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
                variant="outline"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLandmarks.map((landmark) => (
                <Link key={landmark.id} href={`/landmarks/${landmark.id}`}>
                  <Card className="group py-0 relative h-full overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl">
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {landmark.image && (
                        <img
                          src={landmark.image}
                          alt={landmark.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      )}
                      
                      {/* Dark gradient overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      {/* Category badge */}
                      <div className="absolute left-4 top-4 z-10">
                        <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                          {landmark.category}
                        </span>
                      </div>

                      {/* Content overlay */}
                      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 text-white">
                        <h3 className="mb-2 text-xl font-bold transition-transform group-hover:translate-y-[-2px] md:text-2xl">
                          {landmark.title}
                        </h3>
                        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-white/90">
                          {landmark.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            <span>{landmark.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            <span>{formatHours(landmark.hours)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
