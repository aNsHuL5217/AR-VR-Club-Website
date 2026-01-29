-- Increase file size limit to 50MB for glimpses bucket
UPDATE storage.buckets
SET file_size_limit = 52428800 -- 50MB in bytes
WHERE id = 'glimpses';

-- Verify the change
SELECT id, name, file_size_limit FROM storage.buckets WHERE id = 'glimpses';
