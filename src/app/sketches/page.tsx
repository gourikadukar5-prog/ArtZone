"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PenTool, Upload, Trash2 } from "lucide-react";
import { useArtStore } from "@/lib/store";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.12, 0.6),
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

export default function SketchesPage() {
  const artworks = useArtStore((state) => state.artworks);
  const removeArtwork = useArtStore((state) => state.removeArtwork);
  const sketchArtworks = artworks.filter((a) => a.category === "sketch");

  return (
    <div className="min-h-screen bg-cream text-charcoal-900 pt-24 pb-32">

      {/* ── Hero ── */}
      <section className="container-wide mb-20 mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-200 border border-warm-300 text-charcoal-600 mb-8 text-sm font-medium"
          >
            <PenTool className="w-4 h-4" />
            Sketches Showcase
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="font-display font-semibold text-display mb-6"
          >
            Pencil & Ink
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-body-lg text-charcoal-500 mb-10"
          >
            A dedicated space for raw sketches and drawings.
            Discover studies, portraits, and expressive linework.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full btn-primary font-medium transition-all duration-400 active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              Upload Your Sketch
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Sketches Grid ── */}
      <section className="container-wide">
        {sketchArtworks.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-warm-300 flex items-center justify-center mb-6">
              <PenTool className="w-8 h-8 text-charcoal-400" />
            </div>
            <h3 className="font-display text-xl font-medium text-charcoal-900 mb-3">
              No sketches yet
            </h3>
            <p className="text-charcoal-500 text-sm mb-6 max-w-xs">
              Be the first to share a sketch. Upload your drawings and inspire the community.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-charcoal-900 text-warm-100 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Upload className="w-4 h-4" />
              Upload Sketch
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {sketchArtworks.map((artwork, i) => (
              <motion.div
                key={artwork.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                className="group flex flex-col relative"
              >
                <Link href={`/artwork/${artwork.id}`} className="w-full block">
                  {/* Square frame */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-warm-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/10 transition-colors duration-500" />
                  </div>
                </Link>

                <div className="mt-4">
                  <h3 className="font-display font-medium text-lg text-charcoal-900 group-hover:text-accent-terracotta transition-colors duration-300">
                    {artwork.title}
                  </h3>
                  <p className="text-charcoal-500 text-sm mt-1">
                    by {artwork.artist.name}
                  </p>
                </div>

                {/* Delete button (Top Right) */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm('Are you sure you want to remove this artwork?')) {
                      removeArtwork(artwork.id);
                    }
                  }}
                  className="absolute top-4 right-4 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10 hover:scale-110 shadow-md"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
