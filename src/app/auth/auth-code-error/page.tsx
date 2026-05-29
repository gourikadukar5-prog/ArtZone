"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-charcoal-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md px-6"
      >
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-charcoal-900 dark:text-warm-100 mb-3">
          Sign in failed
        </h1>
        <p className="text-charcoal-500 dark:text-charcoal-400 mb-8 leading-relaxed">
          We couldn&apos;t complete your sign in. This can happen if the link expired or Google sign-in isn&apos;t fully configured yet.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/login" className="btn-primary py-3 text-center">
            Try again
          </Link>
          <Link href="/" className="text-sm text-charcoal-500 hover:text-charcoal-900 dark:text-charcoal-400 dark:hover:text-warm-100 transition-colors">
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
