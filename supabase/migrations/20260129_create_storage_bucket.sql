-- Create a new storage bucket for glimpses
insert into storage.buckets (id, name, public)
values ('glimpses', 'glimpses', true);

-- Policy to allow public access to view files
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'glimpses' );

-- Policy to allow authenticated users to upload files
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'glimpses' and auth.role() = 'authenticated' );

-- Policy to allow authenticated users to delete files
create policy "Authenticated Delete"
  on storage.objects for delete
  using ( bucket_id = 'glimpses' and auth.role() = 'authenticated' );
