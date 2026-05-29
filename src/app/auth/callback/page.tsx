"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Handle the OAuth callback — browser client has access to localStorage
    // where the PKCE code verifier is stored
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        router.replace("/dashboard");
        return;
      }

      // If no session yet, listen for auth state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) {
          subscription.unsubscribe();
          router.replace("/dashboard");
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
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream dark:bg-charcoal-950 gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-[#FF1493] border-t-transparent animate-spin" />
      <p className="text-charcoal-500 dark:text-charcoal-400 text-sm font-medium">
        Completing sign in...
      </p>
    </div>
  );
}
