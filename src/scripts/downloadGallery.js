const fs = require('fs');
const path = require('path');
const https = require('https');

const publicDir = path.join(__dirname, '../../public/assets/gallery');
const dataDir = path.join(__dirname, '../galleryData');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const firstNames = ["Sophia", "Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Isabella", "William", "Mia", "James", "Amelia", "Benjamin"];
const lastNames = ["Carter", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez"];
const years = [2021, 2022, 2023, 2024, 2025];
const generateArtist = () => `${rand(firstNames)} ${rand(lastNames)}`;

const generateTitles = (prefixes, suffixes) => {
  const titles = new Set();
  while (titles.size < 100) {
    titles.add(`${rand(prefixes)} ${rand(suffixes)}`);
  }
  return Array.from(titles);
};

const categories = [
  {
    fileName: "trendingArts",
    categoryName: "Trending Arts",
    folder: "trending",
    styles: ["Modern Paintings", "Abstract Paintings", "Oil Paintings", "Canvas Art", "Landscape Paintings", "Watercolor", "Creative Illustration", "Street Art", "Contemporary Art", "Mixed Media"],
    titlePrefixes: ["Color", "Modern", "Urban", "Ocean", "Abstract", "Vibrant", "Dynamic", "Mystic", "Silent", "Neon", "Golden", "Dark", "Light", "Sunset", "Sunrise", "Eternal"],
    titleSuffixes: ["Explosion", "Horizon", "Energy", "Dreams", "Nature", "City", "Canvas", "Wave", "Vibe", "Motion", "Stillness", "Path", "Journey", "Echo", "Vision", "Symphony"]
  },
  {
    fileName: "traditionalArts",
    categoryName: "Traditional Arts",
    folder: "traditional",
    styles: ["Madhubani", "Warli", "Pattachitra", "Kalamkari", "Miniature Painting", "Tanjore Painting", "Indian Folk Art", "Chinese Ink Art", "Japanese Traditional Painting", "African Tribal Art", "Persian Traditional Art"],
    titlePrefixes: ["Royal", "Ancient", "Folk", "Village", "Tribal", "Sacred", "Golden", "Divine", "Classic", "Heritage", "Cultural", "Timeless", "Historic", "Spiritual", "Traditional", "Ethnic"],
    titleSuffixes: ["Madhubani", "Village", "Kalamkari", "Krishna", "Heritage", "Dance", "Festival", "Temple", "Gods", "Legend", "Story", "Tale", "Myth", "Ritual", "Pattern", "Motif"]
  },
  {
    fileName: "digitalArts",
    categoryName: "Digital Arts",
    folder: "digital",
    styles: ["Digital Painting", "Concept Art", "Cyberpunk", "Sci-Fi", "Fantasy Art", "Game Art", "3D Illustration", "Environment Art", "Character Design", "Matte Painting", "Neon Art", "Futuristic Art"],
    titlePrefixes: ["Cyber", "Future", "Galactic", "Quantum", "Neon", "Digital", "Virtual", "Holo", "Cosmic", "Synth", "Robo", "Astro", "Mecha", "Pixel", "Vector", "Crypto"],
    titleSuffixes: ["City", "Machine", "Warrior", "Dreams", "Samurai", "Realm", "Nexus", "Matrix", "Odyssey", "Frontier", "Planet", "Station", "Ship", "Droid", "Cyborg", "Grid"]
  },
  {
    fileName: "animeSketches",
    categoryName: "Anime Sketches",
    folder: "anime",
    styles: ["Anime Pencil Sketches", "Anime Boy", "Anime Girl", "Original Manga Style", "Black & White Anime Drawings", "Chibi", "Anime Expressions", "Anime Character Design", "Japanese Sketch Style"],
    titlePrefixes: ["Silent", "Moon", "Shadow", "Chibi", "Spirit", "Wandering", "Fallen", "Rising", "Hidden", "Lost", "Brave", "Dark", "Light", "Eternal", "Crying", "Smiling"],
    titleSuffixes: ["Ronin", "Princess", "Ninja", "Dreams", "Warrior", "Boy", "Girl", "Hero", "Samurai", "Soul", "Angel", "Demon", "Mage", "Knight", "Fighter", "Student"]
  },
  {
    fileName: "mandalaDesigns",
    categoryName: "Mandala Designs",
    folder: "mandala",
    styles: ["Mandala Art", "Circular Mandalas", "Lotus Mandalas", "Geometric Mandalas", "Henna Mandalas", "Black Ink Mandalas", "Colorful Mandalas", "Sacred Geometry", "Zentangle", "Decorative Mandalas"],
    titlePrefixes: ["Lotus", "Golden", "Inner", "Cosmic", "Sacred", "Floral", "Mystic", "Zen", "Spiritual", "Infinite", "Divine", "Peaceful", "Tranquil", "Healing", "Meditative", "Harmonious"],
    titleSuffixes: ["Harmony", "Geometry", "Peace", "Mandala", "Circle", "Pattern", "Balance", "Symmetry", "Energy", "Focus", "Bloom", "Vibe", "Aura", "Sphere", "Wheel", "Sun"]
  },
  {
    fileName: "creativePortraits",
    categoryName: "Creative Portraits",
    folder: "portraits",
    styles: ["Pencil Portraits", "Charcoal Portraits", "Watercolor Portraits", "Digital Portraits", "Realistic Faces", "Fantasy Portraits", "Female Portraits", "Male Portraits", "Hyper Realistic Portraits", "Creative Face Illustration"],
    titlePrefixes: ["The", "Golden", "Silent", "Dream", "Soul", "Hidden", "Lost", "Dark", "Light", "Mystic", "Beautiful", "Sad", "Happy", "Tearful", "Intense", "Soft"],
    titleSuffixes: ["Thinker", "Smile", "Eyes", "Face", "Reflection", "Gaze", "Tear", "Expression", "Emotion", "Look", "Stare", "Visage", "Profile", "Portrait", "Muse", "Stranger"]
  }
];

const downloadImage = (url, filepath, retries = 5) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const stream = fs.createWriteStream(filepath);
        res.pipe(stream);
        stream.on('finish', () => resolve(true));
        stream.on('error', reject);
      } else if (res.statusCode === 429 || res.statusCode >= 500) {
        if (retries > 0) {
          console.log(`Rate limited or server error (${res.statusCode}). Retrying in 5 seconds... (${retries} retries left)`);
          setTimeout(() => {
            downloadImage(url, filepath, retries - 1).then(resolve).catch(reject);
          }, 5000);
        } else {
          reject(new Error(`Failed with status ${res.statusCode} after max retries`));
        }
      } else {
        reject(new Error(`Failed with status ${res.statusCode}`));
      }
    }).on('error', (err) => {
      if (retries > 0) {
        setTimeout(() => {
          downloadImage(url, filepath, retries - 1).then(resolve).catch(reject);
        }, 5000);
      } else {
        reject(err);
      }
    });
  });
};

const delay = (ms) => new Promise(res => setTimeout(res, ms));

let globalIdCounter = 1;

async function generateAll() {
  for (const cat of categories) {
    console.log(`Processing category: ${cat.categoryName}`);
    const catDir = path.join(publicDir, cat.folder);
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

    const titles = generateTitles(cat.titlePrefixes, cat.titleSuffixes);
    const artworks = [];

    // Download sequentially to avoid rate limits entirely
    for (let i = 0; i < 100; i++) {
      const title = titles[i];
      const style = rand(cat.styles);
      const artist = generateArtist();
      const id = globalIdCounter++;
      
      const localImagePath = `/assets/gallery/${cat.folder}/${id}.jpg`;
      const absolutePath = path.join(catDir, `${id}.jpg`);
      
      // Clean prompt for pollinations (no special chars)
      const promptText = `${cat.categoryName}, ${style}, ${title} artwork, high quality, masterpiece, beautiful illustration.`;
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=600&height=800&nologo=true&seed=${id}`;

      artworks.push({
        id,
        title,
        artist,
        category: cat.categoryName,
        description: `A stunning ${style.toLowerCase()} exploring themes of ${title.toLowerCase()}.`,
        image: localImagePath,
        likes: randInt(100, 5000),
        views: randInt(1000, 20000),
        year: rand(years),
        style
      });

      // Skip download if the file already exists (allows resuming if script was interrupted)
      if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).size === 0) {
        try {
          await downloadImage(url, absolutePath);
          console.log(`  Downloaded image ${i+1}/100 for ${cat.folder}`);
        } catch (err) {
          console.error(`Failed to download ID ${id}:`, err);
        }
        await delay(1000); // Wait 1 second between requests
      } else {
        console.log(`  Skipped image ${i+1}/100 for ${cat.folder} (already exists)`);
      }
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
    console.log(`Finished ${cat.categoryName}`);
  }
  
  console.log("ALL DONE!");
}

generateAll();
