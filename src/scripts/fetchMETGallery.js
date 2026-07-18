/**
 * fetchMETGallery.js  (FIXED - uses department IDs for precision)
 *
 * MET Museum Department IDs:
 *   6  = Asian Art (Japanese woodblock, Chinese, Indian, Tibetan)
 *   9  = Drawings and Prints (portraits, sketches, illustrations)
 *   11 = European Paintings (oil, watercolor, landscape, abstract)
 *   14 = Islamic Art (geometric patterns, arabesque, mandala-like)
 *   21 = Modern Art (contemporary, expressionist, abstract modern)
 *   5  = Arts of Africa, Oceania (tribal, traditional folk)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../galleryData');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const delay = ms => new Promise(r => setTimeout(r, ms));

const httpGet = (url) => new Promise((resolve) => {
  const req = https.get(url, { headers: { 'User-Agent': 'ArtZone/1.0 (educational)' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch { resolve(null); }
    });
  });
  req.on('error', () => resolve(null));
  req.setTimeout(10000, () => { req.destroy(); resolve(null); });
});

// With departmentId for precision, no isPublicDomain filter (too restrictive)
const MET_SEARCH = (q, deptId) =>
  `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(q)}&departmentId=${deptId}`;
const MET_SEARCH_MULTI = (q) =>
  `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(q)}`;
const MET_OBJ = id =>
  `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;

const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

const ARTISTS = [
  'Sophia Carter', 'Liam Smith', 'Olivia Johnson', 'Noah Williams', 'Emma Brown',
  'Oliver Jones', 'Ava Garcia', 'Elijah Miller', 'Isabella Davis', 'William Rodriguez',
  'Mia Martinez', 'James Hernandez', 'Amelia Taylor', 'Benjamin Anderson', 'Charlotte Thomas',
  'Ethan Jackson', 'Emily White', 'Alexander Harris', 'Harper Martin', 'Lucas Thompson',
  'Aiko Tanaka', 'Yuki Nakamura', 'Priya Patel', 'Rahul Singh', 'Mei Chen',
  'Diego Ramirez', 'Sofia Gonzalez', 'Nina Kovacs', 'Leila Hassan', 'Marco Rossi'
];
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];

// ─── Category Definitions ────────────────────────────────────────────────────
// searchTerms: [ [query, departmentId], ... ]  (departmentId=0 means no filter)
const categories = [
  {
    fileName: 'trendingArts',
    categoryName: 'Trending Arts',
    styles: ['Modern Painting', 'Abstract Painting', 'Oil Painting', 'Watercolor', 'Contemporary Art', 'Mixed Media', 'Canvas Art', 'Impressionist', 'Landscape Painting', 'Expressionist'],
    // Dept 11=European Paintings, 21=Modern Art, 9=Drawings&Prints
    searchTerms: [
      ['painting', 11],
      ['painting', 21],
      ['watercolor landscape', 11],
      ['abstract', 21],
      ['oil painting', 11],
    ],
    titles: ['Color Explosion','Modern Horizon','Urban Energy','Ocean Dreams','Abstract Nature','Vibrant Canvas','Dynamic Vision','Mystic Wave','Silent Journey','Golden Echo','Wild Symphony','Deep Motion','Fluid Bloom','Bold Surge','Eternal Storm','Color Wave','Modern Dreams','Urban Canvas','Ocean Horizon','Abstract Energy','Vibrant Journey','Dynamic Echo','Mystic Motion','Silent Bloom','Golden Storm','Wild Wave','Deep Canvas','Fluid Horizon','Bold Dreams','Eternal Energy','Color Symphony','Modern Nature','Urban Vision','Ocean Echo','Abstract Canvas','Vibrant Motion','Dynamic Storm','Mystic Dreams','Silent Wave','Golden Energy','Wild Journey','Deep Bloom','Fluid Vision','Bold Nature','Eternal Canvas','Color Horizon','Modern Motion','Urban Storm','Ocean Journey','Abstract Wave','Vibrant Bloom','Dynamic Canvas','Mystic Vision','Silent Energy','Golden Nature','Wild Dreams','Deep Motion','Fluid Symphony','Bold Echo','Eternal Wave','Color Canvas','Modern Energy','Urban Bloom','Ocean Vision','Abstract Storm','Vibrant Journey','Dynamic Nature','Mystic Horizon','Silent Canvas','Golden Dreams','Wild Echo','Deep Energy','Fluid Storm','Bold Wave','Eternal Bloom','Color Vision','Modern Canvas','Urban Echo','Ocean Energy','Abstract Bloom','Vibrant Storm','Dynamic Dreams','Mystic Wave','Silent Nature','Golden Journey','Wild Canvas','Deep Vision','Fluid Echo','Bold Storm','Eternal Dreams','Color Energy','Modern Bloom','Urban Vision','Ocean Canvas','Abstract Journey','Vibrant Echo','Dynamic Horizon','Mystic Energy','Silent Storm','Golden Wave','Wild Bloom','Fluid Flow'],
    descTemplates: [
      'A vibrant oil painting bursting with rich color and dynamic energy.',
      'Contemporary painting with masterful brushstrokes and expressive texture.',
      'Watercolor artwork exploring the delicate interplay of light and shadow.',
      'Abstract canvas with bold shapes and a harmonious color palette.',
      'Stunning impressionist painting with masterful composition and visual depth.',
    ],
  },
  {
    fileName: 'traditionalArts',
    categoryName: 'Traditional Arts',
    styles: ['Madhubani', 'Warli', 'Pattachitra', 'Indian Folk Art', 'Miniature Painting', 'Japanese Traditional', 'Chinese Ink Painting', 'Tibetan Thangka', 'African Tribal Art', 'Persian Art', 'Kalamkari'],
    // Dept 6=Asian Art (Japanese, Chinese, Indian, Tibetan), 5=Africa/Oceania/Americas
    searchTerms: [
      ['painting', 6],
      ['japanese woodblock print', 6],
      ['indian painting', 6],
      ['tibetan', 6],
      ['painting', 5],
      ['folk art', 5],
      ['chinese painting', 6],
      ['persian', 6],
    ],
    titles: ['Royal Heritage','Ancient Dance','Sacred Festival','Golden Temple','Divine Goddess','Classic Legend','Heritage Pattern','Cultural Motif','Timeless Story','Historic Myth','Spiritual Ritual','Traditional Village','Festive Forest','Blessed Mountain','Ornate Prayer','Royal Dance','Ancient Festival','Sacred Temple','Golden Goddess','Divine Legend','Classic Pattern','Heritage Motif','Cultural Story','Timeless Myth','Historic Ritual','Spiritual Village','Traditional Forest','Festive Mountain','Blessed Prayer','Ornate Heritage','Royal Festival','Ancient Temple','Sacred Goddess','Golden Legend','Divine Pattern','Classic Motif','Heritage Story','Cultural Myth','Timeless Ritual','Historic Village','Spiritual Forest','Traditional Mountain','Festive Prayer','Blessed Dance','Ornate Festival','Royal Temple','Ancient Goddess','Sacred Legend','Golden Pattern','Divine Motif','Classic Story','Heritage Myth','Cultural Ritual','Timeless Village','Historic Forest','Spiritual Mountain','Traditional Prayer','Festive Heritage','Blessed Dance','Ornate Temple','Royal Goddess','Ancient Legend','Sacred Pattern','Golden Motif','Divine Story','Classic Myth','Heritage Ritual','Cultural Village','Timeless Forest','Historic Mountain','Spiritual Prayer','Traditional Dance','Festive Temple','Blessed Goddess','Ornate Legend','Royal Pattern','Ancient Motif','Sacred Story','Golden Myth','Divine Ritual','Classic Village','Heritage Forest','Cultural Mountain','Timeless Prayer','Historic Dance','Spiritual Festival','Traditional Temple','Festive Goddess','Blessed Legend','Ornate Pattern','Royal Motif','Ancient Story','Sacred Myth','Golden Ritual','Divine Village','Classic Forest','Heritage Mountain','Cultural Prayer','Timeless Dance','Historic Temple'],
    descTemplates: [
      'A beautiful traditional painting with intricate folk motifs and cultural symbolism.',
      'Masterful traditional artwork depicting legends and mythological themes.',
      'Detailed miniature painting with vibrant pigments and ancient technique.',
      'Heritage artwork preserving ancient artistic traditions and cultural stories.',
      'Exquisite traditional painting with intricate patterns and rich symbolism.',
    ],
  },
  {
    fileName: 'digitalArts',
    categoryName: 'Digital Arts',
    styles: ['Concept Art', 'Cyberpunk', 'Sci-Fi', 'Fantasy Art', 'Game Art', 'Environment Art', 'Character Design', 'Matte Painting', 'Neon Art', 'Futuristic Art', 'Digital Painting', '3D Illustration'],
    // Dept 9=Drawings&Prints (illustrations, posters, prints), 21=Modern Art, 11=European Paintings
    searchTerms: [
      ['illustration', 9],
      ['fantasy', 9],
      ['science fiction', 9],
      ['surreal', 21],
      ['poster illustration', 9],
      ['imaginative illustration', 9],
      ['futurist', 21],
      ['avant-garde', 21],
    ],
    titles: ['Cyber City','Future Machine','Galactic Warrior','Quantum Dreams','Neon Samurai','Digital Realm','Virtual Nexus','Holo Matrix','Cosmic Odyssey','Synth Frontier','Mecha Planet','Astro Station','Nova Signal','Xeno Void','Ultra Storm','Cyber Machine','Future Warrior','Galactic Dreams','Quantum Samurai','Neon Realm','Digital Nexus','Virtual Matrix','Holo Odyssey','Cosmic Frontier','Synth Planet','Mecha Station','Astro Signal','Nova Void','Xeno Storm','Ultra City','Cyber Warrior','Future Dreams','Galactic Samurai','Quantum Realm','Neon Nexus','Digital Matrix','Virtual Odyssey','Holo Frontier','Cosmic Planet','Synth Station','Mecha Signal','Astro Void','Nova Storm','Xeno City','Ultra Machine','Cyber Dreams','Future Samurai','Galactic Realm','Quantum Nexus','Neon Matrix','Digital Odyssey','Virtual Frontier','Holo Planet','Cosmic Station','Synth Signal','Mecha Void','Astro Storm','Nova City','Xeno Machine','Ultra Warrior','Cyber Samurai','Future Realm','Galactic Nexus','Quantum Matrix','Neon Odyssey','Digital Frontier','Virtual Planet','Holo Station','Cosmic Signal','Synth Void','Mecha Storm','Astro City','Nova Machine','Xeno Warrior','Ultra Dreams','Cyber Realm','Future Nexus','Galactic Matrix','Quantum Odyssey','Neon Frontier','Digital Planet','Virtual Station','Holo Signal','Cosmic Void','Synth Storm','Mecha City','Astro Machine','Nova Warrior','Xeno Dreams','Ultra Samurai','Cyber Nexus','Future Matrix','Galactic Odyssey','Quantum Frontier','Neon Planet','Digital Station','Virtual Signal','Holo Void','Cosmic Storm','Synth City'],
    descTemplates: [
      'A stunning digital artwork with intricate futuristic detail and immersive atmosphere.',
      'Epic concept art exploring imaginative worlds and compelling characters.',
      'Cinematic artwork with masterful lighting and dramatic composition.',
      'Bold fantasy artwork pushing the boundaries of imagination and creativity.',
      'Immersive environment art with rich world-building and visual storytelling.',
    ],
  },
  {
    fileName: 'animeSketches',
    categoryName: 'Anime Sketches',
    styles: ['Japanese Woodblock Print', 'Ukiyo-e', 'Japanese Print Art', 'Edo Period Art', 'Kabuki Art', 'Japanese Portrait', 'Japanese Character Art', 'Traditional Japanese', 'Manga Style'],
    // Dept 6=Asian Art is perfect for Japanese woodblock prints (ukiyo-e)
    searchTerms: [
      ['japanese woodblock print', 6],
      ['ukiyo-e', 6],
      ['japanese print figure', 6],
      ['kabuki actor print', 6],
      ['japanese woman print', 6],
      ['hiroshige', 6],
      ['hokusai', 6],
      ['kuniyoshi', 6],
      ['kunisada', 6],
    ],
    titles: ['Silent Ronin','Moon Princess','Shadow Ninja','Spirit Warrior','Wandering Samurai','Fallen Hero','Rising Guardian','Hidden Sensei','Brave Spirit','Dark Phoenix','Eternal Dragon','Crimson Fox','Azure Oracle','Jade Archer','Obsidian Storm','Silent Princess','Moon Ninja','Shadow Warrior','Spirit Samurai','Wandering Hero','Fallen Guardian','Rising Sensei','Hidden Spirit','Brave Phoenix','Dark Dragon','Eternal Fox','Crimson Oracle','Azure Archer','Jade Storm','Obsidian Ronin','Silent Warrior','Moon Samurai','Shadow Hero','Spirit Guardian','Wandering Sensei','Fallen Spirit','Rising Phoenix','Hidden Dragon','Brave Fox','Dark Oracle','Eternal Archer','Crimson Storm','Azure Ronin','Jade Princess','Obsidian Ninja','Silent Hero','Moon Guardian','Shadow Sensei','Spirit Phoenix','Wandering Dragon','Fallen Fox','Rising Oracle','Hidden Archer','Brave Storm','Dark Ronin','Eternal Princess','Crimson Ninja','Azure Warrior','Jade Samurai','Obsidian Hero','Silent Guardian','Moon Sensei','Shadow Phoenix','Spirit Dragon','Wandering Fox','Fallen Oracle','Rising Archer','Hidden Storm','Brave Ronin','Dark Princess','Eternal Ninja','Crimson Warrior','Azure Samurai','Jade Hero','Obsidian Guardian','Silent Sensei','Moon Phoenix','Shadow Dragon','Spirit Fox','Wandering Oracle','Fallen Archer','Rising Storm','Hidden Ronin','Brave Princess','Dark Ninja','Eternal Warrior','Crimson Samurai','Azure Hero','Jade Guardian','Obsidian Sensei','Silent Phoenix','Moon Dragon','Shadow Fox','Spirit Oracle','Wandering Archer','Fallen Storm','Rising Ronin','Hidden Princess','Brave Ninja','Dark Warrior','Eternal Samurai'],
    descTemplates: [
      'A stunning Japanese woodblock print with fluid lines and expressive artistry.',
      'Beautiful ukiyo-e print capturing the spirit of Edo period artistic tradition.',
      'Elegant Japanese print with bold outlines and dramatic use of color blocks.',
      'Graceful traditional Japanese illustration with deep cultural heritage.',
      'Masterful woodblock print with intricate detail and timeless emotional depth.',
    ],
  },
  {
    fileName: 'mandalaDesigns',
    categoryName: 'Mandala Designs',
    styles: ['Islamic Geometric Art', 'Sacred Geometry', 'Mandala Art', 'Geometric Mandala', 'Tibetan Mandala', 'Lotus Mandala', 'Colorful Mandala', 'Black Ink Mandala', 'Zentangle', 'Arabesque Pattern'],
    // Dept 14=Islamic Art is perfect for geometric patterns, arabesque
    // Dept 6=Asian Art for Tibetan thangka mandalas
    searchTerms: [
      ['geometric pattern', 14],
      ['arabesque', 14],
      ['tile', 14],
      ['medallion', 14],
      ['thangka', 6],
      ['mandala', 6],
      ['lotus', 6],
      ['ornamental', 14],
      ['decorative', 14],
    ],
    titles: ['Lotus Harmony','Golden Geometry','Inner Peace','Cosmic Mandala','Sacred Circle','Floral Pattern','Mystic Balance','Zen Symmetry','Spiritual Bloom','Infinite Wheel','Divine Sun','Radiant Flower','Ancient Labyrinth','Celestial Vortex','Crystal Core','Lotus Geometry','Golden Peace','Inner Mandala','Cosmic Circle','Sacred Pattern','Floral Balance','Mystic Symmetry','Zen Bloom','Spiritual Wheel','Infinite Sun','Divine Flower','Radiant Labyrinth','Ancient Vortex','Celestial Core','Crystal Harmony','Lotus Peace','Golden Mandala','Inner Circle','Cosmic Pattern','Sacred Balance','Floral Symmetry','Mystic Bloom','Zen Wheel','Spiritual Sun','Infinite Flower','Divine Labyrinth','Radiant Vortex','Ancient Core','Celestial Harmony','Crystal Geometry','Lotus Mandala','Golden Circle','Inner Pattern','Cosmic Balance','Sacred Symmetry','Floral Bloom','Mystic Wheel','Zen Sun','Spiritual Flower','Infinite Labyrinth','Divine Vortex','Radiant Core','Ancient Harmony','Celestial Geometry','Crystal Peace','Lotus Balance','Golden Symmetry','Inner Bloom','Cosmic Wheel','Sacred Sun','Floral Flower','Mystic Labyrinth','Zen Vortex','Spiritual Core','Infinite Harmony','Divine Geometry','Radiant Peace','Ancient Mandala','Celestial Circle','Crystal Pattern','Lotus Symmetry','Golden Bloom','Inner Wheel','Cosmic Sun','Sacred Flower','Floral Labyrinth','Mystic Vortex','Zen Core','Spiritual Harmony','Infinite Geometry','Divine Peace','Radiant Mandala','Ancient Circle','Celestial Pattern','Crystal Balance','Lotus Bloom','Golden Wheel','Inner Sun','Cosmic Flower','Sacred Labyrinth','Floral Vortex','Mystic Core','Zen Harmony','Spiritual Geometry','Infinite Peace'],
    descTemplates: [
      'A stunning geometric artwork with perfect radial symmetry and intricate patterns.',
      'Sacred geometric art radiating spiritual energy and meditative calm.',
      'Detailed ornamental art featuring delicate symmetrical Islamic geometric designs.',
      'Beautiful mandala inspired by ancient geometric traditions of the East.',
      'Intricate circular pattern with mesmerizing layered geometric symmetry.',
    ],
  },
  {
    fileName: 'creativePortraits',
    categoryName: 'Creative Portraits',
    styles: ['Pencil Portrait', 'Charcoal Portrait', 'Watercolor Portrait', 'Oil Portrait', 'Graphite Drawing', 'Hyper Realistic Portrait', 'Fantasy Portrait', 'Portrait Sketch', 'Female Portrait', 'Male Portrait'],
    // Dept 9=Drawings&Prints (charcoal, graphite sketches), 11=European Paintings (oil portraits)
    searchTerms: [
      ['portrait', 9],
      ['portrait drawing', 9],
      ['portrait', 11],
      ['charcoal portrait', 9],
      ['head study', 9],
      ['bust portrait', 9],
      ['face drawing', 9],
      ['portrait sketch', 9],
      ['woman portrait', 11],
      ['man portrait', 11],
    ],
    titles: ['The Thinker','Golden Smile','Silent Eyes','Dream Face','Soul Reflection','Hidden Gaze','Dark Expression','Light Emotion','Mystic Stare','Hopeful Visage','Gentle Profile','Fierce Portrait','Tender Muse','Vivid Memory','Pale Story','The Smile','Golden Eyes','Silent Face','Dream Gaze','Soul Expression','Hidden Emotion','Dark Stare','Light Visage','Mystic Profile','Hopeful Portrait','Gentle Muse','Fierce Memory','Tender Story','Vivid Thinker','Pale Smile','The Eyes','Golden Face','Silent Gaze','Dream Expression','Soul Stare','Hidden Visage','Dark Profile','Light Portrait','Mystic Muse','Hopeful Memory','Gentle Story','Fierce Thinker','Tender Smile','Vivid Eyes','Pale Face','The Gaze','Golden Expression','Silent Stare','Dream Visage','Soul Profile','Hidden Portrait','Dark Muse','Light Memory','Mystic Story','Hopeful Thinker','Gentle Smile','Fierce Eyes','Tender Face','Vivid Gaze','Pale Expression','The Stare','Golden Visage','Silent Profile','Dream Portrait','Soul Muse','Hidden Memory','Dark Story','Light Thinker','Mystic Smile','Hopeful Eyes','Gentle Face','Fierce Gaze','Tender Expression','Vivid Stare','Pale Visage','The Profile','Golden Portrait','Silent Muse','Dream Memory','Soul Story','Hidden Thinker','Dark Smile','Light Eyes','Mystic Face','Hopeful Gaze','Gentle Expression','Fierce Stare','Tender Visage','Vivid Profile','Pale Portrait','The Muse','Golden Memory','Silent Story','Dream Thinker','Soul Smile','Hidden Eyes','Dark Face','Light Gaze','Mystic Expression','Hopeful Stare','Gentle Visage'],
    descTemplates: [
      'A stunning portrait capturing raw emotion and extraordinary fine detail.',
      'Expressive charcoal portrait with masterful shading and lifelike presence.',
      'Sensitive watercolor portrait exploring the inner world of the subject.',
      'Beautiful oil portrait with delicate technique and emotional depth.',
      'Powerful graphite drawing capturing the soul and character of the subject.',
    ],
  },
];

// ─── Fetch batch of objects concurrently (5 at a time) ──────────────────────
async function fetchBatch(ids) {
  return Promise.all(ids.map(id => httpGet(MET_OBJ(id))));
}

// ─── Fetch artworks for one category ────────────────────────────────────────
async function fetchCategory(cat, startId) {
  const collected = [];
  const usedIds = new Set();
  let artId = startId;

  for (const [term, deptId] of cat.searchTerms) {
    if (collected.length >= 100) break;

    const url = deptId ? MET_SEARCH(term, deptId) : MET_SEARCH_MULTI(term);
    const searchResult = await httpGet(url);
    if (!searchResult || !searchResult.objectIDs) {
      console.log(`\n  "${term}" dept=${deptId} → 0 results`);
      continue;
    }

    const ids = shuffle(searchResult.objectIDs);
    console.log(`\n  "${term}" dept=${deptId} → ${ids.length} candidates`);

    // Process in batches of 5 concurrently
    for (let i = 0; i < ids.length && collected.length < 100; i += 5) {
      const batch = ids.slice(i, i + 5).filter(id => !usedIds.has(id));
      if (batch.length === 0) continue;
      batch.forEach(id => usedIds.add(id));

      const results = await fetchBatch(batch);
      await delay(100);

      for (const obj of results) {
        if (collected.length >= 100) break;
        if (!obj || !obj.primaryImageSmall || obj.primaryImageSmall.length < 10) continue;
        if (!obj.primaryImageSmall.startsWith('https://')) continue;

        const idx = collected.length;
        const style = cat.styles[idx % cat.styles.length];
        const desc = cat.descTemplates[idx % cat.descTemplates.length];

        const artistName = obj.artistDisplayName && obj.artistDisplayName.trim().length > 2
          ? obj.artistDisplayName.trim()
          : ARTISTS[idx % ARTISTS.length];

        collected.push({
          id: artId++,
          title: cat.titles[idx] || `${cat.categoryName} ${idx + 1}`,
          artist: artistName.replace(/["\n\r]/g, "'").slice(0, 80),
          category: cat.categoryName,
          description: desc,
          image: obj.primaryImageSmall,
          likes: randInt(150, 9999),
          views: randInt(2000, 99999),
          year: rand(YEARS),
          style,
        });

        process.stdout.write(`\r  ✓ ${collected.length}/100 for ${cat.fileName}  `);
      }
    }
  }

  return { artworks: collected, nextId: artId };
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎨 Fetching real artwork from Metropolitan Museum of Art...\n');
  let nextId = 1;

  for (const cat of categories) {
    console.log(`\n\n📂 ${cat.categoryName}`);
    const result = await fetchCategory(cat, nextId);
    nextId = result.nextId;

    const { artworks } = result;
    console.log(`\n  ✅ ${artworks.length} artworks collected`);

    if (artworks.length < 20) {
      console.error(`  ⚠️  WARNING: Only ${artworks.length} for ${cat.categoryName}!`);
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
    console.log(`  💾 Saved ${cat.fileName}.ts with ${artworks.length} artworks`);
  }

  console.log(`\n\n🎉 DONE! ${nextId - 1} real artworks saved from Metropolitan Museum of Art.\n`);
  process.exit(0);
}

main().catch(e => { console.error('Fatal error:', e); process.exit(1); });
