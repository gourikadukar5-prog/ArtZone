"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Image as ImageIcon, FolderHeart, 
  Heart, BarChart3, Settings, Plus, Trash2, Edit2, 
  Eye, TrendingUp, Users, MessageSquare, BellRing,
  MoreVertical, ChevronRight, LogOut, Activity,
  PieChart as PieChartIcon, Award, Shield, Palette,
  Bell, Lock, Mail, Smartphone, AlertTriangle, ArrowUpRight
} from "lucide-react";
import { formatNumber, cn } from "@/lib/utils";
import { useArtStore } from "@/lib/store";
import { fetchArtworks, deleteArtwork, ArtworkDB } from "@/lib/artworks";
import { useRouter } from "next/navigation";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const SIDEBAR_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "artworks", label: "My Artworks", icon: ImageIcon },
  { id: "collections", label: "Collections", icon: FolderHeart },
  { id: "saved", label: "Saved", icon: Heart },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "community", label: "Community", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

// --- MOCK DATA ---
const analyticsData = [
  { name: 'Mon', views: 4000, likes: 2400, followers: 200, engagement: 600 },
  { name: 'Tue', views: 3000, likes: 1398, followers: 150, engagement: 400 },
  { name: 'Wed', views: 5000, likes: 3800, followers: 400, engagement: 900 },
  { name: 'Thu', views: 2780, likes: 3908, followers: 300, engagement: 500 },
  { name: 'Fri', views: 4890, likes: 4800, followers: 500, engagement: 1200 },
  { name: 'Sat', views: 6390, likes: 5800, followers: 800, engagement: 1500 },
  { name: 'Sun', views: 7490, likes: 6300, followers: 1000, engagement: 2100 },
];

const pieData = [
  { name: 'Sketches', value: 400, color: '#C67B5C' },
  { name: 'Mandala', value: 300, color: '#8FA68A' },
  { name: 'Digital Art', value: 300, color: '#5C6BC0' },
  { name: 'Portraits', value: 200, color: '#D4A853' },
  { name: 'Anime', value: 150, color: '#FF7B9C' },
  { name: 'Others', value: 50, color: '#8884d8' },
];

const activityFeed = [
  { id: 1, user: "Alex Chen", action: "liked your artwork", item: "Cosmic Mandala", time: "2 hours ago", icon: Heart, color: "text-[#C67B5C] bg-[#C67B5C]/10" },
  { id: 2, user: "Sarah Smith", action: "started following you", item: "", time: "5 hours ago", icon: Users, color: "text-[#5C6BC0] bg-[#5C6BC0]/10" },
  { id: 3, user: "David Kim", action: "commented on", item: "Urban Sketch", time: "Yesterday", icon: MessageSquare, color: "text-[#8FA68A] bg-[#8FA68A]/10" },
  { id: 4, user: "Elena", action: "saved your artwork", item: "Sacred Geometry", time: "Yesterday", icon: FolderHeart, color: "text-[#D4A853] bg-[#D4A853]/10" },
];

const SETTINGS_CATEGORIES = [
  { id: 'profile', label: 'Profile', icon: Users },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'artwork', label: 'Artwork Preferences', icon: ImageIcon },
  { id: 'security', label: 'Account & Security', icon: Shield },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
];

// --- REUSABLE COMPONENTS ---
const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white/70 dark:bg-charcoal-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden transition-all duration-300", className)}>
    {children}
  </div>
);

const SectionTitle = ({ title, icon: Icon, action }: { title: string, icon?: React.ElementType, action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-display font-semibold text-charcoal-900 dark:text-warm-100 flex items-center gap-2">
      {Icon && <Icon className="w-5 h-5 text-accent-terracotta dark:text-[#D4A853]" />}
      {title}
    </h2>
    {action && <div>{action}</div>}
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile");
  const [timeFilter, setTimeFilter] = useState("7 Days");
  const [mounted, setMounted] = useState(false);
  const [myArtworks, setMyArtworks] = useState<ArtworkDB[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user, isAuthenticated } = useArtStore();

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated) {
      router.replace("/login?next=/dashboard");
    }
  }, [isAuthenticated, mounted, router]);

  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      setLoading(true);
      fetchArtworks().then((data) => {
        // Filter only the logged in user's artworks
        const userArtworks = data.filter(a => a.user_id === user.id);
        setMyArtworks(userArtworks);
        setLoading(false);
      });
    }
  }, [mounted, isAuthenticated, user]);

  const handleRemoveArtwork = async (id: string, imageUrl: string) => {
    if (!user) return;
    if (confirm("Are you sure you want to remove this artwork?")) {
      const success = await deleteArtwork(id, imageUrl, user.id);
      if (success) {
        setMyArtworks(prev => prev.filter(a => a.id !== id));
      }
    }
  };

  const userName = user?.user_metadata?.full_name || "Gouri Kadukar";
  const topArtwork = myArtworks.length > 0 ? [...myArtworks].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0] : null;

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-transparent pt-[var(--nav-height)] flex relative z-10">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 fixed top-[var(--nav-height)] bottom-0 left-0 border-r border-white/20 dark:border-white/10 bg-white/40 dark:bg-charcoal-950/60 backdrop-blur-2xl hidden lg:flex flex-col py-8 z-10 overflow-y-auto custom-scrollbar">
        {/* Profile Header */}
        <div className="px-6 flex flex-col items-center mb-8 pb-8 border-b border-white/20 dark:border-white/10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-accent-terracotta to-[#D4A853] p-1 mb-4 shadow-lg">
            <div className="w-full h-full rounded-full bg-white dark:bg-charcoal-900 flex items-center justify-center overflow-hidden border-2 border-white dark:border-charcoal-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-display text-charcoal-900 dark:text-warm-100">{userName.charAt(0)}</span>
              )}
            </div>
          </div>
          <h2 className="text-lg font-bold text-charcoal-900 dark:text-warm-100 mb-1 text-center">{userName}</h2>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mb-4 text-center">Digital Artist</p>
          <button onClick={() => { setActiveTab('settings'); setActiveSettingsTab('profile'); }} className="px-5 py-2 rounded-full bg-white/60 dark:bg-charcoal-800/60 hover:bg-white dark:hover:bg-charcoal-700 border border-white/40 dark:border-white/10 text-sm font-medium text-charcoal-900 dark:text-warm-100 transition-colors shadow-sm w-full">
            Edit Profile
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 space-y-1.5 px-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 dark:text-charcoal-500 mb-4 pl-4">Menu</p>
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 relative group",
                activeTab === item.id
                  ? "bg-white/80 text-charcoal-900 dark:bg-charcoal-800/80 dark:text-warm-100 shadow-sm"
                  : "text-charcoal-600 dark:text-charcoal-400 hover:bg-white/50 dark:hover:bg-charcoal-800/50 hover:text-charcoal-900 dark:hover:text-warm-100"
              )}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeSidebarIndicator"
                  className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-accent-terracotta dark:bg-[#D4A853] rounded-r-full" 
                />
              )}
              <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", activeTab === item.id ? "text-accent-terracotta dark:text-[#D4A853]" : "opacity-70")} />
              {item.label}
            </button>
          ))}
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 mt-8">
            <LogOut className="w-5 h-5 opacity-70" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 xl:p-10 w-full overflow-x-hidden">
        <div className="max-w-screen-2xl mx-auto space-y-8 pb-20">
          
          {/* TOP HEADER */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="font-display font-semibold text-3xl md:text-4xl text-charcoal-900 dark:text-warm-100 mb-2 tracking-tight">
                Welcome back, {userName.split(' ')[0]}
              </h1>
              <p className="text-charcoal-600 dark:text-charcoal-300 text-base">
                Here&apos;s a comprehensive overview of your creative journey.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/upload" className="btn-primary py-3 px-6 inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                <Plus className="w-5 h-5" />
                Upload Artwork
              </Link>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {/* =========================================
                OVERVIEW TAB (Massive Dashboard layout)
                ========================================= */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* SECTION 1: PERFORMANCE OVERVIEW & SECTION 2: CREATOR SCORE */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Left Col: 4 Stats Cards */}
                  <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { label: "Total Views", value: "84.2K", trend: "+12.5%", isPositive: true, data: [{v: 10}, {v: 15}, {v: 12}, {v: 20}, {v: 18}, {v: 25}, {v: 24}], color: "#C67B5C", icon: Eye },
                      { label: "Total Likes", value: "12,450", trend: "+5.2%", isPositive: true, data: [{v: 5}, {v: 10}, {v: 8}, {v: 15}, {v: 22}, {v: 18}, {v: 25}], color: "#D4A853", icon: Heart },
                      { label: "Followers", value: "3,204", trend: "+8.1%", isPositive: true, data: [{v: 100}, {v: 105}, {v: 110}, {v: 108}, {v: 115}, {v: 120}, {v: 125}], color: "#8FA68A", icon: Users },
                      { label: "Total Artworks", value: myArtworks.length.toString(), trend: "+2", isPositive: true, data: [{v: 1}, {v: 2}, {v: 2}, {v: 3}, {v: 3}, {v: 4}, {v: 5}], color: "#5C6BC0", icon: ImageIcon },
                    ].map((stat, i) => (
                      <GlassCard key={i} className="p-6 relative group hover:bg-white/90 dark:hover:bg-charcoal-800/90 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl bg-white dark:bg-charcoal-900 shadow-sm border border-white/50 dark:border-white/10 text-charcoal-700 dark:text-warm-100")}>
                              <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-semibold text-charcoal-600 dark:text-charcoal-300">{stat.label}</p>
                          </div>
                          <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1", stat.isPositive ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-charcoal-100 text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-300")}>
                            {stat.isPositive && <ArrowUpRight className="w-3 h-3" />}
                            {stat.trend}
                          </span>
                        </div>
                        <div className="flex items-end justify-between">
                          <h3 className="text-3xl font-display font-bold text-charcoal-900 dark:text-warm-100 tracking-tight">{stat.value}</h3>
                          {stat.data && (
                            <div className="h-12 w-24 opacity-80 group-hover:opacity-100 transition-opacity">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stat.data}>
                                  <Line type="monotone" dataKey="v" stroke={stat.color} strokeWidth={3} dot={false} isAnimationActive={false} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    ))}
                  </div>

                  {/* Right Col: Creator Performance Score */}
                  <GlassCard className="xl:col-span-1 p-8 bg-gradient-to-br from-charcoal-900 to-charcoal-950 dark:from-[#1A1A1A] dark:to-[#0A0A0A] border-none text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-bl from-accent-terracotta/30 to-transparent rounded-full blur-2xl" />
                    
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-semibold text-warm-100 opacity-90">Creator Impact Score</h3>
                        <Award className="w-6 h-6 text-[#D4A853]" />
                      </div>
                      
                      <div className="flex items-end gap-4 mb-2">
                        <span className="text-6xl font-display font-bold tracking-tighter text-white">92</span>
                        <span className="text-green-400 font-semibold mb-2 flex items-center"><ArrowUpRight className="w-4 h-4 mr-1" /> +4 this week</span>
                      </div>
                      <p className="text-sm text-charcoal-300 mb-8">Top 5% of artists in the Mandala category. Keep up the great work!</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-medium text-charcoal-300">
                          <span>Profile Completeness</span>
                          <span className="text-white">100%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5"><div className="bg-green-400 h-1.5 rounded-full w-full"></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-medium text-charcoal-300">
                          <span>Engagement Rate</span>
                          <span className="text-white">8.4% (Excellent)</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5"><div className="bg-[#D4A853] h-1.5 rounded-full w-[84%]"></div></div>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* SECTION 4: PERFORMANCE ANALYTICS & SECTION 7: CATEGORY INSIGHTS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Performance Analytics */}
                  <GlassCard className="lg:col-span-2 p-6 md:p-8">
                    <SectionTitle 
                      title="Performance Analytics" 
                      icon={Activity} 
                      action={
                        <div className="flex bg-white/60 dark:bg-charcoal-900/60 p-1 rounded-xl backdrop-blur-md border border-white/40 dark:border-white/10">
                          {['7 Days', '30 Days', '90 Days'].map((t) => (
                            <button key={t} onClick={() => setTimeFilter(t)} className={cn("px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors", timeFilter === t ? "bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 shadow-sm" : "text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-warm-100")}>
                              {t}
                            </button>
                          ))}
                        </div>
                      }
                    />
                    <div className="h-[300px] w-full mt-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C67B5C" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#C67B5C" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#D4A853" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#D4A853" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 dark:opacity-5" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', color: '#1A1A1A' }}
                          />
                          <Area type="monotone" dataKey="views" name="Views" stroke="#C67B5C" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                          <Area type="monotone" dataKey="likes" name="Likes" stroke="#D4A853" strokeWidth={3} fillOpacity={1} fill="url(#colorLikes)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>

                  {/* Category Insights Pie Chart */}
                  <GlassCard className="p-6 md:p-8 flex flex-col">
                    <SectionTitle title="Category Insights" icon={PieChartIcon} />
                    <div className="flex-1 min-h-[250px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Custom Legend */}
                      <div className="absolute bottom-0 w-full flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                        {pieData.slice(0,4).map((entry, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-charcoal-600 dark:text-charcoal-300 font-medium">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            {entry.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* SECTION 3: RECENT ARTWORKS */}
                <GlassCard className="p-6 md:p-8">
                  <SectionTitle 
                    title="Recent Artworks" 
                    icon={ImageIcon} 
                    action={<button className="text-sm font-semibold text-accent-terracotta dark:text-[#D4A853] hover:underline">View All</button>}
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {myArtworks.slice(0, 5).map((art) => (
                      <div key={art.id} className="group relative rounded-2xl overflow-hidden bg-charcoal-100 dark:bg-charcoal-900 border border-white/50 dark:border-white/10 shadow-sm">
                        <div className="aspect-[4/5] relative overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={art.image_url} alt={art.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Hover Actions */}
                          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-95 group-hover:scale-100">
                            <button className="p-2.5 rounded-full bg-white/95 text-charcoal-900 hover:bg-white hover:scale-110 transition-all shadow-xl">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2.5 rounded-full bg-white/95 text-charcoal-900 hover:bg-white hover:scale-110 transition-all shadow-xl">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleRemoveArtwork(art.id, art.image_url)} className="p-2.5 rounded-full bg-red-500/90 text-white hover:bg-red-500 hover:scale-110 transition-all shadow-xl">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 bg-white/80 dark:bg-charcoal-900/80 backdrop-blur-md absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="font-semibold text-sm text-charcoal-900 dark:text-warm-100 truncate mb-1">{art.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-charcoal-500 dark:text-charcoal-400">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatNumber(art.likes * 14)}</span>
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {formatNumber(art.likes)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {myArtworks.length === 0 && (
                      <div className="col-span-full py-10 text-center bg-white/40 dark:bg-charcoal-900/40 rounded-2xl border border-dashed border-warm-300 dark:border-charcoal-700">
                        <ImageIcon className="w-8 h-8 text-charcoal-400 dark:text-charcoal-500 mx-auto mb-3" />
                        <p className="text-charcoal-500 dark:text-charcoal-400 text-sm font-medium">No artworks uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </GlassCard>

                {/* SECTION 5: RECENT ACTIVITY, SECTION 6: TOP PERFORMING, SECTION 8: QUICK ACTIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Recent Activity */}
                  <GlassCard className="p-6 md:p-8">
                    <SectionTitle title="Recent Activity" icon={BellRing} />
                    <div className="space-y-6 mt-4">
                      {activityFeed.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-4 group">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm", activity.color)}>
                            <activity.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-charcoal-900 dark:text-warm-100 font-medium leading-snug">
                              {activity.user} <span className="font-normal text-charcoal-500 dark:text-charcoal-400">{activity.action}</span> {activity.item && <span className="font-semibold">{activity.item}</span>}
                            </p>
                            <p className="text-xs font-medium text-charcoal-400 dark:text-charcoal-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Top Performing Artwork */}
                  <GlassCard className="p-6 md:p-8">
                    <SectionTitle title="Top Performing" icon={TrendingUp} />
                    {topArtwork ? (
                      <div className="mt-4 flex flex-col h-[calc(100%-3rem)]">
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-sm border border-white/20 dark:border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={topArtwork.image_url} alt={topArtwork.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-charcoal-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-[#D4A853]" /> #1 This Month
                          </div>
                        </div>
                        <h3 className="font-bold text-lg text-charcoal-900 dark:text-warm-100 mb-1">{topArtwork.title}</h3>
                        <p className="text-sm text-charcoal-500 dark:text-charcoal-400 capitalize mb-4">{topArtwork.category}</p>
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                          <div className="bg-white/50 dark:bg-charcoal-800/50 rounded-xl p-3 border border-white/40 dark:border-white/5">
                            <p className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 mb-1">Total Views</p>
                            <p className="text-xl font-display font-bold text-charcoal-900 dark:text-warm-100">{formatNumber(topArtwork.likes * 24)}</p>
                          </div>
                          <div className="bg-white/50 dark:bg-charcoal-800/50 rounded-xl p-3 border border-white/40 dark:border-white/5">
                            <p className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 mb-1">Total Likes</p>
                            <p className="text-xl font-display font-bold text-[#C67B5C]">{formatNumber(topArtwork.likes)}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-charcoal-500 text-sm">Not enough data</div>
                    )}
                  </GlassCard>

                  {/* Quick Actions */}
                  <GlassCard className="p-6 md:p-8">
                    <SectionTitle title="Quick Actions" icon={LayoutDashboard} />
                    <div className="space-y-4 mt-4">
                      <Link href="/upload" className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-accent-terracotta to-[#D4A853] text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                          <h4 className="font-bold text-sm">Upload Artwork</h4>
                          <p className="text-xs text-white/80 font-medium">Share your latest creation</p>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-70" />
                      </Link>
                      
                      <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-charcoal-800/60 hover:bg-white/90 dark:hover:bg-charcoal-700/80 border border-white/40 dark:border-white/10 transition-all duration-300 transform hover:-translate-y-1 text-charcoal-900 dark:text-warm-100">
                        <div className="p-2 rounded-xl bg-charcoal-100 dark:bg-charcoal-900">
                          <FolderHeart className="w-5 h-5 text-[#5C6BC0]" />
                        </div>
                        <div className="text-left flex-1">
                          <h4 className="font-bold text-sm">Create Collection</h4>
                          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 font-medium">Group your masterpieces</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-charcoal-400" />
                      </button>

                      <button onClick={() => { setActiveTab('settings'); setActiveSettingsTab('profile'); }} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-charcoal-800/60 hover:bg-white/90 dark:hover:bg-charcoal-700/80 border border-white/40 dark:border-white/10 transition-all duration-300 transform hover:-translate-y-1 text-charcoal-900 dark:text-warm-100">
                        <div className="p-2 rounded-xl bg-charcoal-100 dark:bg-charcoal-900">
                          <Settings className="w-5 h-5 text-[#8FA68A]" />
                        </div>
                        <div className="text-left flex-1">
                          <h4 className="font-bold text-sm">Edit Profile</h4>
                          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 font-medium">Update your bio and links</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-charcoal-400" />
                      </button>
                    </div>
                  </GlassCard>

                </div>
              </motion.div>
            )}

            {/* =========================================
                SETTINGS TAB (Massive Settings Page layout)
                ========================================= */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-8"
              >
                {/* Settings Sidebar */}
                <GlassCard className="lg:col-span-1 p-4 h-fit sticky top-24">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-400 dark:text-charcoal-500 mb-4 px-4 pt-2">Settings Menu</h3>
                  <div className="space-y-1">
                    {SETTINGS_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveSettingsTab(cat.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 text-left",
                          activeSettingsTab === cat.id
                            ? cat.danger 
                              ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" 
                              : "bg-white/80 dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 shadow-sm"
                            : cat.danger
                              ? "text-red-500/70 hover:bg-red-50/50 hover:text-red-600 dark:hover:bg-red-950/20"
                              : "text-charcoal-600 dark:text-charcoal-400 hover:bg-white/50 dark:hover:bg-charcoal-800/50 hover:text-charcoal-900 dark:hover:text-warm-100"
                        )}
                      >
                        <cat.icon className={cn("w-4 h-4", activeSettingsTab === cat.id && !cat.danger ? "text-accent-terracotta dark:text-[#D4A853]" : "")} />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </GlassCard>

                {/* Settings Content Area */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {activeSettingsTab === "profile" && (
                    <GlassCard className="p-8">
                      <SectionTitle title="Public Profile" icon={Users} />
                      <div className="space-y-8">
                        {/* Avatar Upload */}
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-24 rounded-full bg-charcoal-200 dark:bg-charcoal-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-charcoal-900 shadow-lg">
                            {user?.user_metadata?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-3xl font-display text-charcoal-500 dark:text-charcoal-400">{userName.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <button className="px-5 py-2.5 rounded-xl bg-charcoal-900 text-white dark:bg-warm-100 dark:text-charcoal-900 text-sm font-semibold hover:bg-charcoal-800 dark:hover:bg-white transition-colors shadow-sm mb-2">
                              Change Picture
                            </button>
                            <p className="text-xs text-charcoal-500 dark:text-charcoal-400 font-medium">JPG, GIF or PNG. 1MB max.</p>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-charcoal-700 dark:text-charcoal-300">Display Name</label>
                            <input type="text" defaultValue={userName} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-charcoal-900/50 border border-charcoal-200 dark:border-charcoal-800 focus:outline-none focus:ring-2 focus:ring-accent-terracotta text-sm text-charcoal-900 dark:text-warm-100" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-charcoal-700 dark:text-charcoal-300">Username</label>
                            <input type="text" defaultValue="@gouri_art" className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-charcoal-900/50 border border-charcoal-200 dark:border-charcoal-800 focus:outline-none focus:ring-2 focus:ring-accent-terracotta text-sm text-charcoal-900 dark:text-warm-100" />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-charcoal-700 dark:text-charcoal-300">Bio</label>
                            <textarea rows={4} placeholder="Tell the community about yourself and your art style..." className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-charcoal-900/50 border border-charcoal-200 dark:border-charcoal-800 focus:outline-none focus:ring-2 focus:ring-accent-terracotta text-sm text-charcoal-900 dark:text-warm-100 resize-none" />
                          </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-white/20 dark:border-white/10">
                          <button className="btn-primary py-2.5 px-8">Save Changes</button>
                        </div>
                      </div>
                    </GlassCard>
                  )}

                  {/* PLACEHOLDERS FOR OTHER SETTINGS TABS */}
                  {activeSettingsTab !== "profile" && (
                    <GlassCard className="p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/50 dark:bg-charcoal-800/50 flex items-center justify-center mb-4">
                        <Settings className="w-8 h-8 text-charcoal-400 dark:text-charcoal-500 animate-spin-slow" />
                      </div>
                      <h3 className="text-xl font-bold text-charcoal-900 dark:text-warm-100 mb-2 capitalize">{activeSettingsTab} Settings</h3>
                      <p className="text-charcoal-500 dark:text-charcoal-400 text-sm max-w-sm">This section is currently under construction. All layout structures are ready for backend integration.</p>
                    </GlassCard>
                  )}

                </div>
              </motion.div>
            )}

            {/* ARTWORKS TAB (Kept from previous, minimal for completeness) */}
            {activeTab === "artworks" && (
              <motion.div key="artworks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <GlassCard className="p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                    <ImageIcon className="w-12 h-12 text-charcoal-400 mb-4" />
                    <h3 className="text-xl font-bold text-charcoal-900 dark:text-warm-100 mb-2">My Artworks Details</h3>
                    <p className="text-charcoal-500 dark:text-charcoal-400 text-sm">Full grid view available in Overview section.</p>
                 </GlassCard>
              </motion.div>
            )}
            
            {/* OTHER TABS */}
            {["analytics", "community", "saved", "collections"].includes(activeTab) && (
              <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <GlassCard className="p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                    <LayoutDashboard className="w-12 h-12 text-charcoal-400 mb-4" />
                    <h3 className="text-xl font-bold text-charcoal-900 dark:text-warm-100 mb-2 capitalize">{activeTab} Details</h3>
                    <p className="text-charcoal-500 dark:text-charcoal-400 text-sm">Detailed views for these sections are represented in the massive Overview dashboard.</p>
                 </GlassCard>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
