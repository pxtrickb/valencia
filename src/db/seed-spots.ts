import 'dotenv/config';
import cuid from 'cuid';
import db from './index';
import { spots, images } from './schema';
import { processImageUrl } from '../lib/image-utils';

const spotData = [
  {
    name: "La Pepica",
    category: "Restaurant",
    shortCategory: "RESTAURANT",
    description: "Beachfront institution serving authentic Valencian paella since 1898, with sea views and a lively terrace.",
    fullDescription: `La Pepica is one of Valencia's most iconic restaurants, located right on the Malvarrosa Beach. Founded in 1898, this historic establishment has been serving authentic Valencian paella for over a century. The restaurant gained international fame when Ernest Hemingway became a regular visitor, and it continues to attract both locals and tourists seeking the perfect paella experience.

The restaurant offers stunning views of the Mediterranean Sea from its terrace, creating an unforgettable dining atmosphere. The menu features traditional Valencian dishes, with paella being the star attraction. Each paella is cooked over an open fire using traditional methods, ensuring authentic flavors and perfect texture.

The interior maintains its classic charm with maritime-themed decorations and photographs of famous visitors. The staff is known for their warm hospitality and deep knowledge of Valencian cuisine. Whether you're looking for a romantic dinner or a family gathering, La Pepica provides an authentic taste of Valencia's culinary heritage.`,
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
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
    ],
  },
  {
    name: "Café de las Horas",
    category: "Café",
    shortCategory: "CAFÉ",
    description: "Baroque-style café famous for its Agua de Valencia, chandeliers, and eclectic interior.",
    fullDescription: `Café de las Horas is a unique baroque-style café located in the heart of El Carmen, Valencia's historic quarter. This atmospheric establishment is famous for inventing and perfecting the Agua de Valencia cocktail, a refreshing blend of cava, orange juice, vodka, and gin.

The interior is a visual feast, with ornate chandeliers, vintage mirrors, velvet curtains, and eclectic decorations that transport visitors to another era. The café has become a cultural landmark, attracting artists, writers, and locals who appreciate its bohemian atmosphere.

Beyond the famous Agua de Valencia, the café offers a selection of coffee, cocktails, and light snacks. The staff is friendly and knowledgeable about the history of the establishment and its signature drinks. It's the perfect place to unwind after exploring the narrow streets of El Carmen or to start an evening out in Valencia.`,
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
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
    ],
  },
  {
    name: "Mercado Central",
    category: "Shop",
    shortCategory: "MARKET",
    description: "One of Europe's largest fresh food markets, housed in a beautiful Modernist building.",
    fullDescription: `Mercado Central is one of Europe's largest covered markets and a masterpiece of Modernist architecture. Located in the heart of Valencia's old town, this bustling market has been serving locals since 1928.

The building itself is a work of art, featuring stunning stained glass windows, intricate ironwork, and colorful ceramic tiles. Inside, you'll find over 300 stalls selling fresh produce, seafood, meat, cheese, spices, and local specialties.

The market is a feast for the senses, with vendors calling out their wares, the aroma of fresh produce, and the vibrant colors of fruits and vegetables. It's the perfect place to experience local culture, pick up ingredients for a home-cooked meal, or simply enjoy the atmosphere.

Many stalls offer samples, and some have small bars where you can enjoy a coffee or a glass of wine while shopping. The market is a must-visit for food lovers and anyone interested in experiencing authentic Valencian daily life.`,
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
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
    ],
  },
  {
    name: "IVAM",
    category: "Museum",
    shortCategory: "MUSEUM",
    description: "Valencian Institute of Modern Art showcasing contemporary exhibitions and cultural events.",
    fullDescription: `The Valencian Institute of Modern Art (IVAM) is one of Spain's most important contemporary art museums. Located in the El Carmen district, the museum showcases a diverse collection of modern and contemporary art from the 20th and 21st centuries.

The permanent collection includes works by Spanish artists such as Julio González, Ignacio Pinazo, and contemporary Valencian artists. The museum also hosts temporary exhibitions featuring international artists and emerging talents.

IVAM is known for its innovative programming, including film screenings, concerts, workshops, and educational activities. The building itself is a modern architectural statement, with spacious galleries and natural lighting that enhances the viewing experience.

The museum's bookstore and café make it a perfect destination for art lovers looking to spend an afternoon exploring contemporary culture. IVAM plays a crucial role in Valencia's cultural scene and is a must-visit for anyone interested in modern art.`,
    location: "El Carmen",
    address: "Carrer de Guillem de Castro, 118, 46003 Valencia",
    priceRange: "$$",
    hours: {
      monday: "Closed",
      tuesday: "10:00 - 19:00",
      wednesday: "10:00 - 19:00",
      thursday: "10:00 - 19:00",
      friday: "10:00 - 19:00",
      saturday: "10:00 - 19:00",
      sunday: "10:00 - 19:00",
    },
    phone: "+34 963 17 66 00",
    website: "https://www.ivam.es",
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
    ],
  },
  {
    name: "Horchatería Santa Catalina",
    category: "Café",
    shortCategory: "CAFÉ",
    description: "Historic café serving traditional horchata with fartons in a tiled, picture-perfect interior.",
    fullDescription: `Horchatería Santa Catalina is one of Valencia's most beautiful and historic horchaterías, located in the heart of the old town. The establishment dates back to 1836 and has been serving traditional horchata de chufa (tiger nut milk) for generations.

The interior is a masterpiece of Valencian tilework, with intricate azulejo tiles covering the walls and creating a stunning visual experience. The café maintains its traditional charm while offering modern comfort.

Horchata, a refreshing drink made from tiger nuts, is served ice-cold and is traditionally paired with fartons, sweet elongated pastries perfect for dipping. This combination is a quintessential Valencian experience, especially during the hot summer months.

The café also offers other traditional drinks and pastries, making it a perfect stop for breakfast or an afternoon snack while exploring Valencia's historic center.`,
    location: "Old Town",
    address: "Plaza de Santa Catalina, 6, 46001 Valencia",
    priceRange: "$",
    hours: {
      monday: "08:00 - 21:00",
      tuesday: "08:00 - 21:00",
      wednesday: "08:00 - 21:00",
      thursday: "08:00 - 21:00",
      friday: "08:00 - 21:00",
      saturday: "08:00 - 21:00",
      sunday: "08:00 - 21:00",
    },
    phone: "+34 963 91 23 79",
    website: "https://horchateriasantacatalina.com",
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
    ],
  },
  {
    name: "Casa Montaña",
    category: "Restaurant",
    shortCategory: "TAPAS BAR",
    description: "Classic bodega in the Cabanyal district known for its tapas, wine cellar, and authentic atmosphere.",
    fullDescription: `Casa Montaña is a historic bodega located in the Cabanyal district, one of Valencia's most authentic neighborhoods. Established in 1836, this traditional Spanish tavern has been serving locals and visitors for nearly two centuries.

The bodega is famous for its extensive wine cellar, featuring over 3,000 bottles of Spanish wines, and its selection of traditional tapas. The atmosphere is authentic and unpretentious, with wooden barrels, vintage posters, and a warm, welcoming environment.

The menu focuses on classic Spanish tapas, including patatas bravas, jamón ibérico, and local specialties. The staff is knowledgeable about wine pairings and can recommend the perfect wine to complement your meal. Casa Montaña offers a genuine taste of traditional Valencian culture.`,
    location: "Cabanyal",
    address: "Carrer de Josep Benlliure, 69, 46011 Valencia",
    priceRange: "$$",
    hours: {
      monday: "12:00 - 16:00, 19:00 - 23:00",
      tuesday: "12:00 - 16:00, 19:00 - 23:00",
      wednesday: "12:00 - 16:00, 19:00 - 23:00",
      thursday: "12:00 - 16:00, 19:00 - 23:00",
      friday: "12:00 - 16:00, 19:00 - 23:00",
      saturday: "12:00 - 16:00, 19:00 - 23:00",
      sunday: "12:00 - 16:00",
    },
    phone: "+34 963 72 21 14",
    website: "https://emilianobodega.com",
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
    ],
  },
  {
    name: "Lladró Boutique",
    category: "Shop",
    shortCategory: "BOUTIQUE",
    description: "Flagship store of Valencia's world-famous porcelain brand, showcasing intricate figurines and design pieces.",
    fullDescription: `Lladró Boutique is the flagship store of Valencia's world-renowned porcelain brand. Located near the City of Arts and Sciences, this elegant boutique showcases the finest examples of Lladró's intricate porcelain figurines and contemporary design pieces.

The brand was founded in 1953 by three brothers in the Valencian town of Almàssera and has since become internationally recognized for its exquisite craftsmanship and artistic designs. The boutique offers a wide range of collectible figurines, tableware, and decorative pieces.

The store itself is beautifully designed, with displays that highlight the delicate details and artistry of each piece. Knowledgeable staff can help you understand the history and craftsmanship behind the collections, making it a perfect destination for collectors and those seeking unique gifts.

Whether you're looking for a traditional Spanish dancer figurine or a modern design piece, Lladró Boutique offers an authentic piece of Valencian artistry to take home.`,
    location: "Ciutat de les Arts i les Ciències",
    address: "Avinguda del Professor López Piñero, 7, 46013 Valencia",
    priceRange: "$$$",
    hours: {
      monday: "10:00 - 20:00",
      tuesday: "10:00 - 20:00",
      wednesday: "10:00 - 20:00",
      thursday: "10:00 - 20:00",
      friday: "10:00 - 20:00",
      saturday: "10:00 - 20:00",
      sunday: "11:00 - 19:00",
    },
    phone: "+34 963 17 50 00",
    website: "https://www.lladro.com",
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
    ],
  },
  {
    name: "Museo de Bellas Artes",
    category: "Museum",
    shortCategory: "MUSEUM",
    description: "Fine arts museum with an impressive collection of Spanish masters, including works by Sorolla.",
    fullDescription: `The Museo de Bellas Artes de Valencia is one of Spain's most important fine arts museums, housing an impressive collection of paintings, sculptures, and decorative arts from the 14th to the 20th centuries.

The museum's collection includes masterpieces by Spanish artists such as Velázquez, Goya, El Greco, and particularly notable works by Valencian artists including Joaquín Sorolla, whose luminous paintings capture the Mediterranean light and Valencian landscapes.

The building itself is a former convent, providing a beautiful setting for the artworks. The museum is organized chronologically, allowing visitors to trace the evolution of Spanish art through the centuries.

The collection includes religious art from the medieval period, Renaissance works, Baroque masterpieces, and modern art. The museum also features temporary exhibitions and educational programs, making it a cultural hub in Valencia. It's a must-visit for art enthusiasts and anyone interested in Spanish cultural heritage.`,
    location: "El Carmen",
    address: "Carrer de Sant Pius V, 9, 46010 Valencia",
    priceRange: "$",
    hours: {
      monday: "Closed",
      tuesday: "10:00 - 20:00",
      wednesday: "10:00 - 20:00",
      thursday: "10:00 - 20:00",
      friday: "10:00 - 20:00",
      saturday: "10:00 - 20:00",
      sunday: "10:00 - 20:00",
    },
    phone: "+34 963 87 03 00",
    website: "https://museobellasartesvalencia.gva.es",
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
    ],
  },
];

async function seedSpots() {
  console.log('Seeding spots...');

  for (const spot of spotData) {
    const spotId = cuid();
    
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
      website: spot.website,
      image: spot.image,
    });

    // Insert main image
    await db.insert(images).values({
      entityType: 'spot',
      entityId: spotId,
      url: spot.image,
      isPrimary: true,
      orderIndex: 0,
    });

    // Insert additional images
    if (spot.images && spot.images.length > 0) {
      for (let i = 0; i < spot.images.length; i++) {
        await db.insert(images).values({
          entityType: 'spot',
          entityId: spotId,
          url: spot.images[i],
          isPrimary: false,
          orderIndex: i + 1,
        });
      }
    }

    console.log(`✓ Seeded: ${spot.name} (${spotId})`);
  }

  console.log('✓ Spots seeded successfully!');
}

seedSpots()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding:', error);
    process.exit(1);
  });

