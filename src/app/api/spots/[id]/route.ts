import { NextResponse } from 'next/server';
import db from '@/db';
import { spots, images, businesses } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const spot = await db
      .select()
      .from(spots)
      .where(eq(spots.id, id))
      .limit(1);

    if (spot.length === 0) {
      return NextResponse.json(
        { error: 'Spot not found' },
        { status: 404 }
      );
    }

    // Get images for this spot
    const spotImages = await db
      .select()
      .from(images)
      .where(and(
        eq(images.entityType, 'spot'),
        eq(images.entityId, id)
      ))
      .orderBy(images.orderIndex);

    const primaryImage = spotImages.find(img => img.isPrimary)?.url || spot[0].image;
    const additionalImages = spotImages
      .filter(img => !img.isPrimary)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(img => img.url);

    // Parse hours JSON
    let hours = null;
    if (spot[0].hours) {
      try {
        hours = JSON.parse(spot[0].hours);
      } catch (e) {
        console.error('Error parsing hours for spot', id, e);
      }
    }

    // Get business information if spot has a business
    let business = null;
    if (spot[0].businessId) {
      const businessData = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, spot[0].businessId))
        .limit(1);
      
      if (businessData.length > 0) {
        business = {
          id: businessData[0].id,
          name: businessData[0].name,
          identifier: businessData[0].identifier,
        };
      }
    }

    const spotData = {
      id: spot[0].id,
      name: spot[0].name,
      category: spot[0].category,
      shortCategory: spot[0].shortCategory,
      description: spot[0].description,
      fullDescription: spot[0].fullDescription,
      location: spot[0].location,
      address: spot[0].address,
      priceRange: spot[0].priceRange,
      hours,
      phone: spot[0].phone,
      website: spot[0].website,
      image: primaryImage,
      images: [primaryImage, ...additionalImages],
      business,
    };

    return NextResponse.json(spotData);
  } catch (error) {
    console.error('Error fetching spot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spot' },
      { status: 500 }
    );
  }
}


