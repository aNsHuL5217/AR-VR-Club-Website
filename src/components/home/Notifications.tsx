'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MegaphoneIcon,
    InfoIcon,
    CheckCircleIcon,
    WarningCircleIcon,
    CalendarIcon,
    ArrowRightIcon,
    XIcon
} from '@phosphor-icons/react/dist/ssr';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'alert' | 'success' | 'event';
    link_url?: string;
    link_text?: string;
    created_at: string;
}

const typeConfig = {
    info: { icon: InfoIcon, color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.2)' },
    alert: { icon: WarningCircleIcon, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.2)' },
    success: { icon: CheckCircleIcon, color: '#34d399', bg: 'rgba(16, 185, 129, 0.2)' },
    event: { icon: CalendarIcon, color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.2)' },
    default: { icon: MegaphoneIcon, color: '#94a3b8', bg: 'rgba(100, 116, 139, 0.2)' }
};

import { supabase } from '@/lib/supabase/client';

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(3);

            if (error) {
                console.error('Error fetching notifications:', error);
                return;
            }

            if (data) {
                setNotifications(data);
            }
        } catch (err) {
            console.error('Failed to load notifications', err);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('notifications_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    console.log('Notification change received:', payload);
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const dismiss = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    if (notifications.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '100px',
            right: '20px',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
            maxWidth: '350px',
            pointerEvents: 'none' // Allow clicking through the container area
        }}>
            <AnimatePresence>
                {notifications.map((note) => {
                    const config = typeConfig[note.type] || typeConfig.default;
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={note.id}
                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            style={{
                                background: 'rgba(15, 23, 42, 0.85)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                padding: '16px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                pointerEvents: 'auto', // Re-enable clicks on the cards
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={() => dismiss(note.id)}
                                style={{
                                    position: 'absolute', top: '8px', right: '8px',
                                    background: 'transparent', border: 'none', color: '#64748b',
                                    cursor: 'pointer', padding: '4px'
                                }}
                            >
                                <XIcon size={14} />
                            </button>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{
                                    flexShrink: 0,
                                    width: '40px', height: '40px',
                                    borderRadius: '10px',
                                    background: config.bg,
                                    color: config.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Icon size={20} weight="fill" />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'white' }}>{note.title}</h4>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                                        {note.message}
                                    </p>

                                    {note.link_url && (
                                        <a
                                            href={note.link_url}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                fontSize: '0.8rem', color: config.color, textDecoration: 'none',
                                                marginTop: '8px', fontWeight: 500
                                            }}
                                        >
                                            {note.link_text || 'Check it out'} <ArrowRightIcon size={12} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
