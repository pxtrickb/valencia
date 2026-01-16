import 'dotenv/config';
import cuid from 'cuid';
import db from './index';
import { landmarks, images } from './schema';

const landmarkData = [
  {
    category: "GOTHIC MASTERPIECE",
    title: "Valencia Cathedral",
    description: "Home to the Holy Grail and the iconic Miguelete tower, offering panoramic views of the city.",
    fullDescription: `Valencia Cathedral, also known as the Metropolitan Cathedral–Basilica of the Assumption of Our Lady of Valencia, is a stunning example of Gothic architecture with Romanesque, Renaissance, and Baroque elements. The cathedral houses what many believe to be the Holy Grail, the chalice used by Jesus at the Last Supper.

The cathedral's most iconic feature is the Miguelete Tower (El Micalet), a 51-meter-high bell tower that offers breathtaking panoramic views of Valencia. Visitors can climb the 207 steps to the top for an unforgettable view of the city and the Mediterranean Sea.

The interior features beautiful chapels, including the Chapel of the Holy Grail, stunning stained glass windows, and impressive vaulted ceilings. The cathedral's museum displays religious art and artifacts spanning centuries of Valencian history.

The building itself tells the story of Valencia's evolution, with architectural styles from different periods visible throughout. It's a must-visit for anyone interested in history, architecture, or religious art.`,
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
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
    ],
  },
  {
    category: "FUTURISTIC WONDER",
    title: "City of Arts & Sciences",
    description: "A stunning complex of futuristic buildings designed by Calatrava, featuring museums and gardens.",
    fullDescription: `The City of Arts and Sciences (Ciutat de les Arts i les Ciències) is an architectural masterpiece and one of Valencia's most iconic landmarks. Designed by renowned Valencian architect Santiago Calatrava, this futuristic complex spans over 350,000 square meters and represents a stunning blend of art, science, and nature.

The complex includes several major buildings: the Hemisfèric (IMAX cinema and planetarium), the Science Museum, the Oceanogràfic (Europe's largest aquarium), the Palau de les Arts (opera house), the Ágora (events venue), and the Umbracle (landscaped walkway). Each building is a work of art in itself, featuring Calatrava's signature white concrete structures and flowing, organic forms.

The surrounding Turia Gardens provide a beautiful natural setting, with walking paths, fountains, and green spaces. The complex hosts numerous cultural events, exhibitions, and performances throughout the year.

The City of Arts and Sciences is not just a tourist attraction but a living cultural center that celebrates human creativity, scientific discovery, and artistic expression. It's a symbol of Valencia's forward-thinking spirit and commitment to innovation.`,
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
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
    ],
  },
  {
    category: "UNESCO HERITAGE",
    title: "La Lonja de la Seda",
    description: "A late Gothic masterpiece and UNESCO World Heritage Site, once Europe's silk exchange.",
    fullDescription: `La Lonja de la Seda (The Silk Exchange) is a masterpiece of late Gothic architecture and a UNESCO World Heritage Site since 1996. Built between 1482 and 1548, this magnificent building served as Valencia's commercial exchange during the city's golden age of silk trading.

The building consists of four parts: the Tower, the Contract Hall (Sala de Contratación), the Consulate of the Sea, and the Orange Tree Courtyard. The Contract Hall is particularly stunning, with its soaring twisted columns resembling palm trees, creating a forest-like atmosphere that symbolizes the Garden of Eden.

The intricate stone carvings, Gothic vaults, and detailed ornamentation showcase the skill of Valencian craftsmen of the period. The building's design reflects the prosperity and importance of Valencia as a major trading center in the Mediterranean.

Today, La Lonja serves as a cultural venue hosting exhibitions and events, while the Orange Tree Courtyard provides a peaceful oasis in the heart of the city. It's a testament to Valencia's rich commercial and cultural history and remains one of the finest examples of Gothic civil architecture in Europe.`,
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
    image: "/api/placeholder/1200/600",
    images: [
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
      "/api/placeholder/1200/800",
    ],
  },
  {
    category: "GOTHIC MASTERPIECE",
    title: "Torres de Serranos",
    description: "Medieval city gates that once protected Valencia, now offering stunning views of the old city.",
    fullDescription: `The Torres de Serranos (Serranos Towers) are among the best-preserved medieval city gates in Europe. Built in the 14th century as part of Valencia's defensive walls, these imposing towers served as the main entrance to the city from the north.

The towers were designed by Pere Balaguer in the Gothic style and feature a massive, fortress-like appearance with decorative elements. They consist of two polygonal towers connected by a central body, creating an impressive gateway that once controlled access to the city.

Throughout history, the towers have served various purposes: as a defensive structure, a prison for nobles, and a storage facility. Today, they stand as a symbol of Valencia's medieval past and offer visitors the opportunity to climb to the top for panoramic views of the old town and the Turia River.

The towers are particularly beautiful when illuminated at night, creating a dramatic silhouette against the Valencian sky. They represent one of the few remaining pieces of the city's medieval fortifications and are a must-see for history enthusiasts.`,
    location: "Old Town",
    address: "Plaza de los Fueros, s/n, 46003 Valencia",
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
    category: "MODERN ARCHITECTURE",
    title: "Mercado Central",
    description: "One of Europe's largest covered markets, featuring stunning Art Nouveau architecture and fresh local produce.",
    fullDescription: `Mercado Central is one of Europe's largest covered markets and a masterpiece of Art Nouveau architecture. Designed by architects Alejandro Soler March and Francisco Guardia Vial, the market opened in 1928 and has been serving Valencians ever since.

The building features stunning stained glass windows, intricate ironwork, colorful ceramic tiles, and a magnificent domed roof. The interior is a vibrant, bustling space with over 300 stalls selling fresh produce, seafood, meat, cheese, spices, and local specialties.

The market is a feast for the senses, with vendors calling out their wares, the aroma of fresh produce, and the vibrant colors of fruits and vegetables. It's the perfect place to experience local culture, pick up ingredients for a home-cooked meal, or simply enjoy the atmosphere.

Many stalls offer samples, and some have small bars where you can enjoy a coffee or a glass of wine while shopping. The market is a must-visit for food lovers and anyone interested in experiencing authentic Valencian daily life.`,
    location: "City Center",
    address: "Plaza del Mercado, s/n, 46001 Valencia",
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
    category: "UNESCO HERITAGE",
    title: "Palau de les Arts",
    description: "The opera house and cultural center, part of the City of Arts and Sciences complex.",
    fullDescription: `The Palau de les Arts Reina Sofía is the opera house and cultural center of the City of Arts and Sciences. Designed by Santiago Calatrava, this stunning building opened in 2005 and has become one of Europe's most important opera houses.

The building's design is striking, with a flowing, organic form that appears to rise from the surrounding gardens. The exterior features a white concrete shell that seems to float above the ground, while the interior houses four performance halls: the Main Hall, the Master Class Hall, the Auditorium, and the Aula Magistral.

The Main Hall seats 1,400 and hosts opera, ballet, and classical music performances. The acoustics are world-class, designed to provide an exceptional listening experience. The building also features rehearsal spaces, workshops, and educational facilities.

The Palau de les Arts has hosted some of the world's most renowned performers and companies, establishing Valencia as a major cultural destination. The building itself is a work of art, combining Calatrava's signature architectural style with state-of-the-art performance technology.`,
    location: "Turia Gardens",
    address: "Av. del Professor López Piñero, 1, 46013 Valencia",
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
    category: "GOTHIC MASTERPIECE",
    title: "Basilica of the Virgin",
    description: "A beautiful basilica dedicated to Valencia's patron saint, featuring stunning architecture.",
    fullDescription: `The Basilica of the Virgin of the Forsaken (Basílica de la Virgen de los Desamparados) is a beautiful baroque church dedicated to Valencia's patron saint. Located in the Plaza de la Virgen, the basilica is one of the city's most important religious sites.

The building features a stunning baroque façade with intricate decorations and a beautiful dome. The interior is equally impressive, with ornate altars, beautiful frescoes, and the revered image of the Virgin of the Forsaken, which is carried through the city during the annual Fallas festival.

The basilica's location in the heart of the old town makes it a focal point of Valencian religious and cultural life. The square in front of the basilica features the famous Turia Fountain, creating a beautiful setting for this historic building.

The basilica is open to visitors and offers a peaceful place for reflection, as well as an opportunity to admire its beautiful architecture and religious art. It's particularly beautiful during religious festivals when it's decorated with flowers and candles.`,
    location: "Old Town",
    address: "Plaza de la Virgen, s/n, 46001 Valencia",
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
    category: "MODERN ARCHITECTURE",
    title: "Oceanogràfic",
    description: "Europe's largest aquarium, designed by Félix Candela, showcasing marine life from around the world.",
    fullDescription: `Oceanogràfic is Europe's largest aquarium and one of the most impressive attractions in the City of Arts and Sciences. Designed by architect Félix Candela, the building's unique design resembles a water lily and houses marine ecosystems from around the world.

The aquarium is divided into different zones representing various marine environments: the Mediterranean, Wetlands, Temperate and Tropical Seas, Oceans, Antarctic, Arctic, Islands, and the Red Sea. Each zone is carefully designed to replicate the natural habitat of its inhabitants.

Visitors can walk through underwater tunnels, watch dolphin shows, and observe everything from sharks and beluga whales to penguins and sea lions. The aquarium is home to over 45,000 animals representing 500 different species.

The Oceanogràfic is not just an aquarium but also a research and conservation center, working to protect marine life and educate visitors about the importance of ocean conservation. It's an educational and entertaining experience for visitors of all ages.`,
    location: "Turia Gardens",
    address: "Carrer d'Eduardo Primo Yúfera, 1B, 46013 Valencia",
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
    category: "HISTORICAL MONUMENT",
    title: "Plaza de la Virgen",
    description: "The heart of Valencia's old town, surrounded by historic buildings and the famous Turia fountain.",
    fullDescription: `Plaza de la Virgen is the heart of Valencia's old town and one of the city's most beautiful and historic squares. Surrounded by some of Valencia's most important buildings, including the Basilica of the Virgin, the Cathedral, and the Palace of the Generalitat, the square is a focal point of Valencian life.

The centerpiece of the square is the famous Turia Fountain, which represents the Turia River and its irrigation channels. The fountain features allegorical figures representing the eight irrigation channels that have watered Valencia's fields for centuries.

The square has been a gathering place for Valencians for centuries, hosting markets, festivals, and celebrations. Today, it's a popular spot for both locals and tourists, with numerous cafés and restaurants offering outdoor seating.

The square is particularly beautiful at night when the buildings are illuminated, creating a magical atmosphere. It's the perfect place to sit and soak in Valencia's history and culture while enjoying the Mediterranean climate.`,
    location: "Old Town",
    address: "Plaza de la Virgen, 46001 Valencia",
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

async function seedLandmarks() {
  console.log('Seeding landmarks...');

  for (const landmark of landmarkData) {
    const landmarkId = cuid();
    
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
      image: landmark.image,
    });

    // Insert main image
    await db.insert(images).values({
      entityType: 'landmark',
      entityId: landmarkId,
      url: landmark.image,
      isPrimary: true,
      orderIndex: 0,
    });

    // Insert additional images
    if (landmark.images && landmark.images.length > 0) {
      for (let i = 0; i < landmark.images.length; i++) {
        await db.insert(images).values({
          entityType: 'landmark',
          entityId: landmarkId,
          url: landmark.images[i],
          isPrimary: false,
          orderIndex: i + 1,
        });
      }
    }

    console.log(`✓ Seeded: ${landmark.title} (${landmarkId})`);
  }

  console.log('✓ Landmarks seeded successfully!');
}

seedLandmarks()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding:', error);
    process.exit(1);
  });

