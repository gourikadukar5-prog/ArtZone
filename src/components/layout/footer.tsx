import Link from "next/link";
import { Instagram, Twitter, Facebook, Github, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-charcoal-950 text-warm-100 py-16">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group w-max">
              <div className="w-12 h-12 rounded-xl logo-bg-wavy border border-charcoal-700/50 flex items-center justify-center transition-transform duration-300 group-hover:rotate-3 shadow-lg overflow-hidden relative">
                {/* Subtle light overlay for reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                <span className="logo-gold text-lg font-bold font-display tracking-widest translate-x-0.5">
                  AZ
                </span>
              </div>
              <span className="font-display font-semibold text-2xl tracking-tight text-warm-100">
                ArtZone
              </span>
            </Link>
            <p className="text-charcoal-400 max-w-sm mb-8 text-sm leading-relaxed">
              A premium, curated space for digital painters, sketch artists, and creative minds around the world. Discover beauty in every stroke.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-charcoal-900 flex items-center justify-center text-charcoal-400 hover:bg-warm-100 hover:text-charcoal-900 transition-colors duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-charcoal-900 flex items-center justify-center text-charcoal-400 hover:bg-warm-100 hover:text-charcoal-900 transition-colors duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-charcoal-900 flex items-center justify-center text-charcoal-400 hover:bg-warm-100 hover:text-charcoal-900 transition-colors duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-charcoal-900 flex items-center justify-center text-charcoal-400 hover:bg-warm-100 hover:text-charcoal-900 transition-colors duration-300">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-medium text-lg mb-6 text-white">Explore</h4>
            <ul className="space-y-4">
              <li>
                <Link href="#about" className="text-charcoal-400 hover:text-warm-100 transition-colors text-sm flex items-center gap-1 group">
                  About Us <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="#" className="text-charcoal-400 hover:text-warm-100 transition-colors text-sm flex items-center gap-1 group">
                  Contact <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-charcoal-400 hover:text-warm-100 transition-colors text-sm flex items-center gap-1 group">
                  Community <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display font-medium text-lg mb-6 text-white">Legal</h4>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-charcoal-400 hover:text-warm-100 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-charcoal-400 hover:text-warm-100 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-charcoal-400 hover:text-warm-100 transition-colors text-sm">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-charcoal-500 text-sm">
            © 2026 ArtZone. All rights reserved.
          </p>
          <p className="text-charcoal-500 text-sm">
            Designed for creativity.
          </p>
        </div>
      </div>
    </footer>
  );
}
