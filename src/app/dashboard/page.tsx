"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, Image as ImageIcon, FolderHeart, Heart, BarChart3, Settings, Plus, Trash2 } from "lucide-react";
import { formatNumber, cn } from "@/lib/utils";
import { useArtStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SIDEBAR_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "artworks", label: "My Artworks", icon: ImageIcon },
  { id: "collections", label: "Collections", icon: FolderHeart },
  { id: "saved", label: "Saved", icon: Heart },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [mounted, setMounted] = useState(false);
  
  const { artworks, removeArtwork, user, isAuthenticated } = useArtStore();

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated) {
      router.replace("/login?next=/dashboard");
    }
  }, [isAuthenticated, mounted, router]);

  // Use the actual logged-in user's name, fallback to "Gouri" only if metadata is missing (should not happen)
  const userName = user?.user_metadata?.full_name || "Gouri";
  const myArtworks = artworks.filter(a => a.artist.name === userName || a.artist.name === "Anonymous");

  if (!mounted || !isAuthenticated) return null; // Wait for auth redirect

  return (
    <div className="min-h-screen bg-transparent pt-[var(--nav-height)] flex">
      {/* Sidebar */}
      <aside className="w-64 fixed top-[var(--nav-height)] bottom-0 left-0 border-r border-warm-200 dark:border-charcoal-800 bg-white/50 dark:bg-charcoal-900/50 backdrop-blur-md hidden md:flex flex-col p-6">
        <div className="flex-1 space-y-2">
          <p className="label-micro mb-4 pl-3">Menu</p>
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200",
                activeTab === item.id
                  ? "bg-charcoal-900 text-warm-100 dark:bg-warm-100 dark:text-charcoal-900"
                  : "text-charcoal-600 dark:text-charcoal-400 hover:bg-warm-200 dark:hover:bg-charcoal-800"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          {/* Top Bar */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display font-semibold text-3xl text-charcoal-900 dark:text-warm-100 mb-2">
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || "Artist"}
              </h1>
              <p className="text-charcoal-500 dark:text-charcoal-400 text-sm">
                Here&apos;s what&apos;s happening with your art today.
              </p>
            </div>
            <Link 
              href="/upload"
              className="btn-primary py-2.5 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Upload Artwork
            </Link>
          </header>

          {/* Overview Content */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Views", value: "45.2K", trend: "+12%" },
                  { label: "Likes Received", value: "3,240", trend: "+5%" },
                  { label: "Followers", value: "1,204", trend: "+2%" },
                  { label: "Artworks", value: "24", trend: null },
                ].map((stat, i) => (
                  <div key={i} className="card p-6">
                    <p className="label-micro mb-2">{stat.label}</p>
                    <div className="flex items-end gap-3">
                      <span className="font-display font-semibold text-2xl text-charcoal-900 dark:text-warm-100">
                        {stat.value}
                      </span>
                      {stat.trend && (
                        <span className="text-sm font-medium text-accent-sage mb-1">
                          {stat.trend}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Artworks */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display font-semibold text-lg">Recent Artworks</h2>
                  <button onClick={() => setActiveTab("artworks")} className="text-sm font-medium text-charcoal-500 hover:text-charcoal-900 dark:hover:text-warm-100 transition-colors">
                    View all
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {myArtworks.map((artwork) => (
                    <div key={artwork.id} className="group cursor-pointer">
                      <div className="relative overflow-hidden rounded-2xl mb-3 bg-warm-200 dark:bg-charcoal-800" style={{ aspectRatio: '4/3' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 pointer-events-none" />
                        
                        {/* Delete button (Top Right) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to remove this artwork?')) {
                              removeArtwork(artwork.id);
                            }
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10 hover:scale-110 shadow-md"
                          title="Remove Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="font-medium text-sm text-charcoal-900 dark:text-warm-100 truncate">
                        {artwork.title}
                      </h4>
                      <p className="text-micro text-charcoal-500">
                        {formatNumber(artwork.likes)} likes
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === "artworks" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {myArtworks.length > 0 ? (
                myArtworks.map((artwork) => (
                  <div key={artwork.id} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-2xl mb-3 bg-warm-200 dark:bg-charcoal-800" style={{ aspectRatio: '4/3' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 pointer-events-none" />

                      {/* Delete button (Top Right) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to remove this artwork?')) {
                            removeArtwork(artwork.id);
                          }
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10 hover:scale-110 shadow-md"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="font-medium text-sm text-charcoal-900 dark:text-warm-100 truncate">
                      {artwork.title}
                    </h4>
                    <p className="text-xs text-charcoal-500">{artwork.category}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-charcoal-500">
                  You haven&apos;t uploaded any artworks yet.
                </div>
              )}
            </div>
          )}

          {activeTab !== "overview" && activeTab !== "artworks" && (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-warm-200 dark:border-charcoal-800 rounded-3xl">
              <p className="text-charcoal-500 dark:text-charcoal-400 mb-2">
                This section is currently under construction.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
