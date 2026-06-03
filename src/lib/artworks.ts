import { createClient } from "@/lib/supabase/client";

export interface ArtworkDB {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  user_id: string;
  artist_name: string;
  artist_username: string;
  artist_avatar: string;
  likes: number;
  comments: number;
  saves: number;
  created_at: string;
}

// ─── Fetch all artworks ─────────────────────────────────
export async function fetchArtworks(): Promise<ArtworkDB[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchArtworks error:", error.message);
    return [];
  }
  return data ?? [];
}

// ─── Upload image to Supabase Storage ───────────────────
export async function uploadImageToStorage(
  file: File,
  userId: string,
  onProgress?: (pct: number) => void
): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  // Simulate progress (Supabase JS v2 doesn't expose upload progress)
  onProgress?.(30);

  const { error } = await supabase.storage
    .from("artworks")
    .upload(path, file, { upsert: false, cacheControl: "3600" });

  if (error) {
    console.error("uploadImageToStorage error:", error.message);
    return null;
  }

  onProgress?.(80);

  const { data: urlData } = supabase.storage
    .from("artworks")
    .getPublicUrl(path);

  onProgress?.(100);
  return urlData?.publicUrl ?? null;
}

// ─── Insert artwork record ───────────────────────────────
export async function insertArtwork(artwork: {
  title: string;
  description: string;
  image_url: string;
  category: string;
  user_id: string;
  artist_name: string;
  artist_username: string;
  artist_avatar: string;
}): Promise<ArtworkDB | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("artworks")
    .insert([artwork])
    .select()
    .single();

  if (error) {
    console.error("insertArtwork error:", error.message);
    return null;
  }
  return data;
}

// ─── Delete artwork + storage file ──────────────────────
export async function deleteArtwork(
  artworkId: string,
  imageUrl: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient();

  // Extract storage path from URL
  const urlParts = imageUrl.split("/artworks/");
  const storagePath = urlParts[1]; // e.g. "userId/timestamp.jpg"

  // Delete DB record first
  const { error: dbError } = await supabase
    .from("artworks")
    .delete()
    .eq("id", artworkId)
    .eq("user_id", userId);

  if (dbError) {
    console.error("deleteArtwork DB error:", dbError.message);
    return false;
  }

  // Delete from storage (best-effort)
  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from("artworks")
      .remove([storagePath]);

    if (storageError) {
      console.warn("deleteArtwork storage warning:", storageError.message);
    }
  }

  return true;
}
