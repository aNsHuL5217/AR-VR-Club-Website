/**
 * TypeScript types for Supabase database tables
 * These match the database schema
 */

export interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string; // ISO 8601 format
  end_time: string; // ISO 8601 format
  max_capacity: number;
  current_count: number;
  status: 'Open' | 'Full' | 'Closed' | 'Completed';
  type?: string;
  image_url?: string;
  created_at: string;
}

export interface User {
  user_id: string; // Firebase UID
  name: string;
  email: string;
  role: 'student' | 'admin';
  year?: string;
  dept?: string;
  roll_no?: string;
  designation?: string; // e.g., "President", "Secretary", "Treasurer", etc.
  mobile_number?: string;
  created_at: string;
}

export interface Registration {
  registration_id: string;
  event_id: string;
  user_id: string;
  user_email: string;
  year?: string;
  dept?: string;
  roll_no?: string;
  mobile_number?: string;
  timestamp: string;
  status: 'confirmed' | 'cancelled';
}

export interface Winner {
  id: string;
  event_name: string;
  event_date: string;
  first_place: string;
  second_place?: string;
  third_place?: string;
  created_at: string;
}

export interface Glimpse {
  id: string;
  event_id: string;
  image_url: string;
  caption?: string;
  created_at: string;
}

// Database table names
export const TABLES = {
  events: 'events',
  users: 'users',
  registrations: 'registrations',
  winners: 'winners',
  glimpses: 'event_glimpses',
} as const;

