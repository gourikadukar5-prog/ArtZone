"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { Heart, Bookmark, Search, ArrowLeft } from "lucide-react";
import { useArtStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const breakpointColumnsObj = {
  default: 4,
  1280: 3,
  900: 2,
  500: 1,
};

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const artworks = useArtStore((state) => state.artworks);

  const filtered = query.trim()
    ? artworks.filter((art) => {
        const q = query.toLowerCase();
        return (
          art.title.toLowerCase().includes(q) ||
          art.description.toLowerCase().includes(q) ||
          art.category.toLowerCase().includes(q) ||
          art.artist.name.toLowerCase().includes(q)
        );
      })
    : artworks;

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 bg-cream dark:bg-charcoal-950 transition-colors duration-300">
      <div className="container-wide mx-auto">

        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-900 dark:text-charcoal-400 dark:hover:text-warm-100 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-start gap-4 flex-wrap">
            <div>
              {query ? (
                <>
                  <h1 className="font-display font-semibold text-3xl md:text-4xl text-charcoal-900 dark:text-warm-100 mb-2">
                    Results for &ldquo;{query}&rdquo;
                  </h1>
                  <p className="text-charcoal-500 dark:text-charcoal-400">
                    {filtered.length === 0
                      ? "No artworks found. Try a different keyword."
                      : `${filtered.length} artwork${filtered.length !== 1 ? "s" : ""} found`}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="font-display font-semibold text-3xl md:text-4xl text-charcoal-900 dark:text-warm-100 mb-2">
                    All Artworks
                  </h1>
                  <p className="text-charcoal-500 dark:text-charcoal-400">
                    Showing all {filtered.length} artworks
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Quick filter tags */}
          <div className="flex flex-wrap gap-2 mt-6">
            {["mandala", "sketch", "drawing", "digital", "portrait"].map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${tag}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 capitalize
                  ${query.toLowerCase() === tag
                    ? "bg-charcoal-900 text-white border-charcoal-900 dark:bg-warm-100 dark:text-charcoal-900 dark:border-warm-100"
                    : "border-warm-200 dark:border-charcoal-700 text-charcoal-600 dark:text-charcoal-400 hover:border-charcoal-400 hover:bg-white dark:hover:bg-charcoal-800"
                  }`}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* No Results */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-warm-100 dark:bg-charcoal-800 flex items-center justify-center mb-6">
              <Search className="w-9 h-9 text-charcoal-400" />
            </div>
            <h2 className="font-display font-semibold text-2xl text-charcoal-900 dark:text-warm-100 mb-3">
              No results found
            </h2>
            <p className="text-charcoal-500 dark:text-charcoal-400 max-w-md">
              We couldn&apos;t find any artworks matching &ldquo;{query}&rdquo;. Try searching for{" "}
              <Link href="/search?q=mandala" className="underline hover:text-charcoal-900">mandala</Link>,{" "}
              <Link href="/search?q=sketch" className="underline hover:text-charcoal-900">sketch</Link>, or{" "}
              <Link href="/search?q=drawing" className="underline hover:text-charcoal-900">drawing</Link>.
            </p>
          </motion.div>
        )}

        {/* Results Grid */}
        {filtered.length > 0 && (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="masonry-grid"
            columnClassName="masonry-grid-column"
          >
            {filtered.map((artwork, i) => (
              <motion.div
                key={artwork.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i % 4}
                className="mb-6"
              >
                <div className="relative overflow-hidden rounded-2xl bg-warm-200 dark:bg-charcoal-800 shadow-sm group cursor-pointer">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                  />

                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/80 dark:bg-charcoal-900/80 backdrop-blur-sm text-charcoal-700 dark:text-charcoal-300 capitalize">
                      {artwork.category}
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-charcoal-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
                    <div className="flex justify-end pointer-events-auto">
                      <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-colors shadow-sm">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex w-full justify-between items-end text-white translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{artwork.title}</p>
                        <p className="text-xs opacity-80 mt-0.5">{artwork.artist.name}</p>
                      </div>
                      <button className="flex items-center gap-1.5 text-xs font-medium bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full pointer-events-auto hover:bg-white hover:text-charcoal-900 transition-colors">
                        <Heart className="w-3.5 h-3.5" />
                        {formatNumber(artwork.likes)}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info below card */}
                <div className="mt-2 px-1">
                  <p className="font-medium text-sm text-charcoal-900 dark:text-warm-100 truncate">{artwork.title}</p>
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-0.5">{artwork.artist.name}</p>
                </div>
              </motion.div>
            ))}
          </Masonry>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-charcoal-300 border-t-charcoal-900 rounded-full animate-spin" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
