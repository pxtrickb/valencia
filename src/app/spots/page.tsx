"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Search, Star, X, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SpotCategory = "Restaurant" | "Café" | "Museum" | "Shop";
type PriceRange = "$" | "$$" | "$$$";

type Spot = {
  id: string;
  name: string;
  category: SpotCategory;
  shortCategory: string;
  description: string;
  location: string;
  priceRange: PriceRange | null;
  image: string;
  hours: Record<string, string> | null;
};

const priceFilters: (PriceRange | "ANY")[] = ["ANY", "$", "$$", "$$$"];

export default function SpotsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SpotCategory | "ALL">(
    "ALL",
  );
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSpots() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/spots");
        if (!response.ok) {
          throw new Error("Failed to fetch spots");
        }
        const data = await response.json();
        setSpots(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSpots();
  }, []);
  const [selectedPrice, setSelectedPrice] = useState<(typeof priceFilters)[0]>(
    "ANY",
  );

  // Extract unique categories from spots
  const categoryFilters = useMemo(() => {
    const uniqueCategories = Array.from(new Set(spots.map(s => s.category))) as SpotCategory[];
    return uniqueCategories.sort();
  }, [spots]);

  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const matchesSearch =
        searchQuery === "" ||
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" || spot.category === selectedCategory;

      const matchesPrice =
        selectedPrice === "ANY" || spot.priceRange === selectedPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [spots, searchQuery, selectedCategory, selectedPrice]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-amber-50/10 to-background">
      {/* Header & filters */}
      <section className="border-b border-border/50 bg-background/90 pt-24 pb-6 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 max-w-2xl">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-orange-600">
              LOCAL FAVORITES
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Places to Eat, Drink & Explore
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Browse Valencia&apos;s best restaurants, cafés, museums, and shops,
              curated by locals and loved by visitors.
            </p>
          </div>

          {/* Filters row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search spots by name, neighborhood, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-9 pr-9 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2 text-xs md:justify-end">
              {/* Category filter */}
              <div className="flex flex-wrap gap-1">
                <Button
                  size="sm"
                  variant={selectedCategory === "ALL" ? "default" : "outline"}
                  className={cn(
                    "h-8 px-3",
                    selectedCategory === "ALL"
                      ? "bg-orange-600 text-white shadow-sm hover:bg-orange-700"
                      : "hover:bg-accent",
                  )}
                  onClick={() => setSelectedCategory("ALL")}
                >
                  All types
                </Button>
                {categoryFilters.map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    className={cn(
                      "h-8 px-3",
                      selectedCategory === category
                        ? "bg-orange-600 text-white shadow-sm hover:bg-orange-700"
                        : "hover:bg-accent",
                    )}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary filters */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {/* Price filter */}
            <div className="flex items-center gap-1">
              <span className="mr-1 text-[11px] uppercase tracking-wide">
                Price
              </span>
              {priceFilters.map((price) => (
                <button
                  key={price}
                  onClick={() => setSelectedPrice(price)}
                  className={cn(
                    "rounded-full border px-2 py-1 text-[11px] font-medium transition-colors",
                    selectedPrice === price
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {price === "ANY" ? "Any" : price}
                </button>
              ))}
            </div>
          </div>

          {/* Results summary */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredSpots.length}
            </span>{" "}
            {filteredSpots.length === 1 ? "spot" : "spots"}
            {searchQuery && ` for "${searchQuery}"`}
          </div>
        </div>
      </section>

      {/* Spots list grid (distinct layout from landmarks) */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4">
          {isLoading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <Loader2 className="mb-4 size-8 animate-spin text-orange-600" />
              <p className="text-muted-foreground">Loading spots...</p>
            </div>
          ) : error ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <div className="mb-4 text-6xl">⚠️</div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">
                Error loading spots
              </h2>
              <p className="mb-6 text-muted-foreground">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try again
              </Button>
            </div>
          ) : filteredSpots.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <div className="mb-4 text-5xl">🍽️</div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">
                No spots match your filters
              </h2>
              <p className="mb-6 text-muted-foreground">
                Try changing the type or price range to see more places.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                  setSelectedPrice("ANY");
                }}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {filteredSpots.map((spot) => (
                <Link key={spot.id} href={`/spots/${spot.id}`}>
                  <Card className="group flex h-full overflow-hidden border bg-card/90 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    {/* Thumbnail */}
                    <div className="relative hidden w-40 shrink-0 overflow-hidden bg-gradient-to-br from-orange-200 to-orange-300 sm:block">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-orange-600">
                            {spot.shortCategory}
                          </div>
                          <h2 className="text-base font-semibold text-foreground sm:text-lg">
                            {spot.name}
                          </h2>
                        </div>
                      </div>

                      <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {spot.description}
                      </p>

                      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          <span>{spot.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {spot.priceRange === "$"
                              ? "Budget-friendly"
                              : spot.priceRange === "$$"
                                ? "Mid-range"
                                : "Premium"}
                          </span>
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

