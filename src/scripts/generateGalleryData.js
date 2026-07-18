const fs = require('fs');
const path = require('path');

const galleryDir = path.join(__dirname, '../galleryData');
if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}

// Helper to get random item
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Common Data
const firstNames = ["Sophia", "Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Isabella", "William", "Mia", "James", "Amelia", "Benjamin", "Harper", "Lucas", "Evelyn", "Henry", "Abigail", "Alexander", "Emily", "Sebastian", "Elizabeth", "Jack", "Mila", "Julian", "Ella", "Levi", "Avery", "Mateo"];
const lastNames = ["Carter", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis"];
const years = [2020, 2021, 2022, 2023, 2024, 2025];

const generateArtist = () => `${rand(firstNames)} ${rand(lastNames)}`;

// Category definitions
const categories = [
  {
    fileName: "trendingArts",
    categoryName: "Trending Arts",
    styles: ["Abstract", "Oil Painting", "Watercolor", "Modern Canvas", "Fantasy", "Landscape", "Nature", "Street Art", "Mixed Media", "Colorful Illustration", "Creative Paintings", "Contemporary Art"],
    titlePrefixes: ["Echoes of", "Vision of", "Dream in", "Colors of", "Light and", "Shadows on", "Essence of", "Whispers in"],
    titleSuffixes: ["the Horizon", "Eternity", "the Soul", "Time", "the Wild", "Silence", "the City", "Nature"]
  },
  {
    fileName: "traditionalArts",
    categoryName: "Traditional Arts",
    styles: ["Madhubani", "Warli", "Pattachitra", "Miniature Painting", "Tanjore", "Kalamkari", "Chinese Ink", "Japanese Traditional", "African Tribal", "Persian Art", "Folk Art", "Ancient Art"],
    titlePrefixes: ["Heritage of", "Ancient", "Tale of", "Spirit of", "Legacy of", "Roots of", "Cultural", "Myth of"],
    titleSuffixes: ["the Ancestors", "the Gods", "the Village", "Empires", "the Forest", "Tradition", "the Past", "the Land"]
  },
  {
    fileName: "digitalArts",
    categoryName: "Digital Arts",
    styles: ["Concept Art", "Sci-Fi", "Cyberpunk", "Fantasy", "Game Art", "3D Illustration", "Digital Painting", "Character Design", "Environment Art", "Matte Painting", "Futuristic", "Neon Artwork"],
    titlePrefixes: ["Neon", "Cyber", "Virtual", "Future", "Cosmic", "Synthetic", "Digital", "Holo"],
    titleSuffixes: ["Dreams", "Cityscape", "Warrior", "Realm", "Nexus", "Odyssey", "Matrix", "Frontier"]
  },
  {
    fileName: "animeSketches",
    categoryName: "Anime Sketches",
    styles: ["Anime Boy", "Anime Girl", "Pencil Sketch", "Manga", "Original Character", "Action Pose", "Cute Chibi", "Black & White Sketch", "Fantasy Character", "Japanese Sketch Style"],
    titlePrefixes: ["Wandering", "Hidden", "Silent", "Brave", "Lost", "Fallen", "Rising", "Eternal"],
    titleSuffixes: ["Samurai", "Soul", "Hero", "Guardian", "Wanderer", "Spirit", "Blade", "Dreamer"]
  },
  {
    fileName: "mandalaDesigns",
    categoryName: "Mandala Designs",
    styles: ["Lotus", "Circular", "Black Ink", "Colorful", "Geometric", "Sacred Geometry", "Henna", "Floral", "Zentangle", "Meditation Designs", "Detailed Patterns"],
    titlePrefixes: ["Sacred", "Inner", "Infinite", "Cosmic", "Mystic", "Zen", "Floral", "Spiritual"],
    titleSuffixes: ["Circle", "Balance", "Symmetry", "Harmony", "Energy", "Focus", "Bloom", "Tranquility"]
  },
  {
    fileName: "creativePortraits",
    categoryName: "Creative Portraits",
    styles: ["Pencil Portrait", "Charcoal Portrait", "Watercolor Portrait", "Digital Portrait", "Fantasy Portrait", "Female Portrait", "Male Portrait", "Hyper Realistic", "Color Splash", "Creative Illustration"],
    titlePrefixes: ["Gaze of", "Portrait of", "Soul of", "Eyes of", "Face of", "Shadow of", "Light of", "Expression of"],
    titleSuffixes: ["a Stranger", "Youth", "Wisdom", "the Muse", "Sorrow", "Joy", "Mystery", "the Unknown"]
  }
];

let globalIdCounter = 1;

categories.forEach(cat => {
  const artworks = [];
  
  for (let i = 0; i < 100; i++) {
    const style = rand(cat.styles);
    const title = `${rand(cat.titlePrefixes)} ${rand(cat.titleSuffixes)}`;
    const artist = generateArtist();
    
    const prompt = `${cat.categoryName}, ${style}, ${title} artwork by ${artist}, high quality, beautiful, detailed, masterpiece art, iteration ${i}`;
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=1000&nologo=true`;
    
    artworks.push({
      id: globalIdCounter++,
      title: title,
      artist: artist,
      category: cat.categoryName,
      description: `A stunning ${style.toLowerCase()} artwork exploring themes of ${title.toLowerCase()}. Created in ${rand(years)} by ${artist}.`,
      image: imageUrl,
      likes: randInt(50, 5000),
      views: randInt(1000, 50000),
      year: rand(years),
      style: style
    });
  }

  const fileContent = `export interface GalleryArtwork {
  id: number;
  title: string;
  artist: string;
  category: string;
  description: string;
  image: string;
  likes: number;
  views: number;
  year: number;
  style: string;
}

export const ${cat.fileName}: GalleryArtwork[] = ${JSON.stringify(artworks, null, 2)};
`;

  fs.writeFileSync(path.join(galleryDir, `${cat.fileName}.ts`), fileContent);
  console.log(`Generated ${cat.fileName}.ts with 100 artworks.`);
});

console.log("Successfully generated all 600 artworks!");
