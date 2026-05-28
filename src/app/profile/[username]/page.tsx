"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { Heart, Globe, Twitter, Instagram } from "lucide-react";
import { DEMO_ARTISTS, formatNumber, cn } from "@/lib/utils";
import { useArtStore } from "@/lib/store";

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [activeTab, setActiveTab] = useState("Work");
  const artworks = useArtStore((state) => state.artworks);

  const artist = DEMO_ARTISTS.find(a => a.username === params.username) || DEMO_ARTISTS[0];
  const artistArtworks = artworks.filter(a => a.artist.name === artist.name);

  const breakpointColumnsObj = { default: 3, 1100: 3, 700: 2, 500: 1 };

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-950 pt-[var(--nav-height)] pb-24">
      {/* Profile Header */}
      <section className="container-wide pt-16 pb-12 border-b border-warm-200 dark:border-charcoal-800">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-warm-200 dark:bg-charcoal-800 flex items-center justify-center flex-shrink-0 shadow-sm border-4 border-white dark:border-charcoal-900">
            <span className="font-display font-semibold text-4xl text-charcoal-500 dark:text-charcoal-400">
              {artist.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4">
              <h1 className="font-display font-semibold text-3xl text-charcoal-900 dark:text-warm-100">
                {artist.name}
              </h1>
              <button className="btn-primary py-2 px-6 sm:w-auto">Follow</button>
            </div>
            <p className="text-body text-charcoal-600 dark:text-charcoal-400 max-w-xl mb-6">{artist.bio}</p>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex gap-4 text-charcoal-900 dark:text-warm-100 font-medium">
                <span>{artistArtworks.length} <span className="text-charcoal-500 font-normal">Works</span></span>
                <span>{formatNumber(artist.followers)} <span className="text-charcoal-500 font-normal">Followers</span></span>
              </div>
              <div className="flex gap-4">
                {[Globe, Twitter, Instagram].map((Icon, i) => (
                  <button key={i} className="text-charcoal-400 hover:text-charcoal-900 dark:hover:text-warm-100 transition-colors">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container-wide">
        <div className="flex gap-8 border-b border-warm-200 dark:border-charcoal-800 mb-10">
          {["Work", "Collections", "Appreciation"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-4 text-sm font-medium transition-colors relative",
                activeTab === tab
                  ? "text-charcoal-900 dark:text-warm-100"
                  : "text-charcoal-500 hover:text-charcoal-700 dark:text-charcoal-400"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeProfileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-900 dark:bg-warm-100" />
              )}
            </button>
          ))}
        </div>

        {activeTab === "Work" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {artistArtworks.length > 0 ? (
              <Masonry breakpointCols={breakpointColumnsObj} className="masonry-grid" columnClassName="masonry-grid-column">
                {artistArtworks.map((artwork, i) => (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="mb-6"
                  >
                    <Link href={`/artwork/${artwork.id}`} className="group block">
                      <div className="relative overflow-hidden rounded-2xl mb-3 bg-warm-200 dark:bg-charcoal-800 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-charcoal-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="flex items-center gap-2 text-white font-medium px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-sm">
                            <Heart className="w-4 h-4 fill-current" />
                            {formatNumber(artwork.likes)}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-medium text-sm text-charcoal-900 dark:text-warm-100 truncate group-hover:text-accent-terracotta transition-colors">
                        {artwork.title}
                      </h4>
                    </Link>
                  </motion.div>
                ))}
              </Masonry>
            ) : (
              <div className="text-center py-20 text-charcoal-500">No artworks uploaded yet.</div>
            )}
          </motion.div>
        )}

        {activeTab !== "Work" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-charcoal-500 border-2 border-dashed border-warm-300 dark:border-charcoal-800 rounded-2xl">
            <p className="font-display text-lg mb-2 capitalize">{activeTab}</p>
            <p className="text-sm">Coming soon.</p>
          </motion.div>
        )}
      </section>
    </div>
  );
}
