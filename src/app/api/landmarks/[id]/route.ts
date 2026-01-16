import { NextResponse } from 'next/server';
import db from '@/db';
import { landmarks, images } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const landmark = await db
      .select()
      .from(landmarks)
      .where(eq(landmarks.id, id))
      .limit(1);

    if (landmark.length === 0) {
      return NextResponse.json(
        { error: 'Landmark not found' },
        { status: 404 }
      );
    }

    // Get images for this landmark
    const landmarkImages = await db
      .select()
      .from(images)
      .where(and(
        eq(images.entityType, 'landmark'),
        eq(images.entityId, id)
      ))
      .orderBy(images.orderIndex);

    const primaryImage = landmarkImages.find(img => img.isPrimary)?.url || landmark[0].image;
    const additionalImages = landmarkImages
      .filter(img => !img.isPrimary)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(img => img.url);

    // Parse hours JSON
    let hours = null;
    if (landmark[0].hours) {
      try {
        hours = JSON.parse(landmark[0].hours);
      } catch (e) {
        console.error('Error parsing hours for landmark', id, e);
      }
    }

    const landmarkData = {
      id: landmark[0].id,
      category: landmark[0].category,
      title: landmark[0].title,
      description: landmark[0].description,
      fullDescription: landmark[0].fullDescription,
      location: landmark[0].location,
      address: landmark[0].address,
      hours,
      admission: landmark[0].admission,
      website: landmark[0].website,
      image: primaryImage,
      images: [primaryImage, ...additionalImages],
    };

    return NextResponse.json(landmarkData);
  } catch (error) {
    console.error('Error fetching landmark:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landmark' },
      { status: 500 }
    );
  }
}


