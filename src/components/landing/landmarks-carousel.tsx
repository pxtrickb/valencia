"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Landmark = {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  hours: Record<string, string> | null;
  image: string;
};

export function LandmarksCarousel() {
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLandmarks() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/landmarks");
        if (!response.ok) {
          throw new Error("Failed to fetch landmarks");
        }
        const data = await response.json();
        // Show first 3 landmarks
        setLandmarks(data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching landmarks:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLandmarks();
  }, []);

  // Helper function to format hours for display
  const formatHours = (hours: Record<string, string> | null): string => {
    if (!hours) return "Hours not available";
    if (hours.monday === "24/7") return "24/7";
    // Return first day's hours or a default
    return hours.monday || hours.tuesday || hours.wednesday || hours.thursday || hours.friday || "Hours vary";
  };
  return (
    <section className="bg-gradient-to-b from-background via-amber-50/30 to-background py-24">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-orange-600">
            DISCOVER
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Iconic Landmarks
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            From ancient Gothic architecture to futuristic masterpieces, explore
            the landmarks that define Valencia&apos;s unique character.
          </p>
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="flex min-h-[500px] flex-col items-center justify-center">
            <Loader2 className="mb-4 size-8 animate-spin text-orange-600" />
            <p className="text-muted-foreground">Loading landmarks...</p>
          </div>
        ) : landmarks.length === 0 ? (
          <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">No landmarks available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {landmarks.map((landmark) => (
              <Link key={landmark.id} href={`/landmarks/${landmark.id}`}>
                <Card className="group py-0 relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl transition-transform hover:scale-[1.02]">
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
                      <h3 className="mb-2 text-xl font-bold md:text-2xl">
                        {landmark.title}
                      </h3>
                      <p className="mb-4 text-sm leading-relaxed text-white/90">
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

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="outline" className="border-2">
            <Link href="/landmarks">View All Landmarks</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
