'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-caption text-charcoal-500 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-warm-200 transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-warm-100 dark:bg-charcoal-900 flex items-center justify-center mb-6 border border-warm-200 dark:border-charcoal-800">
                <Mail className="w-6 h-6 text-charcoal-600 dark:text-charcoal-400" />
              </div>

              <h1 className="font-display text-title text-charcoal-900 dark:text-warm-100 mb-2">
                Reset password
              </h1>
              <p className="text-body text-charcoal-500 dark:text-charcoal-400 mb-8">
                Enter the email associated with your account and we&apos;ll send
                you a link to reset your password.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setSubmitted(true);
                }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-caption font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                    required
                  />
                </div>

                <button type="submit" className="btn-primary w-full !rounded-xl">
                  Send Reset Link
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              {/* Success Icon */}
              <div className="w-16 h-16 rounded-full bg-accent-sage/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-accent-sage" />
              </div>

              <h2 className="font-display text-title text-charcoal-900 dark:text-warm-100 mb-3">
                Check your email
              </h2>
              <p className="text-body text-charcoal-500 dark:text-charcoal-400 mb-2 mx-auto">
                We&apos;ve sent a password reset link to
              </p>
              <p className="text-body font-medium text-charcoal-900 dark:text-warm-200 mb-8">
                {email}
              </p>

              <p className="text-caption text-charcoal-400 dark:text-charcoal-500 mb-6">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-accent-terracotta hover:text-accent-terracotta/80 font-medium transition-colors"
                >
                  try again
                </button>
              </p>

              <Link href="/login" className="btn-secondary !rounded-xl">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
