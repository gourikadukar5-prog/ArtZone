"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Search, Menu, X, Bell, User, Sun, Moon, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pacifico, Lilita_One } from "next/font/google";
import { useArtStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

const pacifico = Pacifico({ weight: "400", subsets: ["latin"] });
const lilita = Lilita_One({ weight: "400", subsets: ["latin"] });

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/#explore" },
  { label: "Gallery", href: "/gallery" },
  { label: "Community", href: "/gallery" }, // Using gallery as placeholder for Community
];

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

function ArtZoneLogo() {
  return (
    <div className="flex items-baseline text-[36px] text-[#FF1493] transition-transform duration-300 group-hover:scale-105 tracking-tight drop-shadow-sm">
      <span className={lilita.className} style={{ display: "inline-block", transform: "rotate(-2deg)" }}>A</span>
      <span className={pacifico.className} style={{ marginLeft: "-3px" }}>rt</span>
      <span className={lilita.className} style={{ marginLeft: "2px", marginRight: "-2px" }}>Z</span>
      <span className={pacifico.className}>one</span>
    </div>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { isAuthenticated, user, setUser } = useArtStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isAuthPage = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <nav className="container-wide flex items-center h-[var(--nav-height)]">
          <Link href="/" className="relative z-10 flex items-center group">
            <ArtZoneLogo />
          </Link>
        </nav>
      </header>
    );
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out-expo",
          isScrolled
            ? "bg-black/10 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        )}
      >
        <nav className="container-wide flex items-center justify-between h-[var(--nav-height)]">
          {/* Logo */}
          <Link
            href="/"
            className="relative z-10 flex items-center group"
          >
            <ArtZoneLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                  pathname === link.href && link.href !== "/" // Home is always active if path is /, but we'll simplify active state
                    ? "text-charcoal-900 bg-white shadow-sm"
                    : "text-charcoal-500 hover:text-charcoal-900 hover:bg-white/50"
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                href="/upload"
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                  pathname === "/upload"
                    ? "text-charcoal-900 bg-white shadow-sm"
                    : "text-charcoal-500 hover:text-charcoal-900 hover:bg-white/50"
                )}
              >
                Upload Art
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-white/60 hover:bg-white transition-colors duration-300 border border-warm-200 rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-charcoal-900/10 focus-within:bg-white shadow-sm">
              <button type="submit" className="flex items-center">
                <Search className="w-4 h-4 text-charcoal-400 mr-2 hover:text-charcoal-700 transition-colors" />
              </button>
              <input
                type="text"
                placeholder="Search drawings, mandala..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-36 md:w-48 text-charcoal-900 placeholder:text-charcoal-400"
              />
            </form>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-full text-charcoal-600 dark:text-charcoal-400 hover:bg-white dark:hover:bg-charcoal-800 transition-colors shadow-sm bg-white/40 dark:bg-charcoal-900/40 backdrop-blur-sm ml-2"
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Notification */}
            <button
              className="hidden sm:block p-2.5 rounded-full text-charcoal-600 dark:text-charcoal-400 hover:bg-white dark:hover:bg-charcoal-800 transition-colors shadow-sm bg-white/40 dark:bg-charcoal-900/40 backdrop-blur-sm ml-1"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Auth Area */}
            <div className="hidden lg:flex items-center gap-2 ml-2 border-l border-warm-200 dark:border-charcoal-800 pl-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-sm font-medium text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-warm-100 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium rounded-full bg-charcoal-900 text-white hover:bg-charcoal-800 dark:bg-warm-100 dark:text-charcoal-900 dark:hover:bg-white transition-all shadow-sm ml-2"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-medium text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-warm-100 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="truncate max-w-[100px]">{user?.user_metadata?.full_name || 'Dashboard'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 transition-colors ml-2"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Mobile User Profile (only if auth) */}
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="lg:hidden p-2.5 rounded-full text-charcoal-600 dark:text-charcoal-400 hover:bg-white dark:hover:bg-charcoal-800 transition-colors shadow-sm bg-white/40 dark:bg-charcoal-900/40 backdrop-blur-sm ml-1"
                aria-label="Profile"
              >
                <User className="w-4 h-4" />
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2.5 rounded-full text-charcoal-600 hover:bg-white shadow-sm bg-white/40 ml-1"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-charcoal-900/20 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute right-0 top-0 bottom-0 w-[280px] bg-cream border-l border-warm-200 p-6 pt-24 shadow-2xl"
            >
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "px-4 py-3 rounded-xl text-base font-medium transition-colors",
                      pathname === link.href
                        ? "bg-white text-charcoal-900 shadow-sm"
                        : "text-charcoal-600 hover:bg-white/50"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/upload"
                      className={cn(
                        "px-4 py-3 rounded-xl text-base font-medium transition-colors",
                        pathname === "/upload"
                          ? "bg-white text-charcoal-900 shadow-sm"
                          : "text-charcoal-600 hover:bg-white/50"
                      )}
                    >
                      Upload Art
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileOpen(false);
                      }}
                      className="px-4 py-3 rounded-xl text-base font-medium text-left text-red-500 hover:bg-white/50 transition-colors"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-3 rounded-xl text-base font-medium text-charcoal-600 hover:bg-white/50 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-3 rounded-xl text-base font-medium bg-charcoal-900 text-white dark:bg-warm-100 dark:text-charcoal-900 mt-2 text-center"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
