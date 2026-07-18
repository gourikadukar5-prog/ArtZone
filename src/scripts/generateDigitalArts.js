const fs = require('fs');
const path = require('path');

const localImages = [
  'user1.png',
  'user2.png',
  'user3.png',
  '1.jpg',
  '2.jpg',
  '3.jpg'
];

const styles = ["Concept Art", "Digital Illustration", "Digital Painting", "Character Design", "Pop Art", "Anime Aesthetic"];
const artists = ["Aiko Tanaka", "Liam Smith", "Olivia Johnson", "Mia Martinez", "Ethan Jackson", "Yuki Nakamura", "Sofia Gonzalez"];

const titlePrefixes = ["Golden", "Neon", "Silent", "Vivid", "Mystic", "Aesthetic", "Floral", "Digital"];
const titleSuffixes = ["Gaze", "Dream", "Bloom", "Aura", "Portrait", "Vision", "Light"];

const fullArtworks = [];
for (let i = 0; i < 100; i++) {
  const imgName = localImages[i % localImages.length];
  const title = `${titlePrefixes[Math.floor(Math.random()*titlePrefixes.length)]} ${titleSuffixes[Math.floor(Math.random()*titleSuffixes.length)]}`;
  
  fullArtworks.push({
    id: 201 + i,
    title: title,
    artist: artists[Math.floor(Math.random() * artists.length)],
    category: "Digital Arts",
    description: "A stunning digital illustration with vibrant colors and beautiful stylized aesthetic.",
    image: `/assets/gallery/digital/${imgName}`,
    likes: Math.floor(Math.random() * 8000) + 1500,
    views: Math.floor(Math.random() * 50000) + 5000,
    year: 2024,
    style: styles[Math.floor(Math.random() * styles.length)]
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
