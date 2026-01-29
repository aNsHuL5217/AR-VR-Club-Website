-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info', -- 'info', 'alert', 'success', 'event'
    link_url TEXT,
    link_text TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON public.notifications
    FOR SELECT USING (is_active = true);

-- Allow admin all access
CREATE POLICY "Allow admin all" ON public.notifications
    FOR ALL TO service_role USING (true);

GRANT SELECT ON public.notifications TO anon, authenticated;

-- Seed some initial data so it's not empty
INSERT INTO public.notifications (title, message, type, link_url, link_text)
VALUES 
('🚀 Workshop Alert!', 'Introduction to Unity 3D workshop coming this Saturday. Don''t miss out!', 'event', '/#events', 'Register Now'),
('📢 New VR Headsets', 'The club just acquired 2 new Meta Quest 3 headsets. Come try them out in the lab!', 'info', '/#contact', 'Visit Lab'),
('🏆 Hackathon Winners', 'Congrats to Team "Virtual Vanguards" for winning the state-level AR Hackathon!', 'success', null, null);
