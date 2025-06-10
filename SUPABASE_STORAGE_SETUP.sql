-- 🗄️ SUPABASE STORAGE SETUP
-- Run this in your Supabase SQL Editor to set up image storage

-- Step 1: Create the storage bucket for user images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-images',
  'user-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Set up RLS policies for the storage bucket

-- Allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload images to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to view their own images
CREATE POLICY "Users can view own images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public access to images (for sharing)
CREATE POLICY "Public access to images" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Step 3: Update the projects table to include storage paths
ALTER TABLE projects ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_storage_path ON projects(storage_path);
CREATE INDEX IF NOT EXISTS idx_projects_thumbnail_url ON projects(thumbnail_url);

-- Step 5: Create a function to clean up orphaned storage files
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function can be called periodically to clean up storage files
  -- that are no longer referenced by any projects
  
  -- Delete storage objects that don't have corresponding projects
  DELETE FROM storage.objects 
  WHERE bucket_id = 'user-images' 
  AND name NOT IN (
    SELECT DISTINCT storage_path 
    FROM projects 
    WHERE storage_path IS NOT NULL
    UNION
    SELECT DISTINCT thumbnail_url 
    FROM projects 
    WHERE thumbnail_url IS NOT NULL
  );
  
  RAISE NOTICE 'Cleanup completed';
END;
$$;

-- Step 6: Verify the setup
SELECT 
  'Storage bucket created' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'user-images';

-- Check RLS policies
SELECT 
  'RLS policies created' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%user-images%' 
OR policyname LIKE '%Users can%';

-- Success message
SELECT '✅ Supabase Storage setup completed successfully!' as message,
       '📁 Bucket: user-images created' as bucket_info,
       '🔒 RLS policies configured' as security_info,
       '📊 Projects table updated' as database_info;
