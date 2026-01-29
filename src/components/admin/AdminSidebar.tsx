'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  UserIcon,
  CalendarBlankIcon,
  UsersIcon,
  ClipboardTextIcon,
  ChatIcon,
  WrenchIcon,
  MegaphoneIcon
} from '@phosphor-icons/react/dist/ssr';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Profile', path: '/admin', icon: <UserIcon size={20} weight="duotone" /> },
  { label: 'Notifications', path: '/admin/notifications', icon: <MegaphoneIcon size={20} weight="duotone" /> },
  { label: 'Event Management', path: '/admin/events', icon: <CalendarBlankIcon size={20} weight="duotone" /> },
  { label: 'Member Management', path: '/admin/members', icon: <UsersIcon size={20} weight="duotone" /> },
  { label: 'Registrations', path: '/admin/registrations', icon: <ClipboardTextIcon size={20} weight="duotone" /> },
  { label: 'Club Inquiry', path: '/admin/inquiries', icon: <ChatIcon size={20} weight="duotone" /> },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { authUser } = useAuth();

  return (
    <div
      style={{
        width: '280px',
        minHeight: 'calc(100vh - 65px)',
        background: 'rgba(2, 6, 23, 0.95)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'fixed',
        top: '65px',
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)', color: 'white', fontSize: '1.2rem'
          }}>
            <WrenchIcon size={24} weight="duotone" color="white" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>
            Admin Panel
          </h2>
        </div>

        {authUser && (
          <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 'bold' }}>
              Logged in as
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'white', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {authUser.displayName || authUser.email}
            </p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {sidebarItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path));

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: isActive ? '#60a5fa' : '#94a3b8',
                border: '1px solid',
                borderColor: isActive ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                fontWeight: isActive ? '600' : '400',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}