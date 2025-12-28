'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import ChangePasswordModal from '@/components/common/ChangePasswordModal';
import { X, Calendar, MapPin, Clock } from 'lucide-react';

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
  
  // Registration Form States
  const [registrationYear, setRegistrationYear] = useState('');
  const [registrationDept, setRegistrationDept] = useState('');
  const [registrationRollNo, setRegistrationRollNo] = useState('');
  const [registrationMobileNumber, setRegistrationMobileNumber] = useState('');
  const [registering, setRegistering] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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
    setRegistrationYear(''); 
    setRegistrationDept(''); 
    setRegistrationRollNo(''); 
    setRegistrationMobileNumber('');
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
          year: registrationYear,
          dept: registrationDept,
          rollNo: registrationRollNo,
          mobileNumber: registrationMobileNumber,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setShowRegistrationModal(false);
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (e: any) { alert(e.message); } 
    finally { setRegistering(false); }
  };

  if (authLoading || loading) {
    return <><Navbar /><div className="container" style={{paddingTop:'8rem', textAlign:'center', color:'#94a3b8'}}>Loading Dashboard...</div></>;
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
          <button className="btn-outline" onClick={() => setShowPasswordModal(true)}>
            🔒 Change Password
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
            <div style={{ display: 'flex', gap: '2rem', color: '#94a3b8', flexWrap: 'wrap', fontSize: '0.95rem' }}>
                <span>📅 Attended: <strong style={{ color: '#60a5fa' }}>{eventsAttended}</strong></span>
                <span>📝 Registered: <strong style={{ color: '#60a5fa' }}>{registrations.length}</strong></span>
                <span>🏆 Certificates: <strong style={{ color: '#60a5fa' }}>0</strong></span>
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
                    <tr><td colSpan={5} style={{...tdStyle, textAlign: 'center', color: '#64748b', padding: '2rem'}}>No upcoming events found.</td></tr>
                    ) : (
                    upcomingEvents.map((event) => {
                        const isRegistered = registeredEventIds.includes(event.ID);
                        const isFull = event.Status === 'Full' || event.CurrentCount >= event.MaxCapacity;
                        return (
                        <tr key={event.ID}>
                            <td style={{...tdStyle, fontWeight: 'bold'}}>{event.Title}</td>
                            <td style={tdStyle}>
                                {new Date(event.StartTime).toLocaleDateString()}
                            </td>
                            <td style={tdStyle}>Workshop</td>
                            <td style={tdStyle}>
                                <span className={`status-badge ${isFull ? 'status-closed' : 'status-active'}`}>{event.Status}</span>
                            </td>
                            <td style={tdStyle}>
                            {isRegistered ? <span style={{ color: '#4ade80', fontSize: '0.9rem' }}>✓ Registered</span> : 
                            isFull ? <span style={{ color: '#f87171', fontSize: '0.9rem' }}>Full</span> : 
                            <button className="btn" onClick={() => handleRegisterClick(event.ID)} style={{ padding: '6px 16px', fontSize: '0.85rem' }}>Register</button>
                            }
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
                    <tr><td colSpan={5} style={{...tdStyle, textAlign: 'center', color: '#64748b', padding: '2rem'}}>No registrations found.</td></tr>
                    ) : (
                        registrations.map((reg) => (
                        <tr key={reg.RegistrationID}>
                            <td style={{...tdStyle, fontWeight: 'bold'}}>{reg.EventTitle || 'Unknown'}</td>
                            <td style={tdStyle}>{reg.EventStartTime ? new Date(reg.EventStartTime).toLocaleDateString() : '-'}</td>
                            <td style={tdStyle}>
                                <div style={{ fontSize:'0.85rem', color:'#cbd5e1' }}>{reg.Year} • {reg.Dept}</div>
                                <div style={{ fontSize:'0.8rem', color:'#94a3b8' }}>{reg.RollNo}</div>
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
                <X size={20} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'white', fontSize: '1.5rem' }}>Register for Event</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Year</label>
              <select className="form-input" value={registrationYear} onChange={(e) => setRegistrationYear(e.target.value)} disabled={registering}>
                <option value="" style={{ color: 'black' }}>Select Year</option>
                <option value="First Year" style={{ color: 'black' }}>First Year</option>
                <option value="Second Year" style={{ color: 'black' }}>Second Year</option>
                <option value="Third Year" style={{ color: 'black' }}>Third Year</option>
                <option value="Fourth Year" style={{ color: 'black' }}>Fourth Year</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Department</label>
              <select className="form-input" value={registrationDept} onChange={(e) => setRegistrationDept(e.target.value)} disabled={registering}>
                <option value="" style={{ color: 'black' }}>Select Department</option>
                <option value="CSE" style={{ color: 'black' }}>CSE</option>
                <option value="IT" style={{ color: 'black' }}>IT</option>
                <option value="ECE" style={{ color: 'black' }}>ECE</option>
                <option value="AIML" style={{ color: 'black' }}>AIML</option>
                <option value="AIDS" style={{ color: 'black' }}>AIDS</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Roll Number</label>
              <input type="text" className="form-input" value={registrationRollNo} onChange={(e) => setRegistrationRollNo(e.target.value)} placeholder="e.g. TY-CSE-01" disabled={registering} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Mobile Number</label>
              <input type="tel" className="form-input" value={registrationMobileNumber} onChange={(e) => setRegistrationMobileNumber(e.target.value)} placeholder="+91..." disabled={registering} />
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
    </>
  );
}