"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Bookmark, Share2, MessageCircle, Eye, FolderPlus, Loader2, X, AlertCircle } from "lucide-react";
import { formatNumber, formatDate, cn } from "@/lib/utils";
import { useArtStore } from "@/lib/store";
import { fetchArtworkById, incrementArtworkViews, fetchArtworks, ArtworkDB } from "@/lib/artworks";
import { 
  isArtworkSaved, saveArtwork, unsaveArtwork, 
  fetchLikedArtworkIds, likeArtwork, unlikeArtwork,
  fetchFollowingIds, followUser, unfollowUser,
  fetchCollections, addArtworkToCollection, Collection
} from "@/lib/dashboard";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ArtworkDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useArtStore();
  const [artwork, setArtwork] = useState<ArtworkDB | null>(null);
  const [relatedArtworks, setRelatedArtworks] = useState<ArtworkDB[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  
  // Collections Modal
  const [showColModal, setShowColModal] = useState(false);
  const [myCollections, setMyCollections] = useState<Collection[]>([]);
  const [colLoading, setColLoading] = useState(false);

  // ── Load Artwork Data ──
  const loadData = useCallback(async () => {
    setLoading(true);
    
    // Increment view async
    incrementArtworkViews(params.id);

    const data = await fetchArtworkById(params.id);
    if (!data) {
      setLoading(false);
      return;
    }
    
    setArtwork(data);
    setLikesCount(data.likes || 0);
    setViewsCount((data.views || 0) + 1);

    // Fetch related
    const allArts = await fetchArtworks();
    setRelatedArtworks(allArts.filter(a => a.category === data.category && a.id !== data.id).slice(0, 3));

    // Fetch user specific relations
    if (user) {
      const [savedStatus, likedIds, followingIds] = await Promise.all([
        isArtworkSaved(user.id, data.id),
        fetchLikedArtworkIds(user.id),
        fetchFollowingIds(user.id)
      ]);
      setIsSaved(savedStatus);
      setIsLiked(likedIds.includes(data.id));
      setIsFollowing(followingIds.includes(data.user_id));
    }
    
    setLoading(false);
  }, [params.id, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Handlers ──
  const handleLike = async () => {
    if (!user) return toast.error("Please login to like artworks");
    if (!artwork) return;
    
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);

    const ok = wasLiked 
      ? await unlikeArtwork(user.id, artwork.id)
      : await likeArtwork(user.id, artwork.id);
      
    if (!ok) {
      // Revert on fail
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1));
      toast.error("Failed to update like status");
    }
  };

  const handleSave = async () => {
    if (!user) return toast.error("Please login to save artworks");
    if (!artwork) return;
    
    const wasSaved = isSaved;
    setIsSaved(!wasSaved);

    const ok = wasSaved 
      ? await unsaveArtwork(user.id, artwork.id)
      : await saveArtwork(user.id, artwork.id);
      
    if (!ok) {
      setIsSaved(wasSaved);
      toast.error("Failed to update save status");
    } else {
      toast.success(wasSaved ? "Removed from saved" : "Artwork saved!");
    }
  };

  const handleFollow = async () => {
    if (!user) return toast.error("Please login to follow artists");
    if (!artwork) return;
    if (user.id === artwork.user_id) return toast.error("You cannot follow yourself");

    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    const ok = wasFollowing
      ? await unfollowUser(user.id, artwork.user_id)
      : await followUser(user.id, artwork.user_id);
      
    if (!ok) {
      setIsFollowing(wasFollowing);
      toast.error("Failed to update follow status");
    } else {
      toast.success(wasFollowing ? "Unfollowed artist" : "Following artist!");
    }
  };

  const openCollectionModal = async () => {
    if (!user) return toast.error("Please login to add to collections");
    setShowColModal(true);
    setColLoading(true);
    const cols = await fetchCollections(user.id);
    setMyCollections(cols);
    setColLoading(false);
  };

  const handleAddToCollection = async (collectionId: string) => {
    if (!user || !artwork) return;
    const ok = await addArtworkToCollection(collectionId, artwork.id);
    if (ok) {
      toast.success("Added to collection!");
      setShowColModal(false);
    } else {
      toast.error("Failed to add or already in collection");
    }
  };

  // ── Render ──
  if (loading) {
    return (
      <div className="min-h-screen pt-[var(--nav-height)] flex items-center justify-center bg-transparent">
        <Loader2 className="w-8 h-8 text-accent-terracotta animate-spin" />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen pt-[var(--nav-height)] flex flex-col items-center justify-center bg-transparent text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-charcoal-900 dark:text-warm-100 mb-2">Artwork not found</h1>
        <p className="text-charcoal-500 mb-6">The artwork you are looking for does not exist or has been removed.</p>
        <Link href="/gallery" className="btn-primary px-6 py-2">Return to Gallery</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-[var(--nav-height)] pb-24">
      
      {/* ── Collection Modal ── */}
      <AnimatePresence>
        {showColModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-warm-200 dark:border-charcoal-800 p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-semibold text-lg text-charcoal-900 dark:text-warm-100">Add to Collection</h3>
                <button onClick={() => setShowColModal(false)} className="p-2 bg-warm-100 dark:bg-charcoal-800 rounded-full hover:bg-warm-200 dark:hover:bg-charcoal-700 transition-colors">
                  <X className="w-4 h-4 text-charcoal-500" />
                </button>
              </div>
              
              {colLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-charcoal-400" /></div>
              ) : myCollections.length > 0 ? (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {myCollections.map(col => (
                    <button key={col.id} onClick={() => handleAddToCollection(col.id)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-warm-200 dark:border-charcoal-700 hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-colors text-left group">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-terracotta to-[#D4A853] flex items-center justify-center flex-shrink-0">
                        <FolderPlus className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-charcoal-900 dark:text-warm-100 text-sm truncate">{col.name}</h4>
                        <p className="text-xs text-charcoal-500 truncate">{col.artwork_count || 0} artworks</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-charcoal-500 mb-4">You don&apos;t have any collections yet.</p>
                  <Link href="/dashboard" className="btn-primary py-2 px-4 text-sm inline-block">Go to Dashboard to create one</Link>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Top Nav Bar ── */}
      <div className="border-b border-warm-200 dark:border-charcoal-800 bg-white/50 dark:bg-charcoal-900/50 backdrop-blur-md sticky top-[var(--nav-height)] z-40">
        <div className="container-wide h-14 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-medium text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-warm-100 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={openCollectionModal} className="btn-ghost p-2 rounded-lg text-charcoal-500 hover:text-charcoal-900 dark:hover:text-warm-100" title="Add to Collection">
              <FolderPlus className="w-5 h-5" />
            </button>
            <button onClick={handleLike} className={cn("btn-ghost p-2 rounded-lg transition-colors", isLiked ? "text-accent-terracotta" : "text-charcoal-500")}>
              <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
            </button>
            <button onClick={handleSave} className={cn("btn-ghost p-2 rounded-lg transition-colors", isSaved ? "text-[#5C6BC0]" : "text-charcoal-500")}>
              <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
            </button>
            <button className="btn-ghost p-2 rounded-lg text-charcoal-500">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container-wide mt-8">
        <div className="grid lg:grid-cols-12 gap-10 xl:gap-16">
          
          {/* ── Main Artwork Area ── */}
          <div className="lg:col-span-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="art-frame bg-white dark:bg-charcoal-900 rounded-3xl shadow-sm border border-warm-200 dark:border-charcoal-800 overflow-hidden relative">
              <div className="w-full flex items-center justify-center bg-transparent min-h-[40vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artwork.image_url} alt={artwork.title} className="w-full max-h-[80vh] object-contain" />
              </div>
            </motion.div>
          </div>

          {/* ── Sidebar / Info ── */}
          <div className="lg:col-span-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="sticky top-[calc(var(--nav-height)+5rem)]">
              
              {/* Artist Info */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-warm-200 dark:border-charcoal-800">
                <div className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-warm-200 dark:bg-charcoal-800 flex items-center justify-center overflow-hidden">
                    {artwork.artist_avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={artwork.artist_avatar} alt={artwork.artist_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display font-medium text-charcoal-600 dark:text-charcoal-300">
                        {artwork.artist_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-charcoal-900 dark:text-warm-100 group-hover:text-accent-terracotta transition-colors">
                      {artwork.artist_name}
                    </h3>
                    <p className="text-xs text-charcoal-500">@{artwork.artist_username || "artist"}</p>
                  </div>
                </div>
                {user?.id !== artwork.user_id && (
                  <button onClick={handleFollow} className={cn("px-4 py-1.5 rounded-full text-xs font-medium border transition-colors", isFollowing ? "bg-charcoal-100 dark:bg-charcoal-800 border-transparent text-charcoal-600 dark:text-charcoal-300" : "border-charcoal-300 dark:border-charcoal-700 hover:bg-charcoal-50 dark:hover:bg-charcoal-800")}>
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </div>

              {/* Artwork Details */}
              <div className="mb-10">
                <h1 className="font-display font-semibold text-2xl text-charcoal-900 dark:text-warm-100 mb-3 text-balance">
                  {artwork.title}
                </h1>
                <p className="text-body text-charcoal-600 dark:text-charcoal-400 whitespace-pre-wrap">
                  {artwork.description || "No description provided."}
                </p>
                
                <div className="mt-6 flex flex-wrap gap-4 text-sm text-charcoal-500 font-medium">
                  <div className="flex items-center gap-1.5 bg-warm-100 dark:bg-charcoal-800/50 px-3 py-1.5 rounded-lg">
                    <Eye className="w-4 h-4" /> <span>{formatNumber(viewsCount)} Views</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-warm-100 dark:bg-charcoal-800/50 px-3 py-1.5 rounded-lg">
                    <Heart className="w-4 h-4" /> <span>{formatNumber(likesCount)} Likes</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-warm-100 dark:bg-charcoal-800/50 px-3 py-1.5 rounded-lg">
                    <MessageCircle className="w-4 h-4" /> <span>{formatNumber(artwork.comments || 0)} Comments</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-warm-200 dark:border-charcoal-800 flex justify-between items-center text-xs text-charcoal-400 uppercase tracking-widest font-semibold">
                  <span>Published {formatDate(artwork.created_at)}</span>
                  <span className="bg-warm-200 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300 px-2 py-1 rounded-md">{artwork.category}</span>
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <h4 className="font-medium text-sm text-charcoal-900 dark:text-warm-100 mb-4">
                  Comments
                </h4>
                <div className="flex gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-warm-200 dark:bg-charcoal-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={user.user_metadata.avatar_url} alt="You" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs">{user?.user_metadata?.full_name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <input type="text" placeholder="Add a comment... (Coming soon)" disabled className="input-field py-2 text-sm opacity-50 cursor-not-allowed" />
                </div>
                
                <div className="space-y-4">
                  <div className="text-sm text-charcoal-500 text-center py-4 bg-warm-100/50 dark:bg-charcoal-800/20 rounded-xl">
                    Be the first to leave a comment!
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Related Artworks ── */}
        {relatedArtworks.length > 0 && (
          <div className="mt-24 pt-10 border-t border-warm-200 dark:border-charcoal-800">
            <h3 className="font-display font-semibold text-xl text-charcoal-900 dark:text-warm-100 mb-6 flex items-center gap-2">
              More <span className="capitalize">{artwork.category}</span> Artworks
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedArtworks.map((related) => (
                <Link href={`/artwork/${related.id}`} key={related.id} className="group">
                  <div className="relative overflow-hidden rounded-2xl mb-3 bg-warm-200 dark:bg-charcoal-800 aspect-[4/5] shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={related.image_url} alt={related.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="font-semibold text-sm text-charcoal-900 dark:text-warm-100 group-hover:text-accent-terracotta transition-colors truncate">
                    {related.title}
                  </h4>
                  <p className="text-xs text-charcoal-500 truncate">{related.artist_name}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
