"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { Search, Heart, Upload, Trash2 } from "lucide-react";
import { formatNumber, cn } from "@/lib/utils";
import { useArtStore } from "@/lib/store";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.07, 0.5),
      duration: 0.55,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

const CATEGORIES = ["All", "Sketches", "Mandala"];

export default function GalleryPage() {
  const artworks = useArtStore((state) => state.artworks);
  const removeArtwork = useArtStore((state) => state.removeArtwork);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArtworks = artworks.filter((artwork) => {
    const matchesCategory =
      activeCategory === "All" ||
      (activeCategory === "Sketches" && artwork.category === "sketch") ||
      (activeCategory === "Mandala" && artwork.category === "mandala");

    const matchesSearch =
      artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.artist.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const breakpointColumnsObj = {
    default: 4,
    1280: 3,
    900: 2,
    500: 1,
  };

  return (
    <div className="pt-24 min-h-screen pb-24 bg-transparent">
      {/* ── Page Header ── */}
      <section className="container-wide mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display font-semibold text-display text-charcoal-900 dark:text-warm-100 mb-2">
              Gallery
            </h1>
            <p className="text-body text-charcoal-500 dark:text-charcoal-400 max-w-md">
              A curated collection of handcrafted artwork from our community.
            </p>
          </div>

          <div className="flex gap-3 items-center flex-shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search artworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-11 pr-4 w-56"
              />
            </div>
            {/* Upload button right on gallery page too */}
            <Link
              href="/upload"
              className="btn-primary py-2.5 px-5 flex-shrink-0"
            >
              <Upload className="w-4 h-4" />
              Upload
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 pb-4 no-scrollbar border-b border-warm-200 dark:border-charcoal-800">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
                activeCategory === cat
                  ? "bg-charcoal-900 text-warm-100 dark:bg-warm-100 dark:text-charcoal-900"
                  : "text-charcoal-600 dark:text-charcoal-400 hover:bg-warm-200 dark:hover:bg-charcoal-800"
              )}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto text-sm text-charcoal-400 dark:text-charcoal-500 self-center">
            {filteredArtworks.length} work{filteredArtworks.length !== 1 ? "s" : ""}
          </span>
        </div>
      </section>

      {/* ── Masonry Gallery ── */}
      <section className="container-wide">
        {filteredArtworks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-full bg-warm-200 dark:bg-charcoal-800 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-charcoal-400" />
            </div>
            <h3 className="font-display text-lg font-medium text-charcoal-900 dark:text-warm-100 mb-2">
              No artworks found
            </h3>
            <p className="text-charcoal-500 dark:text-charcoal-400 text-sm mb-6">
              Try a different search or upload your first artwork.
            </p>
            <Link
              href="/upload"
              className="btn-primary"
            >
              <Upload className="w-4 h-4" />
              Upload Artwork
            </Link>
          </div>
        ) : (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="masonry-grid"
            columnClassName="masonry-grid-column"
          >
            {filteredArtworks.map((artwork, i) => (
              <motion.div
                key={artwork.id}
                custom={i % 12}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="mb-6"
              >
                <Link href={`/artwork/${artwork.id}`} className="group block">
                  {/* Card */}
                  <div className="relative overflow-hidden rounded-2xl bg-warm-200 dark:bg-charcoal-800 shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1">
                    {/* ── Use plain <img> so blob: URLs work ── */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-auto object-cover transition-transform duration-600 ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-charcoal-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-4 pointer-events-none">
                      <div className="flex w-full justify-between items-end text-white translate-y-3 group-hover:translate-y-0 transition-transform duration-400">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{artwork.title}</p>
                          <p className="text-xs opacity-75 mt-0.5">{artwork.artist.name}</p>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-medium bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full flex-shrink-0 ml-2">
                          <Heart className="w-3 h-3" />
                          {formatNumber(artwork.likes)}
                        </span>
                      </div>
                    </div>

                    {/* Delete button (Top Right) */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm('Are you sure you want to remove this artwork?')) {
                          removeArtwork(artwork.id);
                        }
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10 hover:scale-110 shadow-md"
                      title="Remove Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card meta */}
                  <div className="mt-2.5 px-1">
                    <h3 className="font-medium text-sm text-charcoal-900 dark:text-warm-100 truncate group-hover:text-accent-terracotta transition-colors duration-300">
                      {artwork.title}
                    </h3>
                    <p className="text-xs text-charcoal-400 dark:text-charcoal-500 mt-0.5">
                      {artwork.artist.name}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </Masonry>
        )}
      </section>
    </div>
  );
}
