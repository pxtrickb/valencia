import { NextResponse } from 'next/server';
import db from '@/db';
import { landmarks, images } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const allLandmarks = await db.select().from(landmarks);
    
    // Get images for all landmarks
    const allImages = await db
      .select()
      .from(images)
      .where(eq(images.entityType, 'landmark'));

    // Group images by entityId
    const imagesByLandmark = allImages.reduce((acc, img) => {
      if (!acc[img.entityId]) {
        acc[img.entityId] = [];
      }
      acc[img.entityId].push(img);
      return acc;
    }, {} as Record<string, typeof allImages>);

    // Attach images to landmarks and parse hours
    const landmarksWithImages = allLandmarks.map((landmark) => {
      const landmarkImages = imagesByLandmark[landmark.id] || [];
      const primaryImage = landmarkImages.find(img => img.isPrimary)?.url || landmark.image;
      const additionalImages = landmarkImages
        .filter(img => !img.isPrimary)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map(img => img.url);

      let hours = null;
      if (landmark.hours) {
        try {
          hours = JSON.parse(landmark.hours);
        } catch (e) {
          console.error('Error parsing hours for landmark', landmark.id, e);
        }
      }

      return {
        id: landmark.id,
        category: landmark.category,
        title: landmark.title,
        description: landmark.description,
        fullDescription: landmark.fullDescription,
        location: landmark.location,
        address: landmark.address,
        hours,
        admission: landmark.admission,
        website: landmark.website,
        image: primaryImage,
        images: [primaryImage, ...additionalImages],
      };
    });

    return NextResponse.json(landmarksWithImages);
  } catch (error) {
    console.error('Error fetching landmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landmarks' },
      { status: 500 }
    );
  }
}


