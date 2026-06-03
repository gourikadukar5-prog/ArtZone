-- 1. Safely create the artworks table if it doesn't exist at all
create table if not exists public.artworks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  image_url text not null,
  category text default 'sketch',
  user_id uuid references auth.users(id) on delete cascade,
  artist_name text default 'Anonymous',
  artist_username text default 'anon',
  artist_avatar text default '',
  likes integer default 0,
  comments integer default 0,
  saves integer default 0,
  created_at timestamptz default now()
);

-- 2. If the table already existed but was missing columns, add them safely
do $$ 
begin 
  -- Add user_id if missing
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='artworks' and column_name='user_id') then
    alter table public.artworks add column user_id uuid references auth.users(id) on delete cascade;
  end if;

  -- Add image_url if missing
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='artworks' and column_name='image_url') then
    alter table public.artworks add column image_url text not null default '';
  end if;

  -- Add category if missing
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='artworks' and column_name='category') then
    alter table public.artworks add column category text default 'sketch';
  end if;
  
  -- Add other missing columns safely
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='artworks' and column_name='artist_name') then
    alter table public.artworks add column artist_name text default 'Anonymous';
  end if;
  
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='artworks' and column_name='artist_username') then
    alter table public.artworks add column artist_username text default 'anon';
  end if;
  
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='artworks' and column_name='artist_avatar') then
    alter table public.artworks add column artist_avatar text default '';
  end if;
  
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='artworks' and column_name='likes') then
    alter table public.artworks add column likes integer default 0;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='artworks' and column_name='comments') then
    alter table public.artworks add column comments integer default 0;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='artworks' and column_name='saves') then
    alter table public.artworks add column saves integer default 0;
  end if;
end $$;

-- 3. Enable Row Level Security (RLS) safely
alter table public.artworks enable row level security;

-- Drop existing policies if they exist so we can recreate them safely
drop policy if exists "Public artworks are viewable by everyone" on public.artworks;
drop policy if exists "Users can insert their own artworks" on public.artworks;
drop policy if exists "Users can update their own artworks" on public.artworks;
drop policy if exists "Users can delete their own artworks" on public.artworks;

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

-- 4. Create storage bucket for artwork images non-destructively
insert into storage.buckets (id, name, public) 
values ('artworks', 'artworks', true)
on conflict (id) do nothing;

-- Drop old storage policies safely to recreate them
drop policy if exists "Artwork images are publicly accessible" on storage.objects;
drop policy if exists "Authenticated users can upload artwork images" on storage.objects;
drop policy if exists "Users can delete their own artwork images" on storage.objects;

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
