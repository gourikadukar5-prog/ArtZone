"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, Heart, Share2, Download,
  Eye, Calendar, Palette, Maximize2
} from "lucide-react";

// Re-use interface from data files
export interface GalleryArtwork {
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

interface Props {
  artworks: GalleryArtwork[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

function formatNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

export default function GalleryModal({ artworks, initialIndex, isOpen, onClose }: Props) {
  const [idx, setIdx] = useState(initialIndex);
  const [liked, setLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setIdx(initialIndex);
    setLiked(false);
    setImgLoaded(false);
  }, [initialIndex, isOpen]);

  const goNext = useCallback(() => {
    setIdx(prev => (prev + 1) % artworks.length);
    setImgLoaded(false);
    setLiked(false);
  }, [artworks.length]);

  const goPrev = useCallback(() => {
    setIdx(prev => (prev - 1 + artworks.length) % artworks.length);
    setImgLoaded(false);
    setLiked(false);
  }, [artworks.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, goNext, goPrev, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || artworks.length === 0 || idx < 0 || idx >= artworks.length) return null;

  const art = artworks[idx];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="relative z-10 w-[95vw] max-w-6xl max-h-[90vh] flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-charcoal-900"
          onClick={e => e.stopPropagation()}
        >
          {/* ─── Left: Image ─── */}
          <div className="relative w-full md:w-3/5 bg-charcoal-950 flex items-center justify-center min-h-[280px] md:min-h-0">
            {/* Nav arrows */}
            <button
              onClick={goPrev}
              aria-label="Previous"
              className="absolute left-3 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goNext}
              aria-label="Next"
              className="absolute right-3 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Loading spinner */}
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}

            <motion.img
              key={art.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: imgLoaded ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              src={art.image}
              alt={art.title}
              className="w-full h-full object-contain max-h-[90vh]"
              onLoad={() => setImgLoaded(true)}
              onError={e => {
                // On error, show a placeholder gradient
                (e.target as HTMLImageElement).style.display = "none";
                setImgLoaded(true);
              }}
              loading="lazy"
            />

            {/* Counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
              {idx + 1} / {artworks.length}
            </div>
          </div>

          {/* ─── Right: Details ─── */}
          <div className="relative w-full md:w-2/5 flex flex-col overflow-y-auto bg-white dark:bg-charcoal-900">
            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-warm-100 dark:bg-charcoal-800 hover:bg-warm-200 dark:hover:bg-charcoal-700 flex items-center justify-center text-charcoal-600 dark:text-charcoal-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex-1 p-6 md:p-8 pt-14 md:pt-8">
              {/* Category badge */}
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-charcoal-900/10 dark:bg-warm-100/10 text-charcoal-700 dark:text-warm-200 mb-4 tracking-wide uppercase">
                {art.category}
              </span>

              <h2 className="font-display font-bold text-2xl md:text-3xl text-charcoal-900 dark:text-warm-100 leading-tight mb-2">
                {art.title}
              </h2>

              <p className="text-charcoal-500 dark:text-charcoal-400 font-medium mb-6">
                by {art.artist}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-5 mb-7">
                <div className="flex items-center gap-1.5 text-sm text-charcoal-500 dark:text-charcoal-400">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="font-semibold text-charcoal-700 dark:text-charcoal-200">{formatNum(art.likes)}</span>
                  <span>likes</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-charcoal-500 dark:text-charcoal-400">
                  <Eye className="w-4 h-4" />
                  <span className="font-semibold text-charcoal-700 dark:text-charcoal-200">{formatNum(art.views)}</span>
                  <span>views</span>
                </div>
              </div>

              <p className="text-charcoal-600 dark:text-charcoal-300 leading-relaxed mb-7 text-sm md:text-base">
                {art.description}
              </p>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="p-4 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-100 dark:border-charcoal-700">
                  <div className="flex items-center gap-1.5 text-charcoal-400 dark:text-charcoal-500 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-widest">Year</span>
                  </div>
                  <p className="font-bold text-charcoal-900 dark:text-warm-100">{art.year}</p>
                </div>
                <div className="p-4 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-100 dark:border-charcoal-700">
                  <div className="flex items-center gap-1.5 text-charcoal-400 dark:text-charcoal-500 mb-1">
                    <Palette className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-widest">Style</span>
                  </div>
                  <p className="font-bold text-charcoal-900 dark:text-warm-100 text-sm leading-tight">{art.style}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 md:p-8 pt-0 border-t border-warm-100 dark:border-charcoal-800">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setLiked(l => !l)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    liked
                      ? "bg-rose-50 dark:bg-rose-900/20 text-rose-500 shadow-sm"
                      : "bg-warm-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-charcoal-300 hover:bg-warm-200 dark:hover:bg-charcoal-700"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
                  {liked ? "Liked" : "Like"}
                </button>
                <button
                  onClick={async () => {
                    try {
                      await navigator.share({ title: art.title, url: window.location.href });
                    } catch {
                      await navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-semibold bg-warm-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-charcoal-300 hover:bg-warm-200 dark:hover:bg-charcoal-700 transition-all duration-200"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
                <a
                  href={art.image}
                  download={`${art.title}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-semibold bg-charcoal-900 dark:bg-warm-100 text-white dark:text-charcoal-900 hover:bg-charcoal-800 dark:hover:bg-warm-200 transition-all duration-200 shadow-md text-center"
                >
                  <Download className="w-5 h-5" />
                  Save
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
