'use client';

import React, { useEffect, useState } from 'react';
import { BellIcon, InfoIcon, WarningCircleIcon, CheckCircleIcon, CalendarIcon, ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';
import { supabase } from '@/lib/supabase/client';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'alert' | 'success' | 'event';
    link_url?: string;
    link_text?: string;
    created_at: string;
    is_active: boolean;
}

const typeConfig = {
    info: { icon: InfoIcon, color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.1)' },
    alert: { icon: WarningCircleIcon, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.1)' },
    success: { icon: CheckCircleIcon, color: '#34d399', bg: 'rgba(16, 185, 129, 0.1)' },
    event: { icon: CalendarIcon, color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.1)' },
    default: { icon: BellIcon, color: '#94a3b8', bg: 'rgba(100, 116, 139, 0.1)' }
};

export default function NotificationSidebar() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('dashboard_notifications_persistent')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notifications' },
                () => {
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="glass-card" style={{ height: 'fit-content', maxHeight: 'calc(100vh - 120px)', position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', padding: '0' }}>
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <BellIcon size={24} color="#60a5fa" weight="duotone" /> Notifications
                </h2>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '600px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
                ) : notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>
                        <p>No new notifications</p>
                    </div>
                ) : (
                    notifications.map((note) => {
                        const config = typeConfig[note.type] || typeConfig.default;
                        const Icon = config.icon;
                        return (
                            <div key={note.id} style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                padding: '16px',
                                display: 'flex', gap: '12px'
                            }}>
                                <div style={{
                                    flexShrink: 0, width: '36px', height: '36px',
                                    borderRadius: '8px', background: config.bg,
                                    color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Icon size={18} weight="duotone" />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'white' }}>{note.title}</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>{note.message}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {new Date(note.created_at).toLocaleDateString()}
                                        </span>
                                        {note.link_url && (
                                            <a href={note.link_url} style={{ fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {note.link_text || 'View'} <ArrowRightIcon size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
