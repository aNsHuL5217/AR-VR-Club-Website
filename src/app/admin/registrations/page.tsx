'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { DownloadSimpleIcon, ArrowsClockwiseIcon } from '@phosphor-icons/react/dist/ssr';

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  if (dateString.includes('/')) return dateString;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; 
    return d.toLocaleString();
  } catch {
    return dateString;
  }
};

interface Registration { 
    registration_id: string; 
    event_id: string; 
    user_id: string; 
    user_email: string; 
    year?: string; 
    dept?: string; 
    roll_no?: string; 
    timestamp: string; 
    status: 'confirmed'|'cancelled'; 
    event_title?: string; 
}
interface Event { id: string; title: string; }

export default function RegistrationsManagementPage() {
  const { authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({ year: '', dept: '', eventId: '', status: '', search: '' });

  useEffect(() => {
      if (!authLoading) {
          if (!authUser) router.push('/login');
          else if (authUser.role !== 'admin') router.push('/dashboard');
      }
  }, [authUser, authLoading, router]);

  useEffect(() => {
      if (authUser?.role === 'admin') {
          fetchData();
          const interval = setInterval(fetchData, 30000);
          return () => clearInterval(interval);
      }
  }, [authUser]);

  const fetchData = async () => {
      try {
          setLoading(true);
          const regRes = await fetch('/api/admin/registrations', { 
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache' }
          });
          const regData = await regRes.json();
          
          if(regData.success) {
              setRegistrations(regData.data);
          }
          
          const evtRes = await fetch('/api/events', { cache: 'no-store' });
          const evtData = await evtRes.json();
          if(evtData.success) setEvents(evtData.data);
      } catch(e: any) { 
          console.error(e); 
      } finally { 
          setLoading(false); 
      }
  }

  const handleExport = (format: 'excel' | 'pdf') => {
      const params = new URLSearchParams({ type: 'registrations', format });
      if(filters.year) params.append('year', filters.year);
      if(filters.eventId) params.append('eventId', filters.eventId);
      if(filters.dept) params.append('dept', filters.dept);
      if(filters.status) params.append('status', filters.status);
      if(filters.search) params.append('search', filters.search);
      window.open(`/api/export?${params.toString()}`, '_blank');
  }

  const filteredRegistrations = registrations.filter(r => {
      if(filters.year && r.year !== filters.year) return false;
      if(filters.dept && r.dept !== filters.dept) return false;
      if(filters.eventId && r.event_id !== filters.eventId) return false;
      if(filters.status && r.status !== filters.status) return false;
      
      if(filters.search) {
          const s = filters.search.toLowerCase();
          return (
              r.user_email?.toLowerCase().includes(s) || 
              r.roll_no?.toLowerCase().includes(s) ||
              r.event_title?.toLowerCase().includes(s) ||
              r.year?.toLowerCase().includes(s) ||
              r.dept?.toLowerCase().includes(s)
          );
      }
      return true;
  });

  const uniqueYears = Array.from(new Set(registrations.map(r => r.year).filter(Boolean))).sort();
  const uniqueDepts = Array.from(new Set(registrations.map(r => r.dept).filter(Boolean))).sort();

  if (loading && registrations.length === 0) return <><Navbar /><div className="container" style={{paddingTop:'6rem', textAlign:'center', color:'#94a3b8'}}>Loading...</div></>;
  if (!authUser || authUser.role !== 'admin') return null;

  const thStyle = { padding: '12px 16px', textAlign: 'left' as const, borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' as const };
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
                 <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>Registrations</h2>
                 <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8' }}>
                   Showing {filteredRegistrations.length} of {registrations.length} registrations
                 </p>
               </div>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                 <button className="btn-outline" onClick={fetchData} title="Refresh"><ArrowsClockwiseIcon size={18} /></button>
                 <button className="btn" onClick={() => handleExport('excel')}><DownloadSimpleIcon size={18}  style={{marginRight:'8px'}}/> Excel</button>
                 <button className="btn-outline" onClick={() => handleExport('pdf')} title="PDF"><DownloadSimpleIcon size={18} /></button>
               </div>
             </div>

             <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                   <div style={{ flex: 1, minWidth: '200px' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Event</label>
                      <select className="form-input" value={filters.eventId} onChange={(e) => setFilters({...filters, eventId: e.target.value})} style={{ marginBottom: 0 }}>
                          <option value="" style={{color:'black'}}>All Events</option>
                          {events.map(e => <option key={e.id} value={e.id} style={{color:'black'}}>{e.title}</option>)}
                      </select>
                   </div>
                   <div style={{ flex: 1, minWidth: '150px' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Status</label>
                      <select className="form-input" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} style={{ marginBottom: 0 }}>
                          <option value="" style={{color:'black'}}>All Status</option>
                          <option value="confirmed" style={{color:'black'}}>Confirmed</option>
                          <option value="cancelled" style={{color:'black'}}>Cancelled</option>
                      </select>
                   </div>
                   <div style={{ flex: 1, minWidth: '200px' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Search</label>
                      <input type="text" className="form-input" placeholder="Search..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} style={{ marginBottom: 0 }} />
                   </div>
                   <button className="btn-outline" onClick={() => setFilters({year:'', dept:'', eventId:'', status:'', search:''})} style={{ height: '46px' }}>Clear</button>
                </div>
             </div>

             <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
               <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                       <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                           <th style={thStyle}>Event</th>
                           <th style={thStyle}>User</th>
                           <th style={thStyle}>Details</th>
                           <th style={thStyle}>Date</th>
                           <th style={thStyle}>Status</th>
                       </tr>
                   </thead>
                   <tbody>
                       {filteredRegistrations.length > 0 ? (
                           filteredRegistrations.map(r => (
                               <tr key={r.registration_id}>
                                   <td style={{...tdStyle, fontWeight: 'bold'}}>{r.event_title || 'Unknown'}</td>
                                   <td style={tdStyle}>{r.user_email || 'N/A'}</td>
                                   <td style={tdStyle}>
                                       <div>{r.year || '-'} / {r.dept || '-'}</div>
                                       <div style={{fontSize:'0.8rem', color:'#94a3b8'}}>{r.roll_no}</div>
                                   </td>
                                   <td style={tdStyle}>{formatDate(r.timestamp)}</td>
                                   <td style={tdStyle}>
                                       <span className={`status-badge ${r.status === 'confirmed' ? 'status-active' : 'status-closed'}`}>{r.status}</span>
                                   </td>
                               </tr>
                           ))
                       ) : (
                           <tr>
                               <td colSpan={5} style={{...tdStyle, textAlign:'center', padding:'2rem', color:'#94a3b8'}}>
                                   No registrations found.
                               </td>
                           </tr>
                       )}
                   </tbody>
                 </table>
               </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}