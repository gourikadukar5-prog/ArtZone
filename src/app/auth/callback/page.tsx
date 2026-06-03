"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    const supabase = createClient();

    // Handle the OAuth callback — browser client has access to localStorage
    // where the PKCE code verifier is stored
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        router.replace(next);
        return;
      }

      // If no session yet, listen for auth state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) {
          subscription.unsubscribe();
          router.replace(next);
        } else if (event === "SIGNED_OUT" || (!session && event !== "INITIAL_SESSION")) {
          subscription.unsubscribe();
          router.replace("/auth/auth-code-error");
        }
      });

      // Clean up after 10 seconds if nothing happens
      setTimeout(() => {
        subscription.unsubscribe();
        router.replace("/auth/auth-code-error");
      }, 10000);
    };

    handleCallback();
  }, [router, next]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-[#FF1493] border-t-transparent animate-spin" />
      <p className="text-charcoal-500 dark:text-charcoal-400 text-sm font-medium">
        Completing sign in...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#FF1493] border-t-transparent animate-spin" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
