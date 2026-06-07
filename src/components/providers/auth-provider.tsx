"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useArtStore } from "@/lib/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useArtStore((state) => state.setUser);
  const setUserAvatarUrl = useArtStore((state) => state.setUserAvatarUrl);

  useEffect(() => {
    const supabase = createClient();

    const fetchProfileAvatar = async (userId: string) => {
      const { data } = await supabase.from("profiles").select("avatar_url").eq("id", userId).maybeSingle();
      if (data?.avatar_url) {
        setUserAvatarUrl(data.avatar_url);
      } else {
        setUserAvatarUrl(null);
      }
    };

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) fetchProfileAvatar(session.user.id);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) fetchProfileAvatar(session.user.id);
      else setUserAvatarUrl(null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  return <>{children}</>;
}
