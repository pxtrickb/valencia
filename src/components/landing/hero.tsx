"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleScroll() {
      setScrollY(window.scrollY);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.5;
  const opacity = Math.max(0, 1 - scrollY / 600);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50/30 to-background pt-16"
    >
      {/* Background elements with parallax */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          transform: `translateY(${parallaxOffset * 0.3}px)`,
        }}
      >
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-orange-400/30 blur-3xl" />
        <div className="absolute bottom-1/4 left-0 h-96 w-96 rounded-full bg-amber-400/30 blur-3xl" />
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative z-10 mx-auto max-w-6xl px-4 text-center transition-opacity duration-300",
        )}
        style={{ opacity }}
      >
        <div className="mb-6 inline-block rounded-full border border-orange-200 bg-orange-50/50 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-orange-700 backdrop-blur-sm">
          <MapPin className="mr-2 inline-block size-3" />
          Valencia, Spain
        </div>

        <h1 className="mb-6 text-6xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl">
          Discover
          <br />
          <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            Valencia
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Where Mediterranean charm meets modern innovation. Explore ancient
          architecture, futuristic masterpieces, and the vibrant culture of
          Spain&apos;s third-largest city.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group h-12 gap-2 bg-orange-600 px-8 text-base shadow-lg transition-all hover:bg-orange-700 hover:shadow-xl"
          >
            <Link href="/landmarks">
              Explore Landmarks
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 border-2 px-8 text-base"
          >
            <Link href="/spots">Discover Spots</Link>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="h-8 w-px bg-gradient-to-b from-foreground/50 to-transparent" />
      </div>
    </section>
  );
}
