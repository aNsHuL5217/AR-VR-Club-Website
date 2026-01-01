'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import StatusModal from '@/components/common/StatusModal';
import {
  TrashIcon,
  CopyIcon,
  MagnifyingGlassIcon,
  ArrowsClockwiseIcon,
} from '@phosphor-icons/react/dist/ssr';

interface Inquiry { id: string; name: string; email: string; message: string; status: 'pending' | 'read' | 'replied' | 'resolved'; created_at: string; updated_at: string; }

export default function InquiriesManagementPage() {
  const { authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', search: '' });

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

  useEffect(() => {
    if (authUser?.role === 'admin') {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [authUser]);

  const fetchData = async () => {
    try {
      setLoading(true); setError('');
      
      // FIX: Add timestamp query param to force fresh data fetch
      const t = new Date().getTime();
      const response = await fetch(`/api/admin/inquiries?t=${t}`, { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      
      const data = await response.json();
      if (data.success) setInquiries(data.data);
      else setError(data.error);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (e) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update inquiry status.'
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete inquiry from ${name}?`)) return;
    await fetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
    fetchData();
  }

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (filters.status && inquiry.status !== filters.status) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      return inquiry.name?.toLowerCase().includes(s) || inquiry.email?.toLowerCase().includes(s) || inquiry.message?.toLowerCase().includes(s);
    }
    return true;
  });

  const pendingCount = inquiries.filter(i => i.status === 'pending').length;

  if (loading && inquiries.length === 0) return <><Navbar /><div className="container" style={{ paddingTop: '6rem', textAlign: 'center', color: '#94a3b8' }}>Loading Inquiries...</div></>;
  if (!authUser || authUser.role !== 'admin') return null;

  const thStyle = { padding: '12px 16px', textAlign: 'left' as const, borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' as const };
  const tdStyle = { padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: '0.95rem' };
  
  // Dark style for select options
  const optionStyle = { backgroundColor: '#1e293b', color: 'white' };

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)', paddingTop: '65px' }}>
        <AdminSidebar />
        <div style={{ marginLeft: '280px', flex: 1, padding: '2rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>Club Inquiries</h2>
                <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8' }}>Manage incoming messages</p>
              </div>
              <button className="btn-outline" onClick={fetchData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowsClockwiseIcon size={16} className={loading ? 'spin' : ''} /> Refresh
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{inquiries.length}</div>
                <div style={{ color: '#94a3b8' }}>Total Inquiries</div>
              </div>
              <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{pendingCount}</div>
                <div style={{ color: '#94a3b8' }}>Pending Action</div>
              </div>
            </div>

            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Search</label>
                  <div style={{ position: 'relative' }}>
                    <input type="text" className="form-input" placeholder="Search name, email..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} style={{ marginBottom: 0, paddingLeft: '35px' }} />
                    <MagnifyingGlassIcon size={18} weight="duotone" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  </div>
                </div>
                <div style={{ width: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Status</label>
                  <select className="form-input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} style={{ marginBottom: 0 }}>
                    <option value="" style={optionStyle}>All Status</option>
                    <option value="pending" style={optionStyle}>Pending</option>
                    <option value="read" style={optionStyle}>Read</option>
                    <option value="resolved" style={optionStyle}>Resolved</option>
                  </select>
                </div>
                <button className="btn-outline" onClick={() => setFilters({ status: '', search: '' })} style={{ height: '46px' }}>Clear</button>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Message</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.map(inq => (
                      <tr key={inq.id}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 'bold' }}>{inq.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#60a5fa' }}>{inq.email}</div>
                        </td>
                        <td style={{ ...tdStyle, maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#cbd5e1' }} title={inq.message}>
                          {inq.message}
                        </td>
                        <td style={tdStyle}>
                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                            style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '6px' }}
                          >
                            <option value="pending" style={optionStyle}>Pending</option>
                            <option value="read" style={optionStyle}>Read</option>
                            <option value="resolved" style={optionStyle}>Resolved</option>
                          </select>
                        </td>
                        <td style={tdStyle}>{new Date(inq.created_at).toLocaleDateString()}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-outline" onClick={() => {
                              navigator.clipboard.writeText(inq.message);
                              setStatusModal({
                                isOpen: true,
                                type: 'success',
                                title: 'Copied!',
                                message: 'Message copied to clipboard.'
                              });
                            }} style={{ padding: '6px' }} title="Copy Message">
                              <CopyIcon size={16} weight="duotone" />
                            </button>
                            <button className="btn-outline" onClick={() => handleDelete(inq.id, inq.name)} style={{ padding: '6px', color: '#ef4444', borderColor: '#ef4444' }} title="Delete">
                              <TrashIcon size={16} weight="duotone" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredInquiries.length === 0 && <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No inquiries found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

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