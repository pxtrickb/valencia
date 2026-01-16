import 'dotenv/config';
import cuid from 'cuid';
import db from './index';
import { landmarks, spots, businesses, images, reviews, user } from './schema';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Ensure upload directory exists
async function ensureUploadDir() {
  const uploadDir = join(process.cwd(), 'usercontent', 'images');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

// Download image from URL and save locally
async function downloadAndSaveImage(url: string, filename: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image from URL: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadDir = await ensureUploadDir();
  const filePath = join(uploadDir, filename);
  await writeFile(filePath, buffer);

  return `/usercontent/images/${filename}`;
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const ext = originalName.split('.').pop()?.split('?')[0] || 'jpg';
  return `${timestamp}-${random}.${ext}`;
}

// Real image URLs for landmarks
const landmarkData = [
  {
    category: "GOTHIC MASTERPIECE",
    title: "Valencia Cathedral",
    description: "Home to the Holy Grail and the iconic Miguelete tower, offering panoramic views of the city.",
    fullDescription: `Valencia Cathedral, also known as the Metropolitan Cathedral–Basilica of the Assumption of Our Lady of Valencia, is a stunning example of Gothic architecture with Romanesque, Renaissance, and Baroque elements. The cathedral houses what many believe to be the Holy Grail, the chalice used by Jesus at the Last Supper.

The cathedral's most iconic feature is the Miguelete Tower (El Micalet), a 51-meter-high bell tower that offers breathtaking panoramic views of Valencia. Visitors can climb the 207 steps to the top for an unforgettable view of the city and the Mediterranean Sea.`,
    location: "Old Town",
    address: "Plaza de la Reina, s/n, 46003 Valencia",
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
    imageUrls: [
      "https://images.unsplash.com/photo-1691505601944-6d4b971eba3b",
      "https://images.unsplash.com/photo-1606389449999-22585a8be93e",
      "https://images.unsplash.com/photo-1659315354110-16f1ed738423",
    ],
  },
  {
    category: "FUTURISTIC WONDER",
    title: "City of Arts & Sciences",
    description: "A stunning complex of futuristic buildings designed by Calatrava, featuring museums and gardens.",
    fullDescription: `The City of Arts and Sciences (Ciutat de les Arts i les Ciències) is an architectural masterpiece and one of Valencia's most iconic landmarks. Designed by renowned Valencian architect Santiago Calatrava, this futuristic complex spans over 350,000 square meters.`,
    location: "Turia Gardens",
    address: "Av. del Professor López Piñero, 7, 46013 Valencia",
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
    imageUrls: [
      "https://images.unsplash.com/photo-1763571294142-54993a594420",
      "https://images.unsplash.com/photo-1763566623265-1d39ee1be78c",
    ],
  },
  {
    category: "UNESCO HERITAGE",
    title: "La Lonja de la Seda",
    description: "A late Gothic masterpiece and UNESCO World Heritage Site, once Europe's silk exchange.",
    fullDescription: `La Lonja de la Seda (The Silk Exchange) is a masterpiece of late Gothic architecture and a UNESCO World Heritage Site since 1996. Built between 1482 and 1548, this magnificent building served as Valencia's commercial exchange.`,
    location: "City Center",
    address: "Plaza del Mercado, s/n, 46001 Valencia",
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
    imageUrls: [
      "https://plus.unsplash.com/premium_photo-1697730449653-afdbc80d4f8a",
    ],
  },
];

// Business and spots data
const businessData = [
  {
    name: "Valencia Gastronomy Group",
    identifier: "VG-GROUP-001",
    email: "contact@vg-group.com",
    phone: "+34 963 123 456",
    website: "https://vg-group.com",
    spots: [
      {
        name: "La Pepica",
        category: "Restaurant",
        shortCategory: "RESTAURANT",
        description: "Beachfront institution serving authentic Valencian paella since 1898.",
        fullDescription: `La Pepica is one of Valencia's most iconic restaurants, located right on the Malvarrosa Beach. Founded in 1898, this historic establishment has been serving authentic Valencian paella for over a century.`,
        location: "Malvarrosa Beach",
        address: "Passeig de Neptú, 6, 46011 Valencia",
        priceRange: "$$",
        hours: {
          monday: "13:00 - 16:00, 20:00 - 23:00",
          tuesday: "13:00 - 16:00, 20:00 - 23:00",
          wednesday: "13:00 - 16:00, 20:00 - 23:00",
          thursday: "13:00 - 16:00, 20:00 - 23:00",
          friday: "13:00 - 16:00, 20:00 - 23:00",
          saturday: "13:00 - 16:00, 20:00 - 23:00",
          sunday: "13:00 - 16:00",
        },
        phone: "+34 963 37 10 11",
        website: "https://lapepica.com",
        imageUrls: [
          "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&h=600&fit=crop",
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop",
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=800&fit=crop",
        ],
      },
      {
        name: "Café de las Horas",
        category: "Café",
        shortCategory: "CAFÉ",
        description: "Baroque-style café famous for its Agua de Valencia.",
        fullDescription: `Café de las Horas is a unique baroque-style café located in the heart of El Carmen. This atmospheric establishment is famous for inventing the Agua de Valencia cocktail.`,
        location: "El Carmen",
        address: "Carrer del Comte de Salvatierra, 8, 46003 Valencia",
        priceRange: "$$",
        hours: {
          monday: "10:00 - 02:00",
          tuesday: "10:00 - 02:00",
          wednesday: "10:00 - 02:00",
          thursday: "10:00 - 02:00",
          friday: "10:00 - 03:00",
          saturday: "10:00 - 03:00",
          sunday: "10:00 - 02:00",
        },
        phone: "+34 963 91 56 36",
        website: "https://cafedelashoras.com",
        imageUrls: [
          "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=600&fit=crop",
          "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&h=800&fit=crop",
        ],
      },
    ],
  },
  {
    name: "Valencia Markets Co.",
    identifier: "VM-CO-001",
    email: "info@valenciamarkets.com",
    phone: "+34 963 234 567",
    website: "https://valenciamarkets.com",
    spots: [
      {
        name: "Mercado Central",
        category: "Shop",
        shortCategory: "MARKET",
        description: "One of Europe's largest fresh food markets, housed in a beautiful Modernist building.",
        fullDescription: `Mercado Central is one of Europe's largest covered markets and a masterpiece of Modernist architecture. Inside, you'll find over 300 stalls selling fresh produce, seafood, meat, and local specialties.`,
        location: "Ciutat Vella",
        address: "Plaza del Mercado, s/n, 46001 Valencia",
        priceRange: "$",
        hours: {
          monday: "07:00 - 15:00",
          tuesday: "07:00 - 15:00",
          wednesday: "07:00 - 15:00",
          thursday: "07:00 - 15:00",
          friday: "07:00 - 15:00",
          saturday: "07:00 - 15:00",
          sunday: "Closed",
        },
        phone: "+34 963 82 91 00",
        website: "https://mercadocentralvalencia.es",
        imageUrls: [
          "https://plus.unsplash.com/premium_photo-1697730452875-48896dd01667",
          "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&h=800&fit=crop",
        ],
      },
    ],
  },
];

// Review data
const reviewData = [
  { itemType: 'landmark' as const, rating: 5, comment: "Absolutely stunning! The architecture is breathtaking and the views from the tower are worth the climb." },
  { itemType: 'landmark' as const, rating: 5, comment: "A must-visit when in Valencia. The futuristic design is incredible." },
  { itemType: 'landmark' as const, rating: 4, comment: "Beautiful Gothic architecture. The UNESCO status is well-deserved." },
  { itemType: 'spot' as const, rating: 5, comment: "Best paella in Valencia! The beachfront location makes it perfect." },
  { itemType: 'spot' as const, rating: 5, comment: "Love the Agua de Valencia here. The atmosphere is amazing!" },
  { itemType: 'spot' as const, rating: 4, comment: "Great market with fresh produce. The building itself is beautiful." },
];

async function seed() {
  console.log('Starting database seed...');

  // Get the first user (should be the admin)
  const users = await db.select().from(user).limit(1);
  if (users.length === 0) {
    throw new Error('No users found. Please create a user first before seeding.');
  }
  const firstUser = users[0];
  console.log(`✓ Using user: ${firstUser.name} (${firstUser.id})`);

  // Seed landmarks
  console.log('\nSeeding landmarks...');
  const landmarkIds: string[] = [];
  for (const landmark of landmarkData) {
    const landmarkId = cuid();
    landmarkIds.push(landmarkId);

    // Download and save images
    const savedImages: string[] = [];
    for (let i = 0; i < landmark.imageUrls.length; i++) {
      try {
        const filename = generateFilename(`landmark-${landmarkId}-${i}.jpg`);
        const localPath = await downloadAndSaveImage(landmark.imageUrls[i], filename);
        savedImages.push(localPath);
      } catch (error) {
        console.error(`  Warning: Failed to download image ${i + 1} for ${landmark.title}:`, error);
        // Use placeholder if download fails
        savedImages.push(`/api/placeholder/1200/${i === 0 ? '600' : '800'}`);
      }
    }

    const primaryImage = savedImages[0] || '/api/placeholder/1200/600';

    // Insert landmark
    await db.insert(landmarks).values({
      id: landmarkId,
      category: landmark.category,
      title: landmark.title,
      description: landmark.description,
      fullDescription: landmark.fullDescription,
      location: landmark.location,
      address: landmark.address,
      hours: JSON.stringify(landmark.hours),
      admission: landmark.admission,
      website: landmark.website || null,
      image: primaryImage,
    });

    // Insert images
    for (let i = 0; i < savedImages.length; i++) {
      await db.insert(images).values({
        entityType: 'landmark',
        entityId: landmarkId,
        url: savedImages[i],
        isPrimary: i === 0,
        orderIndex: i,
      });
    }

    console.log(`  ✓ Seeded: ${landmark.title} (${landmarkId})`);
  }

  // Seed businesses and their spots
  console.log('\nSeeding businesses and spots...');
  const spotIds: string[] = [];
  for (const business of businessData) {
    const businessId = cuid();

    // Insert business (assigned to first user)
    await db.insert(businesses).values({
      id: businessId,
      userId: firstUser.id,
      name: business.name,
      identifier: business.identifier,
      email: business.email,
      phone: business.phone,
      website: business.website || null,
      status: 'approved', // Auto-approve seeded businesses
    });

    console.log(`  ✓ Seeded business: ${business.name} (${businessId})`);

    // Seed spots for this business
    for (const spot of business.spots) {
      const spotId = cuid();
      spotIds.push(spotId);

      // Download and save images
      const savedImages: string[] = [];
      for (let i = 0; i < spot.imageUrls.length; i++) {
        try {
          const filename = generateFilename(`spot-${spotId}-${i}.jpg`);
          const localPath = await downloadAndSaveImage(spot.imageUrls[i], filename);
          savedImages.push(localPath);
        } catch (error) {
          console.error(`    Warning: Failed to download image ${i + 1} for ${spot.name}:`, error);
          // Use placeholder if download fails
          savedImages.push(`/api/placeholder/1200/${i === 0 ? '600' : '800'}`);
        }
      }

      const primaryImage = savedImages[0] || '/api/placeholder/1200/600';

      // Insert spot
      await db.insert(spots).values({
        id: spotId,
        name: spot.name,
        category: spot.category,
        shortCategory: spot.shortCategory,
        description: spot.description,
        fullDescription: spot.fullDescription,
        location: spot.location,
        address: spot.address,
        priceRange: spot.priceRange,
        hours: JSON.stringify(spot.hours),
        phone: spot.phone,
        website: spot.website || null,
        image: primaryImage,
        businessId,
      });

      // Insert images
      for (let i = 0; i < savedImages.length; i++) {
        await db.insert(images).values({
          entityType: 'spot',
          entityId: spotId,
          url: savedImages[i],
          isPrimary: i === 0,
          orderIndex: i,
        });
      }

      console.log(`    ✓ Seeded spot: ${spot.name} (${spotId})`);
    }
  }

  // Seed reviews
  console.log('\nSeeding reviews...');
  
  // Add reviews for landmarks (one review per landmark, rotating through review data)
  const landmarkReviews = reviewData.filter(r => r.itemType === 'landmark');
  for (let i = 0; i < landmarkIds.length; i++) {
    const landmarkId = landmarkIds[i];
    const review = landmarkReviews[i % landmarkReviews.length];
    if (review) {
      await db.insert(reviews).values({
        userId: firstUser.id,
        itemType: 'landmark',
        itemId: landmarkId,
        rating: review.rating,
        comment: review.comment,
      });
      console.log(`  ✓ Added review for landmark ${landmarkId}`);
    }
  }

  // Add reviews for spots (one review per spot, rotating through review data)
  const spotReviews = reviewData.filter(r => r.itemType === 'spot');
  for (let i = 0; i < spotIds.length; i++) {
    const spotId = spotIds[i];
    const review = spotReviews[i % spotReviews.length];
    if (review) {
      await db.insert(reviews).values({
        userId: firstUser.id,
        itemType: 'spot',
        itemId: spotId,
        rating: review.rating,
        comment: review.comment,
      });
      console.log(`  ✓ Added review for spot ${spotId}`);
    }
  }

  console.log('\n✓ Database seed completed successfully!');
  console.log(`  - ${landmarkIds.length} landmarks`);
  console.log(`  - ${businessData.length} businesses`);
  console.log(`  - ${spotIds.length} spots`);
  console.log(`  - Reviews added`);
}

// Export for use in API route
export { seed };

// If run directly (via npm script)
if (require.main === module) {
  seed()
    .then(() => {
      console.log('\nSeed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nError seeding:', error);
      process.exit(1);
    });
}
