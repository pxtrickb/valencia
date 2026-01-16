"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Star,
  Clock,
  ArrowLeft,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReviewDialog } from "@/components/review-dialog";
import { BucketListButton } from "@/components/bucket-list-button";
import { ImageLightbox } from "@/components/image-lightbox";
import { authClient } from "@/lib/authClient";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type LandmarkData = {
  id: string;
  category: string;
  title: string;
  description: string;
  fullDescription?: string;
  location: string;
  address: string;
  hours: Record<string, string> | null;
  admission?: string;
  website: string | null;
  image: string;
  images?: string[];
};

// Mock data removed - now fetching from database via API
const _allLandmarksRemoved: LandmarkData[] = [
  {
    id: 1,
    category: "GOTHIC MASTERPIECE",
    title: "Valencia Cathedral",
    description:
      "Home to the Holy Grail and the iconic Miguelete tower, offering panoramic views of the city.",
    fullDescription: `Valencia Cathedral, also known as the Metropolitan Cathedral–Basilica of the Assumption of Our Lady of Valencia, is a stunning example of Gothic architecture with Romanesque, Renaissance, and Baroque elements. The cathedral houses what many believe to be the Holy Grail, the chalice used by Jesus at the Last Supper.

The cathedral's most iconic feature is the Miguelete Tower (El Micalet), a 51-meter-high bell tower that offers breathtaking panoramic views of Valencia. Visitors can climb the 207 steps to the top for an unforgettable view of the city and the Mediterranean Sea.

The interior features beautiful chapels, including the Chapel of the Holy Grail, stunning stained glass windows, and impressive vaulted ceilings. The cathedral's museum displays religious art and artifacts spanning centuries of Valencian history.

The building itself tells the story of Valencia's evolution, with architectural styles from different periods visible throughout. It's a must-visit for anyone interested in history, architecture, or religious art.`,
    location: "Old Town",
    address: "Plaza de la Reina, s/n, 46003 Valencia",
    rating: 4.7,
    reviewCount: 3420,
    hours: {
      monday: "10:00 - 18:30",
      tuesday: "10:00 - 18:30",
      wednesday: "10:00 - 18:30",
      thursday: "10:00 - 18:30",
      friday: "10:00 - 18:30",
      saturday: "10:00 - 18:30",
      sunday: "14:00 - 17:00",
    },
    admission: "€8 (includes tower climb)",
    website: "https://catedraldevalencia.es",
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
    ],
  },
  {
    id: 2,
    category: "FUTURISTIC WONDER",
    title: "City of Arts & Sciences",
    description:
      "A stunning complex of futuristic buildings designed by Calatrava, featuring museums and gardens.",
    fullDescription: `The City of Arts and Sciences (Ciutat de les Arts i les Ciències) is an architectural masterpiece and one of Valencia's most iconic landmarks. Designed by renowned Valencian architect Santiago Calatrava, this futuristic complex spans over 350,000 square meters and represents a stunning blend of art, science, and nature.

The complex includes several major buildings: the Hemisfèric (IMAX cinema and planetarium), the Science Museum, the Oceanogràfic (Europe's largest aquarium), the Palau de les Arts (opera house), the Ágora (events venue), and the Umbracle (landscaped walkway). Each building is a work of art in itself, featuring Calatrava's signature white concrete structures and flowing, organic forms.

The surrounding Turia Gardens provide a beautiful natural setting, with walking paths, fountains, and green spaces. The complex hosts numerous cultural events, exhibitions, and performances throughout the year.

The City of Arts and Sciences is not just a tourist attraction but a living cultural center that celebrates human creativity, scientific discovery, and artistic expression. It's a symbol of Valencia's forward-thinking spirit and commitment to innovation.`,
    location: "Turia Gardens",
    address: "Av. del Professor López Piñero, 7, 46013 Valencia",
    rating: 4.9,
    reviewCount: 12850,
    hours: {
      monday: "10:00 - 21:00",
      tuesday: "10:00 - 21:00",
      wednesday: "10:00 - 21:00",
      thursday: "10:00 - 21:00",
      friday: "10:00 - 21:00",
      saturday: "10:00 - 21:00",
      sunday: "10:00 - 21:00",
    },
    admission: "Varies by attraction",
    website: "https://www.cac.es",
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
    ],
  },
  {
    id: 3,
    category: "UNESCO HERITAGE",
    title: "La Lonja de la Seda",
    description:
      "A late Gothic masterpiece and UNESCO World Heritage Site, once Europe's silk exchange.",
    fullDescription: `La Lonja de la Seda (The Silk Exchange) is a masterpiece of late Gothic architecture and a UNESCO World Heritage Site since 1996. Built between 1482 and 1548, this magnificent building served as Valencia's commercial exchange during the city's golden age of silk trading.

The building consists of four parts: the Tower, the Contract Hall (Sala de Contratación), the Consulate of the Sea, and the Orange Tree Courtyard. The Contract Hall is particularly stunning, with its soaring twisted columns resembling palm trees, creating a forest-like atmosphere that symbolizes the Garden of Eden.

The intricate stone carvings, Gothic vaults, and detailed ornamentation showcase the skill of Valencian craftsmen of the period. The building's design reflects the prosperity and importance of Valencia as a major trading center in the Mediterranean.

Today, La Lonja serves as a cultural venue hosting exhibitions and events, while the Orange Tree Courtyard provides a peaceful oasis in the heart of the city. It's a testament to Valencia's rich commercial and cultural history and remains one of the finest examples of Gothic civil architecture in Europe.`,
    location: "City Center",
    address: "Plaza del Mercado, s/n, 46001 Valencia",
    rating: 4.8,
    reviewCount: 4560,
    hours: {
      monday: "09:30 - 19:00",
      tuesday: "09:30 - 19:00",
      wednesday: "09:30 - 19:00",
      thursday: "09:30 - 19:00",
      friday: "09:30 - 19:00",
      saturday: "09:30 - 19:00",
      sunday: "09:30 - 15:00",
    },
    admission: "€2 (Free on Sundays)",
    website: "https://www.valencia.es",
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
    ],
  },
  {
    id: 4,
    category: "GOTHIC MASTERPIECE",
    title: "Torres de Serranos",
    description:
      "Medieval city gates that once protected Valencia, now offering stunning views of the old city.",
    fullDescription: `The Torres de Serranos (Serranos Towers) are among the best-preserved medieval city gates in Europe. Built in the 14th century as part of Valencia's defensive walls, these imposing towers served as the main entrance to the city from the north.

The towers were designed by Pere Balaguer in the Gothic style and feature a massive, fortress-like appearance with decorative elements. They consist of two polygonal towers connected by a central body, creating an impressive gateway that once controlled access to the city.

Throughout history, the towers have served various purposes: as a defensive structure, a prison for nobles, and a storage facility. Today, they stand as a symbol of Valencia's medieval past and offer visitors the opportunity to climb to the top for panoramic views of the old town and the Turia River.

The towers are particularly beautiful when illuminated at night, creating a dramatic silhouette against the Valencian sky. They represent one of the few remaining pieces of the city's medieval fortifications and are a must-see for history enthusiasts.`,
    location: "Old Town",
    address: "Plaza de los Fueros, s/n, 46003 Valencia",
    rating: 4.6,
    reviewCount: 2890,
    hours: {
      monday: "10:00 - 19:00",
      tuesday: "10:00 - 19:00",
      wednesday: "10:00 - 19:00",
      thursday: "10:00 - 19:00",
      friday: "10:00 - 19:00",
      saturday: "10:00 - 19:00",
      sunday: "10:00 - 19:00",
    },
    admission: "€2",
    website: "https://www.valencia.es",
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
    ],
  },
  {
    id: 5,
    category: "MODERN ARCHITECTURE",
    title: "Mercado Central",
    description:
      "One of Europe's largest covered markets, featuring stunning Art Nouveau architecture and fresh local produce.",
    fullDescription: `Mercado Central is one of Europe's largest covered markets and a masterpiece of Art Nouveau architecture. Designed by architects Alejandro Soler March and Francisco Guardia Vial, the market opened in 1928 and has been serving Valencians ever since.

The building features stunning stained glass windows, intricate ironwork, colorful ceramic tiles, and a magnificent domed roof. The interior is a vibrant, bustling space with over 300 stalls selling fresh produce, seafood, meat, cheese, spices, and local specialties.

The market is a feast for the senses, with vendors calling out their wares, the aroma of fresh produce, and the vibrant colors of fruits and vegetables. It's the perfect place to experience local culture, pick up ingredients for a home-cooked meal, or simply enjoy the atmosphere.

Many stalls offer samples, and some have small bars where you can enjoy a coffee or a glass of wine while shopping. The market is a must-visit for food lovers and anyone interested in experiencing authentic Valencian daily life.`,
    location: "City Center",
    address: "Plaza del Mercado, s/n, 46001 Valencia",
    rating: 4.7,
    reviewCount: 5120,
    hours: {
      monday: "07:00 - 15:00",
      tuesday: "07:00 - 15:00",
      wednesday: "07:00 - 15:00",
      thursday: "07:00 - 15:00",
      friday: "07:00 - 15:00",
      saturday: "07:00 - 15:00",
      sunday: "Closed",
    },
    admission: "Free",
    website: "https://www.mercadocentralvalencia.es",
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
    ],
  },
  {
    id: 6,
    category: "UNESCO HERITAGE",
    title: "Palau de les Arts",
    description:
      "The opera house and cultural center, part of the City of Arts and Sciences complex.",
    fullDescription: `The Palau de les Arts Reina Sofía is the opera house and cultural center of the City of Arts and Sciences. Designed by Santiago Calatrava, this stunning building opened in 2005 and has become one of Europe's most important opera houses.

The building's design is striking, with a flowing, organic form that appears to rise from the surrounding gardens. The exterior features a white concrete shell that seems to float above the ground, while the interior houses four performance halls: the Main Hall, the Master Class Hall, the Auditorium, and the Aula Magistral.

The Main Hall seats 1,400 and hosts opera, ballet, and classical music performances. The acoustics are world-class, designed to provide an exceptional listening experience. The building also features rehearsal spaces, workshops, and educational facilities.

The Palau de les Arts has hosted some of the world's most renowned performers and companies, establishing Valencia as a major cultural destination. The building itself is a work of art, combining Calatrava's signature architectural style with state-of-the-art performance technology.`,
    location: "Turia Gardens",
    address: "Av. del Professor López Piñero, 1, 46013 Valencia",
    rating: 4.8,
    reviewCount: 3420,
    hours: {
      monday: "10:00 - 20:00",
      tuesday: "10:00 - 20:00",
      wednesday: "10:00 - 20:00",
      thursday: "10:00 - 20:00",
      friday: "10:00 - 20:00",
      saturday: "10:00 - 20:00",
      sunday: "10:00 - 20:00",
    },
    admission: "Varies by performance",
    website: "https://www.lesarts.com",
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
    ],
  },
  {
    id: 7,
    category: "GOTHIC MASTERPIECE",
    title: "Basilica of the Virgin",
    description:
      "A beautiful basilica dedicated to Valencia's patron saint, featuring stunning architecture.",
    fullDescription: `The Basilica of the Virgin of the Forsaken (Basílica de la Virgen de los Desamparados) is a beautiful baroque church dedicated to Valencia's patron saint. Located in the Plaza de la Virgen, the basilica is one of the city's most important religious sites.

The building features a stunning baroque façade with intricate decorations and a beautiful dome. The interior is equally impressive, with ornate altars, beautiful frescoes, and the revered image of the Virgin of the Forsaken, which is carried through the city during the annual Fallas festival.

The basilica's location in the heart of the old town makes it a focal point of Valencian religious and cultural life. The square in front of the basilica features the famous Turia Fountain, creating a beautiful setting for this historic building.

The basilica is open to visitors and offers a peaceful place for reflection, as well as an opportunity to admire its beautiful architecture and religious art. It's particularly beautiful during religious festivals when it's decorated with flowers and candles.`,
    location: "Old Town",
    address: "Plaza de la Virgen, s/n, 46001 Valencia",
    rating: 4.5,
    reviewCount: 1890,
    hours: {
      monday: "07:30 - 14:00, 17:00 - 21:00",
      tuesday: "07:30 - 14:00, 17:00 - 21:00",
      wednesday: "07:30 - 14:00, 17:00 - 21:00",
      thursday: "07:30 - 14:00, 17:00 - 21:00",
      friday: "07:30 - 14:00, 17:00 - 21:00",
      saturday: "07:30 - 14:00, 17:00 - 21:00",
      sunday: "08:00 - 14:00, 17:00 - 21:00",
    },
    admission: "Free",
    website: "https://www.basilicavirgen.es",
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
    ],
  },
  {
    id: 8,
    category: "MODERN ARCHITECTURE",
    title: "Oceanogràfic",
    description:
      "Europe's largest aquarium, designed by Félix Candela, showcasing marine life from around the world.",
    fullDescription: `Oceanogràfic is Europe's largest aquarium and one of the most impressive attractions in the City of Arts and Sciences. Designed by architect Félix Candela, the building's unique design resembles a water lily and houses marine ecosystems from around the world.

The aquarium is divided into different zones representing various marine environments: the Mediterranean, Wetlands, Temperate and Tropical Seas, Oceans, Antarctic, Arctic, Islands, and the Red Sea. Each zone is carefully designed to replicate the natural habitat of its inhabitants.

Visitors can walk through underwater tunnels, watch dolphin shows, and observe everything from sharks and beluga whales to penguins and sea lions. The aquarium is home to over 45,000 animals representing 500 different species.

The Oceanogràfic is not just an aquarium but also a research and conservation center, working to protect marine life and educate visitors about the importance of ocean conservation. It's an educational and entertaining experience for visitors of all ages.`,
    location: "Turia Gardens",
    address: "Carrer d'Eduardo Primo Yúfera, 1B, 46013 Valencia",
    rating: 4.7,
    reviewCount: 8750,
    hours: {
      monday: "10:00 - 18:00",
      tuesday: "10:00 - 18:00",
      wednesday: "10:00 - 18:00",
      thursday: "10:00 - 18:00",
      friday: "10:00 - 18:00",
      saturday: "10:00 - 20:00",
      sunday: "10:00 - 20:00",
    },
    admission: "€31.90",
    website: "https://www.oceanografic.org",
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
    ],
  },
  {
    id: 9,
    category: "HISTORICAL MONUMENT",
    title: "Plaza de la Virgen",
    description:
      "The heart of Valencia's old town, surrounded by historic buildings and the famous Turia fountain.",
    fullDescription: `Plaza de la Virgen is the heart of Valencia's old town and one of the city's most beautiful and historic squares. Surrounded by some of Valencia's most important buildings, including the Basilica of the Virgin, the Cathedral, and the Palace of the Generalitat, the square is a focal point of Valencian life.

The centerpiece of the square is the famous Turia Fountain, which represents the Turia River and its irrigation channels. The fountain features allegorical figures representing the eight irrigation channels that have watered Valencia's fields for centuries.

The square has been a gathering place for Valencians for centuries, hosting markets, festivals, and celebrations. Today, it's a popular spot for both locals and tourists, with numerous cafés and restaurants offering outdoor seating.

The square is particularly beautiful at night when the buildings are illuminated, creating a magical atmosphere. It's the perfect place to sit and soak in Valencia's history and culture while enjoying the Mediterranean climate.`,
    location: "Old Town",
    address: "Plaza de la Virgen, 46001 Valencia",
    rating: 4.6,
    reviewCount: 2340,
    hours: {
      monday: "24/7",
      tuesday: "24/7",
      wednesday: "24/7",
      thursday: "24/7",
      friday: "24/7",
      saturday: "24/7",
      sunday: "24/7",
    },
    admission: "Free",
    website: null,
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
    ],
  },
];

type Review = {
  id: number;
  userId: string;
  userName: string;
  userInitials: string;
  rating: number;
  reviewText: string;
  date: string;
};

// getRelatedLandmarks function removed - now handled in component with API fetch

export default function LandmarkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [landmark, setLandmark] = useState<LandmarkData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [relatedLandmarks, setRelatedLandmarks] = useState<Array<{
    id: string;
    title: string;
    category: string;
    location: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const landmarkId = params.id as string;

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const isAuthenticated = !!session;

  // Fetch reviews for the landmark
  const fetchReviews = async () => {
    if (!landmarkId) return;
    
    try {
      setIsLoadingReviews(true);
      const response = await fetch(
        `/api/reviews?itemType=landmark&itemId=${landmarkId}`
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Helper function to format hours for display
  const formatHours = (hours: Record<string, string> | null): string => {
    if (!hours) return "Hours not available";
    if (hours.monday === "24/7") return "24/7";
    return hours.monday || "Hours vary";
  };

  // Helper function to get hours display value
  const getHoursDisplay = (hours: Record<string, string> | null): string => {
    if (!hours) return "Hours vary";
    if (hours.monday === "24/7") return "Open 24 hours";
    return hours.monday || "Hours vary";
  };

  useEffect(() => {
    async function fetchLandmark() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/landmarks/${landmarkId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Landmark not found");
          } else {
            throw new Error("Failed to fetch landmark");
          }
          return;
        }
        const data = await response.json();
        setLandmark(data);

        // Fetch all landmarks for related landmarks
        const allResponse = await fetch("/api/landmarks");
        if (allResponse.ok) {
          const allData = await allResponse.json();
          const related = allData
            .filter((l: LandmarkData) => 
              l.id !== data.id &&
              (l.category === data.category || l.location === data.location)
            )
            .slice(0, 3)
            .map((l: LandmarkData) => ({
              id: l.id,
              title: l.title,
              category: l.category,
              location: l.location,
            }));
          setRelatedLandmarks(related);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    if (landmarkId) {
      fetchLandmark();
    }
  }, [landmarkId]);

  // Fetch reviews when landmark is loaded
  useEffect(() => {
    if (landmark) {
      fetchReviews();
    }
  }, [landmark]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-8 animate-spin text-orange-600" />
          <p className="text-muted-foreground">Loading landmark...</p>
        </div>
      </div>
    );
  }

  if (error || !landmark) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">
            {error || "Landmark Not Found"}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {error || "The landmark you&apos;re looking for doesn&apos;t exist."}
          </p>
          <Button asChild>
            <Link href="/landmarks">Back to Landmarks</Link>
          </Button>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (landmark.images?.length ?? 1) - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (landmark.images?.length ?? 1) - 1 : prev - 1
    );
  };

  // Keep currentImageIndex for hero carousel, but use lightbox for gallery

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-amber-50/30 to-background">
      {/* Full-width Hero Image with Carousel */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* Image Carousel */}
        <div className="relative h-full w-full">
          {landmark.images && landmark.images.length > 0 ? (
            <>
              <div className="relative h-full w-full bg-gradient-to-br from-blue-600 to-blue-800">
                <img
                  src={landmark.images[currentImageIndex]}
                  alt={landmark.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Navigation Arrows */}
              {landmark.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 backdrop-blur-sm transition-all hover:bg-white/30"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="size-6 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 backdrop-blur-sm transition-all hover:bg-white/30"
                    aria-label="Next image"
                  >
                    <ChevronRight className="size-6 text-white" />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {landmark.images.length > 1 && (
                <div className="absolute bottom-4 mb-20 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                  {landmark.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        "h-2 rounded-full transition-all",
                        idx === currentImageIndex
                          ? "w-8 bg-white"
                          : "w-2 bg-white/50"
                      )}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-blue-600 to-blue-800" />
          )}
        </div>

        {/* Back Button */}
        <div className="absolute left-4 top-4 z-20 md:left-8 md:top-8">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-white/20 bg-background/90 backdrop-blur-sm hover:bg-background"
          >
            <Link href="/landmarks">
              <ArrowLeft className="mr-2 size-4" />
              Back to Landmarks
            </Link>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="absolute right-4 top-4 z-20 flex gap-2 md:right-8 md:top-8">
          <Button
            variant="outline"
            size="icon"
            className="border-white/20 bg-background/90 backdrop-blur-sm hover:bg-background"
          >
            <Share2 className="size-4" />
          </Button>
          <BucketListButton
            itemId={landmarkId}
            itemType="landmark"
            className="border-white/20 bg-background/90 backdrop-blur-sm hover:bg-background"
          />
        </div>

        {/* Content Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8 md:p-12">
          <div className="mx-auto max-w-5xl mb-20">
            <div className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-sm">
              {landmark.category}
            </div>
            <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl lg:text-7xl">
              {landmark.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-base text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="size-5" />
                <span>{landmark.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-5" />
                <span>{formatHours(landmark.hours)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Single Column Layout */}
      <section className="relative -mt-20 z-10">
        <div className="mx-auto max-w-5xl px-4 pb-24">
          {/* Key Info Cards - Horizontal Layout */}
          <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border bg-card/95 p-6 shadow-md backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 text-orange-600" />
                <span>Location</span>
              </div>
              <p className="text-base font-medium text-foreground">
                {landmark.address}
              </p>
            </Card>
            <Card className="border bg-card/95 p-6 shadow-md backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 text-orange-600" />
                <span>Opening Hours</span>
              </div>
              <p className="text-base font-medium text-foreground">
                {getHoursDisplay(landmark.hours)}
              </p>
            </Card>
            <Card className="border bg-card/95 p-6 shadow-md backdrop-blur-sm">
              <div className="mb-2 text-sm text-muted-foreground">Admission</div>
              <p className="text-base font-medium text-foreground">
                {landmark.admission || "Free"}
              </p>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mb-12 grid gap-6 sm:grid-cols-2">
            <Button
              asChild
              size="lg"
              className="h-14 bg-orange-600 text-lg font-medium hover:bg-orange-700"
            >
              <Link
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  landmark.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Directions
                <ExternalLink className="ml-2 size-5" />
              </Link>
            </Button>
            {landmark.website && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 border-2 text-lg font-medium"
              >
                <Link
                  href={landmark.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Official Website
                  <ExternalLink className="ml-2 size-5" />
                </Link>
              </Button>
            )}
          </div>

          {/* Description Section */}
          <Card className="mb-12 border bg-card/95 p-8 shadow-lg backdrop-blur-sm">
            <h2 className="mb-6 text-3xl font-bold text-foreground">About</h2>
            <div className="prose max-w-none">
              <p className="leading-relaxed text-muted-foreground whitespace-pre-line text-lg">
                {landmark.fullDescription || landmark.description}
              </p>
            </div>
          </Card>

          {/* Photo Gallery */}
          {landmark.images && landmark.images.length > 0 && (
            <Card className="mb-12 border bg-card/95 p-8 shadow-lg backdrop-blur-sm">
              <h2 className="mb-6 text-3xl font-bold text-foreground">
                Photo Gallery
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {landmark.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setLightboxIndex(idx);
                      setLightboxOpen(true);
                    }}
                    className="group relative aspect-video overflow-hidden rounded-lg transition-transform hover:scale-105 shadow-md cursor-pointer bg-gradient-to-br from-orange-200 to-orange-300"
                  >
                    <img
                      src={img}
                      alt={`${landmark.title} - Photo ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-2 left-2 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                      Photo {idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Reviews Section */}
          <Card className="mb-12 border bg-card/95 p-8 shadow-lg backdrop-blur-sm">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-foreground">
                Reviews
              </h2>
              {!isSessionLoading && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (isAuthenticated) {
                      // Check if user already has a review
                      const userReview = reviews.find(
                        (r) => r.userId === session?.user.id
                      );
                      if (userReview) {
                        setEditingReview(userReview);
                      } else {
                        setEditingReview(null);
                      }
                      setReviewDialogOpen(true);
                    } else {
                      router.push(
                        `/signin?callbackURL=${encodeURIComponent(
                          `/landmarks/${landmarkId}`
                        )}`
                      );
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isAuthenticated && reviews.some((r) => r.userId === session?.user.id)
                    ? "Edit Your Review"
                    : isAuthenticated
                      ? "Write a Review"
                      : "Sign in to Review"}
                </Button>
              )}
            </div>

            {isLoadingReviews ? (
              <div className="py-12 text-center">
                <Loader2 className="mx-auto mb-4 size-8 animate-spin text-orange-600" />
                <p className="text-muted-foreground">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  No reviews yet. Be the first to write one!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-8">
                  {reviews.map((review, idx) => {
                    const isOwnReview = session?.user.id === review.userId;
                    return (
                      <div key={review.id}>
                        <div className="mb-4 flex items-start gap-4">
                          <div className="flex size-12 items-center justify-center rounded-full bg-orange-100 text-base font-semibold text-orange-700">
                            {review.userInitials}
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <span className="text-lg font-semibold text-foreground">
                                {review.userName}
                              </span>
                              {isOwnReview && (
                                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                                  Your review
                                </span>
                              )}
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "size-4",
                                      i < review.rating
                                        ? "fill-orange-500 text-orange-500"
                                        : "fill-muted text-muted-foreground"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="mb-3 text-sm text-muted-foreground">
                              {review.date}
                            </div>
                            <p className="leading-relaxed text-muted-foreground">
                              {review.reviewText}
                            </p>
                          </div>
                          {isOwnReview && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => {
                                  setEditingReview(review);
                                  setReviewDialogOpen(true);
                                }}
                                aria-label="Edit review"
                              >
                                <Edit className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive hover:text-destructive"
                                onClick={async () => {
                                  if (
                                    confirm(
                                      "Are you sure you want to delete this review?"
                                    )
                                  ) {
                                    try {
                                      const response = await fetch(
                                        `/api/reviews/${review.id}`,
                                        {
                                          method: "DELETE",
                                        }
                                      );
                                      if (response.ok) {
                                        toast.success(
                                          "Review deleted successfully"
                                        );
                                        fetchReviews();
                                      } else {
                                        throw new Error(
                                          "Failed to delete review"
                                        );
                                      }
                                    } catch (error) {
                                      toast.error(
                                        error instanceof Error
                                          ? error.message
                                          : "Failed to delete review"
                                      );
                                    }
                                  }
                                }}
                                aria-label="Delete review"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {idx < reviews.length - 1 && <Separator />}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>

          {/* Related Landmarks */}
          {relatedLandmarks.length > 0 && (
            <Card className="border bg-card/95 p-8 shadow-lg backdrop-blur-sm">
              <h3 className="mb-6 text-2xl font-bold text-foreground">
                Related Landmarks
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedLandmarks.map((related) => (
                  <Link
                    key={related.id}
                    href={`/landmarks/${related.id}`}
                    className="group rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-600">
                      {related.category}
                    </div>
                    <div className="mb-2 text-lg font-semibold text-foreground">
                      {related.title}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span>{related.location}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Review Dialog - Only show if authenticated */}
      {isAuthenticated && landmark && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={(open) => {
            setReviewDialogOpen(open);
            if (!open) {
              setEditingReview(null);
            }
          }}
          itemType="landmark"
          itemId={landmarkId}
          landmarkName={landmark.title}
          existingReview={editingReview ? {
            id: editingReview.id,
            rating: editingReview.rating,
            comment: editingReview.reviewText,
          } : null}
          onSuccess={() => {
            fetchReviews();
            setEditingReview(null);
          }}
        />
      )}

      {/* Image Lightbox */}
      {lightboxOpen && landmark && landmark.images && landmark.images.length > 0 && (
        <ImageLightbox
          images={landmark.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
