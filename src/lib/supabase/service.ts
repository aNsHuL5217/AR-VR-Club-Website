/**
 * Supabase Database Service
 * Main service utility for CRUD operations on Supabase
 * Replaces Google Sheets service
 */

import { supabaseAdmin } from './admin';
import { Event, User, Registration, Winner, Glimpse, TABLES } from './types';
import { v4 as uuidv4 } from 'uuid';
import { formatISO } from 'date-fns';

class SupabaseService {
  // ==================== EVENTS ====================

  /**
   * Get all events
   */
  async getAllEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.events)
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching events:', error);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<Event | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.events)
        .select('*')
        .eq('id', eventId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data;
    } catch (error: any) {
      console.error('Error fetching event:', error);
      throw new Error(`Failed to fetch event: ${error.message}`);
    }
  }

  /**
   * Create a new event
   */
  async createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'current_count'>): Promise<Event> {
    try {
      const newEvent: any = {
        ...eventData,
        id: uuidv4(),
        current_count: 0,
      };

      const { data, error } = await supabaseAdmin
        .from(TABLES.events)
        .insert(newEvent)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error creating event:', error);
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  /**
   * Update an event
   */
  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.events)
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error updating event:', error);
      throw new Error(`Failed to update event: ${error.message}`);
    }
  }

  /**
   * Delete an event
   * Note: This will also delete all related registrations due to CASCADE
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      // Check if event exists first
      const event = await this.getEventById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Check if there are registrations (optional - for user info)
      const registrations = await this.getEventRegistrations(eventId);
      if (registrations.length > 0) {
        console.log(`Deleting event with ${registrations.length} registration(s). They will be automatically deleted.`);
      }

      // Delete the event (CASCADE will handle registrations)
      const { error } = await supabaseAdmin
        .from(TABLES.events)
        .delete()
        .eq('id', eventId);

      if (error) {
        // Check if it's a foreign key constraint error
        if (error.message?.includes('foreign key constraint') || error.code === '23503') {
          throw new Error(
            'Cannot delete event: There are registrations associated with this event. ' +
            'Please ensure the foreign key constraint has CASCADE delete enabled. ' +
            'See supabase/fix-foreign-key-cascade.sql for the fix.'
          );
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  /**
   * Increment event registration count
   */
  async incrementEventCount(eventId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin.rpc('increment_event_count', {
        event_id: eventId,
      });

      // If RPC doesn't exist, use update instead
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        const event = await this.getEventById(eventId);
        if (event) {
          await this.updateEvent(eventId, {
            current_count: event.current_count + 1,
            status: event.current_count + 1 >= event.max_capacity ? 'Full' : event.status,
          });
        }
      } else if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error incrementing event count:', error);
      throw new Error(`Failed to increment event count: ${error.message}`);
    }
  }

  // ==================== USERS ====================

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.users)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  /**
   * Get user by ID or email
   */
  async getUserById(identifier: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.users)
        .select('*')
        .or(`user_id.eq.${identifier},email.eq.${identifier}`)
        .single();

      if (error) {
        // PGRST116 = not found (this is expected if user doesn't exist)
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Supabase query error:', {
          message: error.message,
          code: error.code,
          details: error.details,
        });
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: Omit<User, 'created_at'>): Promise<User> {
    try {
      const newUser: any = {
        ...userData,
        created_at: formatISO(new Date()),
      };

      console.log('Creating user in Supabase:', {
        email: newUser.email,
        name: newUser.name,
        roll_no: newUser.roll_no,
        mobile_number: newUser.mobile_number,
      });

      const { data, error } = await supabaseAdmin
        .from(TABLES.users)
        .insert(newUser)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log('User created successfully in Supabase:', data.user_id);
      return data;
    } catch (error: any) {
      console.error('Error creating user in Supabase:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to create user: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update a user
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.users)
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // ==================== REGISTRATIONS ====================

  /**
   * Get all registrations
   */
  async getAllRegistrations(): Promise<Registration[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.registrations)
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching registrations:', error);
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }
  }

  /**
   * Get filtered registrations with event information
   */
  async getFilteredRegistrations(filters: {
    year?: string;
    dept?: string;
    eventId?: string;
    status?: 'confirmed' | 'cancelled';
    search?: string;
  }): Promise<any[]> {
    try {
      let query = supabaseAdmin
        .from(TABLES.registrations)
        .select('*');

      // Apply filters
      if (filters.year) {
        query = query.eq('year', filters.year);
      }
      if (filters.dept) {
        query = query.eq('dept', filters.dept);
      }
      if (filters.eventId) {
        query = query.eq('event_id', filters.eventId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data: registrations, error } = await query.order('timestamp', { ascending: false });

      if (error) throw error;
      if (!registrations || registrations.length === 0) return [];

      // Get event details
      const eventIds = registrations.map(reg => reg.event_id);
      const { data: events } = await supabaseAdmin
        .from(TABLES.events)
        .select('id, title, start_time')
        .in('id', eventIds);

      // Combine with event data and apply search filter if provided
      let result = registrations.map(reg => {
        const event = events?.find((e: any) => e.id === reg.event_id);
        return {
          ...reg,
          event_title: event?.title || 'Unknown Event',
          event_start_time: event?.start_time || '',
        };
      });

      // Apply search filter (client-side for simplicity)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(reg =>
          reg.user_email?.toLowerCase().includes(searchLower) ||
          reg.roll_no?.toLowerCase().includes(searchLower) ||
          reg.event_title?.toLowerCase().includes(searchLower) ||
          reg.year?.toLowerCase().includes(searchLower) ||
          reg.dept?.toLowerCase().includes(searchLower)
        );
      }

      return result;
    } catch (error: any) {
      console.error('Error fetching filtered registrations:', error);
      throw new Error(`Failed to fetch filtered registrations: ${error.message}`);
    }
  }

  /**
   * Get registrations for a specific user with event details
   */
  async getUserRegistrations(userId: string): Promise<any[]> {
    try {
      // First get registrations
      const { data: registrations, error: regError } = await supabaseAdmin
        .from(TABLES.registrations)
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'confirmed')
        .order('timestamp', { ascending: false });

      if (regError) throw regError;
      if (!registrations || registrations.length === 0) return [];

      // Then get event details for each registration
      const eventIds = registrations.map(reg => reg.event_id);
      const { data: events, error: eventsError } = await supabaseAdmin
        .from(TABLES.events)
        .select('id, title, description, start_time, end_time, status')
        .in('id', eventIds);

      if (eventsError) throw eventsError;

      // Combine registrations with event data
      const registrationsWithEvents = registrations.map(reg => {
        const event = events?.find(e => e.id === reg.event_id);
        return {
          ...reg,
          events: event || null,
        };
      });

      return registrationsWithEvents;
    } catch (error: any) {
      console.error('Error fetching user registrations:', error);
      throw new Error(`Failed to fetch user registrations: ${error.message}`);
    }
  }

  /**
   * Get registrations for a specific event
   */
  async getEventRegistrations(eventId: string): Promise<Registration[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.registrations)
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'confirmed')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching event registrations:', error);
      throw new Error(`Failed to fetch event registrations: ${error.message}`);
    }
  }

  /**
   * Check if user is already registered for an event
   */
  async isUserRegistered(eventId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.registrations)
        .select('registration_id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .eq('status', 'confirmed')
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    } catch (error: any) {
      console.error('Error checking registration:', error);
      throw new Error(`Failed to check registration: ${error.message}`);
    }
  }

  /**
   * Create a new registration
   */
  async createRegistration(
    eventId: string,
    userId: string,
    userEmail: string,
    year?: string,
    dept?: string,
    rollNo?: string,
    mobileNumber?: string
  ): Promise<Registration> {
    try {
      // Check if already registered
      const isRegistered = await this.isUserRegistered(eventId, userId);
      if (isRegistered) {
        throw new Error('User is already registered for this event');
      }

      // Check event capacity
      const event = await this.getEventById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      if (event.current_count >= event.max_capacity) {
        throw new Error('Event is full');
      }
      if (event.status === 'Closed' || event.status === 'Completed') {
        throw new Error('Event is not open for registration');
      }

      // Create registration
      const newRegistration: any = {
        registration_id: uuidv4(),
        event_id: eventId,
        user_id: userId,
        user_email: userEmail,
        year: year || undefined,
        dept: dept || undefined,
        roll_no: rollNo || undefined,
        mobile_number: mobileNumber || undefined,
        timestamp: formatISO(new Date()),
        status: 'confirmed',
      };

      const { data, error } = await supabaseAdmin
        .from(TABLES.registrations)
        .insert(newRegistration)
        .select()
        .single();

      if (error) throw error;

      // Increment event count
      await this.incrementEventCount(eventId);

      return data;
    } catch (error: any) {
      console.error('Error creating registration:', error);
      throw error;
    }
  }

  /**
   * Cancel a registration
   */
  async cancelRegistration(registrationId: string): Promise<void> {
    try {
      // Get registration to find event
      const { data: registration, error: regError } = await supabaseAdmin
        .from(TABLES.registrations)
        .select('event_id')
        .eq('registration_id', registrationId)
        .single();

      if (regError) throw regError;

      // Update registration status
      const { error: updateError } = await supabaseAdmin
        .from(TABLES.registrations)
        .update({ status: 'cancelled' })
        .eq('registration_id', registrationId);

      if (updateError) throw updateError;

      // Decrement event count
      const event = await this.getEventById(registration.event_id);
      if (event) {
        await this.updateEvent(registration.event_id, {
          current_count: Math.max(0, event.current_count - 1),
          status: 'Open',
        });
      }
    } catch (error: any) {
      console.error('Error cancelling registration:', error);
      throw new Error(`Failed to cancel registration: ${error.message}`);
    }
  }

  // ==================== WINNERS ====================

  /**
   * Get all winners
   */
  async getAllWinners(): Promise<Winner[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.winners)
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching winners:', error);
      throw new Error(`Failed to fetch winners: ${error.message}`);
    }
  }

  /**
   * Create a winner record
   */
  async createWinner(winnerData: Omit<Winner, 'id' | 'created_at'>): Promise<Winner> {
    try {
      const newWinner: any = {
        ...winnerData,
        id: uuidv4(),
        created_at: formatISO(new Date()),
      };

      const { data, error } = await supabaseAdmin
        .from(TABLES.winners)
        .insert(newWinner)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error creating winner:', error);
      throw new Error(`Failed to create winner: ${error.message}`);
    }
  }

  /**
   * Delete a winner record
   */
  async deleteWinner(winnerId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from(TABLES.winners)
        .delete()
        .eq('id', winnerId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting winner:', error);
      throw new Error(`Failed to delete winner: ${error.message}`);
    }
  }
  // ==================== GLIMPSES ====================

  /**
   * Get glimpses for an event
   */
  async getEventGlimpses(eventId: string): Promise<Glimpse[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.glimpses)
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching glimpses:', error);
      throw new Error(`Failed to fetch glimpses: ${error.message}`);
    }
  }

  /**
   * Create a new glimpse
   */
  async createGlimpse(glimpseData: Omit<Glimpse, 'id' | 'created_at'>): Promise<Glimpse> {
    try {
      const newGlimpse: any = {
        ...glimpseData,
        id: uuidv4(),
        created_at: formatISO(new Date()),
      };

      const { data, error } = await supabaseAdmin
        .from(TABLES.glimpses)
        .insert(newGlimpse)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error creating glimpse:', error);
      throw new Error(`Failed to create glimpse: ${error.message}`);
    }
  }

  /**
   * Delete a glimpse
   */
  async deleteGlimpse(glimpseId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from(TABLES.glimpses)
        .delete()
        .eq('id', glimpseId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting glimpse:', error);
      throw new Error(`Failed to delete glimpse: ${error.message}`);
    }
  }
}

// Export singleton instance
let serviceInstance: SupabaseService | null = null;

export function getSupabaseService(): SupabaseService {
  if (!serviceInstance) {
    serviceInstance = new SupabaseService();
  }
  return serviceInstance;
}

export default SupabaseService;

