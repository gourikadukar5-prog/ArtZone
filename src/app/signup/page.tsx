"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex bg-cream dark:bg-charcoal-950">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 pt-24 pb-12 relative z-10 overflow-y-auto">
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
          className="w-full max-w-md mx-auto my-auto"
        >
          <div className="mb-10">
            <h1 className="font-display font-semibold text-title text-charcoal-900 dark:text-warm-100 mb-2">
              Join the gallery
            </h1>
            <p className="text-charcoal-500 dark:text-charcoal-400">
              Create an account to upload your artwork and connect with creators.
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="label-micro block">Display Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Jane Doe"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="label-micro block">Username</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="janedoe"
                required
              />
            </div>

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
              <label className="label-micro block">Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Create a strong password"
                required
              />
              <div className="flex gap-1 mt-2">
                <div className="h-1 flex-1 rounded-full bg-charcoal-300 dark:bg-charcoal-700"></div>
                <div className="h-1 flex-1 rounded-full bg-charcoal-300 dark:bg-charcoal-700"></div>
                <div className="h-1 flex-1 rounded-full bg-charcoal-300 dark:bg-charcoal-700"></div>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-6">
              <input type="checkbox" id="terms" className="mt-1" required />
              <label htmlFor="terms" className="text-sm text-charcoal-500 dark:text-charcoal-400">
                I agree to the <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
              </label>
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-base mt-2">
              Create Account
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-charcoal-500 dark:text-charcoal-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-charcoal-900 hover:text-accent-terracotta dark:text-warm-100 dark:hover:text-accent-terracotta transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side: Image */}
      <div className="hidden lg:block lg:flex-1 relative bg-charcoal-900">
        <Image 
          src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&q=80"
          alt="Hands sketching"
          fill
          className="object-cover opacity-70 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950 to-transparent opacity-80" />
      </div>
    </div>
  );
}
