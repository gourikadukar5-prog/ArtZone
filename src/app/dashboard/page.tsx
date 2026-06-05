"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Image as ImageIcon, FolderHeart,
  Heart, BarChart3, Settings, Plus, Trash2,
  Eye, TrendingUp, Users, MessageSquare, BellRing,
  ChevronRight, LogOut, Activity,
  PieChart as PieChartIcon, Award, Shield, Palette,
  Bell, Lock, AlertTriangle, X, Check, UserPlus, UserCheck, Camera, Loader2
} from "lucide-react";
import { formatNumber, cn } from "@/lib/utils";
import { useArtStore } from "@/lib/store";
import { fetchArtworks, deleteArtwork, ArtworkDB } from "@/lib/artworks";
import {
  fetchCollections, createCollection, deleteCollection,
  fetchSavedArtworks, unsaveArtwork,
  fetchFollowerCount, fetchFollowingIds, followUser, unfollowUser,
  fetchAllArtists, fetchProfile, upsertProfile, uploadProfileImage,
  buildMonthlyData,
  Collection, ArtistWithFollow, Profile,
} from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

// ─── SIDEBAR ─────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "artworks", label: "My Artworks", icon: ImageIcon },
  { id: "collections", label: "Collections", icon: FolderHeart },
  { id: "saved", label: "Saved", icon: Heart },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "community", label: "Community", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

const SETTINGS_CATEGORIES = [
  { id: "profile", label: "Profile", icon: Users },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "artwork", label: "Artwork Preferences", icon: ImageIcon },
  { id: "security", label: "Account & Security", icon: Shield },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
];

const COLORS = ["#C67B5C", "#8FA68A", "#5C6BC0", "#D4A853", "#FF7B9C", "#8884d8"];

// ─── REUSABLE COMPONENTS ─────────────────────────────────────
const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white/70 dark:bg-charcoal-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden transition-all duration-300", className)}>
    {children}
  </div>
);

const SectionTitle = ({ title, icon: Icon, action }: { title: string; icon?: React.ElementType; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-3xl font-handwriting font-medium tracking-wide text-charcoal-900 dark:text-warm-100 flex items-center gap-2">
      {Icon && <Icon className="w-6 h-6 text-accent-terracotta dark:text-[#D4A853]" />}
      {title}
    </h2>
    {action && <div>{action}</div>}
  </div>
);

const EmptyState = ({ icon: Icon, title, desc, action }: { icon: React.ElementType; title: string; desc: string; action?: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-white/50 dark:bg-charcoal-800/50 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-charcoal-400 dark:text-charcoal-500" />
    </div>
    <h3 className="text-2xl font-handwriting font-medium tracking-wide text-charcoal-900 dark:text-warm-100 mb-2">{title}</h3>
    <p className="font-handwriting tracking-wide text-xl text-charcoal-500 dark:text-charcoal-400 max-w-xs mb-4">{desc}</p>
    {action}
  </div>
);

// ─── ARTWORK CARD ────────────────────────────────────────────
const ArtworkCard = ({ art, onDelete, showDelete }: { art: ArtworkDB; onDelete?: () => void; showDelete?: boolean }) => (
  <div className="group relative rounded-2xl overflow-hidden bg-charcoal-100 dark:bg-charcoal-900 border border-white/50 dark:border-white/10 shadow-sm">
    <div className="aspect-[4/5] relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art.image_url} alt={art.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {showDelete && onDelete && (
        <button
          onClick={onDelete}
          className="absolute bottom-3 left-3 z-20 p-2 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-md hover:scale-110"
          title="Delete artwork"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
    <div className="p-4 bg-white/80 dark:bg-charcoal-900/80 backdrop-blur-md absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
      <h3 className="font-handwriting font-medium tracking-wide text-2xl text-charcoal-900 dark:text-warm-100 truncate mb-1">{art.title}</h3>
      <div className="flex items-center gap-3 font-handwriting text-lg text-charcoal-500 dark:text-charcoal-400">
        <span className="flex items-center gap-1"><FolderHeart className="w-3 h-3" /> {formatNumber(art.saves || 0)}</span>
        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {formatNumber(art.likes || 0)}</span>
      </div>
    </div>
  </div>
);

// ─── SAVED ARTWORK CARD ──────────────────────────────────────
const SavedCard = ({ art, onUnsave }: { art: ArtworkDB; onUnsave: () => void }) => (
  <div className="group relative rounded-2xl overflow-hidden bg-charcoal-100 dark:bg-charcoal-900 border border-white/50 dark:border-white/10 shadow-sm">
    <div className="aspect-[4/5] relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art.image_url} alt={art.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <button
        onClick={onUnsave}
        className="absolute top-3 right-3 z-20 p-2 bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white transition-all shadow-md hover:scale-110"
        title="Remove from saved"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
    <div className="p-3 border-t border-white/20 dark:border-white/10">
      <h3 className="font-handwriting font-medium tracking-wide text-2xl text-charcoal-900 dark:text-warm-100 truncate">{art.title}</h3>
      <p className="font-handwriting text-lg text-charcoal-500 dark:text-charcoal-400 capitalize">{art.artist_name}</p>
    </div>
  </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile");
  const [mounted, setMounted] = useState(false);

  // Data states
  const [myArtworks, setMyArtworks] = useState<ArtworkDB[]>([]);
  const [savedArtworks, setSavedArtworks] = useState<ArtworkDB[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [artists, setArtists] = useState<ArtistWithFollow[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileForm, setProfileForm] = useState({ display_name: "", username: "", bio: "" });
  const [loading, setLoading] = useState(true);

  // Collection modal state
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [savingCollection, setSavingCollection] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { user, isAuthenticated, setUserAvatarUrl } = useArtStore();

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace("/login?next=/dashboard");
    }
  }, [isAuthenticated, mounted, router]);

  // ── Data loading ──────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [arts, saved, cols, fCount, artistList, prof] = await Promise.all([
      fetchArtworks().then(all => all.filter(a => a.user_id === user.id)),
      fetchSavedArtworks(user.id),
      fetchCollections(user.id),
      fetchFollowerCount(user.id),
      fetchAllArtists(user.id),
      fetchProfile(user.id),
    ]);
    setMyArtworks(arts);
    setSavedArtworks(saved);
    setCollections(cols);
    setFollowerCount(fCount);
    setArtists(artistList);
    setProfile(prof);
    setAvatarUrl(prof?.avatar_url || null);
    setProfileForm({
      display_name: prof?.display_name || user.user_metadata?.full_name || "",
      username: prof?.username || user.user_metadata?.full_name?.toLowerCase().replace(/\s+/g, "") || "",
      bio: prof?.bio || "",
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      loadData();
    }
  }, [mounted, isAuthenticated, user, loadData]);

  // ── Computed values ───────────────────────────────────────
  const userName = profileForm.display_name || user?.user_metadata?.full_name || "Artist";
  const totalLikes = myArtworks.reduce((s, a) => s + (a.likes || 0), 0);
  const totalComments = myArtworks.reduce((s, a) => s + (a.comments || 0), 0);
  const totalSaves = myArtworks.reduce((s, a) => s + (a.saves || 0), 0);
  const topArtwork = myArtworks.length > 0 ? [...myArtworks].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0] : null;

  const categoryCounts = myArtworks.reduce((acc, art) => {
    const cat = art.category || "other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const realPieData = Object.entries(categoryCounts).map(([name, value], i) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: COLORS[i % COLORS.length],
  }));
  const monthlyData = buildMonthlyData(myArtworks);

  // ── Handlers ─────────────────────────────────────────────
  const handleDeleteArtwork = async (id: string, imageUrl: string) => {
    if (!user || !confirm("Delete this artwork permanently?")) return;
    const ok = await deleteArtwork(id, imageUrl, user.id);
    if (ok) setMyArtworks(prev => prev.filter(a => a.id !== id));
  };

  const handleUnsave = async (artworkId: string) => {
    if (!user) return;
    const ok = await unsaveArtwork(user.id, artworkId);
    if (ok) setSavedArtworks(prev => prev.filter(a => a.id !== artworkId));
  };

  const handleCreateCollection = async () => {
    if (!user || !newCollectionName.trim()) return;
    setSavingCollection(true);
    const col = await createCollection({ name: newCollectionName.trim(), description: newCollectionDesc.trim(), user_id: user.id });
    if (col) {
      setCollections(prev => [{ ...col, artwork_count: 0 }, ...prev]);
      setNewCollectionName("");
      setNewCollectionDesc("");
      setShowCreateCollection(false);
    }
    setSavingCollection(false);
  };

  const handleDeleteCollection = async (id: string) => {
    if (!user || !confirm("Delete this collection?")) return;
    const ok = await deleteCollection(id, user.id);
    if (ok) setCollections(prev => prev.filter(c => c.id !== id));
  };

  const handleFollow = async (artistId: string) => {
    if (!user) return;
    const ok = await followUser(user.id, artistId);
    if (ok) {
      setArtists(prev => prev.map(a => a.id === artistId ? { ...a, is_following: true, followers_count: a.followers_count + 1 } : a));
    }
  };

  const handleUnfollow = async (artistId: string) => {
    if (!user) return;
    const ok = await unfollowUser(user.id, artistId);
    if (ok) {
      setArtists(prev => prev.map(a => a.id === artistId ? { ...a, is_following: false, followers_count: Math.max(0, a.followers_count - 1) } : a));
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    setProfileError(null);
    try {
      let finalAvatarUrl = avatarUrl;

      // Upload avatar if a new file is selected
      if (avatarFile) {
        setAvatarUploading(true);
        const uploadedUrl = await uploadProfileImage(avatarFile, user.id, avatarUrl);
        if (!uploadedUrl) {
          setProfileError("Failed to upload profile picture. Please try again.");
          setProfileSaving(false);
          setAvatarUploading(false);
          return;
        }
        finalAvatarUrl = uploadedUrl;
        setAvatarUrl(uploadedUrl);
        setUserAvatarUrl(uploadedUrl); // Sync to global store for navbar
        setAvatarFile(null);
        setAvatarPreview(null);
        setAvatarUploading(false);
      }

      const ok = await upsertProfile({ id: user.id, ...profileForm, avatar_url: finalAvatarUrl || undefined });
      if (ok) {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
      } else {
        setProfileError("Failed to update profile. Please try again.");
      }
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile.");
    }
    setProfileSaving(false);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setProfileError("Invalid file type. Please use JPG, JPEG, PNG, or WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Image is too large. Maximum size is 5MB.");
      return;
    }
    setProfileError(null);
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  if (!mounted || !isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pt-[var(--nav-height)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" />
          <p className="text-charcoal-600 dark:text-charcoal-400 font-medium font-display animate-pulse">Loading your creative space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-[var(--nav-height)] flex relative z-10">

      {/* ── SIDEBAR ── */}
      <aside className="w-64 fixed top-[var(--nav-height)] bottom-0 left-0 border-r border-white/20 dark:border-white/10 bg-white/40 dark:bg-charcoal-950/60 backdrop-blur-2xl hidden lg:flex flex-col py-8 z-10 overflow-y-auto custom-scrollbar">
        <div className="px-6 flex flex-col items-center mb-8 pb-8 border-b border-white/20 dark:border-white/10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-accent-terracotta to-[#D4A853] p-1 mb-4 shadow-lg">
            <div className="w-full h-full rounded-full bg-white dark:bg-charcoal-900 flex items-center justify-center overflow-hidden border-2 border-white dark:border-charcoal-900">
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : user?.user_metadata?.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-display text-charcoal-900 dark:text-warm-100">{userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
          <h2 className="font-handwriting font-medium tracking-wide text-lg text-charcoal-900 dark:text-warm-100 mb-1 text-center">{userName}</h2>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mb-2 text-center">{followerCount} Followers</p>
          <button onClick={() => { setActiveTab("settings"); setActiveSettingsTab("profile"); }} className="px-5 py-2 rounded-full bg-white/60 dark:bg-charcoal-800/60 hover:bg-white dark:hover:bg-charcoal-700 border border-white/40 dark:border-white/10 text-sm font-medium text-charcoal-900 dark:text-warm-100 transition-colors shadow-sm w-full">
            Edit Profile
          </button>
        </div>
        <div className="flex-1 space-y-1.5 px-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 dark:text-charcoal-500 mb-4 pl-4">Menu</p>
          {SIDEBAR_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 relative group", activeTab === item.id ? "bg-white/80 text-charcoal-900 dark:bg-charcoal-800/80 dark:text-warm-100 shadow-sm" : "text-charcoal-600 dark:text-charcoal-400 hover:bg-white/50 dark:hover:bg-charcoal-800/50 hover:text-charcoal-900 dark:hover:text-warm-100")}>
              {activeTab === item.id && (
                <motion.div layoutId="activeSidebarIndicator" className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-accent-terracotta dark:bg-[#D4A853] rounded-r-full" />
              )}
              <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", activeTab === item.id ? "text-accent-terracotta dark:text-[#D4A853]" : "opacity-70")} />
              {item.label}
            </button>
          ))}
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 mt-8">
            <LogOut className="w-5 h-5 opacity-70" /> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 xl:p-10 w-full overflow-x-hidden">
        <div className="max-w-screen-2xl mx-auto space-y-8 pb-20">

          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="font-handwriting font-bold text-4xl md:text-5xl text-charcoal-900 dark:text-warm-100 mb-2">
                Welcome back, {userName.split(" ")[0]}
              </h1>
              <p className="font-handwriting tracking-wide text-xl text-charcoal-600 dark:text-charcoal-300">Here&apos;s a comprehensive overview of your creative journey.</p>
            </div>
            <Link href="/upload" className="btn-primary py-3 px-6 inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
              <Plus className="w-5 h-5" /> Upload Artwork
            </Link>
          </header>

          <AnimatePresence mode="wait">

            {/* ═══════════════════════════════════════
                OVERVIEW
            ═══════════════════════════════════════ */}
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { label: "Total Artworks", value: formatNumber(myArtworks.length), color: "#5C6BC0", icon: ImageIcon },
                      { label: "Total Likes", value: formatNumber(totalLikes), color: "#D4A853", icon: Heart },
                      { label: "Total Saves", value: formatNumber(totalSaves), color: "#8FA68A", icon: FolderHeart },
                      { label: "Followers", value: formatNumber(followerCount), color: "#C67B5C", icon: Users },
                    ].map((stat, i) => (
                      <GlassCard key={i} className="p-6 relative group hover:bg-white/90 dark:hover:bg-charcoal-800/90 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-xl bg-white dark:bg-charcoal-900 shadow-sm border border-white/50 dark:border-white/10">
                            <stat.icon className="w-5 h-5 text-charcoal-700 dark:text-warm-100" />
                          </div>
                          <p className="font-handwriting tracking-wide text-2xl text-charcoal-600 dark:text-charcoal-300">{stat.label}</p>
                        </div>
                        <h3 className="text-3xl font-display font-bold text-charcoal-900 dark:text-warm-100 tracking-tight">{stat.value}</h3>
                      </GlassCard>
                    ))}
                  </div>
                  {/* Creator Score Card */}
                  <GlassCard className="xl:col-span-1 p-8 bg-gradient-to-br from-charcoal-900 to-charcoal-950 dark:from-[#1A1A1A] dark:to-[#0A0A0A] border-none text-white relative overflow-hidden flex flex-col justify-center items-center text-center">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-bl from-accent-terracotta/30 to-transparent rounded-full blur-2xl" />
                    <Award className="w-12 h-12 text-[#D4A853] mb-4" />
                    <h3 className="font-handwriting tracking-wide text-2xl text-warm-100 mb-2">Total Comments</h3>
                    <p className="text-5xl font-display font-bold text-white mb-2">{formatNumber(totalComments)}</p>
                    <p className="text-sm text-charcoal-400">across all your artworks</p>
                  </GlassCard>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <GlassCard className="lg:col-span-2 p-6 md:p-8">
                    <SectionTitle title="Uploads Over Time" icon={Activity} />
                    {monthlyData.length > 0 ? (
                      <div className="h-[250px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "currentColor", opacity: 0.5 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "currentColor", opacity: 0.5 }} allowDecimals={false} />
                            <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                            <Bar dataKey="count" name="Uploads" fill="#C67B5C" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[200px] flex flex-col items-center justify-center text-center">
                        <Activity className="w-10 h-10 text-charcoal-300 dark:text-charcoal-700 mb-3" />
                        <p className="font-handwriting tracking-wide text-xl text-charcoal-500 dark:text-charcoal-400">Upload artworks to see your upload history.</p>
                      </div>
                    )}
                  </GlassCard>

                  <GlassCard className="p-6 md:p-8 flex flex-col min-h-[300px]">
                    <SectionTitle title="Category Insights" icon={PieChartIcon} />
                    {realPieData.length > 0 ? (
                      <div className="flex-1 min-h-[200px] relative mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={realPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                              {realPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-2">
                          {realPieData.map((e, i) => (
                            <div key={i} className="flex items-center gap-1.5 font-handwriting text-lg text-charcoal-600 dark:text-charcoal-300">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                              {e.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <PieChartIcon className="w-8 h-8 text-charcoal-300 dark:text-charcoal-700 mb-3" />
                        <p className="font-handwriting tracking-wide text-xl text-charcoal-500 dark:text-charcoal-400">No categories to display.</p>
                      </div>
                    )}
                  </GlassCard>
                </div>

                {/* Recent Artworks */}
                <GlassCard className="p-6 md:p-8">
                  <SectionTitle title="Recent Artworks" icon={ImageIcon}
                    action={<button onClick={() => setActiveTab("artworks")} className="text-sm font-semibold text-accent-terracotta dark:text-[#D4A853] hover:underline">View All</button>}
                  />
                  {myArtworks.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {myArtworks.slice(0, 5).map(art => (
                        <ArtworkCard key={art.id} art={art} showDelete onDelete={() => handleDeleteArtwork(art.id, art.image_url)} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={ImageIcon} title="No Artworks Yet" desc="Upload your first artwork to see it here." action={<Link href="/upload" className="btn-primary py-2 px-5 text-sm inline-flex items-center gap-2"><Plus className="w-4 h-4" />Upload Now</Link>} />
                  )}
                </GlassCard>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Activity */}
                  <GlassCard className="p-6 md:p-8">
                    <SectionTitle title="Recent Activity" icon={BellRing} />
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessageSquare className="w-8 h-8 text-charcoal-300 dark:text-charcoal-700 mb-3" />
                      <p className="font-handwriting tracking-wide text-xl text-charcoal-500 dark:text-charcoal-400">No recent activity.</p>
                    </div>
                  </GlassCard>

                  {/* Top Performing */}
                  <GlassCard className="p-6 md:p-8">
                    <SectionTitle title="Top Performing" icon={TrendingUp} />
                    {topArtwork ? (
                      <div className="mt-4">
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-sm border border-white/20 dark:border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={topArtwork.image_url} alt={topArtwork.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-charcoal-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-[#D4A853]" /> #1 Top
                          </div>
                        </div>
                        <h3 className="font-handwriting font-medium tracking-wide text-2xl text-charcoal-900 dark:text-warm-100 mb-1">{topArtwork.title}</h3>
                        <p className="font-handwriting text-xl text-charcoal-500 dark:text-charcoal-400 capitalize mb-4">{topArtwork.category}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/50 dark:bg-charcoal-800/50 rounded-xl p-3 border border-white/40 dark:border-white/5">
                            <p className="font-handwriting tracking-wide text-lg text-charcoal-500 dark:text-charcoal-400 mb-1">Saves</p>
                            <p className="text-xl font-display font-bold text-charcoal-900 dark:text-warm-100">{formatNumber(topArtwork.saves || 0)}</p>
                          </div>
                          <div className="bg-white/50 dark:bg-charcoal-800/50 rounded-xl p-3 border border-white/40 dark:border-white/5">
                            <p className="font-handwriting tracking-wide text-lg text-charcoal-500 dark:text-charcoal-400 mb-1">Likes</p>
                            <p className="text-xl font-display font-bold text-[#C67B5C]">{formatNumber(topArtwork.likes || 0)}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-charcoal-500 text-sm">Upload artworks to see top performer.</div>
                    )}
                  </GlassCard>

                  {/* Quick Actions */}
                  <GlassCard className="p-6 md:p-8">
                    <SectionTitle title="Quick Actions" icon={LayoutDashboard} />
                    <div className="space-y-4 mt-4">
                      <Link href="/upload" className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-accent-terracotta to-[#D4A853] text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="p-2 rounded-xl bg-white/20"><Plus className="w-5 h-5" /></div>
                        <div className="text-left flex-1"><h4 className="font-handwriting font-medium text-xl">Upload Artwork</h4><p className="font-handwriting text-lg text-white/80">Share your latest creation</p></div>
                        <ChevronRight className="w-5 h-5 opacity-70" />
                      </Link>
                      <button onClick={() => setActiveTab("collections")} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-charcoal-800/60 hover:bg-white/90 dark:hover:bg-charcoal-700/80 border border-white/40 dark:border-white/10 transition-all duration-300 transform hover:-translate-y-1 text-charcoal-900 dark:text-warm-100">
                        <div className="p-2 rounded-xl bg-charcoal-100 dark:bg-charcoal-900"><FolderHeart className="w-5 h-5 text-[#5C6BC0]" /></div>
                        <div className="text-left flex-1"><h4 className="font-handwriting font-medium text-xl text-charcoal-900 dark:text-warm-100">My Collections</h4><p className="font-handwriting text-lg text-charcoal-500 dark:text-charcoal-400">{collections.length} collections</p></div>
                        <ChevronRight className="w-5 h-5 text-charcoal-400" />
                      </button>
                      <button onClick={() => { setActiveTab("settings"); setActiveSettingsTab("profile"); }} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-charcoal-800/60 hover:bg-white/90 dark:hover:bg-charcoal-700/80 border border-white/40 dark:border-white/10 transition-all duration-300 transform hover:-translate-y-1 text-charcoal-900 dark:text-warm-100">
                        <div className="p-2 rounded-xl bg-charcoal-100 dark:bg-charcoal-900"><Settings className="w-5 h-5 text-[#8FA68A]" /></div>
                        <div className="text-left flex-1"><h4 className="font-handwriting font-medium text-xl text-charcoal-900 dark:text-warm-100">Edit Profile</h4><p className="font-handwriting text-lg text-charcoal-500 dark:text-charcoal-400">Update bio and links</p></div>
                        <ChevronRight className="w-5 h-5 text-charcoal-400" />
                      </button>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════
                MY ARTWORKS
            ═══════════════════════════════════════ */}
            {activeTab === "artworks" && (
              <motion.div key="artworks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
                <GlassCard className="p-6 md:p-8">
                  <SectionTitle title="My Artworks" icon={ImageIcon}
                    action={<span className="font-handwriting text-xl text-charcoal-500 dark:text-charcoal-400">{myArtworks.length} total</span>}
                  />
                  {myArtworks.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {myArtworks.map(art => (
                        <ArtworkCard key={art.id} art={art} showDelete onDelete={() => handleDeleteArtwork(art.id, art.image_url)} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={ImageIcon} title="No Artworks Yet" desc="Start uploading your art to build your portfolio." action={<Link href="/upload" className="btn-primary py-2 px-5 text-sm inline-flex items-center gap-2"><Plus className="w-4 h-4" />Upload Your First Artwork</Link>} />
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════
                COLLECTIONS
            ═══════════════════════════════════════ */}
            {activeTab === "collections" && (
              <motion.div key="collections" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
                <GlassCard className="p-6 md:p-8">
                  <SectionTitle title="My Collections" icon={FolderHeart}
                    action={
                      <button onClick={() => setShowCreateCollection(true)} className="btn-primary py-2 px-4 text-sm inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Collection
                      </button>
                    }
                  />

                  {/* Create Collection Modal */}
                  {showCreateCollection && (
                    <div className="mb-6 p-5 rounded-2xl bg-white/50 dark:bg-charcoal-800/50 border border-white/40 dark:border-white/10">
                      <h3 className="font-handwriting font-medium tracking-wide text-2xl text-charcoal-900 dark:text-warm-100 mb-4">Create New Collection</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Collection name *"
                          value={newCollectionName}
                          onChange={e => setNewCollectionName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-charcoal-900/70 border border-charcoal-200 dark:border-charcoal-700 focus:outline-none focus:ring-2 focus:ring-accent-terracotta text-sm text-charcoal-900 dark:text-warm-100"
                        />
                        <textarea
                          placeholder="Description (optional)"
                          value={newCollectionDesc}
                          onChange={e => setNewCollectionDesc(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-charcoal-900/70 border border-charcoal-200 dark:border-charcoal-700 focus:outline-none focus:ring-2 focus:ring-accent-terracotta text-sm text-charcoal-900 dark:text-warm-100 resize-none"
                        />
                        <div className="flex gap-3">
                          <button onClick={handleCreateCollection} disabled={!newCollectionName.trim() || savingCollection} className="btn-primary py-2 px-5 text-sm disabled:opacity-50">
                            {savingCollection ? "Creating..." : "Create"}
                          </button>
                          <button onClick={() => setShowCreateCollection(false)} className="py-2 px-5 text-sm rounded-xl border border-white/40 dark:border-white/10 text-charcoal-600 dark:text-charcoal-400 hover:bg-white/50 dark:hover:bg-charcoal-800/50 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {collections.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {collections.map(col => (
                        <Link href={`/collection/${col.id}`} key={col.id} className="group relative rounded-2xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-charcoal-800/50 p-5 hover:bg-white/80 dark:hover:bg-charcoal-700/60 transition-all duration-300 block">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-terracotta to-[#D4A853] flex items-center justify-center mb-3 shadow-sm">
                            <FolderHeart className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-handwriting font-medium tracking-wide text-2xl text-charcoal-900 dark:text-warm-100 mb-1 truncate">{col.name}</h3>
                          {col.description && <p className="font-handwriting text-lg text-charcoal-500 dark:text-charcoal-400 mb-3 line-clamp-2">{col.description}</p>}
                          <div className="flex items-center justify-between">
                            <span className="font-handwriting text-lg text-charcoal-500 dark:text-charcoal-400">{col.artwork_count ?? 0} artworks</span>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteCollection(col.id); }} className="p-1.5 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={FolderHeart} title="No Collections Yet" desc="Group your favourite artworks into collections." action={<button onClick={() => setShowCreateCollection(true)} className="btn-primary py-2 px-5 text-sm inline-flex items-center gap-2"><Plus className="w-4 h-4" />Create First Collection</button>} />
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════
                SAVED
            ═══════════════════════════════════════ */}
            {activeTab === "saved" && (
              <motion.div key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
                <GlassCard className="p-6 md:p-8">
                  <SectionTitle title="Saved Artworks" icon={Heart}
                    action={<span className="font-handwriting text-xl text-charcoal-500 dark:text-charcoal-400">{savedArtworks.length} saved</span>}
                  />
                  {savedArtworks.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {savedArtworks.map(art => (
                        <SavedCard key={art.id} art={art} onUnsave={() => handleUnsave(art.id)} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={Heart} title="No Saved Artworks" desc="Browse the gallery and save artworks you love." action={<Link href="/gallery" className="btn-primary py-2 px-5 text-sm inline-flex items-center gap-2"><Eye className="w-4 h-4" />Browse Gallery</Link>} />
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════
                ANALYTICS
            ═══════════════════════════════════════ */}
            {activeTab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
                {/* Stat Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Artworks", value: myArtworks.length, icon: ImageIcon, color: "#5C6BC0" },
                    { label: "Total Likes", value: totalLikes, icon: Heart, color: "#D4A853" },
                    { label: "Total Saves", value: totalSaves, icon: FolderHeart, color: "#8FA68A" },
                    { label: "Total Comments", value: totalComments, icon: MessageSquare, color: "#C67B5C" },
                  ].map((s, i) => (
                    <GlassCard key={i} className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-white dark:bg-charcoal-900 shadow-sm border border-white/50 dark:border-white/10">
                          <s.icon className="w-4 h-4 text-charcoal-700 dark:text-warm-100" />
                        </div>
                        <p className="font-handwriting tracking-wide text-xl text-charcoal-600 dark:text-charcoal-300">{s.label}</p>
                      </div>
                      <p className="text-2xl font-display font-bold text-charcoal-900 dark:text-warm-100">{formatNumber(s.value)}</p>
                    </GlassCard>
                  ))}
                </div>

                {/* Upload History Chart */}
                <GlassCard className="p-6 md:p-8">
                  <SectionTitle title="Upload History" icon={BarChart3} />
                  {monthlyData.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "currentColor", opacity: 0.5 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "currentColor", opacity: 0.5 }} allowDecimals={false} />
                          <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                          <Bar dataKey="count" name="Artworks Uploaded" fill="#C67B5C" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyState icon={BarChart3} title="No data yet" desc="Upload artworks to see your upload history chart." />
                  )}
                </GlassCard>

                {/* Category Breakdown */}
                <GlassCard className="p-6 md:p-8">
                  <SectionTitle title="Category Breakdown" icon={PieChartIcon} />
                  {realPieData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={realPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                              {realPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {realPieData.map((e, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                              <span className="font-handwriting tracking-wide text-xl text-charcoal-900 dark:text-warm-100">{e.name}</span>
                            </div>
                            <span className="font-handwriting text-xl text-charcoal-600 dark:text-charcoal-300">{e.value} artworks</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyState icon={PieChartIcon} title="No categories" desc="Upload artworks with different categories to see the breakdown." />
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════
                COMMUNITY
            ═══════════════════════════════════════ */}
            {activeTab === "community" && (
              <motion.div key="community" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
                <GlassCard className="p-6 md:p-8">
                  <SectionTitle title="Discover Artists" icon={Users}
                    action={<span className="font-handwriting text-xl text-charcoal-500 dark:text-charcoal-400">{artists.length} artists</span>}
                  />
                  {artists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {artists.map(artist => (
                        <div key={artist.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-charcoal-800/50 border border-white/40 dark:border-white/10 hover:bg-white/80 dark:hover:bg-charcoal-700/60 transition-all duration-300">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-terracotta to-[#D4A853] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {artist.avatar_url
                              ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={artist.avatar_url} alt={artist.display_name} className="w-full h-full rounded-full object-cover" />
                              : artist.display_name.charAt(0).toUpperCase()
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-handwriting font-medium tracking-wide text-2xl text-charcoal-900 dark:text-warm-100 truncate">{artist.display_name}</h3>
                            <p className="font-handwriting text-lg text-charcoal-500 dark:text-charcoal-400 truncate">{artist.bio || "Artist"}</p>
                          </div>
                          <button
                            onClick={() => artist.is_following ? handleUnfollow(artist.id) : handleFollow(artist.id)}
                            className={cn("flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
                              artist.is_following
                                ? "bg-charcoal-100 dark:bg-charcoal-700 text-charcoal-600 dark:text-charcoal-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                                : "bg-accent-terracotta text-white hover:bg-accent-terracotta/90"
                            )}
                          >
                            {artist.is_following
                              ? <><UserCheck className="w-3.5 h-3.5" /> Following</>
                              : <><UserPlus className="w-3.5 h-3.5" /> Follow</>
                            }
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={Users} title="No other artists yet" desc="Be the first to upload artworks and join the community." />
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════
                SETTINGS
            ═══════════════════════════════════════ */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <GlassCard className="lg:col-span-1 p-4 h-fit sticky top-24">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-400 dark:text-charcoal-500 mb-4 px-4 pt-2">Settings Menu</h3>
                  <div className="space-y-1">
                    {SETTINGS_CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => setActiveSettingsTab(cat.id)}
                        className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 text-left",
                          activeSettingsTab === cat.id
                            ? cat.danger ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" : "bg-white/80 dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 shadow-sm"
                            : cat.danger ? "text-red-500/70 hover:bg-red-50/50 hover:text-red-600 dark:hover:bg-red-950/20" : "text-charcoal-600 dark:text-charcoal-400 hover:bg-white/50 dark:hover:bg-charcoal-800/50"
                        )}>
                        <cat.icon className={cn("w-4 h-4", activeSettingsTab === cat.id && !cat.danger ? "text-accent-terracotta dark:text-[#D4A853]" : "")} />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <div className="lg:col-span-3 space-y-6">
                  {activeSettingsTab === "profile" && (
                    <GlassCard className="p-8">
                      <SectionTitle title="Public Profile" icon={Users} />
                      <div className="space-y-6">
                        {/* ── Avatar Upload ── */}
                        <div className="flex items-start gap-6 pb-6 border-b border-white/20 dark:border-white/10">
                          <div className="relative flex-shrink-0">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-accent-terracotta to-[#D4A853] p-1 shadow-lg">
                              <div className="w-full h-full rounded-full bg-white dark:bg-charcoal-900 overflow-hidden">
                                {avatarUploading ? (
                                  <div className="w-full h-full flex items-center justify-center bg-charcoal-100 dark:bg-charcoal-800">
                                    <Loader2 className="w-8 h-8 text-accent-terracotta animate-spin" />
                                  </div>
                                ) : avatarPreview ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : avatarUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : user?.user_metadata?.avatar_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="w-full h-full flex items-center justify-center text-4xl font-display text-charcoal-500 dark:text-charcoal-400">{userName.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => avatarInputRef.current?.click()}
                              disabled={avatarUploading}
                              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-accent-terracotta text-white flex items-center justify-center shadow-lg hover:bg-accent-terracotta/90 transition-colors border-2 border-white dark:border-charcoal-900 disabled:opacity-50"
                              title="Change profile picture"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                            <input
                              ref={avatarInputRef}
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              className="hidden"
                              onChange={handleAvatarFileChange}
                            />
                          </div>
                          <div className="flex-1 pt-2">
                            <h4 className="font-handwriting font-medium tracking-wide text-2xl text-charcoal-900 dark:text-warm-100 mb-1">Profile Picture</h4>
                            <p className="font-handwriting text-lg text-charcoal-500 dark:text-charcoal-400 mb-3">JPG, JPEG, PNG or WEBP — max 5MB</p>
                            <button
                              type="button"
                              onClick={() => avatarInputRef.current?.click()}
                              disabled={avatarUploading}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-charcoal-200 dark:border-charcoal-700 text-sm font-medium text-charcoal-700 dark:text-charcoal-300 hover:bg-white/60 dark:hover:bg-charcoal-800/60 transition-colors disabled:opacity-50"
                            >
                              <Camera className="w-4 h-4" />
                              {avatarFile ? "Change Selection" : "Choose Photo"}
                            </button>
                            {avatarFile && (
                              <p className="mt-2 font-handwriting text-lg text-accent-terracotta dark:text-[#D4A853]">
                                ✓ {avatarFile.name} selected — click Save Changes to upload
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="font-handwriting tracking-wide text-xl text-charcoal-700 dark:text-charcoal-300">Display Name</label>
                            <input type="text" value={profileForm.display_name} onChange={e => setProfileForm(p => ({ ...p, display_name: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-charcoal-900/50 border border-charcoal-200 dark:border-charcoal-800 focus:outline-none focus:ring-2 focus:ring-accent-terracotta text-sm text-charcoal-900 dark:text-warm-100" />
                          </div>
                          <div className="space-y-2">
                            <label className="font-handwriting tracking-wide text-xl text-charcoal-700 dark:text-charcoal-300">Username</label>
                            <input type="text" value={profileForm.username} onChange={e => setProfileForm(p => ({ ...p, username: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-charcoal-900/50 border border-charcoal-200 dark:border-charcoal-800 focus:outline-none focus:ring-2 focus:ring-accent-terracotta text-sm text-charcoal-900 dark:text-warm-100" />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="font-handwriting tracking-wide text-xl text-charcoal-700 dark:text-charcoal-300">Bio</label>
                            <textarea rows={4} value={profileForm.bio} onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell the community about yourself..." className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-charcoal-900/50 border border-charcoal-200 dark:border-charcoal-800 focus:outline-none focus:ring-2 focus:ring-accent-terracotta text-sm text-charcoal-900 dark:text-warm-100 resize-none" />
                          </div>
                        </div>
                        {/* Error & Success Messages */}
                        {profileError && (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                            <X className="w-4 h-4 flex-shrink-0" />
                            <p className="font-handwriting text-xl">{profileError}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/20 dark:border-white/10">
                          {profileSaved && (
                            <span className="flex items-center gap-1.5 font-handwriting text-xl text-green-600 dark:text-green-400">
                              <Check className="w-4 h-4" /> Profile updated successfully!
                            </span>
                          )}
                          <button onClick={handleSaveProfile} disabled={profileSaving || avatarUploading} className="btn-primary py-2.5 px-8 disabled:opacity-50 flex items-center gap-2">
                            {(profileSaving || avatarUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                            {profileSaving ? "Saving..." : avatarUploading ? "Uploading..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  )}

                  {activeSettingsTab !== "profile" && (
                    <GlassCard className="p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/50 dark:bg-charcoal-800/50 flex items-center justify-center mb-4">
                        <Settings className="w-8 h-8 text-charcoal-400 dark:text-charcoal-500" />
                      </div>
                      <h3 className="font-handwriting tracking-wide text-3xl text-charcoal-900 dark:text-warm-100 mb-2 capitalize">{activeSettingsTab} Settings</h3>
                      <p className="font-handwriting tracking-wide text-xl text-charcoal-500 dark:text-charcoal-400 max-w-sm">This section is coming soon.</p>
                    </GlassCard>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
