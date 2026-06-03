"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Upload, Trash2 } from "lucide-react";
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

export default function MandalaPage() {
  const artworks = useArtStore((state) => state.artworks).filter((a) => a.category === "mandala");
  const removeArtwork = useArtStore((state) => state.removeArtwork);

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 pt-24 pb-32">

      {/* ── Hero ── */}
      <section className="container-wide mb-20 mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-charcoal-900 border border-charcoal-800 text-accent-ochre mb-8 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Mandala Showcase
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="font-display font-semibold text-display mb-6"
          >
            Sacred Geometry
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-body-lg text-charcoal-400 mb-10"
          >
            A dedicated space for the mesmerising world of mandala art.
            Discover intricate patterns, meditative symmetries, and cosmic designs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-charcoal-600 text-warm-300 text-sm font-medium transition-all duration-400 hover:bg-warm-100 hover:text-charcoal-900 hover:border-warm-100 active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              Upload Your Mandala
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Mandala Grid ── */}
      <section className="container-wide">
        {artworks.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-charcoal-700 flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-charcoal-600" />
            </div>
            <h3 className="font-display text-xl font-medium text-warm-200 mb-3">
              No mandalas yet
            </h3>
            <p className="text-charcoal-500 text-sm mb-6 max-w-xs">
              Be the first to share a mandala. Upload your intricate artwork and inspire the community.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-warm-100 text-charcoal-900 text-sm font-medium hover:bg-white transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Mandala
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {artworks.map((artwork, i) => (
              <motion.div
                key={artwork.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                className="group flex flex-col items-center relative"
              >
                <Link href={`/artwork/${artwork.id}`} className="w-full block">
                  {/* Circular frame */}
                  <div className="relative w-[85%] mx-auto aspect-square rounded-full overflow-hidden border-2 border-charcoal-800 group-hover:border-accent-ochre/50 transition-all duration-700 p-1">
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover transition-transform duration-[8s] ease-linear group-hover:rotate-12 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-charcoal-950/20 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                  </div>

                  {/* Decorative corner dots */}
                  {["-top-2 left-1/2 -translate-x-1/2", "-bottom-2 left-1/2 -translate-x-1/2", "top-1/2 -left-2 -translate-y-1/2", "top-1/2 -right-2 -translate-y-1/2"].map((pos, idx) => (
                    <div
                      key={idx}
                      className={`absolute ${pos} w-1.5 h-1.5 rounded-full bg-charcoal-700 group-hover:bg-accent-ochre transition-colors duration-500`}
                    />
                  ))}
                </Link>

                <div className="text-center mt-8">
                  <h3 className="font-display text-base text-warm-200 group-hover:text-accent-ochre transition-colors duration-300">
                    {artwork.title}
                  </h3>
                  <p className="text-charcoal-500 text-xs mt-1.5 font-medium tracking-widest uppercase">
                    {artwork.artist.name}
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
                  className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10 hover:scale-110 shadow-md"
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
