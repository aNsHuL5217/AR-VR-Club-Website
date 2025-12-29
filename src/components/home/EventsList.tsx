'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

// Event type
interface Event {
  ID: string;
  Title: string;
  Description: string;
  StartTime: string;
  EndTime: string;
  MaxCapacity: number;
  CurrentCount: number;
  Status: 'Open' | 'Full' | 'Closed' | 'Completed';
  ImageURL?: string;
  CreatedAt: string;
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      const data = await response.json();
      
      if (data.success) {
        const now = new Date();
        const upcomingEvents = data.data.filter((event: Event) => {
          const eventDate = new Date(event.StartTime);
          return eventDate >= now && (event.Status === 'Open' || event.Status === 'Full');
        });
        setEvents(upcomingEvents.slice(0, 6)); 
      } else {
        setError(data.error || 'Failed to load events');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section container text-center">
        <h2>Upcoming Events</h2>
        <div style={{ color: '#94a3b8', marginTop: '2rem' }}>Loading the future...</div>
      </div>
    );
  }

  if (error || events.length === 0) {
    return (
      <div className="section container text-center">
        <h2>Upcoming Events</h2>
        <div className="glass-card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8' }}>
            {error || "No upcoming events scheduled."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="section container">
      <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Upcoming Events</h2>
      <div className="grid-layout">
        {events.map((event, index) => (
          <motion.div 
            key={event.ID} 
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            {event.ImageURL && (
              <img
                src={event.ImageURL}
                alt={event.Title}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'white' }}>{event.Title}</h3>
              <span className={`status-badge ${event.Status === 'Open' ? 'status-active' : 'status-warning'}`}>
                {event.Status}
              </span>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {event.Description.length > 100
                ? `${event.Description.substring(0, 100)}...`
                : event.Description}
            </p>

            <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>📅 {new Date(event.StartTime).toLocaleDateString()}</span>
                <span>🕒 {new Date(event.StartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div>👥 Seats: {event.CurrentCount} / {event.MaxCapacity}</div>
            </div>

            <button
              className={event.Status === 'Open' ? 'btn' : 'btn-outline'}
              style={{ width: '100%' }}
              onClick={() => router.push(user ? '/dashboard' : '/login')}
              disabled={event.Status === 'Full'}
            >
              {event.Status === 'Full' ? 'Registration Full' : 'Register Now'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}