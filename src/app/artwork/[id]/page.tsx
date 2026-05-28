"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Bookmark, Share2, MessageCircle, MoreHorizontal, Eye } from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";
import { useArtStore } from "@/lib/store";

export default function ArtworkDetailPage({ params }: { params: { id: string } }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const artworks = useArtStore((state) => state.artworks);
  
  // Find artwork, default to first if not found (for demo)
  const artwork = artworks.find(a => a.id === params.id) || artworks[0];
  
  const relatedArtworks = artworks.filter(
    a => a.category === artwork.category && a.id !== artwork.id
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-950 pt-[var(--nav-height)] pb-24">
      {/* Top Nav Bar */}
      <div className="border-b border-warm-200 dark:border-charcoal-800 bg-white/50 dark:bg-charcoal-900/50 backdrop-blur-md sticky top-[var(--nav-height)] z-40">
        <div className="container-wide h-14 flex items-center justify-between">
          <Link href="/gallery" className="flex items-center gap-2 text-sm font-medium text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-warm-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`btn-ghost p-2 rounded-lg ${isLiked ? 'text-accent-terracotta dark:text-accent-terracotta' : ''}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`btn-ghost p-2 rounded-lg ${isSaved ? 'text-accent-indigo dark:text-accent-indigo' : ''}`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button className="btn-ghost p-2 rounded-lg">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container-wide mt-8">
        <div className="grid lg:grid-cols-12 gap-10 xl:gap-16">
          {/* Main Artwork Area */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="art-frame bg-white dark:bg-charcoal-900 rounded-3xl shadow-sm border border-warm-200 dark:border-charcoal-800 overflow-hidden relative"
            >
              <div className="w-full flex items-center justify-center bg-warm-100 dark:bg-charcoal-950 min-h-[40vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full max-h-[80vh] object-contain"
                />
              </div>
            </motion.div>
          </div>

          {/* Sidebar / Info */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-[calc(var(--nav-height)+5rem)]"
            >
              {/* Artist Info */}
              <div className="flex items-center justify-between mb-8">
                <Link href={`/profile/${artwork.artist.username}`} className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-warm-200 dark:bg-charcoal-800 flex items-center justify-center">
                    <span className="font-display font-medium text-charcoal-600 dark:text-charcoal-300">
                      {artwork.artist.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-charcoal-900 dark:text-warm-100 group-hover:text-accent-terracotta transition-colors">
                      {artwork.artist.name}
                    </h3>
                    <p className="text-xs text-charcoal-500">@{artwork.artist.username}</p>
                  </div>
                </Link>
                <button className="px-4 py-1.5 rounded-full text-xs font-medium border border-charcoal-300 dark:border-charcoal-700 hover:bg-charcoal-50 dark:hover:bg-charcoal-800 transition-colors">
                  Follow
                </button>
              </div>

              {/* Artwork Details */}
              <div className="mb-10">
                <h1 className="font-display font-semibold text-2xl text-charcoal-900 dark:text-warm-100 mb-3 text-balance">
                  {artwork.title}
                </h1>
                <p className="text-body text-charcoal-600 dark:text-charcoal-400">
                  {artwork.description}
                </p>
                
                <div className="mt-6 flex flex-wrap gap-4 text-sm text-charcoal-500">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>{formatNumber(artwork.likes * 3)} Views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    <span>{formatNumber(artwork.likes + (isLiked ? 1 : 0))} Likes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    <span>{artwork.comments} Comments</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-warm-200 dark:border-charcoal-800 flex justify-between items-center text-xs text-charcoal-400 uppercase tracking-widest">
                  <span>Published {formatDate(artwork.createdAt)}</span>
                  <span className="bg-warm-200 dark:bg-charcoal-800 px-2 py-1 rounded-md">{artwork.category}</span>
                </div>
              </div>

              {/* Comments Section (Simplified) */}
              <div>
                <h4 className="font-medium text-sm text-charcoal-900 dark:text-warm-100 mb-4">
                  Comments
                </h4>
                <div className="flex gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-warm-200 dark:bg-charcoal-800 flex-shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Add a comment..."
                    className="input-field py-2 text-sm"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-warm-200 dark:bg-charcoal-800 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-charcoal-600 dark:text-charcoal-400">T</span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-medium text-charcoal-900 dark:text-warm-100">Tom</span>
                        <span className="text-xs text-charcoal-400">2 days ago</span>
                      </div>
                      <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                        The linework here is incredible. Love the composition!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Artworks */}
        {relatedArtworks.length > 0 && (
          <div className="mt-32">
            <h3 className="font-display font-semibold text-xl text-charcoal-900 dark:text-warm-100 mb-6">
              More {artwork.category}s
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArtworks.map((related) => (
                <Link href={`/artwork/${related.id}`} key={related.id} className="group">
                  <div className="relative overflow-hidden rounded-2xl mb-3 bg-warm-200 dark:bg-charcoal-800 aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={related.imageUrl}
                      alt={related.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-medium text-sm text-charcoal-900 dark:text-warm-100 group-hover:text-accent-terracotta transition-colors">
                    {related.title}
                  </h4>
                  <p className="text-xs text-charcoal-500">{related.artist.name}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
