"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Masonry from "react-masonry-css";
import { Search, Heart, Upload, Trash2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { formatNumber, cn } from "@/lib/utils";
import { useArtStore } from "@/lib/store";
import { fetchArtworks, deleteArtwork, ArtworkDB } from "@/lib/artworks";
import { toast } from "sonner";

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

// Confirm dialog component
function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-warm-200 dark:border-charcoal-800 p-6 max-w-sm w-full"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="font-display font-semibold text-charcoal-900 dark:text-warm-100 text-lg">
            Delete Artwork?
          </h3>
        </div>
        <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mb-6">
          This will permanently delete the artwork and its image from storage. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 text-charcoal-700 dark:text-charcoal-300 text-sm font-medium hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function GalleryPage() {
  const { user } = useArtStore();
  const [artworks, setArtworks] = useState<ArtworkDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ArtworkDB | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadArtworks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await fetchArtworks();
    if (data.length === 0 && !user) {
      // Could be empty or error — either way show what we got
    }
    setArtworks(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadArtworks();
  }, [loadArtworks]);

  const filteredArtworks = artworks.filter((artwork) => {
    const matchesCategory =
      activeCategory === "All" ||
      (activeCategory === "Sketches" && artwork.category === "sketch") ||
      (activeCategory === "Mandala" && artwork.category === "mandala");

    const matchesSearch =
      artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.artist_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !user) return;
    setDeleteLoading(true);

    const success = await deleteArtwork(deleteTarget.id, deleteTarget.image_url, user.id);

    if (success) {
      setArtworks((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast.success("Artwork deleted successfully.");
    } else {
      toast.error("Failed to delete artwork. Please try again.");
    }

    setDeleteLoading(false);
    setDeleteTarget(null);
  };

  const breakpointColumnsObj = {
    default: 4,
    1280: 3,
    900: 2,
    500: 1,
  };

  return (
    <div className="pt-24 min-h-screen pb-24 bg-transparent">
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            open={!!deleteTarget}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>

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
            <Link href="/upload" className="btn-primary py-2.5 px-5 flex-shrink-0">
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
            {loading ? "Loading..." : `${filteredArtworks.length} work${filteredArtworks.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      </section>

      {/* ── Gallery Content ── */}
      <section className="container-wide">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 text-charcoal-400 animate-spin" />
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Loading artworks...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-charcoal-600 dark:text-charcoal-400">{error}</p>
            <button onClick={loadArtworks} className="btn-primary gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredArtworks.length === 0 && (
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
            <Link href="/upload" className="btn-primary">
              <Upload className="w-4 h-4" />
              Upload Artwork
            </Link>
          </div>
        )}

        {/* Masonry Grid */}
        {!loading && !error && filteredArtworks.length > 0 && (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="masonry-grid"
            columnClassName="masonry-grid-column"
          >
            {filteredArtworks.map((artwork, i) => {
              const isOwner = user?.id === artwork.user_id;

              return (
                <motion.div
                  key={artwork.id}
                  custom={i % 12}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="mb-6"
                >
                  <div className="relative group">
                    {/* ── DELETE button — LEFT BOTTOM side ── */}
                    {isOwner && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteTarget(artwork);
                        }}
                        className="absolute bottom-3 left-3 z-20 p-2 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-md hover:scale-110"
                        title="Delete artwork"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <Link href={`/artwork/${artwork.id}`} className="block">
                      <div className="relative overflow-hidden rounded-2xl bg-warm-200 dark:bg-charcoal-800 shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={artwork.image_url}
                          alt={artwork.title}
                          className="w-full h-auto object-cover transition-transform duration-600 ease-out group-hover:scale-[1.03]"
                          loading="lazy"
                        />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-charcoal-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-4 pointer-events-none">
                          <div className="flex w-full justify-between items-end text-white translate-y-3 group-hover:translate-y-0 transition-transform duration-400">
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{artwork.title}</p>
                              <p className="text-xs opacity-75 mt-0.5">{artwork.artist_name}</p>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-medium bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full flex-shrink-0 ml-2">
                              <Heart className="w-3 h-3" />
                              {formatNumber(artwork.likes)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card meta */}
                      <div className="mt-2.5 px-1">
                        <h3 className="font-medium text-sm text-charcoal-900 dark:text-warm-100 truncate group-hover:text-accent-terracotta transition-colors duration-300">
                          {artwork.title}
                        </h3>
                        <p className="text-xs text-charcoal-400 dark:text-charcoal-500 mt-0.5">
                          {artwork.artist_name}
                        </p>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </Masonry>
        )}
      </section>
    </div>
  );
}
