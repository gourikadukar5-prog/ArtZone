"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const redirectTo = next
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      console.error("[Login] Google OAuth error:", error.message);
      setError(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) return setError("Email and password are required.");

    setLoading(true);
    const supabase = createClient();

    console.log("[Login] ── Starting login ──────────────────────────");
    console.log("[Login] Email:", email.trim());
    console.log("[Login] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    console.log("[Login] RAW data:", JSON.stringify(data, null, 2));
    console.log("[Login] RAW error:", JSON.stringify(signInError, null, 2));

    if (signInError) {
      console.error("[Login] signInWithPassword error details:", {
        code: signInError.status || signInError.code,
        message: signInError.message,
        name: signInError.name
      });
      // Surface exact Supabase error to the user
      if (signInError.message === "Invalid login credentials") {
        setError("Incorrect email or password. Please try again.");
      } else if (signInError.message.includes("Email not confirmed")) {
        setError("Please confirm your email address before signing in. Check your inbox.");
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    console.log("[Login] signInWithPassword success. User:", data.user?.id);
    router.push(next || "/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent pt-[var(--nav-height)] pb-12 px-4 sm:px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/70 dark:bg-charcoal-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10"
      >
        <div className="mb-10">
          <h1 className="font-display font-semibold text-title text-charcoal-900 dark:text-warm-100 mb-2">
            Welcome back
          </h1>
          <p className="text-charcoal-500 dark:text-charcoal-400">
            Sign in to save artworks and follow your favorite creators.
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="label-micro block">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="hello@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-4 text-base mt-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
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
          <button
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-colors"
            onClick={() => setError("GitHub login is not enabled yet.")}
          >
            <svg className="w-5 h-5 text-charcoal-900 dark:text-warm-100" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
            </svg>
            <span className="text-sm font-medium">GitHub</span>
          </button>
        </div>

        <p className="mt-10 text-center text-sm text-charcoal-500 dark:text-charcoal-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-charcoal-900 hover:text-accent-terracotta dark:text-warm-100 dark:hover:text-accent-terracotta transition-colors"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <LoginContent />
    </Suspense>
  );
}
