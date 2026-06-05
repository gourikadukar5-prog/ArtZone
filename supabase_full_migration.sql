-- ============================================================
-- ArtZone Full Dashboard Migration
-- Safe: uses IF NOT EXISTS, DROP POLICY IF EXISTS
-- Does NOT drop any existing table or data
-- ============================================================

-- ── 1. PROFILES TABLE ───────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text default '',
  username text default '',
  bio text default '',
  avatar_url text default '',
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- ── 2. COLLECTIONS TABLE ────────────────────────────────────
create table if not exists public.collections (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text default '',
  cover_image_url text default '',
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);
alter table public.collections enable row level security;
drop policy if exists "Collections are viewable by everyone" on public.collections;
drop policy if exists "Users can insert their own collections" on public.collections;
drop policy if exists "Users can update their own collections" on public.collections;
drop policy if exists "Users can delete their own collections" on public.collections;
create policy "Collections are viewable by everyone" on public.collections for select using (true);
create policy "Users can insert their own collections" on public.collections for insert with check (auth.uid() = user_id);
create policy "Users can update their own collections" on public.collections for update using (auth.uid() = user_id);
create policy "Users can delete their own collections" on public.collections for delete using (auth.uid() = user_id);

-- ── 3. COLLECTION_ARTWORKS (junction) ───────────────────────
create table if not exists public.collection_artworks (
  id uuid default gen_random_uuid() primary key,
  collection_id uuid references public.collections(id) on delete cascade not null,
  artwork_id uuid references public.artworks(id) on delete cascade not null,
  added_at timestamptz default now(),
  unique(collection_id, artwork_id)
);
alter table public.collection_artworks enable row level security;
drop policy if exists "Collection artworks viewable by everyone" on public.collection_artworks;
drop policy if exists "Collection owners can manage artworks" on public.collection_artworks;
create policy "Collection artworks viewable by everyone" on public.collection_artworks for select using (true);
create policy "Collection owners can manage artworks" on public.collection_artworks for all
  using (exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid()));

-- ── 4. SAVED_ARTWORKS (junction) ────────────────────────────
create table if not exists public.saved_artworks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  artwork_id uuid references public.artworks(id) on delete cascade not null,
  saved_at timestamptz default now(),
  unique(user_id, artwork_id)
);
alter table public.saved_artworks enable row level security;
drop policy if exists "Users can view their own saved artworks" on public.saved_artworks;
drop policy if exists "Users can save artworks" on public.saved_artworks;
drop policy if exists "Users can unsave artworks" on public.saved_artworks;
create policy "Users can view their own saved artworks" on public.saved_artworks for select using (auth.uid() = user_id);
create policy "Users can save artworks" on public.saved_artworks for insert with check (auth.uid() = user_id);
create policy "Users can unsave artworks" on public.saved_artworks for delete using (auth.uid() = user_id);

-- ── 5. ARTWORK_LIKES (junction) ─────────────────────────────
create table if not exists public.artwork_likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  artwork_id uuid references public.artworks(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, artwork_id)
);
alter table public.artwork_likes enable row level security;
drop policy if exists "Artwork likes viewable by everyone" on public.artwork_likes;
drop policy if exists "Users can like artworks" on public.artwork_likes;
drop policy if exists "Users can unlike artworks" on public.artwork_likes;
create policy "Artwork likes viewable by everyone" on public.artwork_likes for select using (true);
create policy "Users can like artworks" on public.artwork_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike artworks" on public.artwork_likes for delete using (auth.uid() = user_id);

-- ── 6. FOLLOWERS TABLE ──────────────────────────────────────
create table if not exists public.followers (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references auth.users(id) on delete cascade not null,
  following_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);
alter table public.followers enable row level security;
drop policy if exists "Followers viewable by everyone" on public.followers;
drop policy if exists "Users can follow others" on public.followers;
drop policy if exists "Users can unfollow" on public.followers;
create policy "Followers viewable by everyone" on public.followers for select using (true);
create policy "Users can follow others" on public.followers for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.followers for delete using (auth.uid() = follower_id);

-- ── 7. COMMENTS TABLE ───────────────────────────────────────
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  artwork_id uuid references public.artworks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  author_name text default 'Anonymous',
  author_avatar text default '',
  created_at timestamptz default now()
);
alter table public.comments enable row level security;
drop policy if exists "Comments are viewable by everyone" on public.comments;
drop policy if exists "Authenticated users can comment" on public.comments;
drop policy if exists "Users can delete their own comments" on public.comments;
create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users can comment" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can delete their own comments" on public.comments for delete using (auth.uid() = user_id);

-- ── 8. SAFE COLUMN ADDITIONS to artworks ────────────────────
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='artworks' and column_name='views') then
    alter table public.artworks add column views integer default 0;
  end if;
end $$;

-- ── 9. INDEXES ───────────────────────────────────────────────
create index if not exists idx_artworks_user_id on public.artworks(user_id);
create index if not exists idx_collections_user_id on public.collections(user_id);
create index if not exists idx_saved_artworks_user_id on public.saved_artworks(user_id);
create index if not exists idx_artwork_likes_artwork_id on public.artwork_likes(artwork_id);
create index if not exists idx_followers_follower_id on public.followers(follower_id);
create index if not exists idx_followers_following_id on public.followers(following_id);
create index if not exists idx_comments_artwork_id on public.comments(artwork_id);
