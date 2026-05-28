import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Demo data for artworks — only kept artworks not deleted by user
export const DEMO_ARTWORKS = [
  {
    id: "3",
    title: "Sacred Geometry — Bloom",
    description: "An intricate mandala inspired by the geometry of flowering plants and sacred mathematical proportions.",
    imageUrl: "https://images.unsplash.com/photo-1596548438137-d51ea5c83ca5?w=800&q=80",
    category: "mandala",
    artist: { name: "Priya Sharma", username: "priyaarts", avatar: "" },
    likes: 567,
    comments: 41,
    saves: 123,
    createdAt: "2026-01-03",
  },
  {
    id: "5",
    title: "Infinite Pattern — Ocean",
    description: "A meditative mandala artwork inspired by ocean waves and tidal patterns, inked with fine-line technique.",
    imageUrl: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=800&q=80",
    category: "mandala",
    artist: { name: "Aiko Tanaka", username: "aikocreates", avatar: "" },
    likes: 723,
    comments: 56,
    saves: 198,
    createdAt: "2026-02-14",
  },
  {
    id: "7",
    title: "Mandala of Roots",
    description: "An organic mandala celebrating the unseen network of roots beneath the forest floor.",
    imageUrl: "https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=800&q=80",
    category: "mandala",
    artist: { name: "Emil Kovac", username: "emilkov", avatar: "" },
    likes: 456,
    comments: 33,
    saves: 112,
    createdAt: "2026-03-01",
  },
  {
    id: "9",
    title: "Cosmic Symmetry",
    description: "A large-format mandala blending celestial imagery with sacred geometric patterns.",
    imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80",
    category: "mandala",
    artist: { name: "Priya Sharma", username: "priyaarts", avatar: "" },
    likes: 891,
    comments: 67,
    saves: 234,
    createdAt: "2026-03-18",
  },
  {
    id: "11",
    title: "Zentangle Flow",
    description: "A flowing zentangle piece combining structured patterns with organic, free-form elements.",
    imageUrl: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=800&q=80",
    category: "mandala",
    artist: { name: "Aiko Tanaka", username: "aikocreates", avatar: "" },
    likes: 534,
    comments: 39,
    saves: 145,
    createdAt: "2026-04-15",
  },
  {
    id: "12",
    title: "Portrait in Pencil",
    description: "A detailed pencil sketch portrait capturing raw human emotion through fine graphite lines.",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    category: "sketch",
    artist: { name: "Gouri", username: "gouri", avatar: "" },
    likes: 342,
    comments: 28,
    saves: 89,
    createdAt: "2026-01-15",
  },
  {
    id: "13",
    title: "Botanical Sketch Study",
    description: "An intricate pencil drawing of tropical leaves and flowers using cross-hatching techniques.",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
    category: "sketch",
    artist: { name: "Sofia Reyes", username: "sofiasketches", avatar: "" },
    likes: 411,
    comments: 22,
    saves: 104,
    createdAt: "2026-02-01",
  },
  {
    id: "14",
    title: "Urban Architecture Drawing",
    description: "A detailed ink drawing of city streets and buildings, capturing the energy of urban life.",
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    category: "drawing",
    artist: { name: "Liam Foster", username: "liamdraws", avatar: "" },
    likes: 278,
    comments: 19,
    saves: 67,
    createdAt: "2026-02-20",
  },
  {
    id: "15",
    title: "Charcoal Portrait",
    description: "A powerful charcoal drawing exploring light and shadow in a classical portrait style.",
    imageUrl: "https://images.unsplash.com/photo-1471666875520-c75081f42081?w=800&q=80",
    category: "drawing",
    artist: { name: "James Wright", username: "jwstudio", avatar: "" },
    likes: 623,
    comments: 48,
    saves: 167,
    createdAt: "2026-03-10",
  },
  {
    id: "16",
    title: "Anime Character Sketch",
    description: "A dynamic anime-style pencil sketch with expressive linework and detailed shading.",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    category: "sketch",
    artist: { name: "Aiko Tanaka", username: "aikocreates", avatar: "" },
    likes: 789,
    comments: 61,
    saves: 213,
    createdAt: "2026-04-01",
  },
  {
    id: "17",
    title: "Still Life Drawing",
    description: "A classical still life drawing in graphite, capturing the play of light on everyday objects.",
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
    category: "drawing",
    artist: { name: "Liam Foster", username: "liamdraws", avatar: "" },
    likes: 198,
    comments: 14,
    saves: 52,
    createdAt: "2026-04-22",
  },
];

export const DEMO_ARTISTS = [
  { name: "Gouri", username: "gouri", bio: "Visual storyteller. Pencil & ink.", followers: 2340, artworks: 48 },
  { name: "Priya Sharma", username: "priyaarts", bio: "Mandala artist. Sacred geometry enthusiast.", followers: 5120, artworks: 72 },
  { name: "Liam Foster", username: "liamdraws", bio: "Botanical illustrator based in Portland.", followers: 1890, artworks: 35 },
  { name: "Aiko Tanaka", username: "aikocreates", bio: "Pattern designer. Ink on paper.", followers: 4200, artworks: 61 },
  { name: "James Wright", username: "jwstudio", bio: "Charcoal portraits and still life.", followers: 1560, artworks: 29 },
  { name: "Sofia Reyes", username: "sofiasketches", bio: "Architecture through sketching.", followers: 2780, artworks: 44 },
];
