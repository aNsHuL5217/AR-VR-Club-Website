'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ChangePasswordModal from '@/components/common/ChangePasswordModal';
import { User, Shield, Mail, Hash } from 'lucide-react';

export default function AdminDashboard() {
  const { authUser, loading } = useAuth();
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!authUser) router.push('/login');
      else if (authUser.role !== 'admin') router.push('/dashboard');
    }
  }, [authUser, loading, router]);

  if (loading) return <><Navbar /><div className="container" style={{paddingTop:'6rem', textAlign:'center', color:'#94a3b8'}}>Loading...</div></>;
  if (!authUser || authUser.role !== 'admin') return null;

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)', paddingTop: '65px' }}>
        <AdminSidebar />
        <div style={{ marginLeft: '280px', flex: 1, padding: '2rem' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>Profile Settings</h2>
                <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8' }}>Manage your admin account details</p>
              </div>
              <button className="btn-outline" onClick={() => setShowPasswordModal(true)}>
                🔒 Change Password
              </button>
            </div>

            {/* Profile Card */}
            <div className="glass-card">
              <h3 style={{ marginTop: 0, marginBottom: '2rem', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                Account Information
              </h3>
              
              <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: '#60a5fa' }}><User size={24} /></div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.85rem' }}>Full Name</label>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: 'white' }}>{authUser.displayName || 'Not set'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', color: '#c084fc' }}><Mail size={24} /></div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.85rem' }}>Email Address</label>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: 'white' }}>{authUser.email || 'Not set'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', color: '#facc15' }}><Shield size={24} /></div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.85rem' }}>Role</label>
                    <span className="status-badge status-warning" style={{ fontSize: '0.9rem', padding: '0.25rem 0.75rem' }}>Admin</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                   <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#cbd5e1' }}><Hash size={24} /></div>
                   <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.85rem' }}>User ID</label>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', fontFamily: 'monospace' }}>{authUser.uid}</p>
                   </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </>
  );
}