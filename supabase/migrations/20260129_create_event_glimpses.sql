-- Create event_glimpses table
CREATE TABLE IF NOT EXISTS public.event_glimpses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.event_glimpses ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow everyone to read glimpses
CREATE POLICY "Allow public read access" ON public.event_glimpses
    FOR SELECT USING (true);

-- Allow authenticated insert/update/delete
-- Note: The backend uses service role which bypasses RLS, but these are good for manual admin operations or client-side admin tools.
CREATE POLICY "Allow authenticated insert" ON public.event_glimpses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.event_glimpses
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.event_glimpses
    FOR DELETE USING (auth.role() = 'authenticated');
