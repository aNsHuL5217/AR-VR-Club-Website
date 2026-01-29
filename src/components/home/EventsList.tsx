'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, CameraIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react/dist/ssr';

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

interface Glimpse {
  id: string;
  event_id: string;
  image_url: string;
  caption?: string;
  created_at: string;
}

export default function EventsList() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
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
      const response = await fetch('/api/events', { cache: 'no-store' });
      const data = await response.json();

      if (data.success) {
        const now = new Date();
        const allEvents = data.data as Event[];

        const upcoming = allEvents.filter((event: Event) => {
          const eventEnd = new Date(event.EndTime);
          const comparisonDate = !isNaN(eventEnd.getTime()) ? eventEnd : new Date(event.StartTime);
          const isFutureOrActive = comparisonDate >= now;
          const isActiveStatus = event.Status !== 'Completed';
          return isFutureOrActive && isActiveStatus;
        });

        const past = allEvents.filter((event: Event) => {
          return event.Status === 'Completed';
        });

        upcoming.sort((a: Event, b: Event) =>
          new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime()
        );

        past.sort((a: Event, b: Event) =>
          new Date(b.StartTime).getTime() - new Date(a.StartTime).getTime()
        );

        setUpcomingEvents(upcoming.slice(0, 6));
        setPastEvents(past.slice(0, 6));
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
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Events</h2>
        <div style={{ color: '#94a3b8', marginTop: '2rem' }}>Loading events...</div>
      </div>
    );
  }

  return (
    <div id="events" className="section container">

      {/* UPCOMING EVENTS */}
      <div style={{ marginBottom: '6rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Upcoming Events</h2>

        {error || upcomingEvents.length === 0 ? (
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
              {error || "No upcoming events scheduled at the moment."}
            </p>
          </div>
        ) : (
          <div className="grid-layout">
            {upcomingEvents.map((event, index) => (
              <EventCard key={event.ID} event={event} index={index} router={router} user={user} />
            ))}
          </div>
        )}
      </div>

      {/* PAST EVENTS */}
      {pastEvents.length > 0 && (
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Past Events</h2>
          <div className="grid-layout">
            {pastEvents.map((event, index) => (
              <PastEventCard key={event.ID} event={event} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { createPortal } from 'react-dom';

function PastEventCard({ event, index }: { event: Event, index: number }) {
  const [glimpses, setGlimpses] = useState<Glimpse[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredGlimpse, setHoveredGlimpse] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchGlimpses = async () => {
      try {
        const response = await fetch(`/api/glimpses?eventId=${event.ID}`);
        const data = await response.json();
        if (data.success) {
          setGlimpses(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch glimpses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGlimpses();
  }, [event.ID]);

  return (
    <>
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'white', margin: 0 }}>{event.Title}</h3>
          <span style={{ fontSize: '0.8rem', background: '#334155', color: '#cbd5e1', padding: '4px 8px', borderRadius: '4px' }}>
            Completed
          </span>
        </div>

        <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          📅 Was held on {new Date(event.StartTime).toLocaleDateString()}
        </div>

        {loading ? (
          <div style={{ height: '150px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Loading photos...
          </div>
        ) : glimpses.length > 0 ? (
          <div style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '10px',
            marginBottom: '1rem',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.2) transparent'
          }}>
            {glimpses.map((glimpse) => (
              <motion.div
                key={glimpse.id}
                onMouseEnter={() => setHoveredGlimpse(glimpse.image_url)}
                onMouseLeave={() => setHoveredGlimpse(null)}
                style={{ flexShrink: 0 }}
              >
                <motion.img
                  src={glimpse.image_url}
                  alt="Glimpse"
                  whileHover={{ scale: 1.05, opacity: 0.5 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    height: '100px',
                    minWidth: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'zoom-in'
                  }}
                />
              </motion.div>
            ))}
          </div>
        ) : event.ImageURL ? (
          <img
            src={event.ImageURL}
            alt={event.Title}
            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', opacity: 0.6, filter: 'grayscale(30%)' }}
          />
        ) : (
          <div style={{ height: '150px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic' }}>
            No photos available
          </div>
        )}

        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
          {event.Description}
        </p>
      </motion.div>

      {/* FIXED CENTERED PREVIEW OVERLAY - PORTAL */}
      {mounted && createPortal(
        <AnimatePresence>
          {hoveredGlimpse && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 99999,
                pointerEvents: 'none',
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(2px)'
              }}
            >
              <div style={{
                position: 'relative',
                padding: '10px',
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 25px 60px -12px rgba(0,0,0,0.7)',
                maxWidth: '90vw',
                maxHeight: '90vh',
                // Removed pointerEvents: 'auto' so hover state on thumbnail persists
              }}>
                <img
                  src={hoveredGlimpse}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                    borderRadius: '10px',
                    display: 'block'
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

function EventCard({ event, index, router, user }: { event: Event, index: number, router: any, user: any }) {
  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      style={{ display: 'flex', flexDirection: 'column' }}
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
        <h3 style={{ fontSize: '1.25rem', color: 'white', margin: 0 }}>{event.Title}</h3>
        <span className={`status-badge ${event.Status === 'Open' ? 'status-active' : 'status-warning'}`}>
          {event.Status}
        </span>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.5', flex: 1 }}>
        {event.Description.length > 100
          ? `${event.Description.substring(0, 100)}...`
          : event.Description}
      </p>

      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ display: 'flex', gap: '6px' }}>📅 {new Date(event.StartTime).toLocaleDateString()}</span>
          <span style={{ display: 'flex', gap: '6px' }}>🕒 {new Date(event.StartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
  );
}