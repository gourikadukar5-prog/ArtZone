"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { ArrowLeft, FolderHeart, Trash2, Loader2, AlertCircle, Heart } from "lucide-react";
import { formatNumber, formatDate, cn } from "@/lib/utils";
import { useArtStore } from "@/lib/store";
import { fetchCollectionDetails, removeArtworkFromCollection, Collection } from "@/lib/dashboard";
import { ArtworkDB } from "@/lib/artworks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CollectionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useArtStore();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [artworks, setArtworks] = useState<ArtworkDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { collection: col, artworks: arts } = await fetchCollectionDetails(params.id);
    if (col) {
      setCollection(col);
      setArtworks(arts);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemove = async (artworkId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !collection || user.id !== collection.user_id) return;
    
    setRemovingId(artworkId);
    const ok = await removeArtworkFromCollection(collection.id, artworkId);
    if (ok) {
      setArtworks(prev => prev.filter(a => a.id !== artworkId));
      toast.success("Artwork removed from collection");
    } else {
      toast.error("Failed to remove artwork");
    }
    setRemovingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-[var(--nav-height)] flex items-center justify-center bg-transparent">
        <Loader2 className="w-8 h-8 text-accent-terracotta animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen pt-[var(--nav-height)] flex flex-col items-center justify-center bg-transparent text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-charcoal-900 dark:text-warm-100 mb-2">Collection not found</h1>
        <p className="text-charcoal-500 mb-6">This collection might have been deleted or does not exist.</p>
        <Link href="/dashboard" className="btn-primary px-6 py-2">Back to Dashboard</Link>
      </div>
    );
  }

  const isOwner = user?.id === collection.user_id;

  return (
    <div className="min-h-screen bg-transparent pt-[var(--nav-height)] pb-24">
      {/* ── Top Nav Bar ── */}
      <div className="border-b border-warm-200 dark:border-charcoal-800 bg-white/50 dark:bg-charcoal-900/50 backdrop-blur-md sticky top-[var(--nav-height)] z-40">
        <div className="container-wide h-14 flex items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-medium text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-warm-100 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      <div className="container-wide mt-10">
        {/* ── Collection Header ── */}
        <div className="mb-12 flex flex-col md:flex-row gap-6 md:items-end justify-between bg-white/50 dark:bg-charcoal-900/50 p-8 rounded-3xl border border-warm-200 dark:border-charcoal-800 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#5C6BC0] to-[#8FA68A] flex items-center justify-center flex-shrink-0 shadow-md">
              <FolderHeart className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900 dark:text-warm-100 mb-2">
                {collection.name}
              </h1>
              <p className="text-charcoal-600 dark:text-charcoal-400 max-w-2xl text-balance">
                {collection.description || "A curated collection of artworks."}
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                <span>{artworks.length} Artworks</span>
                <span>•</span>
                <span>Created {formatDate(collection.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        {artworks.length > 0 ? (
          <Masonry
            breakpointCols={{ default: 4, 1280: 3, 900: 2, 500: 1 }}
            className="masonry-grid"
            columnClassName="masonry-grid-column"
          >
            {artworks.map((artwork, i) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.5) }}
                className="mb-6 relative group"
              >
                {/* Remove button for owner */}
                {isOwner && (
                  <button
                    onClick={(e) => handleRemove(artwork.id, e)}
                    disabled={removingId === artwork.id}
                    className="absolute top-3 right-3 z-20 p-2 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-md hover:scale-110 disabled:opacity-50"
                    title="Remove from collection"
                  >
                    {removingId === artwork.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
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
                </Link>
              </motion.div>
            ))}
          </Masonry>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/30 dark:bg-charcoal-900/30 rounded-3xl border border-dashed border-warm-300 dark:border-charcoal-700">
            <div className="w-16 h-16 rounded-2xl bg-warm-200 dark:bg-charcoal-800 flex items-center justify-center mb-4">
              <FolderHeart className="w-8 h-8 text-charcoal-400" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-900 dark:text-warm-100 mb-2">This collection is empty</h3>
            <p className="text-sm text-charcoal-500 max-w-sm mb-6">
              Browse the gallery and click the folder icon on artworks to add them here.
            </p>
            <Link href="/gallery" className="btn-primary py-2 px-6">
              Browse Gallery
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
