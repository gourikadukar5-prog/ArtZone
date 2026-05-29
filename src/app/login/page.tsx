"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex bg-cream dark:bg-charcoal-950">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 pt-24 pb-12 relative z-10">
        <Link 
          href="/" 
          className="absolute top-8 left-8 sm:left-16 flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-900 dark:text-charcoal-400 dark:hover:text-warm-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10">
            <h1 className="font-display font-semibold text-title text-charcoal-900 dark:text-warm-100 mb-2">
              Welcome back
            </h1>
            <p className="text-charcoal-500 dark:text-charcoal-400">
              Sign in to save artworks and follow your favorite creators.
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="label-micro block">Email</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="hello@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="label-micro block">Password</label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-medium text-charcoal-500 hover:text-charcoal-900 dark:text-charcoal-400 dark:hover:text-warm-100 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-base mt-4">
              Sign In
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4 before:h-px before:flex-1 before:bg-warm-200 dark:before:bg-charcoal-800 after:h-px after:flex-1 after:bg-warm-200 dark:after:bg-charcoal-800">
            <span className="text-xs text-charcoal-400 uppercase tracking-widest font-medium">Or</span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-colors">
              <svg className="w-5 h-5 text-charcoal-900 dark:text-warm-100" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm font-medium">GitHub</span>
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-charcoal-500 dark:text-charcoal-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-charcoal-900 hover:text-accent-terracotta dark:text-warm-100 dark:hover:text-accent-terracotta transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side: Image */}
      <div className="hidden lg:block lg:flex-1 relative bg-charcoal-900">
        <Image 
          src="https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1200&q=80"
          alt="Creative workspace"
          fill
          className="object-cover opacity-80 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/20 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16">
          <p className="font-display text-2xl text-warm-100 italic leading-snug">
            &quot;Art is not what you see, but what you make others see.&quot;
          </p>
          <p className="text-charcoal-400 mt-4 text-sm font-medium tracking-widest uppercase">
            — Edgar Degas
          </p>
        </div>
      </div>
    </div>
  );
}
