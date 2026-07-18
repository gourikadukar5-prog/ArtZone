"use client";

import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { Heart, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";
import GalleryModal, { GalleryArtwork } from "@/components/gallery/GalleryModal";

import { trendingArts }    from "@/galleryData/trendingArts";
import { traditionalArts } from "@/galleryData/traditionalArts";
import { digitalArts }     from "@/galleryData/digitalArts";
import { animeSketches }   from "@/galleryData/animeSketches";
import { mandalaDesigns }  from "@/galleryData/mandalaDesigns";
import { creativePortraits } from "@/galleryData/creativePortraits";

const CATEGORY_MAP: Record<string, { title: string; subtitle: string; artworks: GalleryArtwork[] }> = {
  "trending-arts":    { title: "Trending Arts",    subtitle: "Modern, Abstract, Oil & Contemporary Paintings", artworks: trendingArts    },
  "traditional-arts": { title: "Traditional Arts", subtitle: "Madhubani, Warli, Pattachitra & World Folk Art",  artworks: traditionalArts },
  "digital-arts":     { title: "Digital Arts",     subtitle: "Cyberpunk, Sci-Fi, Fantasy & Concept Art",       artworks: digitalArts     },
  "anime-sketches":   { title: "Anime Sketches",   subtitle: "Manga, Chibi, Original Anime Characters & Sketches", artworks: animeSketches },
  "mandala-designs":  { title: "Mandala Designs",  subtitle: "Sacred Geometry, Lotus, Zentangle & Henna Art",  artworks: mandalaDesigns  },
  "creative-portraits": { title: "Creative Portraits", subtitle: "Pencil, Charcoal, Watercolor & Digital Portraits", artworks: creativePortraits },
};

function formatNum(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.035, 0.6),
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

const breakpointCols = {
  default: 5,
  1536:    4,
  1280:    3,
  900:     2,
  480:     1,
};

export default function ExploreCategoryPage() {
  const params    = useParams();
  const slug      = params.category as string;
  const category  = CATEGORY_MAP[slug];

  if (!category) notFound();

  const { title, subtitle, artworks } = category;
  const [modalIndex, setModalIndex]   = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (i: number) => { setModalIndex(i); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-charcoal-950 pt-24 pb-20">
      <div className="container-wide">
        {/* ── Header ── */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-900 dark:text-charcoal-400 dark:hover:text-warm-100 transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-charcoal-900 dark:text-warm-100 tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-charcoal-500 dark:text-charcoal-400 text-lg max-w-2xl">
            {subtitle}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-charcoal-400 dark:text-charcoal-500">
              {artworks.length} artworks
            </span>
          </div>
        </div>

        {/* ── Masonry Grid ── */}
        <Masonry
          breakpointCols={breakpointCols}
          className="masonry-grid"
          columnClassName="masonry-grid-column"
        >
          {artworks.map((artwork, i) => (
            <motion.div
              key={artwork.id}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              animate="visible"
              className="mb-5"
            >
              <div
                className="group relative rounded-2xl overflow-hidden bg-warm-200 dark:bg-charcoal-800 shadow-sm hover:shadow-xl cursor-pointer transition-shadow duration-300"
                onClick={() => openModal(i)}
              >
                {/* Image */}
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-auto block object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Hover content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white font-display font-semibold text-base leading-snug truncate">
                    {artwork.title}
                  </p>
                  <p className="text-white/75 text-xs mt-0.5 truncate">by {artwork.artist}</p>
                  <div className="flex items-center gap-3 mt-2 text-white/80 text-xs">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {formatNum(artwork.likes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {formatNum(artwork.views)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </Masonry>
      </div>

      {/* Modal */}
      <GalleryModal
        artworks={artworks}
        initialIndex={modalIndex}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
