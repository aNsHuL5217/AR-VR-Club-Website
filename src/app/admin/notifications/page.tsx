'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
    MegaphoneIcon,
    TrashIcon,
    PlusIcon,
    CheckCircleIcon,
    WarningCircleIcon,
    InfoIcon,
    CalendarIcon
} from '@phosphor-icons/react/dist/ssr';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'alert' | 'success' | 'event';
    link_url?: string;
    link_text?: string;
    is_active: boolean;
    created_at: string;
}

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'info' | 'alert' | 'success' | 'event'>('info');
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    message,
                    type,
                    link_url: linkUrl || null,
                    link_text: linkText || null,
                    is_active: true
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            // Reset form and refresh list
            setTitle('');
            setMessage('');
            setType('info');
            setLinkUrl('');
            setLinkText('');
            fetchNotifications();
            alert('Notification posted successfully!');
        } catch (error: any) {
            alert('Error creating notification: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this notification?')) return;

        try {
            const response = await fetch(`/api/admin/notifications/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error: any) {
            alert('Error deleting notification: ' + error.message);
        }
    };

    const getTypeColor = (t: string) => {
        switch (t) {
            case 'info': return '#3b82f6';
            case 'alert': return '#f59e0b';
            case 'success': return '#10b981';
            case 'event': return '#8b5cf6';
            default: return '#64748b';
        }
    };

    return (
        <div style={{ padding: '2rem', paddingLeft: '300px', minHeight: '100vh', background: '#020617', color: 'white' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MegaphoneIcon weight="duotone" color="#60a5fa" /> Manage Notifications
                </h1>
                <p style={{ color: '#94a3b8' }}>Create and manage announcements for the homepage notice board.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* CREATE FORM */}
                <div className="glass-card" style={{ padding: '2rem', alignSelf: 'start', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PlusIcon /> Create New Notification
                    </h2>

                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Title</label>
                            <input
                                type="text"
                                value={title} onChange={e => setTitle(e.target.value)}
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                placeholder="e.g., Workshop Alert"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Message</label>
                            <textarea
                                value={message} onChange={e => setMessage(e.target.value)}
                                required
                                rows={3}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                placeholder="Details about the announcement..."
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Type</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {['info', 'alert', 'success', 'event'].map((t) => (
                                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem', color: type === t ? getTypeColor(t) : '#64748b' }}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value={t}
                                            checked={type === t}
                                            onChange={() => setType(t as any)}
                                        />
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Link URL (Optional)</label>
                                <input
                                    type="text"
                                    value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    placeholder="/events"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Link Text (Optional)</label>
                                <input
                                    type="text"
                                    value={linkText} onChange={e => setLinkText(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    placeholder="Register Now"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn"
                            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                        >
                            {submitting ? 'Posting...' : 'Post Notification'}
                        </button>
                    </form>
                </div>

                {/* LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Active Notifications</h2>

                    {loading ? (
                        <p style={{ color: '#64748b' }}>Loading...</p>
                    ) : notifications.length === 0 ? (
                        <p style={{ color: '#64748b' }}>No notifications found.</p>
                    ) : (
                        notifications.map((note) => (
                            <div
                                key={note.id}
                                style={{
                                    background: 'rgba(30, 41, 59, 0.4)',
                                    padding: '1.25rem',
                                    borderRadius: '12px',
                                    borderLeft: `4px solid ${getTypeColor(note.type)}`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start'
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            background: getTypeColor(note.type) + '20',
                                            color: getTypeColor(note.type),
                                            padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600
                                        }}>
                                            {note.type}
                                        </span>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{note.title}</h3>
                                    </div>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.5rem' }}>{note.message}</p>
                                    {note.link_url && (
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                                            🔗 {note.link_text || 'Link'} ({note.link_url})
                                        </div>
                                    )}
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#475569' }}>
                                        Posted on {new Date(note.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(note.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}
                                    title="Delete"
                                >
                                    <TrashIcon size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
