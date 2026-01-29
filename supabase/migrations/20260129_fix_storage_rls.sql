-- 1. Ensure bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('glimpses', 'glimpses', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

-- 3. Create Permissive Policies
-- Allow anyone to read files
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'glimpses');

-- Allow anyone (including anon/service_role) to upload
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'glimpses');

-- Allow anyone to delete (for ease of management/testing)
CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE USING (bucket_id = 'glimpses');
