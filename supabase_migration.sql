-- Run this in Supabase SQL Editor
-- Creates the artworks table with RLS policies

create table if not exists public.artworks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  image_url text not null,
  category text default 'sketch',
  user_id uuid references auth.users(id) on delete cascade not null,
  artist_name text default 'Anonymous',
  artist_username text default 'anon',
  artist_avatar text default '',
  likes integer default 0,
  comments integer default 0,
  saves integer default 0,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.artworks enable row level security;

-- Policy: Anyone can read all artworks
create policy "Public artworks are viewable by everyone"
  on public.artworks for select
  using (true);

-- Policy: Authenticated users can insert their own artworks
create policy "Users can insert their own artworks"
  on public.artworks for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own artworks
create policy "Users can update their own artworks"
  on public.artworks for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own artworks
create policy "Users can delete their own artworks"
  on public.artworks for delete
  using (auth.uid() = user_id);

-- Create storage bucket for artwork images
insert into storage.buckets (id, name, public) 
values ('artworks', 'artworks', true)
on conflict (id) do nothing;

-- Storage policy: Anyone can view artwork images
create policy "Artwork images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'artworks');

-- Storage policy: Authenticated users can upload
create policy "Authenticated users can upload artwork images"
  on storage.objects for insert
  with check (bucket_id = 'artworks' and auth.role() = 'authenticated');

-- Storage policy: Users can delete their own uploads
create policy "Users can delete their own artwork images"
  on storage.objects for delete
  using (bucket_id = 'artworks' and auth.uid()::text = (storage.foldername(name))[1]);
