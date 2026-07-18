"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Share2, Download, Eye, Calendar, Palette } from "lucide-react";
import { GalleryArtwork } from "@/galleryData/trendingArts"; // We can reuse the interface from here

interface GalleryModalProps {
  artworks: GalleryArtwork[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function GalleryModal({ artworks, initialIndex, isOpen, onClose }: GalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setLiked(false);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, artworks.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : artworks.length - 1));
    setLiked(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < artworks.length - 1 ? prev + 1 : 0));
    setLiked(false);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: artworks[currentIndex].title,
        text: `Check out ${artworks[currentIndex].title} by ${artworks[currentIndex].artist} on ArtZone!`,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback to copy link
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = artworks[currentIndex].image;
    link.download = `${artworks[currentIndex].title}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || artworks.length === 0) return null;

  const artwork = artworks[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 cursor-pointer"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-charcoal-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-charcoal-900 dark:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/50 dark:bg-black/20 dark:hover:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-charcoal-900 dark:text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6 pr-1" />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 md:right-[35%] lg:right-[400px] z-20 w-12 h-12 bg-white/20 hover:bg-white/50 dark:bg-black/20 dark:hover:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-charcoal-900 dark:text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6 pl-1" />
            </button>

            {/* Image Section */}
            <div className="w-full md:w-3/5 lg:w-[calc(100%-400px)] h-[50vh] md:h-[90vh] bg-warm-100 dark:bg-charcoal-950 flex items-center justify-center relative">
              <motion.img
                key={artwork.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={artwork.image}
                alt={artwork.title}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>

            {/* Details Section */}
            <div className="w-full md:w-2/5 lg:w-[400px] h-full overflow-y-auto p-6 md:p-8 flex flex-col bg-white dark:bg-charcoal-900">
              <div className="flex-grow">
                <span className="inline-block px-3 py-1 rounded-full bg-accent-terracotta/10 text-accent-terracotta text-sm font-medium mb-4">
                  {artwork.category}
                </span>
                
                <h2 className="font-display font-bold text-3xl text-charcoal-900 dark:text-warm-100 mb-2 leading-tight">
                  {artwork.title}
                </h2>
                
                <p className="text-lg text-charcoal-600 dark:text-charcoal-400 font-medium mb-6">
                  by {artwork.artist}
                </p>

                <div className="flex items-center gap-6 mb-8 text-charcoal-500 dark:text-charcoal-400 text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-charcoal-700 dark:text-charcoal-300">{artwork.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium text-charcoal-700 dark:text-charcoal-300">{artwork.views.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-charcoal-600 dark:text-charcoal-300 leading-relaxed mb-8">
                  {artwork.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-100 dark:border-charcoal-700">
                    <div className="flex items-center gap-2 text-charcoal-500 dark:text-charcoal-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Year</span>
                    </div>
                    <p className="font-medium text-charcoal-900 dark:text-warm-100">{artwork.year}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-100 dark:border-charcoal-700">
                    <div className="flex items-center gap-2 text-charcoal-500 dark:text-charcoal-400 mb-1">
                      <Palette className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Style</span>
                    </div>
                    <p className="font-medium text-charcoal-900 dark:text-warm-100">{artwork.style}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-warm-200 dark:border-charcoal-800 mt-auto">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all duration-300 ${
                    liked 
                      ? "bg-red-50 dark:bg-red-900/20 text-red-500" 
                      : "bg-warm-100 dark:bg-charcoal-800 hover:bg-warm-200 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                  <span className="text-xs font-medium">{liked ? "Liked" : "Like"}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-warm-100 dark:bg-charcoal-800 hover:bg-warm-200 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300 transition-all duration-300"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-xs font-medium">Share</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-charcoal-900 text-white dark:bg-warm-100 dark:text-charcoal-900 hover:bg-charcoal-800 dark:hover:bg-white transition-all duration-300 shadow-md"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-xs font-medium">Save</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
