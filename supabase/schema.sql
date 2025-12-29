-- Complete Database Schema for AR/VR Club Platform
-- Run this in Supabase SQL Editor to set up the entire database
-- This includes all tables, functions, and constraints

-- ==================== TABLES ====================

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 50,
  current_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Full', 'Closed', 'Completed')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY, -- Firebase UID
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  year TEXT,
  dept TEXT,
  roll_no TEXT,
  designation TEXT,
  mobile_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations (
  registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  year TEXT,
  dept TEXT,
  roll_no TEXT,
  mobile_number TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled'))
);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Winners table (for future use)
CREATE TABLE IF NOT EXISTS winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  first_place TEXT,
  second_place TEXT,
  third_place TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_users_mobile_number ON users(mobile_number);
CREATE INDEX IF NOT EXISTS idx_registrations_mobile_number ON registrations(mobile_number);
CREATE INDEX IF NOT EXISTS idx_users_designation ON users(designation);

-- ==================== FUNCTIONS ====================

-- Function to increment event count
CREATE OR REPLACE FUNCTION public.increment_event_count(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_capacity INTEGER;
  max_capacity_val INTEGER;
BEGIN
  SELECT e.current_count, e.max_capacity
  INTO current_capacity, max_capacity_val
  FROM events e
  WHERE e.id = event_id;

  IF current_capacity IS NULL THEN
    RAISE EXCEPTION 'Event not found: %', event_id;
  END IF;

  UPDATE events
  SET 
    current_count = events.current_count + 1,
    status = CASE 
      WHEN events.current_count + 1 >= max_capacity_val AND events.status = 'Open' THEN 'Full'
      ELSE events.status
    END
  WHERE events.id = event_id;
END;
$$;

-- Function to decrement event count
CREATE OR REPLACE FUNCTION public.decrement_event_count(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_capacity INTEGER;
  max_capacity_val INTEGER;
BEGIN
  SELECT e.current_count, e.max_capacity
  INTO current_capacity, max_capacity_val
  FROM events e
  WHERE e.id = event_id;

  IF current_capacity IS NULL THEN
    RAISE EXCEPTION 'Event not found: %', event_id;
  END IF;

  UPDATE events
  SET 
    current_count = GREATEST(events.current_count - 1, 0),
    status = CASE 
      WHEN GREATEST(events.current_count - 1, 0) < max_capacity_val AND events.status = 'Full' THEN 'Open'
      ELSE events.status
    END
  WHERE events.id = event_id;
END;
$$;

-- Function to update inquiries updated_at
CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================== TRIGGERS ====================

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiries_updated_at();

-- ==================== PERMISSIONS ====================

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Grant permissions (service role can do everything)
GRANT ALL ON events TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON registrations TO authenticated;
GRANT ALL ON inquiries TO authenticated;
GRANT ALL ON winners TO authenticated;

GRANT EXECUTE ON FUNCTION public.increment_event_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_event_count(UUID) TO authenticated;

-- Policies (service role bypasses RLS, but we set policies for future use)
CREATE POLICY "Service role can manage events"
  ON events FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage users"
  ON users FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage registrations"
  ON registrations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage inquiries"
  ON inquiries FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage winners"
  ON winners FOR ALL USING (true) WITH CHECK (true);

