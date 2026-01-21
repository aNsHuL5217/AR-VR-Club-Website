'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ChangePasswordModal from '@/components/common/ChangePasswordModal';
import StatusModal from '@/components/common/StatusModal';
import {
  UserIcon,
  ShieldIcon,
  EnvelopeSimpleIcon,
  HashIcon,
  LockKeyIcon,
  PencilSimpleIcon,
  XIcon,
  CalendarBlankIcon,
  BuildingsIcon,
  IdentificationCardIcon,
  PhoneIcon
} from '@phosphor-icons/react/dist/ssr';

export default function AdminDashboard() {
  const { authUser, loading } = useAuth();
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileYear, setProfileYear] = useState('');
  const [profileDept, setProfileDept] = useState('');
  const [profileRollNo, setProfileRollNo] = useState('');
  const [profileDesignation, setProfileDesignation] = useState(''); // Added Designation state
  const [profileMobile, setProfileMobile] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

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

  // FIX: Common style for dropdown options to fix readability
  const optionStyle = { backgroundColor: '#1e293b', color: 'white' };

  useEffect(() => {
    if (!loading) {
      if (!authUser) router.push('/login');
      else if (authUser.role !== 'admin') router.push('/dashboard');
    }
  }, [authUser, loading, router]);

  useEffect(() => {
    if (authUser) {
      setProfileYear(authUser.year || '');
      setProfileDept(authUser.dept || '');
      setProfileRollNo(authUser.rollNo || '');
      setProfileDesignation(authUser.designation || ''); // Added designation loading
      setProfileMobile(authUser.mobileNumber || '');
    }
  }, [authUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const response = await fetch(`/api/users/${authUser!.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name: authUser!.displayName,
          Email: authUser!.email,
          Role: 'admin',
          Year: profileYear,
          Dept: profileDept,
          RollNo: profileRollNo,
          Designation: profileDesignation, // Added designation to payload
          MobileNumber: profileMobile
        }),
      });
      const data = await response.json();
      if (data.success) {
        setShowProfileModal(false);
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been successfully updated.',
          // FIX: Reload page on close to refresh AuthContext data
          onClose: () => window.location.reload()
        });
      } else {
        setStatusModal({
          isOpen: true,
          type: 'error',
          title: 'Update Failed',
          message: data.error || 'Failed to update profile.'
        });
      }
    } catch (error) {
      console.error(error);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred.'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) return <><Navbar /><div className="container" style={{ paddingTop: '6rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div></>;
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
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-outline" onClick={() => setShowPasswordModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LockKeyIcon size={18} weight="duotone" /> Change Password
                </button>
                <button className="btn" onClick={() => setShowProfileModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PencilSimpleIcon size={18} weight="duotone" /> Edit Profile
                </button>
              </div>
            </div>

            {/* Profile Card */}
            <div className="glass-card">
              <h3 style={{ marginTop: 0, marginBottom: '2rem', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                Account Information
              </h3>

              <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: '#60a5fa' }}>
                    <UserIcon size={24} weight="duotone" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.85rem' }}>Full Name</label>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: 'white' }}>{authUser.displayName || 'Not set'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', color: '#c084fc' }}>
                    <EnvelopeSimpleIcon size={24} weight="duotone" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.85rem' }}>Email Address</label>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: 'white' }}>{authUser.email || 'Not set'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', color: '#facc15' }}>
                    <ShieldIcon size={24} weight="duotone" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.85rem' }}>Role</label>
                    <span className="status-badge status-warning" style={{ fontSize: '0.9rem', padding: '0.25rem 0.75rem' }}>Admin</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#cbd5e1' }}>
                    <HashIcon size={24} weight="duotone" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.85rem' }}>User ID</label>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', fontFamily: 'monospace' }}>{authUser.uid}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '8px', color: '#f472b6' }}>
                    <CalendarBlankIcon size={24} weight="duotone" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.85rem' }}>Year</label>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: 'white' }}>{authUser.year || 'Not set'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px', color: '#38bdf8' }}>
                    <BuildingsIcon size={24} weight="duotone" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.85rem' }}>Department</label>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: 'white' }}>{authUser.dept || 'Not set'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', color: '#a78bfa' }}>
                    <IdentificationCardIcon size={24} weight="duotone" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.85rem' }}>Roll Number</label>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: 'white' }}>{authUser.rollNo || 'Not set'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', color: '#4ade80' }}>
                    <PhoneIcon size={24} weight="duotone" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.85rem' }}>Mobile Number</label>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: 'white' }}>{authUser.mobileNumber || 'Not set'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', color: '#facc15' }}>
                    <IdentificationCardIcon size={24} weight="duotone" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.85rem' }}>Designation</label>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: 'white' }}>{authUser.designation || 'Not set'}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />

      {/* FIX: Properly execute onClose when modal is closed */}
      <StatusModal
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => {
          setStatusModal({ ...statusModal, isOpen: false });
          if (statusModal.onClose) statusModal.onClose();
        }}
      />

      {/* Complete/Edit Profile Modal */}
      {showProfileModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
        }} onClick={() => !profileLoading && setShowProfileModal(false)}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowProfileModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <XIcon size={20} weight="duotone" />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'white', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserIcon size={28} color="#60a5fa" weight="duotone" /> Edit Profile
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Update your admin profile details.</p>

            <form onSubmit={handleProfileUpdate}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Year</label>
                  <select
                    className="form-input"
                    value={profileYear}
                    onChange={(e) => setProfileYear(e.target.value)}
                    disabled={profileLoading}
                  // FIX: Removed 'color: black' and let the options style handle text color
                  >
                    <option value="" style={optionStyle}>Select Year</option>
                    <option value="First Year" style={optionStyle}>First Year</option>
                    <option value="Second Year" style={optionStyle}>Second Year</option>
                    <option value="Third Year" style={optionStyle}>Third Year</option>
                    <option value="Fourth Year" style={optionStyle}>Fourth Year</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Department</label>
                  <select
                    className="form-input"
                    value={profileDept}
                    onChange={(e) => setProfileDept(e.target.value)}
                    disabled={profileLoading}
                  >
                    <option value="" style={optionStyle}>Select Dept</option>
                    <option value="CSE" style={optionStyle}>CSE</option>
                    <option value="IT" style={optionStyle}>IT</option>
                    <option value="ECE" style={optionStyle}>ECE</option>
                    <option value="EE" style={optionStyle}>EE</option>
                    <option value="ME" style={optionStyle}>ME</option>
                    <option value="CE" style={optionStyle}>CE</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Roll Number</label>
                <input type="text" className="form-input" value={profileRollNo} onChange={(e) => setProfileRollNo(e.target.value)} placeholder="e.g. TY-CSE-01" disabled={profileLoading} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Designation</label>
                <input type="text" className="form-input" value={profileDesignation} onChange={(e) => setProfileDesignation(e.target.value)} placeholder="e.g. Admin, Coordinator" disabled={profileLoading} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Mobile Number</label>
                <input type="tel" className="form-input" value={profileMobile} onChange={(e) => setProfileMobile(e.target.value)} placeholder="+91..." disabled={profileLoading} />
              </div>

              <button type="submit" className={`btn ${profileLoading ? 'btn-disabled' : ''}`} style={{ width: '100%', justifyContent: 'center' }} disabled={profileLoading}>
                {profileLoading ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}