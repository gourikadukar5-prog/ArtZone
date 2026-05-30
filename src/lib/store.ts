import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_ARTWORKS } from './utils';

export interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  artist: { name: string; username: string; avatar: string };
  likes: number;
  comments: number;
  saves: number;
  createdAt: string;
}

interface ArtStore {
  artworks: Artwork[];
  // IDs of user-uploaded artworks (so we don't lose them across refreshes)
  userUploadIds: string[];
  // Auth state
  user: any | null;
  isAuthenticated: boolean;
  setUser: (user: any | null) => void;
  addArtwork: (artwork: Omit<Artwork, 'id' | 'likes' | 'comments' | 'saves' | 'createdAt' | 'artist'>) => void;
  removeArtwork: (id: string) => void;
}

export const useArtStore = create<ArtStore>()(
  persist(
    (set, get) => ({
      artworks: [...DEMO_ARTWORKS],
      userUploadIds: [],
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      addArtwork: (newArt) => set((state) => {
        const artwork: Artwork = {
          ...newArt,
          id: Math.random().toString(36).substr(2, 9),
          likes: 0,
          comments: 0,
          saves: 0,
          createdAt: new Date().toISOString(),
          artist: { 
            name: state.user?.user_metadata?.full_name || "Anonymous", 
            username: state.user?.user_metadata?.full_name?.toLowerCase().replace(/\s+/g, '') || "anon", 
            avatar: state.user?.user_metadata?.avatar_url || "" 
          }
        };
        return {
          artworks: [artwork, ...state.artworks],
          userUploadIds: [artwork.id, ...state.userUploadIds],
        };
      }),

      removeArtwork: (id) => set((state) => ({
        artworks: state.artworks.filter(a => a.id !== id),
        userUploadIds: state.userUploadIds.filter(uid => uid !== id),
      })),
    }),
    {
      name: 'artzone-storage', // key in localStorage
      // Only persist user-uploaded artworks (not the full demo list which is always loaded fresh)
      partialize: (state) => ({
        userUploadIds: state.userUploadIds,
        // Only save artworks that were user-uploaded (has an id in userUploadIds)
        artworks: state.artworks.filter(a => state.userUploadIds.includes(a.id)),
      }),
      // On rehydrate: merge saved user uploads back with fresh demo artworks
      merge: (persistedState: any, currentState) => {
        const userUploads: Artwork[] = persistedState?.artworks ?? [];
        const userUploadIds: string[] = persistedState?.userUploadIds ?? [];
        return {
          ...currentState,
          userUploadIds,
          artworks: [...userUploads, ...DEMO_ARTWORKS],
        };
      },
    }
  )
);
