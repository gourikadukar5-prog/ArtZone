import Link from "next/link";
import { Instagram, Twitter, Facebook, Sparkles } from "lucide-react";
import { Pacifico, Lilita_One } from "next/font/google";

const pacifico = Pacifico({ weight: "400", subsets: ["latin"] });
const lilita = Lilita_One({ weight: "400", subsets: ["latin"] });

export function Footer() {
  return (
    <footer className="bg-[#050505] text-warm-100 pt-20 pb-8 border-t border-white/5">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-6 group">
              <div className="flex flex-col items-start gap-4">
                {/* Large AZ Logo */}
                <div className="relative text-[80px] leading-none tracking-tighter drop-shadow-sm select-none">
                  <span className={`${pacifico.className} text-[#D4A853] relative z-10`} style={{ transform: "rotate(-5deg)", display: "inline-block" }}>A</span>
                  <span className={`${lilita.className} text-white absolute bottom-0 left-[35px] text-[70px] z-0`}>Z</span>
                </div>
                
                {/* ARTZONE Text */}
                <div className="flex items-center gap-1 text-sm tracking-[0.4em] font-semibold">
                  <span className="text-[#D4A853]">A</span>
                  <span className="text-[#D4A853]">R</span>
                  <span className="text-[#D4A853]">T</span>
                  <span className="text-white">Z</span>
                  <span className="text-white">O</span>
                  <span className="text-white">N</span>
                  <span className="text-white">E</span>
                </div>
              </div>
            </Link>
            
            <p className="text-gray-400 max-w-[250px] mb-8 text-sm leading-relaxed">
              Where creativity<br />meets expression.
            </p>
            
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all duration-300 font-serif italic font-bold">
                P
              </a>
            </div>
          </div>

          {/* EXPLORE Links */}
          <div className="pt-2 md:pt-16">
            <h4 className="text-[#D4A853] text-xs font-bold tracking-widest uppercase mb-2">Explore</h4>
            <div className="w-8 h-[2px] bg-[#D4A853] mb-6 opacity-70"></div>
            <ul className="space-y-4">
              <li>
                <Link href="/gallery" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  Trending Art
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPANY Links */}
          <div className="pt-2 md:pt-16">
            <h4 className="text-[#D4A853] text-xs font-bold tracking-widest uppercase mb-2">Company</h4>
            <div className="w-8 h-[2px] bg-[#D4A853] mb-6 opacity-70"></div>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  Become an Artist
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-xs">
            © 2025 ArtZone. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs">
            <Link href="#" className="text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-gray-500 hover:text-gray-300 transition-colors">Terms of use</Link>
            <Sparkles className="w-4 h-4 text-[#D4A853] ml-2 opacity-80" />
          </div>
        </div>
      </div>
    </footer>
  );
}
