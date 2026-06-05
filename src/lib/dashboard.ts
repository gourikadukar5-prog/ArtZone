import { createClient } from "@/lib/supabase/client";
import type { ArtworkDB } from "@/lib/artworks";

// ─── Types ───────────────────────────────────────────────────

export interface Collection {
  id: string;
  name: string;
  description: string;
  cover_image_url: string;
  user_id: string;
  created_at: string;
  artwork_count?: number;
}

export interface SavedArtwork {
  id: string;
  user_id: string;
  artwork_id: string;
  saved_at: string;
  artwork: ArtworkDB;
}

export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string;
  username: string;
  bio: string;
  avatar_url: string;
}

export interface ArtistWithFollow {
  id: string;
  display_name: string;
  username: string;
  bio: string;
  avatar_url: string;
  artworks_count: number;
  followers_count: number;
  is_following: boolean;
}

// ─── My Artworks ─────────────────────────────────────────────

export async function fetchMyArtworks(userId: string): Promise<ArtworkDB[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) { console.error("fetchMyArtworks:", error.message); return []; }
  return data ?? [];
}

// ─── Collections ─────────────────────────────────────────────

export async function fetchCollections(userId: string): Promise<Collection[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*, collection_artworks(count)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) { console.error("fetchCollections:", error.message); return []; }
  return (data ?? []).map((c: any) => ({
    ...c,
    artwork_count: c.collection_artworks?.[0]?.count ?? 0,
  }));
}

export async function createCollection(payload: {
  name: string;
  description: string;
  user_id: string;
}): Promise<Collection | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("collections")
    .insert([payload])
    .select()
    .single();

  if (error) { console.error("createCollection:", error.message); return null; }
  return data;
}

export async function deleteCollection(collectionId: string, userId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", userId);

  if (error) { console.error("deleteCollection:", error.message); return false; }
  return true;
}

export async function fetchCollectionDetails(collectionId: string): Promise<{ collection: Collection | null, artworks: ArtworkDB[] }> {
  const supabase = createClient();
  const { data: collection, error: colError } = await supabase
    .from("collections")
    .select("*")
    .eq("id", collectionId)
    .single();

  if (colError || !collection) {
    console.error("fetchCollectionDetails error:", colError?.message);
    return { collection: null, artworks: [] };
  }

  const { data: artworksData, error: artError } = await supabase
    .from("collection_artworks")
    .select("artworks(*)")
    .eq("collection_id", collectionId)
    .order("added_at", { ascending: false });

  if (artError) {
    console.error("fetchCollectionDetails artworks error:", artError.message);
  }

  const artworks = (artworksData ?? []).map((row: any) => row.artworks).filter(Boolean);
  return { collection, artworks };
}

export async function addArtworkToCollection(collectionId: string, artworkId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("collection_artworks")
    .insert([{ collection_id: collectionId, artwork_id: artworkId }]);
  
  if (error) {
    console.error("addArtworkToCollection error:", error.message);
    return false;
  }
  return true;
}

export async function removeArtworkFromCollection(collectionId: string, artworkId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("collection_artworks")
    .delete()
    .eq("collection_id", collectionId)
    .eq("artwork_id", artworkId);
  
  if (error) {
    console.error("removeArtworkFromCollection error:", error.message);
    return false;
  }
  return true;
}

// ─── Saved Artworks ──────────────────────────────────────────

export async function fetchSavedArtworks(userId: string): Promise<ArtworkDB[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_artworks")
    .select("artwork_id, artworks(*)")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });

  if (error) { console.error("fetchSavedArtworks:", error.message); return []; }
  return (data ?? []).map((row: any) => row.artworks).filter(Boolean);
}

export async function saveArtwork(userId: string, artworkId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("saved_artworks")
    .insert([{ user_id: userId, artwork_id: artworkId }]);

  if (error) { console.error("saveArtwork:", error.message); return false; }
  return true;
}

export async function unsaveArtwork(userId: string, artworkId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("saved_artworks")
    .delete()
    .eq("user_id", userId)
    .eq("artwork_id", artworkId);

  if (error) { console.error("unsaveArtwork:", error.message); return false; }
  return true;
}

export async function isArtworkSaved(userId: string, artworkId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("saved_artworks")
    .select("id")
    .eq("user_id", userId)
    .eq("artwork_id", artworkId)
    .maybeSingle();
  return !!data;
}

// ─── Likes ───────────────────────────────────────────────────

export async function likeArtwork(userId: string, artworkId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("artwork_likes")
    .insert([{ user_id: userId, artwork_id: artworkId }]);
  if (error) return false;
  // increment likes counter
  await supabase.rpc("increment_likes", { artwork_id: artworkId });
  return true;
}

export async function unlikeArtwork(userId: string, artworkId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("artwork_likes")
    .delete()
    .eq("user_id", userId)
    .eq("artwork_id", artworkId);
  if (error) return false;
  await supabase.rpc("decrement_likes", { artwork_id: artworkId });
  return true;
}

export async function fetchLikedArtworkIds(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("artwork_likes")
    .select("artwork_id")
    .eq("user_id", userId);
  return (data ?? []).map((r: any) => r.artwork_id);
}

// ─── Followers ───────────────────────────────────────────────

export async function fetchFollowerCount(userId: string): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);
  return count ?? 0;
}

export async function fetchFollowingIds(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("followers")
    .select("following_id")
    .eq("follower_id", userId);
  return (data ?? []).map((r: any) => r.following_id);
}

export async function followUser(followerId: string, followingId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("followers")
    .insert([{ follower_id: followerId, following_id: followingId }]);
  if (error) { console.error("followUser:", error.message); return false; }
  return true;
}

export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("followers")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
  if (error) { console.error("unfollowUser:", error.message); return false; }
  return true;
}

// ─── Profile Image Upload ─────────────────────────────────────

export async function uploadProfileImage(
  file: File,
  userId: string,
  oldAvatarUrl?: string | null
): Promise<string | null> {
  const supabase = createClient();

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPG, JPEG, PNG, and WEBP are supported.");
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File is too large. Maximum size is 5MB.");
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const timestamp = Date.now();
  const path = `${userId}/avatar_${timestamp}.${ext}`;

  // Delete old avatar from storage if it's from our bucket
  if (oldAvatarUrl && oldAvatarUrl.includes("/profile-images/")) {
    const oldPath = oldAvatarUrl.split("/profile-images/").pop();
    if (oldPath) {
      await supabase.storage.from("profile-images").remove([oldPath]);
    }
  }

  // Upload new image
  const { error } = await supabase.storage
    .from("profile-images")
    .upload(path, file, { upsert: true, cacheControl: "3600" });

  if (error) {
    console.error("uploadProfileImage error:", error.message);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("profile-images")
    .getPublicUrl(path);

  return urlData?.publicUrl ?? null;
}

// ─── Profiles ────────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) { console.error("fetchProfile:", error.message); return null; }
  return data;
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }): Promise<boolean> {
  const supabase = createClient();
  // Build payload — always include avatar_url even if null so it is written explicitly
  const payload: Record<string, unknown> = {
    id: profile.id,
    display_name: profile.display_name ?? "",
    username: profile.username ?? "",
    bio: profile.bio ?? "",
  };
  // Only include avatar_url when it is explicitly provided in the argument
  if ("avatar_url" in profile) {
    payload.avatar_url = profile.avatar_url ?? null;
  }
  const { error } = await supabase.from("profiles").upsert([payload]);
  if (error) { console.error("upsertProfile:", error.message); return false; }
  return true;
}

// ─── Community: All Artists ───────────────────────────────────

export async function fetchAllArtists(currentUserId?: string): Promise<ArtistWithFollow[]> {
  const supabase = createClient();

  // Get all profiles that have at least one artwork
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*");

  if (!profiles || profiles.length === 0) {
    // Fallback: get unique artists from artworks table
    const { data: artworks } = await supabase
      .from("artworks")
      .select("user_id, artist_name, artist_username, artist_avatar");

    const artistMap = new Map<string, any>();
    (artworks ?? []).forEach((a: any) => {
      if (!artistMap.has(a.user_id)) {
        artistMap.set(a.user_id, {
          id: a.user_id,
          display_name: a.artist_name,
          username: a.artist_username,
          bio: "",
          avatar_url: a.artist_avatar,
          artworks_count: 1,
          followers_count: 0,
          is_following: false,
        });
      } else {
        artistMap.get(a.user_id).artworks_count++;
      }
    });

    const artists = Array.from(artistMap.values()).filter(a => a.id !== currentUserId);

    if (currentUserId) {
      const followingIds = await fetchFollowingIds(currentUserId);
      return artists.map(a => ({ ...a, is_following: followingIds.includes(a.id) }));
    }
    return artists;
  }

  const followingIds = currentUserId ? await fetchFollowingIds(currentUserId) : [];

  return (profiles ?? [])
    .filter((p: any) => p.id !== currentUserId)
    .map((p: any) => ({
      id: p.id,
      display_name: p.display_name || "Artist",
      username: p.username || "anon",
      bio: p.bio || "",
      avatar_url: p.avatar_url || "",
      artworks_count: 0,
      followers_count: 0,
      is_following: followingIds.includes(p.id),
    }));
}

// ─── Analytics: uploads by month ─────────────────────────────

export interface MonthlyUpload {
  month: string;
  count: number;
}

export function buildMonthlyData(artworks: ArtworkDB[]): MonthlyUpload[] {
  const map = new Map<string, number>();
  artworks.forEach(a => {
    const d = new Date(a.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([month, count]) => ({
      month: new Date(month + "-01").toLocaleString("default", { month: "short", year: "2-digit" }),
      count,
    }));
}
