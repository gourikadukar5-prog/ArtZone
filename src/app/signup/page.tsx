"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next");

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGoogleSignup = async () => {
    const supabase = createClient();
    const redirectTo = next
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      console.error("[Signup] Google OAuth error:", error.message);
      setError(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!displayName.trim()) return setError("Display name is required.");
    if (!username.trim()) return setError("Username is required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    const supabase = createClient();

    console.log("[Signup] Attempting signUp for:", email);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: displayName.trim(),
          username: username.trim(),
        },
      },
    });

    if (signUpError) {
      console.error("[Signup] signUp error:", signUpError.message, signUpError);
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    console.log("[Signup] signUp success. User:", data.user?.id, "Session:", data.session);

    // Also upsert the profile row immediately (in case the DB trigger doesn't exist)
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: displayName.trim(),
        username: username.trim(),
      });
      if (profileError) {
        console.warn("[Signup] Profile upsert error (non-fatal):", profileError.message);
      }
    }

    // If email confirmation is required, Supabase returns a user but no session
    if (data.session) {
      console.log("[Signup] Session created immediately, redirecting…");
      router.push(next || "/dashboard");
    } else {
      setSuccess(
        "Account created! Please check your email and click the confirmation link to activate your account."
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent pt-24 pb-12 px-4 sm:px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/70 dark:bg-charcoal-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 relative"
      >
        <div className="mb-10">
          <h1 className="font-display font-semibold text-title text-charcoal-900 dark:text-warm-100 mb-2">
            Join the gallery
          </h1>
          <p className="text-charcoal-500 dark:text-charcoal-400">
            Create an account to upload your artwork and connect with creators.
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400">
            {success}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="label-micro block">Display Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Jane Doe"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="label-micro block">Username</label>
            <input
              type="text"
              className="input-field"
              placeholder="janedoe"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
              disabled={loading}
            />
          </div>

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
            <label className="label-micro block">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Create a strong password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <div className="flex gap-1 mt-2">
              <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 1 ? "bg-red-400" : "bg-charcoal-300 dark:bg-charcoal-700"}`}></div>
              <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 6 ? "bg-yellow-400" : "bg-charcoal-300 dark:bg-charcoal-700"}`}></div>
              <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 10 ? "bg-green-400" : "bg-charcoal-300 dark:bg-charcoal-700"}`}></div>
            </div>
          </div>

          <div className="flex items-start gap-3 mt-6">
            <input type="checkbox" id="terms" className="mt-1" required />
            <label htmlFor="terms" className="text-sm text-charcoal-500 dark:text-charcoal-400">
              I agree to the <Link href="#" className="underline">Terms of Service</Link> and{" "}
              <Link href="#" className="underline">Privacy Policy</Link>.
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-4 text-base mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4 before:h-px before:flex-1 before:bg-warm-200 dark:before:bg-charcoal-800 after:h-px after:flex-1 after:bg-warm-200 dark:after:bg-charcoal-800">
          <span className="text-xs text-charcoal-400 uppercase tracking-widest font-medium">Or</span>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={handleGoogleSignup}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-medium">Sign up with Google</span>
          </button>
        </div>

        <p className="mt-10 text-center text-sm text-charcoal-500 dark:text-charcoal-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-charcoal-900 hover:text-accent-terracotta dark:text-warm-100 dark:hover:text-accent-terracotta transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <SignupContent />
    </Suspense>
  );
}
