const fs = require('fs');
const path = require('path');
const https = require('https');

const outDir = path.join(__dirname, '../../public/assets/gallery/digital');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

const downloadImage = (url, filepath, attempt = 1) => new Promise((resolve, reject) => {
  if (attempt > 3) return reject(new Error('Too many redirects or retries'));
  
  https.get(url, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      res.resume(); // CRITICAL: consume the response data so the socket doesn't hang
      return downloadImage(res.headers.location, filepath, attempt + 1).then(resolve).catch(reject);
    }
    if (res.statusCode !== 200) {
      res.resume();
      return reject(new Error(`Status: ${res.statusCode}`));
    }
    const stream = fs.createWriteStream(filepath);
    res.pipe(stream);
    stream.on('finish', () => { stream.close(); resolve(true); });
    stream.on('error', (e) => { fs.unlink(filepath, () => reject(e)); });
  }).on('error', reject).setTimeout(10000, function() { this.destroy(); reject(new Error('Timeout')); });
});

// Prompts inspired closely by the user's uploaded Pinterest images
const basePrompts = [
  "digital illustration close up portrait beautiful girl face warm lighting vivid colors stylized digital painting artstation behance pinterest style",
  "digital art close up of an eye looking through purple flowers anime aesthetic watercolor digital blending pinterest style",
  "digital painting close up portrait girl covering one eye with bright yellow sunflower aesthetic lighting freckles hyper detailed",
  "stylized digital illustration dark skin beautiful woman glowing match stick in mouth neon warm lighting vector art style",
  "aesthetic anime style digital painting close up girl face surrounded by glowing flora fantasy pastel colors",
  "digital portrait painting beautiful young woman vibrant pop art colors dramatic lighting aesthetic digital art",
  "digital sketch stylized face of a girl aesthetic warm colors highly detailed pinterest art style",
  "beautiful digital illustration anime style eye close up colorful aesthetic floral elements",
  "digital illustration female character sunflower warm golden hour lighting beautiful stylized art",
  "aesthetic digital portrait vibrant orange and pink lighting stylized character design",
];

const styles = ["Concept Art", "Digital Illustration", "Digital Painting", "Character Design", "Pop Art", "Anime Aesthetic"];
const artists = ["Aiko Tanaka", "Liam Smith", "Olivia Johnson", "Mia Martinez", "Ethan Jackson", "Yuki Nakamura", "Sofia Gonzalez"];

async function main() {
  console.log('Downloading 40 Pinterest-style digital artworks locally...');
  
  const artworks = [];
  let idCounter = 201;

  for (let i = 0; i < 40; i++) {
    const promptSeed = basePrompts[i % basePrompts.length];
    // Add variations to make each prompt unique
    const uniquePrompt = `${promptSeed} masterpiece high quality 8k unique variation ${i}`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(uniquePrompt)}?width=800&height=1000&nologo=true`;
    const filename = `${i + 1}.jpg`;
    const filepath = path.join(outDir, filename);

    try {
      console.log(`Downloading ${filename}...`);
      await downloadImage(url, filepath);
      
      const titlePrefixes = ["Golden", "Neon", "Silent", "Vivid", "Mystic", "Aesthetic", "Floral", "Digital"];
      const titleSuffixes = ["Gaze", "Dream", "Bloom", "Aura", "Portrait", "Vision", "Light"];
      const title = `${titlePrefixes[Math.floor(Math.random()*titlePrefixes.length)]} ${titleSuffixes[Math.floor(Math.random()*titleSuffixes.length)]}`;
      
      artworks.push({
        id: idCounter++,
        title: title,
        artist: artists[Math.floor(Math.random() * artists.length)],
        category: "Digital Arts",
        description: "A stunning digital illustration with vibrant colors and beautiful stylized aesthetic.",
        image: `/assets/gallery/digital/${filename}`,
        likes: Math.floor(Math.random() * 8000) + 1500,
        views: Math.floor(Math.random() * 50000) + 5000,
        year: 2024,
        style: styles[Math.floor(Math.random() * styles.length)]
      });

      await delay(500); // 0.5s delay to avoid rate limits
    } catch (e) {
      console.error(`Failed to download ${filename}:`, e.message);
    }
  }

  // Multiply to get 100 items for the masonry grid
  const fullArtworks = [];
  while (fullArtworks.length < 100) {
    const base = artworks[fullArtworks.length % artworks.length];
    fullArtworks.push({
      ...base,
      id: 201 + fullArtworks.length,
      likes: Math.floor(Math.random() * 8000) + 1500,
      views: Math.floor(Math.random() * 50000) + 5000,
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

export const digitalArts: GalleryArtwork[] = ${JSON.stringify(fullArtworks, null, 2)};
`;
  
  const tsPath = path.join(__dirname, '../galleryData/digitalArts.ts');
  fs.writeFileSync(tsPath, tsContent);
  console.log(`Saved ${tsPath} with ${fullArtworks.length} items`);
  console.log('Done!');
}

main();
