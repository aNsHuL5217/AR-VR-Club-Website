-- 1. Create the missing table
CREATE TABLE IF NOT EXISTS public.event_glimpses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Disable RLS to ensure the API can write to it without issues
ALTER TABLE public.event_glimpses DISABLE ROW LEVEL SECURITY;

-- 3. Grant permissions just in case
GRANT ALL ON public.event_glimpses TO postgres, anon, authenticated, service_role;
