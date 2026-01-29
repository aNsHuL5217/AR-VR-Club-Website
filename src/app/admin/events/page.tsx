'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import StatusModal from '@/components/common/StatusModal';
import {
  XIcon,
  PencilSimpleIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  CameraIcon,
  Image as ImageIcon
} from '@phosphor-icons/react/dist/ssr';

interface Event {
  ID: string; Title: string; Description: string; StartTime: string; EndTime: string;
  MaxCapacity: number; CurrentCount: number; Status: 'Open' | 'Full' | 'Closed' | 'Completed';
  Type: string; ImageURL?: string; CreatedAt: string;
}

interface Glimpse {
  id: string;
  event_id: string;
  image_url: string;
  caption?: string;
  created_at: string;
}

import { supabase } from '@/lib/supabase/client';

export default function EventManagementPage() {
  const { authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    Title: '', Description: '', StartTime: '', EndTime: '', MaxCapacity: '', ImageURL: '', Status: 'Open' as any, Type: 'Workshop',
  });
  const [submitting, setSubmitting] = useState(false);

  // Glimpse Modal State
  const [showGlimpseModal, setShowGlimpseModal] = useState(false);
  const [currentEventForGlimpses, setCurrentEventForGlimpses] = useState<Event | null>(null);
  const [glimpses, setGlimpses] = useState<Glimpse[]>([]);
  const [loadingGlimpses, setLoadingGlimpses] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newGlimpseCaption, setNewGlimpseCaption] = useState('');
  const [addingGlimpse, setAddingGlimpse] = useState(false);

  // Status Modal State
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    if (!authLoading) {
      if (!authUser) router.push('/login');
      else if (authUser.role !== 'admin') router.push('/dashboard');
    }
  }, [authUser, authLoading, router]);

  useEffect(() => { if (authUser?.role === 'admin') fetchEvents(); }, [authUser]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.success) setEvents(data.data);
      else setError(data.error);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchGlimpses = async (eventId: string) => {
    try {
      setLoadingGlimpses(true);
      const response = await fetch(`/api/glimpses?eventId=${eventId}`);
      const data = await response.json();
      if (data.success) setGlimpses(data.data);
      else console.error(data.error);
    } catch (err: any) { console.error(err.message); }
    finally { setLoadingGlimpses(false); }
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setFormData({ Title: '', Description: '', StartTime: '', EndTime: '', MaxCapacity: '', ImageURL: '', Status: 'Open', Type: 'Workshop' });
    setShowModal(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      Title: event.Title, Description: event.Description,
      StartTime: new Date(event.StartTime).toISOString().slice(0, 16),
      EndTime: new Date(event.EndTime).toISOString().slice(0, 16),
      MaxCapacity: event.MaxCapacity.toString(), ImageURL: event.ImageURL || '', Status: event.Status, Type: event.Type || 'Workshop',
    });
    setShowModal(true);
  };

  const handleManageGlimpses = (event: Event) => {
    setCurrentEventForGlimpses(event);
    setGlimpses([]);
    setShowGlimpseModal(true);
    fetchGlimpses(event.ID);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddGlimpse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEventForGlimpses || !selectedFile) return;

    setAddingGlimpse(true);
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${currentEventForGlimpses.ID}/${Date.now()}.${fileExt}`;
      const config = {
        cacheControl: '3600',
        upsert: false
      };

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('glimpses')
        .upload(fileName, selectedFile, config);

      if (uploadError) throw new Error('Upload failed: ' + uploadError.message);

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from('glimpses')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // 3. Save to Database
      const response = await fetch('/api/glimpses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: currentEventForGlimpses.ID,
          image_url: publicUrl,
          caption: newGlimpseCaption
        })
      });
      const data = await response.json();
      if (data.success) {
        setSelectedFile(null);
        setNewGlimpseCaption('');
        // Reset file input
        const fileInput = document.getElementById('glimpse-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        fetchGlimpses(currentEventForGlimpses.ID);
      } else {
        alert('Failed to add glimpse: ' + data.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setAddingGlimpse(false);
    }
  };

  const handleDeleteGlimpse = async (glimpseId: string) => {
    if (!confirm('Are you sure you want to delete this glimpse?')) return;
    try {
      const response = await fetch(`/api/glimpses/${glimpseId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        if (currentEventForGlimpses) fetchGlimpses(currentEventForGlimpses.ID);
      } else {
        alert('Failed to delete glimpse: ' + data.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure? This will delete all registrations associated with this event.')) return;
    try {
      const response = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        fetchEvents();
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Event Deleted',
          message: 'The event has been successfully deleted.'
        });
      }
      else {
        setStatusModal({
          isOpen: true,
          type: 'error',
          title: 'Delete Failed',
          message: data.error || 'Failed to delete event.'
        });
      }
    } catch (err: any) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: err.message
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        StartTime: new Date(formData.StartTime).toISOString(),
        EndTime: new Date(formData.EndTime).toISOString(),
        MaxCapacity: parseInt(formData.MaxCapacity),
      };

      const url = editingEvent ? `/api/events/${editingEvent.ID}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();

      if (data.success) { setShowModal(false); fetchEvents(); }
      else setError(data.error);
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <><Navbar /><div className="container" style={{ paddingTop: '6rem', textAlign: 'center', color: '#94a3b8' }}>Loading Events...</div></>;
  if (!authUser || authUser.role !== 'admin') return null;

  const thStyle = { padding: '12px 16px', textAlign: 'left' as const, borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
  const tdStyle = { padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: '0.95rem' };

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)', paddingTop: '65px' }}>
        <AdminSidebar />
        <div style={{ marginLeft: '280px', flex: 1, padding: '2rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>Event Management</h2>
                <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8' }}>Create, edit, and manage club events</p>
              </div>
              <button className="btn" onClick={handleCreate}><PlusIcon size={18} style={{ marginRight: '8px' }} /> Create New Event</button>
            </div>

            {error && <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <th style={thStyle}>Title</th>
                      <th style={thStyle}>Type</th>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Time</th>
                      <th style={thStyle}>Capacity</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.ID}>
                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>{event.Title}</td>
                        <td style={tdStyle}>{event.Type || 'Workshop'}</td>
                        <td style={tdStyle}>{new Date(event.StartTime).toLocaleDateString()}</td>
                        <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#cbd5e1' }}>
                          {new Date(event.StartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={tdStyle}>{event.CurrentCount} / {event.MaxCapacity}</td>
                        <td style={tdStyle}>
                          <span className={`status-badge ${event.Status === 'Open' ? 'status-active' : event.Status === 'Full' ? 'status-warning' : 'status-closed'}`}>
                            {event.Status}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {event.Status === 'Completed' && (
                              <button className="btn-outline" onClick={() => handleManageGlimpses(event)} style={{ padding: '6px 10px' }} title="Manage Glimpses">
                                <CameraIcon size={16} weight="duotone" />
                              </button>
                            )}
                            <button className="btn-outline" onClick={() => handleEdit(event)} style={{ padding: '6px 10px' }} title="Edit">
                              <PencilSimpleIcon size={16} weight="duotone" />
                            </button>
                            <button className="btn-outline" onClick={() => handleDelete(event.ID)} style={{ padding: '6px 10px', color: '#ef4444', borderColor: '#ef4444' }} title="Delete">
                              <TrashIcon size={16} weight="duotone" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {events.length === 0 && <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No events found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
        }} onClick={() => !submitting && setShowModal(false)}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <XIcon size={20} />
            </button>

            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'white' }}>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Title</label>
                <input type="text" className="form-input" value={formData.Title} onChange={(e) => setFormData({ ...formData, Title: e.target.value })} required disabled={submitting} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Description</label>
                <textarea className="form-input" rows={3} value={formData.Description} onChange={(e) => setFormData({ ...formData, Description: e.target.value })} required disabled={submitting} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Event Type</label>
                <select className="form-input" value={formData.Type} onChange={(e) => setFormData({ ...formData, Type: e.target.value })} disabled={submitting}>
                  <option value="Workshop" style={{ color: 'black' }}>Workshop</option>
                  <option value="Seminar" style={{ color: 'black' }}>Seminar</option>
                  <option value="Webinar" style={{ color: 'black' }}>Webinar</option>
                  <option value="Hackathon" style={{ color: 'black' }}>Hackathon</option>
                  <option value="Meetup" style={{ color: 'black' }}>Meetup</option>
                  <option value="Competition" style={{ color: 'black' }}>Competition</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Start Time</label>
                  <input type="datetime-local" className="form-input" value={formData.StartTime} onChange={(e) => setFormData({ ...formData, StartTime: e.target.value })} required disabled={submitting} style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>End Time</label>
                  <input type="datetime-local" className="form-input" value={formData.EndTime} onChange={(e) => setFormData({ ...formData, EndTime: e.target.value })} required disabled={submitting} style={{ colorScheme: 'dark' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Capacity</label>
                  <input type="number" className="form-input" value={formData.MaxCapacity} onChange={(e) => setFormData({ ...formData, MaxCapacity: e.target.value })} required disabled={submitting} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Status</label>
                  <select className="form-input" value={formData.Status} onChange={(e) => setFormData({ ...formData, Status: e.target.value as any })} disabled={submitting}>
                    <option value="Open" style={{ color: 'black' }}>Open</option>
                    <option value="Full" style={{ color: 'black' }}>Full</option>
                    <option value="Closed" style={{ color: 'black' }}>Closed</option>
                    <option value="Completed" style={{ color: 'black' }}>Completed</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Image URL</label>
                <input type="url" className="form-input" value={formData.ImageURL} onChange={(e) => setFormData({ ...formData, ImageURL: e.target.value })} disabled={submitting} placeholder="https://..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Saving...' : 'Save Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Glimpse Modal */}
      {showGlimpseModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
        }} onClick={() => setShowGlimpseModal(false)}>
          <div className="glass-card" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowGlimpseModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <XIcon size={20} />
            </button>

            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'white' }}>Manage Glimpses</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>{currentEventForGlimpses?.Title}</p>

            <form onSubmit={handleAddGlimpse} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>Select Image</label>
                  <input
                    id="glimpse-file-input"
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={handleFileSelect}
                    required
                    style={{ fontSize: '0.9rem', paddingTop: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>Caption (Optional)</label>
                  <input type="text" className="form-input" value={newGlimpseCaption} onChange={(e) => setNewGlimpseCaption(e.target.value)} placeholder="Fun times..." style={{ fontSize: '0.9rem' }} />
                </div>
                <button type="submit" className="btn" disabled={addingGlimpse || !selectedFile}>
                  {addingGlimpse ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>

            {loadingGlimpses ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Loading glimpses...</div>
            ) : (
              <div>
                <h4 style={{ color: 'white', marginBottom: '1rem' }}>Uploaded Photos ({glimpses.length})</h4>
                {glimpses.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>No glimpses added yet.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                    {glimpses.map(glimpse => (
                      <div key={glimpse.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1/1', background: '#000' }}>
                        <img src={glimpse.image_url} alt="Glimpse" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', opacity: 0, transition: '0.2s', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0.5rem' }} className="glimpse-overlay">
                          <button onClick={() => handleDeleteGlimpse(glimpse.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                        </div>
                        <style jsx>{`
                          .glimpse-overlay:hover { opacity: 1 !important; }
                        `}</style>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Modal */}
      <StatusModal
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => {
          setStatusModal(prev => ({ ...prev, isOpen: false }));
          if (statusModal.onClose) statusModal.onClose();
        }}
      />
    </>
  );
}