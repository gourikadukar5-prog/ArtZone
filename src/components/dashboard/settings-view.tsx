"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  Shield, Globe, Bell, Lock, AlertTriangle, Loader2, Check, X 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Profile, upsertProfile } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

export const SETTINGS_CATEGORIES = [
  { id: "security", label: "Account & Security", icon: Shield },
  { id: "social", label: "Social Links", icon: Globe },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "artwork", label: "Artwork Preferences", icon: ImageIcon },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
];

// Import missing icons since they are used in the array above
import { Palette, Image as ImageIcon } from "lucide-react";

interface SettingsViewProps {
  activeTab: string;
  profile: Profile | null;
  user: any; // User from Supabase Auth
  onProfileUpdate: () => void;
}

const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white/70 dark:bg-charcoal-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden transition-all duration-300", className)}>
    {children}
  </div>
);

export function SettingsView({ activeTab, profile, user, onProfileUpdate }: SettingsViewProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    notify_followers: true,
    notify_likes: true,
    notify_comments: true,
    is_public: true,
    show_followers_count: true,
    instagram_url: "",
    pinterest_url: "",
    portfolio_url: "",
    email: user?.email || "",
    password: "",
    theme_mode: "system",
    preferred_category: "All",
    feed_preference: "latest",
  });

  const { theme, setTheme } = useTheme();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        notify_followers: profile.notify_followers ?? true,
        notify_likes: profile.notify_likes ?? true,
        notify_comments: profile.notify_comments ?? true,
        is_public: profile.is_public ?? true,
        show_followers_count: profile.show_followers_count ?? true,
        instagram_url: profile.instagram_url ?? "",
        pinterest_url: profile.pinterest_url ?? "",
        portfolio_url: profile.portfolio_url ?? "",
        theme_mode: profile.theme_mode ?? "system",
        preferred_category: profile.preferred_category ?? "All",
        feed_preference: profile.feed_preference ?? "latest",
      }));
      // Sync loaded theme with NextThemes if necessary
      if (profile.theme_mode && profile.theme_mode !== theme) {
        setTheme(profile.theme_mode);
      }
    }
  }, [profile]);

  const saveProfileSettings = async (updates: Partial<typeof form>) => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const success = await upsertProfile({
      id: profile.id,
      ...updates,
    });

    if (success) {
      setSuccess("Settings saved successfully.");
      onProfileUpdate();
    } else {
      setError("Failed to save settings.");
    }
    setLoading(false);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSecuritySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (form.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: form.email });
        if (emailError) throw emailError;
        setSuccess("Check your new email address for a confirmation link.");
      }
      
      if (form.password) {
        const { error: pwError } = await supabase.auth.updateUser({ password: form.password });
        if (pwError) throw pwError;
        setSuccess("Password updated successfully.");
        setForm(p => ({ ...p, password: "" }));
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;
      
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  const provider = user?.app_metadata?.provider || "email";

  const renderContent = () => {
    switch (activeTab) {
      case "security":
        return (
          <GlassCard className="p-8">
            <h3 className="font-sans font-light tracking-wide text-2xl mb-6">Account & Security</h3>
            
            <div className="mb-6 p-4 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700">
              <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                Signed in via: <strong className="capitalize text-charcoal-900 dark:text-warm-100">{provider}</strong>
              </p>
            </div>

            <form onSubmit={handleSecuritySave} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Email Address</label>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  disabled={provider !== "email"}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-charcoal-900/50 border border-charcoal-200 dark:border-charcoal-800 disabled:opacity-50" 
                />
                {provider !== "email" && <p className="text-xs mt-1 text-charcoal-400">Email cannot be changed when signed in via Google.</p>}
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">New Password</label>
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current" 
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-charcoal-900/50 border border-charcoal-200 dark:border-charcoal-800" 
                />
              </div>

              <button disabled={loading} type="submit" className="btn-primary py-2.5 px-6">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Security Settings"}
              </button>
            </form>
          </GlassCard>
        );

      case "social":
        return (
          <GlassCard className="p-8">
            <h3 className="font-sans font-light tracking-wide text-2xl mb-6">Social Links</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Instagram URL</label>
                <input 
                  type="url" 
                  value={form.instagram_url} 
                  onChange={e => setForm(p => ({ ...p, instagram_url: e.target.value }))}
                  placeholder="https://instagram.com/yourusername"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-charcoal-900/50 border border-charcoal-200 dark:border-charcoal-800" 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Pinterest URL</label>
                <input 
                  type="url" 
                  value={form.pinterest_url} 
                  onChange={e => setForm(p => ({ ...p, pinterest_url: e.target.value }))}
                  placeholder="https://pinterest.com/yourusername"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-charcoal-900/50 border border-charcoal-200 dark:border-charcoal-800" 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Portfolio Website</label>
                <input 
                  type="url" 
                  value={form.portfolio_url} 
                  onChange={e => setForm(p => ({ ...p, portfolio_url: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-charcoal-900/50 border border-charcoal-200 dark:border-charcoal-800" 
                />
              </div>
              <button 
                onClick={() => saveProfileSettings({ 
                  instagram_url: form.instagram_url, 
                  pinterest_url: form.pinterest_url, 
                  portfolio_url: form.portfolio_url 
                })}
                disabled={loading} 
                className="btn-primary py-2.5 px-6"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Social Links"}
              </button>
            </div>
          </GlassCard>
        );

      case "notifications":
        return (
          <GlassCard className="p-8">
            <h3 className="font-sans font-light tracking-wide text-2xl mb-6">Notifications</h3>
            <div className="space-y-6">
              {[
                { id: "notify_followers", label: "New Followers", desc: "Get notified when someone follows you" },
                { id: "notify_likes", label: "New Likes", desc: "Get notified when someone likes your artwork" },
                { id: "notify_comments", label: "New Comments", desc: "Get notified when someone comments" },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-charcoal-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={(form as any)[item.id]} 
                      onChange={e => {
                        const val = e.target.checked;
                        setForm(p => ({ ...p, [item.id]: val }));
                        saveProfileSettings({ [item.id]: val });
                      }}
                    />
                    <div className="w-11 h-6 bg-charcoal-200 peer-focus:outline-none rounded-full peer dark:bg-charcoal-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-charcoal-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-charcoal-600 peer-checked:bg-accent-terracotta"></div>
                  </label>
                </div>
              ))}
            </div>
          </GlassCard>
        );

      case "privacy":
        return (
          <GlassCard className="p-8">
            <h3 className="font-sans font-light tracking-wide text-2xl mb-6">Privacy Settings</h3>
            <div className="space-y-6">
              {[
                { id: "is_public", label: "Public Profile", desc: "Allow anyone to view your profile and artworks" },
                { id: "show_followers_count", label: "Show Follower Count", desc: "Display how many followers you have" },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-charcoal-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={(form as any)[item.id]} 
                      onChange={e => {
                        const val = e.target.checked;
                        setForm(p => ({ ...p, [item.id]: val }));
                        saveProfileSettings({ [item.id]: val });
                      }}
                    />
                    <div className="w-11 h-6 bg-charcoal-200 peer-focus:outline-none rounded-full peer dark:bg-charcoal-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-charcoal-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-charcoal-600 peer-checked:bg-accent-terracotta"></div>
                  </label>
                </div>
              ))}
            </div>
          </GlassCard>
        );

      case "danger":
        return (
          <GlassCard className="p-8 border border-red-500/20">
            <h3 className="font-sans font-light tracking-wide text-2xl mb-2 text-red-600 dark:text-red-400">Danger Zone</h3>
            <p className="text-charcoal-500 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
            
            {deleteConfirmOpen ? (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <p className="mb-4 text-red-800 dark:text-red-200 font-medium">Are you absolutely sure you want to delete your account and all data?</p>
                <div className="flex gap-3">
                  <button onClick={handleDeleteAccount} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    {loading ? "Deleting..." : "Yes, Delete Everything"}
                  </button>
                  <button onClick={() => setDeleteConfirmOpen(false)} disabled={loading} className="px-4 py-2 border border-charcoal-200 dark:border-charcoal-700 rounded-lg hover:bg-charcoal-50 dark:hover:bg-charcoal-800">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setDeleteConfirmOpen(true)} className="px-6 py-2.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-xl transition-colors font-medium">
                Delete Account
              </button>
            )}
          </GlassCard>
        );

      case "appearance":
        return (
          <GlassCard className="p-8">
            <h3 className="font-sans font-light tracking-wide text-2xl mb-6 flex items-center gap-2">
              <Palette className="w-6 h-6 text-accent-terracotta dark:text-[#D4A853]" /> Appearance
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block text-charcoal-700 dark:text-charcoal-300">Theme Mode</label>
                <div className="flex gap-3">
                  {["light", "dark", "system"].map(mode => (
                    <button
                      key={mode}
                      onClick={() => {
                        setForm(p => ({ ...p, theme_mode: mode }));
                        setTheme(mode);
                        saveProfileSettings({ theme_mode: mode });
                      }}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border text-sm font-medium capitalize transition-all",
                        form.theme_mode === mode 
                          ? "border-accent-terracotta bg-accent-terracotta/10 text-accent-terracotta dark:border-[#D4A853] dark:bg-[#D4A853]/10 dark:text-[#D4A853]" 
                          : "border-charcoal-200 dark:border-charcoal-800 text-charcoal-600 dark:text-charcoal-400 hover:bg-white/50 dark:hover:bg-charcoal-800"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        );

      case "artwork":
        return (
          <GlassCard className="p-8">
            <h3 className="font-sans font-light tracking-wide text-2xl mb-6 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-accent-terracotta dark:text-[#D4A853]" /> Artwork Preferences
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block text-charcoal-700 dark:text-charcoal-300">Preferred Art Category</label>
                <select
                  value={form.preferred_category}
                  onChange={e => {
                    setForm(p => ({ ...p, preferred_category: e.target.value }));
                    saveProfileSettings({ preferred_category: e.target.value });
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-charcoal-900/50 border border-charcoal-200 dark:border-charcoal-800 focus:outline-none focus:ring-2 focus:ring-accent-terracotta"
                >
                  <option value="All">All Categories</option>
                  <option value="Pencil Art">Pencil Art</option>
                  <option value="Mandala Art">Mandala Art</option>
                  <option value="Painting">Painting</option>
                  <option value="Digital Art">Digital Art</option>
                  <option value="Sketches">Sketches</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-charcoal-700 dark:text-charcoal-300">Feed Preference</label>
                <select
                  value={form.feed_preference}
                  onChange={e => {
                    setForm(p => ({ ...p, feed_preference: e.target.value }));
                    saveProfileSettings({ feed_preference: e.target.value });
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-charcoal-900/50 border border-charcoal-200 dark:border-charcoal-800 focus:outline-none focus:ring-2 focus:ring-accent-terracotta"
                >
                  <option value="latest">Latest Artworks First</option>
                  <option value="trending">Trending Artworks First</option>
                </select>
              </div>
            </div>
          </GlassCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center gap-2">
          <X className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-center gap-2">
          <Check className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}
      {renderContent()}
    </div>
  );
}
