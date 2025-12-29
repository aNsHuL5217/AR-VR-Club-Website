'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import ChangePasswordModal from '@/components/common/ChangePasswordModal';
import StatusModal from '@/components/common/StatusModal';
import {
  XCircleIcon,
  LockKeyIcon,
  CalendarCheckIcon,
  ClipboardTextIcon,
  TrophyIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  PencilSimpleIcon,
  UserIcon
} from '@phosphor-icons/react/dist/ssr';

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

interface Registration {
  RegistrationID: string;
  EventID: string;
  UserID: string;
  UserEmail: string;
  Year?: string;
  Dept?: string;
  RollNo?: string;
  Timestamp: string;
  Status: 'confirmed' | 'cancelled';
  EventTitle?: string;
  EventDescription?: string;
  EventStartTime?: string;
  EventEndTime?: string;
  EventStatus?: string;
}

export default function DashboardPage() {
  const { user, authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [registering, setRegistering] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

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

  // Profile Form States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileYear, setProfileYear] = useState('');
  const [profileDept, setProfileDept] = useState('');
  const [profileRollNo, setProfileRollNo] = useState('');
  const [profileMobile, setProfileMobile] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const eventsRes = await fetch('/api/events', { cache: 'no-store' });
      const eventsData = await eventsRes.json();
      if (eventsData.success) setEvents(eventsData.data);

      if (user) {
        const regRes = await fetch(`/api/registrations?userId=${user.uid}`, { cache: 'no-store' });
        const regData = await regRes.json();
        if (regData.success) setRegistrations(regData.data);

        const userRes = await fetch(`/api/users?userId=${user.uid}`, { cache: 'no-store' });
        const userData = await userRes.json();
        if (userData.success) setUserProfile(userData.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowRegistrationModal(true);
  };

  const handleEditProfile = () => {
    if (userProfile) {
      setProfileYear(userProfile.Year || '');
      setProfileDept(userProfile.Dept || '');
      setProfileRollNo(userProfile.RollNo || '');
      setProfileMobile(userProfile.MobileNumber || '');
    }
    setShowProfileModal(true);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserID: user.uid,
          Year: profileYear,
          Dept: profileDept,
          RollNo: profileRollNo,
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
          message: 'Your profile has been updated successfully.',
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
    } catch (e: any) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: e.message
      });
    }
    finally { setProfileLoading(false); }
  };

  const handleRegister = async () => {
    if (!user || !user.email || !selectedEventId) return;
    setRegistering(true);
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          userId: user.uid,
          userEmail: user.email,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setShowRegistrationModal(false);
        fetchData();
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Registration Successful',
          message: 'You have successfully registered for the event.'
        });
      } else {
        if (data.error === 'PROFILE_INCOMPLETE' || data.code === 'PROFILE_INCOMPLETE') {
          setShowRegistrationModal(false);
          setStatusModal({
            isOpen: true,
            type: 'error',
            title: 'Profile Incomplete',
            message: "Your profile is incomplete. Please add your Year, Department, Roll No, and Mobile Number to continue.",
            onClose: () => setShowProfileModal(true)
          });
        } else {
          setStatusModal({
            isOpen: true,
            type: 'error',
            title: 'Registration Failed',
            message: data.error || 'Failed to register.'
          });
        }
      }
    } catch (e: any) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: e.message
      });
    }
    finally { setRegistering(false); }
  };

  if (authLoading || loading) {
    return <><Navbar /><div className="container" style={{ paddingTop: '8rem', textAlign: 'center', color: '#94a3b8' }}>Loading Dashboard...</div></>;
  }
  if (!user) return null;

  const registeredEventIds = registrations.map((r) => r.EventID);
  const eventsAttended = registrations.filter((reg) => reg.EventStatus === 'Completed').length;
  const now = new Date();
  const upcomingEvents = events.filter((e) => {
    const eventDate = new Date(e.StartTime);
    return eventDate >= now && (e.Status === 'Open' || e.Status === 'Full');
  });

  const thStyle = { padding: '12px', textAlign: 'left' as const, borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.9rem' };
  const tdStyle = { padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white' };

  return (
    <>
      <Navbar />
      <div className="container" style={{ marginTop: '6rem', paddingBottom: '4rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ color: 'white', fontSize: '2rem' }}>Student Dashboard</h2>
          <button className="btn-outline" onClick={() => setShowPasswordModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LockKeyIcon size={18} weight="duotone" /> Change Password
          </button>
        </div>

        {/* Stats Card */}
        <div className="glass-card" style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <img
            src="https://www.w3schools.com/howto/img_avatar2.png"
            alt="Profile"
            style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #3b82f6' }}
          />
          <div>
            <h3 style={{ marginTop: 0, color: 'white', marginBottom: '0.5rem' }}>Welcome, {authUser?.displayName || user.email}!</h3>
            <button onClick={handleEditProfile} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '1rem', padding: 0 }}>
              <PencilSimpleIcon size={16} /> Edit Profile
            </button>
            <div style={{ display: 'flex', gap: '2rem', color: '#94a3b8', flexWrap: 'wrap', fontSize: '0.95rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarCheckIcon size={20} color="#60a5fa" weight="duotone" />
                Attended: <strong style={{ color: 'white' }}>{eventsAttended}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardTextIcon size={20} color="#60a5fa" weight="duotone" />
                Registered: <strong style={{ color: 'white' }}>{registrations.length}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrophyIcon size={20} color="#60a5fa" weight="duotone" />
                Certificates: <strong style={{ color: 'white' }}>0</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Upcoming Events</h3>
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '3rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={thStyle}>Event</th>
                  <th style={thStyle}>Date & Time</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.length === 0 ? (
                  <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#64748b', padding: '2rem' }}>No upcoming events found.</td></tr>
                ) : (
                  upcomingEvents.map((event) => {
                    const isRegistered = registeredEventIds.includes(event.ID);
                    const isFull = event.Status === 'Full' || event.CurrentCount >= event.MaxCapacity;
                    return (
                      <tr key={event.ID}>
                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>{event.Title}</td>
                        <td style={tdStyle}>
                          {new Date(event.StartTime).toLocaleDateString()}
                        </td>
                        <td style={tdStyle}>Workshop</td>
                        <td style={tdStyle}>
                          <span className={`status-badge ${isFull ? 'status-closed' : 'status-active'}`}>{event.Status}</span>
                        </td>
                        <td style={tdStyle}>
                          {isRegistered ? (
                            <span style={{ color: '#4ade80', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <CheckCircleIcon size={18} weight="fill" /> Registered
                            </span>
                          ) : isFull ? (
                            <span style={{ color: '#f87171', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <WarningCircleIcon size={18} weight="duotone" /> Full
                            </span>
                          ) : (
                            <button className="btn" onClick={() => handleRegisterClick(event.ID)} style={{ padding: '6px 16px', fontSize: '0.85rem' }}>Register</button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registrations */}
        <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Your Registrations</h3>
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={thStyle}>Event Name</th>
                  <th style={thStyle}>Event Date</th>
                  <th style={thStyle}>Details Provided</th>
                  <th style={thStyle}>Registered On</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#64748b', padding: '2rem' }}>No registrations found.</td></tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg.RegistrationID}>
                      <td style={{ ...tdStyle, fontWeight: 'bold' }}>{reg.EventTitle || 'Unknown'}</td>
                      <td style={tdStyle}>{reg.EventStartTime ? new Date(reg.EventStartTime).toLocaleDateString() : '-'}</td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{reg.Year} • {reg.Dept}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{reg.RollNo}</div>
                      </td>
                      <td style={tdStyle}>{new Date(reg.Timestamp).toLocaleDateString()}</td>
                      <td style={tdStyle}>
                        <span className={`status-badge ${reg.Status === 'confirmed' ? 'status-active' : 'status-closed'}`}>{reg.Status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => !registering && setShowRegistrationModal(false)}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowRegistrationModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <XCircleIcon size={30} weight="duotone" />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'white', fontSize: '1.5rem' }}>Register for Event</h3>

            <div style={{ marginBottom: '1.5rem', color: '#cbd5e1' }}>
              <p>Are you sure you want to register for this event?</p>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleIcon size={16} color="#60a5fa" />
                Using your profile details (Name, Roll No, Dept)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-outline" onClick={() => setShowRegistrationModal(false)} disabled={registering}>Cancel</button>
              <button className="btn" onClick={handleRegister} disabled={registering}>
                {registering ? 'Registering...' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />

      {/* Complete Profile Modal */}
      {showProfileModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
        }} onClick={() => !profileLoading && setShowProfileModal(false)}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowProfileModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <XCircleIcon size={30} weight="duotone" />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'white', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserIcon size={28} color="#60a5fa" weight="duotone" /> Complete Profile
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Please complete your profile to register for events.</p>

            <form onSubmit={handleProfileUpdate}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Year</label>
                  <select className="form-input" value={profileYear} onChange={(e) => setProfileYear(e.target.value)} required disabled={profileLoading}>
                    <option value="" style={{ color: 'black' }}>Select Year</option>
                    <option value="First Year" style={{ color: 'black' }}>First Year</option>
                    <option value="Second Year" style={{ color: 'black' }}>Second Year</option>
                    <option value="Third Year" style={{ color: 'black' }}>Third Year</option>
                    <option value="Fourth Year" style={{ color: 'black' }}>Fourth Year</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Department</label>
                  <select className="form-input" value={profileDept} onChange={(e) => setProfileDept(e.target.value)} required disabled={profileLoading}>
                    <option value="" style={{ color: 'black' }}>Select Dept</option>
                    <option value="CSE" style={{ color: 'black' }}>CSE</option>
                    <option value="IT" style={{ color: 'black' }}>IT</option>
                    <option value="ECE" style={{ color: 'black' }}>ECE</option>
                    <option value="AIML" style={{ color: 'black' }}>AIML</option>
                    <option value="AIDS" style={{ color: 'black' }}>AIDS</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Roll Number</label>
                <input type="text" className="form-input" value={profileRollNo} onChange={(e) => setProfileRollNo(e.target.value)} placeholder="e.g. TY-CSE-01" required disabled={profileLoading} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Mobile Number</label>
                <input type="tel" className="form-input" value={profileMobile} onChange={(e) => setProfileMobile(e.target.value)} placeholder="+91..." required disabled={profileLoading} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-outline" onClick={() => setShowProfileModal(false)} disabled={profileLoading}>Cancel</button>
                <button type="submit" className="btn" disabled={profileLoading}>
                  {profileLoading ? 'Saving...' : 'Save & Continue'}
                </button>
              </div>
            </form>
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