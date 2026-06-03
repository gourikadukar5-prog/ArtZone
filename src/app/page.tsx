"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import Masonry from "react-masonry-css";
import { ArrowRight, Heart, Bookmark, UploadCloud, Users, Sparkles, Image as ImageIcon } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useArtStore } from "@/lib/store";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

function AnimatedSection({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section 
      ref={ref} 
      id={id} 
      initial="hidden" 
      animate={isInView ? "visible" : "hidden"} 
      className={className}
    >
      {children}
    </motion.section>
  );
}

const HERO_CATEGORIES = [
  { name: "Mandala Arts", img: "https://images.unsplash.com/photo-1596548438137-d51ea5c83ca5?w=800&q=80" },
  { name: "Pencil Sketches", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80" },
  { name: "Anime Arts", img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80" },
  { name: "Digital Paintings", img: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=800&q=80" },
  { name: "Portrait Drawings", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80" },
];

const EXPLORE_CATEGORIES = [
  { name: "Trending Arts", img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80" },
  { name: "Traditional Arts", img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80" },
  { name: "Digital Arts", img: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600&q=80" },
  { name: "Anime Sketches", img: "https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=600&q=80" },
  { name: "Mandala Designs", img: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&q=80" },
  { name: "Creative Portraits", img: "https://images.unsplash.com/photo-1471666875520-c75081f42081?w=600&q=80" },
];

const FEATURES = [
  { icon: UploadCloud, title: "High Quality Uploads", desc: "Share your art in stunning uncompressed resolution." },
  { icon: Users, title: "Discover Artists", desc: "Connect with thousands of talented creators globally." },
  { icon: Bookmark, title: "Save Favorite Arts", desc: "Curate personal collections of pieces that inspire you." },
  { icon: Sparkles, title: "Creative Community", desc: "Engage, learn, and grow in a supportive environment." },
];

export default function HomePage() {
  const artworks = useArtStore((state) => state.artworks);
  
  const breakpointColumnsObj = {
    default: 4,
    1280: 3,
    900: 2,
    500: 1,
  };

  return (
    <div className="bg-cream dark:bg-charcoal-950 min-h-screen pt-24 font-sans text-charcoal-900 dark:text-warm-100 transition-colors duration-300">
      
      {/* ══ HERO SECTION (Google Arts Inspired) ══ */}
      <AnimatedSection className="relative section container-wide text-center overflow-hidden py-24 rounded-3xl mt-4 mb-20 shadow-lg border border-warm-200/50 dark:border-charcoal-800/50">
        
        {/* Video Background */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src="/new-hero-bg.mp4" type="video/mp4" />
          </video>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-cream/80 dark:bg-charcoal-950/80 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10">
          <motion.h1 variants={fadeUp} custom={0} className="font-display font-semibold text-5xl md:text-7xl mb-6 max-w-4xl mx-auto tracking-tight">
            What inspires your creativity?
          </motion.h1>
          <motion.p variants={fadeUp} custom={1} className="text-lg text-charcoal-900 font-medium dark:text-warm-100 max-w-2xl mx-auto mb-16 leading-relaxed">
            Explore beautiful sketches, mandala arts, anime arts, digital paintings, and creative artworks from talented artists around the world.
          </motion.p>
          
          {/* Overlapping Cards */}
        <div className="relative h-[450px] md:h-[600px] w-full max-w-6xl mx-auto flex items-center justify-center">
          {HERO_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 50, rotate: 0 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                rotate: (i - 2) * 5,
                x: (i - 2) * (typeof window !== "undefined" && window.innerWidth > 768 ? 140 : 40),
                zIndex: i === 2 ? 10 : 5 - Math.abs(i - 2)
              }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
              whileHover={{ scale: 1.05, zIndex: 20, rotate: 0, y: -20 }}
              className="absolute w-48 md:w-72 aspect-[3/4] rounded-2xl overflow-hidden shadow-xl bg-white dark:bg-charcoal-800 border-4 border-white dark:border-charcoal-800 cursor-pointer group"
            >
              <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-white font-medium text-lg mb-2">{cat.name}</h3>
                <Link href="/gallery" className="text-warm-100 text-sm font-medium flex items-center gap-1 hover:text-white">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </AnimatedSection>

      {/* ══ EXPLORE SECTION ══ */}
      <AnimatedSection className="section bg-white/50 dark:bg-charcoal-900/50 py-24" id="explore">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="font-display font-semibold text-4xl mb-4">Explore by Category</h2>
            <p className="text-charcoal-500 dark:text-charcoal-400">Dive into specific styles and mediums.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {EXPLORE_CATEGORIES.map((cat, i) => (
              <motion.div key={cat.name} variants={fadeUp} custom={i} className="group relative rounded-3xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-charcoal-900/20 group-hover:bg-charcoal-900/40 transition-colors duration-500 flex items-center justify-center">
                  <h3 className="text-white font-display font-medium text-xl md:text-2xl tracking-wide">{cat.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ ART GALLERY SECTION (Pinterest Style) ══ */}
      <AnimatedSection className="section container-wide py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-display font-semibold text-4xl mb-2">Curated Gallery</h2>
            <p className="text-charcoal-500 dark:text-charcoal-400">Masterpieces handpicked for you.</p>
          </div>
          <Link href="/gallery" className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-charcoal-200 dark:border-charcoal-700 hover:bg-charcoal-900 hover:text-white dark:hover:bg-warm-100 dark:hover:text-charcoal-900 transition-colors duration-300 font-medium text-sm">
            View full gallery
          </Link>
        </div>

        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid-column"
        >
          {artworks.slice(0, 12).map((artwork, i) => (
            <motion.div key={artwork.id} variants={fadeUp} custom={i % 4} className="mb-6">
              <div className="relative overflow-hidden rounded-2xl bg-warm-200 dark:bg-charcoal-800 shadow-sm group cursor-pointer">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-charcoal-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
                  <div className="flex justify-end pointer-events-auto">
                    <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors shadow-sm">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex w-full justify-between items-end text-white translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{artwork.title}</p>
                      <p className="text-xs opacity-80 mt-0.5">{artwork.artist.name}</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-medium bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full pointer-events-auto hover:bg-white hover:text-charcoal-900 transition-colors">
                      <Heart className="w-3.5 h-3.5" />
                      {formatNumber(artwork.likes)}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </Masonry>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/gallery" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-charcoal-900 text-white font-medium text-sm">
            View full gallery
          </Link>
        </div>
      </AnimatedSection>

      {/* ══ UPLOAD ART CTA (Glassmorphism) ══ */}
      <AnimatedSection className="section container-wide py-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#E6D5B8] via-[#D4A853]/20 to-[#E8E2DA] dark:from-charcoal-800 dark:via-charcoal-900 dark:to-charcoal-950 p-12 md:p-24 shadow-sm border border-white/50 dark:border-charcoal-700/50 backdrop-blur-3xl">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/40 dark:bg-white/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-terracotta/10 blur-3xl rounded-full translate-x-1/3 translate-y-1/3" />
          
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-charcoal-900 dark:text-warm-100 mb-6">Share your creativity with the world.</h2>
            <p className="text-charcoal-600 dark:text-charcoal-400 text-lg mb-10">Upload your artwork and inspire thousands of art lovers across the globe.</p>
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-charcoal-900 text-white dark:bg-warm-100 dark:text-charcoal-900 font-medium hover:bg-charcoal-800 dark:hover:bg-white transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 duration-300">
              <UploadCloud className="w-5 h-5" />
              Upload Your Art
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* ══ FEATURES SECTION ══ */}
      <AnimatedSection className="section container-wide py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, i) => (
            <motion.div key={feature.title} variants={fadeUp} custom={i} className="p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400 group">
              <div className="w-12 h-12 rounded-xl bg-warm-100 dark:bg-charcoal-800 flex items-center justify-center mb-6 group-hover:bg-charcoal-900 group-hover:text-white dark:group-hover:bg-warm-100 dark:group-hover:text-charcoal-900 transition-colors duration-400">
                <feature.icon className="w-6 h-6 text-charcoal-600 dark:text-charcoal-400 group-hover:text-white dark:group-hover:text-charcoal-900 transition-colors" />
              </div>
              <h3 className="font-display font-medium text-xl mb-3 dark:text-warm-100">{feature.title}</h3>
              <p className="text-charcoal-500 dark:text-charcoal-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
