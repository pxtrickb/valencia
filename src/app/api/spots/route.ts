import { NextResponse } from 'next/server';
import db from '@/db';
import { spots, images } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allSpots = await db.select().from(spots);
    
    // Get images for all spots
    const allImages = await db
      .select()
      .from(images)
      .where(eq(images.entityType, 'spot'));

    // Group images by entityId
    const imagesBySpot = allImages.reduce((acc, img) => {
      if (!acc[img.entityId]) {
        acc[img.entityId] = [];
      }
      acc[img.entityId].push(img);
      return acc;
    }, {} as Record<string, typeof allImages>);

    // Attach images to spots and parse hours
    const spotsWithImages = allSpots.map((spot) => {
      const spotImages = imagesBySpot[spot.id] || [];
      const primaryImage = spotImages.find(img => img.isPrimary)?.url || spot.image;
      const additionalImages = spotImages
        .filter(img => !img.isPrimary)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map(img => img.url);

      let hours = null;
      if (spot.hours) {
        try {
          hours = JSON.parse(spot.hours);
        } catch (e) {
          console.error('Error parsing hours for spot', spot.id, e);
        }
      }

      return {
        id: spot.id,
        name: spot.name,
        category: spot.category,
        shortCategory: spot.shortCategory,
        description: spot.description,
        fullDescription: spot.fullDescription,
        location: spot.location,
        address: spot.address,
        priceRange: spot.priceRange,
        hours,
        phone: spot.phone,
        website: spot.website,
        image: primaryImage,
        images: [primaryImage, ...additionalImages],
      };
    });

    return NextResponse.json(spotsWithImages);
  } catch (error) {
    console.error('Error fetching spots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spots' },
      { status: 500 }
    );
  }
}


