-- 0. Row level security is already enabled by default on storage.objects.

-- Drop existing policies if any to avoid conflicts
drop policy if exists "Profile images are publicly accessible." on storage.objects;
drop policy if exists "Users can upload their own profile image." on storage.objects;
drop policy if exists "Users can update their own profile image." on storage.objects;
drop policy if exists "Users can delete their own profile image." on storage.objects;

-- 1. Allow public read access to the bucket
create policy "Profile images are publicly accessible."
on storage.objects for select
using (bucket_id = 'profile-images');

-- 2. Allow authenticated users to upload their own images
-- The path structure is userId/filename.ext, so we check if auth.uid() matches the first part of the path
create policy "Users can upload their own profile image."
on storage.objects for insert
with check (
  bucket_id = 'profile-images' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow authenticated users to update their own images
create policy "Users can update their own profile image."
on storage.objects for update
using (
  bucket_id = 'profile-images' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow authenticated users to delete their own images
create policy "Users can delete their own profile image."
on storage.objects for delete
using (
  bucket_id = 'profile-images' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);
