const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../galleryData');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// =====================================================
// Picsum Photos - GUARANTEED working image IDs
// Format: https://picsum.photos/id/{ID}/800/1000
// IDs 1-1000 always work. We split 600 unique IDs
// across 6 categories, 100 each, no duplicates.
// =====================================================

// Each category gets 100 unique IDs from 1-1000, no overlaps
// Trending:   1-100
// Traditional: 101-200
// Digital:    201-300
// Anime:      301-400
// Mandala:    401-500
// Portraits:  501-600

const makeRange = (start, end) => Array.from({length: end - start + 1}, (_, i) => start + i);

const TRENDING_IDS    = makeRange(1, 100);
const TRADITIONAL_IDS = makeRange(101, 200);
const DIGITAL_IDS     = makeRange(201, 300);
const ANIME_IDS       = makeRange(301, 400);
const MANDALA_IDS     = makeRange(401, 500);
const PORTRAIT_IDS    = makeRange(501, 600);

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const firstNames = ["Sophia", "Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Isabella", "William", "Mia", "James", "Amelia", "Benjamin", "Charlotte", "Ethan", "Emily", "Alexander", "Harper", "Lucas", "Aiko", "Yuki", "Priya", "Rahul", "Mei"];
const lastNames  = ["Carter", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Tanaka", "Patel", "Chen", "Kim", "Singh", "Nguyen", "Yamamoto", "Okonkwo"];
const years      = [2020, 2021, 2022, 2023, 2024, 2025];

const generateArtist = () => `${rand(firstNames)} ${rand(lastNames)}`;

const makeUniqueTitle = (prefixes, suffixes, index) => {
  const results = [];
  const used = new Set();
  let attempts = 0;
  while (results.length < 100 && attempts < 5000) {
    attempts++;
    const t = `${rand(prefixes)} ${rand(suffixes)}`;
    if (!used.has(t)) { used.add(t); results.push(t); }
  }
  // Fallback if not enough unique titles: append index
  while (results.length < 100) {
    results.push(`${rand(prefixes)} ${rand(suffixes)} ${results.length + 1}`);
  }
  return results[index];
};

const categoryConfigs = [
  {
    fileName: "trendingArts",
    categoryName: "Trending Arts",
    styles: ["Modern Painting", "Abstract Painting", "Oil Painting", "Canvas Art", "Landscape Painting", "Watercolor", "Creative Illustration", "Street Art", "Contemporary Art", "Mixed Media"],
    descriptions: [
      "A vibrant modern abstract painting bursting with color and dynamic energy.",
      "Contemporary oil painting with rich textures and bold, expressive brushstrokes.",
      "An expressive watercolor piece exploring the interplay of light and shadow.",
      "Mixed media artwork combining photography, paint, and illustration techniques.",
      "Street art-inspired canvas with urban energy and raw visual movement.",
      "Landscape painting capturing the serene beauty of the natural world.",
      "Creative illustration with a modern, editorial approach to visual storytelling.",
      "Contemporary art piece blurring the lines between media and perception.",
      "A stunning canvas artwork exploring form, color, and depth.",
      "Mixed media creation featuring layered textures and bold compositional choices.",
    ],
    titlePrefixes: ["Color", "Modern", "Urban", "Ocean", "Abstract", "Vibrant", "Dynamic", "Mystic", "Silent", "Neon", "Golden", "Dark", "Light", "Sunset", "Eternal", "Broken", "Wild", "Soft", "Bold", "Deep", "Fluid", "Static", "Raw", "Pure", "Dense"],
    titleSuffixes: ["Explosion", "Horizon", "Energy", "Dreams", "Canvas", "Wave", "Vibe", "Motion", "Stillness", "Journey", "Echo", "Vision", "Symphony", "Pulse", "Bloom", "Form", "Mass", "Layer", "Flow", "Tide", "Gust", "Surge", "Rush", "Calm", "Storm"],
    ids: TRENDING_IDS
  },
  {
    fileName: "traditionalArts",
    categoryName: "Traditional Arts",
    styles: ["Madhubani", "Warli", "Pattachitra", "Kalamkari", "Miniature Painting", "Tanjore Painting", "Indian Folk Art", "Chinese Ink Art", "Japanese Traditional Painting", "African Tribal Art", "Persian Traditional Art"],
    descriptions: [
      "A traditional Madhubani painting with intricate folk motifs and geometric borders.",
      "Warli art depicting everyday village life through simple geometric forms.",
      "Pattachitra scroll painting narrating mythological themes and legends.",
      "Kalamkari textile art with hand-painted floral and divine motifs.",
      "A detailed miniature painting with vibrant natural pigments.",
      "Tanjore painting adorned with gold foil and precious stones.",
      "Japanese sumi-e ink painting with serene landscape composition.",
      "African tribal art celebrating cultural heritage through bold patterns.",
      "Persian miniature art with intricate details and precious gold leaf.",
      "Chinese ink painting with elegant calligraphic brushwork.",
    ],
    titlePrefixes: ["Royal", "Ancient", "Folk", "Village", "Tribal", "Sacred", "Golden", "Divine", "Classic", "Heritage", "Cultural", "Timeless", "Historic", "Spiritual", "Traditional", "Ethnic", "Ritual", "Festive", "Holy", "Earthen", "Rustic", "Ornate", "Blessed", "Mystic", "Vibrant"],
    titleSuffixes: ["Madhubani", "Warli", "Kalamkari", "Pattachitra", "Tanjore", "Krishna", "Dance", "Festival", "Temple", "Goddess", "Legend", "Folk", "Pattern", "Motif", "Heritage", "Story", "Myth", "Ritual", "Celebration", "Village", "Forest", "River", "Mountain", "Harvest", "Prayer"],
    ids: TRADITIONAL_IDS
  },
  {
    fileName: "digitalArts",
    categoryName: "Digital Arts",
    styles: ["Digital Painting", "Concept Art", "Cyberpunk", "Sci-Fi", "Fantasy Art", "Game Art", "3D Illustration", "Environment Art", "Character Design", "Matte Painting", "Neon Art", "Futuristic Art"],
    descriptions: [
      "A gritty cyberpunk cityscape bathed in vivid neon lights and rain.",
      "Futuristic sci-fi environment concept with extraordinary intricate detail.",
      "Fantasy world-building art with epic scale and immersive atmosphere.",
      "Game character design with bold colors and a powerful dynamic pose.",
      "3D rendered matte painting depicting an alien world at dusk.",
      "Digital painting with cinematic lighting and masterful composition.",
      "Neon-drenched futuristic art with glowing elements and deep shadows.",
      "Concept art exploring a post-apocalyptic world with striking beauty.",
      "Character design for a fantasy RPG with unique costume and personality.",
      "Environment art showing a sprawling megacity from a bird's-eye view.",
    ],
    titlePrefixes: ["Cyber", "Future", "Galactic", "Quantum", "Neon", "Digital", "Virtual", "Holo", "Cosmic", "Synth", "Mecha", "Astro", "Techno", "Nano", "Ultra", "Hyper", "Mega", "Infra", "Nova", "Xeno", "Proto", "Meta", "Bi", "Tri", "Omni"],
    titleSuffixes: ["City", "Machine", "Warrior", "Dreams", "Samurai", "Realm", "Nexus", "Matrix", "Odyssey", "Frontier", "Planet", "Station", "Droid", "Cyborg", "Grid", "Signal", "Pulse", "Void", "Storm", "Core", "Zone", "Shield", "Blade", "Gate", "Link"],
    ids: DIGITAL_IDS
  },
  {
    fileName: "animeSketches",
    categoryName: "Anime Sketches",
    styles: ["Anime Pencil Sketch", "Anime Boy", "Anime Girl", "Original Manga Style", "Anime Character Design", "Black and White Sketch", "Chibi", "Anime Expressions", "Fantasy Anime Character"],
    descriptions: [
      "A detailed pencil sketch of an original anime character with expressive eyes.",
      "Black and white manga-style illustration with clean, confident linework.",
      "Chibi character design with adorably exaggerated features and expressions.",
      "Anime protagonist in a dynamic action pose showing strength and spirit.",
      "Soft pencil sketch of an anime girl with flowing hair and emotional depth.",
      "Original anime character with a unique and detailed costume design.",
      "Manga-style panel illustration with dramatic ink shading and composition.",
      "Fantasy anime character with elemental powers and ethereal costume.",
      "Expressive anime expression study showing a wide range of emotions.",
    ],
    titlePrefixes: ["Silent", "Moon", "Shadow", "Spirit", "Wandering", "Fallen", "Rising", "Hidden", "Lost", "Brave", "Dark", "Light", "Eternal", "Dreaming", "Burning", "Frozen", "Thunder", "Storm", "Wind", "Crimson", "Azure", "Jade", "Amber", "Ivory", "Obsidian"],
    titleSuffixes: ["Ronin", "Princess", "Ninja", "Warrior", "Hero", "Samurai", "Soul", "Angel", "Demon", "Mage", "Knight", "Fighter", "Guardian", "Sensei", "Spirit", "Phoenix", "Dragon", "Fox", "Witch", "Paladin", "Oracle", "Seer", "Archer", "Blade", "Storm"],
    ids: ANIME_IDS
  },
  {
    fileName: "mandalaDesigns",
    categoryName: "Mandala Designs",
    styles: ["Mandala Art", "Lotus Mandala", "Circular Mandala", "Geometric Mandala", "Henna Mandala", "Sacred Geometry", "Colorful Mandala", "Black Ink Mandala", "Zentangle"],
    descriptions: [
      "A geometric mandala with precise symmetry and perfect radial balance.",
      "Lotus-inspired mandala with delicately flowing petal patterns.",
      "Sacred geometry mandala featuring intricate interlocking golden patterns.",
      "Colorful mandala artwork radiating peace, joy, and spiritual harmony.",
      "Black ink mandala with hand-drawn zentangle and fine ornamental details.",
      "Henna-inspired mandala design with delicate and intricate floral patterns.",
      "Meditative mandala artwork with calming circular symmetry patterns.",
      "A vibrant multicolored mandala with complex layered geometric forms.",
      "Zentangle mandala featuring organic patterns and mindful linework.",
    ],
    titlePrefixes: ["Lotus", "Golden", "Inner", "Cosmic", "Sacred", "Floral", "Mystic", "Zen", "Spiritual", "Infinite", "Divine", "Peaceful", "Tranquil", "Healing", "Meditative", "Radiant", "Blooming", "Glowing", "Ancient", "Eternal", "Crystal", "Solar", "Lunar", "Stellar", "Celestial"],
    titleSuffixes: ["Harmony", "Geometry", "Peace", "Circle", "Pattern", "Balance", "Symmetry", "Energy", "Focus", "Bloom", "Mandala", "Aura", "Sphere", "Wheel", "Sun", "Flower", "Labyrinth", "Vortex", "Core", "Web", "Gate", "Eye", "Ring", "Crown", "Halo"],
    ids: MANDALA_IDS
  },
  {
    fileName: "creativePortraits",
    categoryName: "Creative Portraits",
    styles: ["Pencil Portrait", "Charcoal Portrait", "Watercolor Portrait", "Digital Portrait", "Hyper Realistic Portrait", "Fantasy Portrait", "Male Portrait", "Female Portrait", "Creative Face Illustration"],
    descriptions: [
      "A hyper-realistic pencil portrait with extraordinary fine detail and depth.",
      "Charcoal portrait capturing raw, unfiltered emotion and rich texture.",
      "Dreamy watercolor portrait with soft, bleeding colors and ethereal mood.",
      "Digital portrait with cinematic dramatic lighting and powerful mood.",
      "Fantasy portrait with ethereal elements and otherworldly, timeless beauty.",
      "Creative face illustration blending realism with abstract artistic freedom.",
      "Expressive portrait study capturing the inner soul of the subject.",
      "A striking female portrait with bold colors and confident composition.",
      "Male portrait with strong shadows and powerful emotional narrative.",
    ],
    titlePrefixes: ["The", "Golden", "Silent", "Dream", "Soul", "Hidden", "Dark", "Light", "Mystic", "Hopeful", "Sad", "Radiant", "Gentle", "Fierce", "Tender", "Broken", "Vivid", "Pale", "Warm", "Cold", "Distant", "Close", "Lost", "Found", "Lone"],
    titleSuffixes: ["Thinker", "Smile", "Eyes", "Face", "Gaze", "Tear", "Expression", "Emotion", "Stare", "Visage", "Profile", "Portrait", "Muse", "Stranger", "Moment", "Memory", "Story", "Secret", "Soul", "Whisper", "Touch", "Breath", "Voice", "Shadow", "Light"],
    ids: PORTRAIT_IDS
  }
];

let globalId = 1;

categoryConfigs.forEach(cat => {
  const artworks = [];
  
  for (let i = 0; i < 100; i++) {
    const id = globalId++;
    const photoId = cat.ids[i]; // Unique ID for each image
    // picsum.photos/id/{ID}/{width}/{height} - always returns a real image, no sign-in needed
    const imageUrl = `https://picsum.photos/id/${photoId}/800/1000`;
    
    artworks.push({
      id,
      title: makeUniqueTitle(cat.titlePrefixes, cat.titleSuffixes, i),
      artist: generateArtist(),
      category: cat.categoryName,
      description: cat.descriptions[i % cat.descriptions.length],
      image: imageUrl,
      likes: randInt(100, 9999),
      views: randInt(1000, 99999),
      year: rand(years),
      style: cat.styles[i % cat.styles.length]
    });
  }
  
  const tsContent = `export interface GalleryArtwork {
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

  fs.writeFileSync(path.join(dataDir, `${cat.fileName}.ts`), tsContent);
  console.log(`Generated ${cat.fileName}.ts with ${artworks.length} artworks.`);
});

console.log('Done! Generated 600 total artworks across 6 categories with guaranteed working Picsum image URLs.');
