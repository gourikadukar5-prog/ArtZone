"use client";

import { useMemo, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { Heart, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import GalleryModal from "@/components/gallery/GalleryModal";

// Data Imports
import { trendingArts } from "@/galleryData/trendingArts";
import { traditionalArts } from "@/galleryData/traditionalArts";
import { digitalArts } from "@/galleryData/digitalArts";
import { animeSketches } from "@/galleryData/animeSketches";
import { mandalaDesigns } from "@/galleryData/mandalaDesigns";
import { creativePortraits } from "@/galleryData/creativePortraits";

const categoryMap: Record<string, { title: string; data: any[] }> = {
  "trending-arts": { title: "Trending Arts", data: trendingArts },
  "traditional-arts": { title: "Traditional Arts", data: traditionalArts },
  "digital-arts": { title: "Digital Arts", data: digitalArts },
  "anime-sketches": { title: "Anime Sketches", data: animeSketches },
  "mandala-designs": { title: "Mandala Designs", data: mandalaDesigns },
  "creative-portraits": { title: "Creative Portraits", data: creativePortraits },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.05, 0.5),
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

export default function ExploreCategoryPage() {
  const params = useParams();
  const slug = params.category as string;
  
  const categoryInfo = categoryMap[slug];

  if (!categoryInfo) {
    notFound();
  }

  const { title, data: artworks } = categoryInfo;
  const [modalIndex, setModalIndex] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (index: number) => {
    setModalIndex(index);
    setIsModalOpen(true);
  };

  const breakpointColumnsObj = {
    default: 5,
    1536: 4,
    1280: 3,
    900: 2,
    500: 1,
  };

  return (
    <div className="bg-warm-50 dark:bg-charcoal-950 min-h-screen pt-24 pb-20 font-sans text-charcoal-900 dark:text-warm-100">
      <div className="container-wide">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-charcoal-500 hover:text-charcoal-900 dark:text-charcoal-400 dark:hover:text-warm-100 transition-colors mb-6 font-medium text-sm self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-4 tracking-tight">
            {title}
          </h1>
          <p className="text-charcoal-500 dark:text-charcoal-400 text-lg max-w-2xl mx-auto">
            Explore 100 stunning, hand-picked artworks from the best artists across the globe in this exclusive gallery.
          </p>
        </div>

        {/* Masonry Gallery */}
        <Masonry
          breakpointCols={breakpointColumnsObj}
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
              className="mb-6"
            >
              <div 
                className="relative overflow-hidden rounded-2xl bg-warm-200 dark:bg-charcoal-800 shadow-sm group cursor-pointer"
                onClick={() => openModal(i)}
              >
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-5 pointer-events-none">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 pointer-events-auto">
                    <p className="font-display font-medium text-white text-lg leading-tight mb-1">{artwork.title}</p>
                    <p className="text-white/80 text-sm font-medium mb-3">by {artwork.artist}</p>
                    
                    <div className="flex items-center gap-4 text-white/90 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5" /> {formatNumber(artwork.likes)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> {formatNumber(artwork.views)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </Masonry>
      </div>

      <GalleryModal
        artworks={artworks}
        initialIndex={modalIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
