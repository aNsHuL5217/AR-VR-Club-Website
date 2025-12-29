'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import StatusModal from '@/components/common/StatusModal';
import {
  XIcon,
  FileTextIcon,
  UserPlusIcon,
  ArrowsClockwiseIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react/dist/ssr';

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  if (dateString.includes('/')) return dateString;
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

interface Member {
  UserID: string;
  Name: string;
  Email: string;
  Role: 'student' | 'admin';
  Year?: string;
  Dept?: string;
  Designation?: string;
  MobileNumber?: string;
  CreatedAt: string;
}

export default function MemberManagementPage() {
  const { authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Role: 'student' as 'student' | 'admin',
    Year: '',
    Dept: '',
    Designation: '',
    MobileNumber: '',
  });

  const [filters, setFilters] = useState({ role: '', year: '', dept: '', search: '' });
  const [submitting, setSubmitting] = useState(false);

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
      fetchMembers();
    }
  }, [authUser]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      if (data.success) {
        setMembers(data.data);
      } else {
        console.error("Failed to load members:", data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = members.filter(m => {
    if (filters.role && m.Role !== filters.role) return false;
    if (filters.year && m.Year !== filters.year) return false;
    if (filters.dept && m.Dept !== filters.dept) return false;

    if (filters.search) {
      const s = filters.search.toLowerCase();
      return (
        m.Name?.toLowerCase().includes(s) ||
        m.Email?.toLowerCase().includes(s) ||
        m.MobileNumber?.toLowerCase().includes(s) ||
        m.Designation?.toLowerCase().includes(s) ||
        m.Year?.toLowerCase().includes(s) ||
        m.Dept?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const handleCreate = () => {
    setEditingMember(null);
    setFormData({ Name: '', Email: '', Role: 'student', Year: '', Dept: '', Designation: '', MobileNumber: '' });
    setShowModal(true);
  }

  const handleEdit = (m: Member) => {
    setEditingMember(m);
    setFormData({
      Name: m.Name,
      Email: m.Email,
      Role: m.Role,
      Year: m.Year || '',
      Dept: m.Dept || '',
      Designation: m.Designation || '',
      MobileNumber: m.MobileNumber || ''
    });
    setShowModal(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingMember ? `/api/users/${editingMember.UserID}` : '/api/admin/members';
      const method = editingMember ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchMembers();
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: editingMember ? 'Member Updated' : 'Member Added',
          message: editingMember ? 'Member details updated successfully.' : 'New member added successfully.'
        });
      } else {
        setStatusModal({
          isOpen: true,
          type: 'error',
          title: 'Operation Failed',
          message: data.error
        });
      }
    } catch (e: any) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: e.message
      });
    } finally {
      setSubmitting(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchMembers();
  }

  const uniqueYears = Array.from(new Set(members.map(m => m.Year).filter(Boolean))).sort();
  const uniqueDepts = Array.from(new Set(members.map(m => m.Dept).filter(Boolean))).sort();

  if (loading && members.length === 0) return <><Navbar /><div className="container" style={{ paddingTop: '6rem', textAlign: 'center', color: '#94a3b8' }}>Loading Members...</div></>;
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
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>Members</h2>
                <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8' }}>
                  Manage club membership database
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-outline" onClick={fetchMembers} title="Refresh"><ArrowsClockwiseIcon size={18} /></button>
                <button className="btn" onClick={handleCreate}><UserPlusIcon size={18} weight="duotone" style={{ marginRight: '8px' }} /> Add Member</button>
                <button className="btn-outline" onClick={() => window.open('/api/export?type=users&format=excel')} title="Export Excel"><FileTextIcon size={18} weight="duotone" /></button>
              </div>
            </div>

            {/* Filters */}
            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 2, minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Search</label>
                  <input type="text" className="form-input" placeholder="Search name, email, mobile..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} style={{ marginBottom: 0 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Role</label>
                  <select className="form-input" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} style={{ marginBottom: 0 }}>
                    <option value="" style={{ color: 'black' }}>All</option>
                    <option value="student" style={{ color: 'black' }}>Student</option>
                    <option value="admin" style={{ color: 'black' }}>Admin</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Year</label>
                  <select className="form-input" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} style={{ marginBottom: 0 }}>
                    <option value="" style={{ color: 'black' }}>All</option>
                    {uniqueYears.map(y => <option key={y} value={y} style={{ color: 'black' }}>{y}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Dept</label>
                  <select className="form-input" value={filters.dept} onChange={(e) => setFilters({ ...filters, dept: e.target.value })} style={{ marginBottom: 0 }}>
                    <option value="" style={{ color: 'black' }}>All</option>
                    {uniqueDepts.map(d => <option key={d} value={d} style={{ color: 'black' }}>{d}</option>)}
                  </select>
                </div>
                <button className="btn-outline" onClick={() => setFilters({ role: '', year: '', dept: '', search: '' })} style={{ height: '46px' }}>Clear</button>
              </div>
            </div>

            {/* Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <th style={thStyle}>Name / Email</th>
                      <th style={thStyle}>Role</th>
                      <th style={thStyle}>Year / Dept</th>
                      <th style={thStyle}>Mobile</th>
                      <th style={thStyle}>Joined</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map(m => (
                        <tr key={m.UserID}>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 'bold' }}>{m.Name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{m.Email}</div>
                            {m.Designation && <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '4px' }}>{m.Designation}</div>}
                          </td>
                          <td style={tdStyle}>
                            <span className={`status-badge ${m.Role === 'admin' ? 'status-warning' : 'status-active'}`}>{m.Role}</span>
                          </td>
                          <td style={tdStyle}>
                            <div>{m.Year || '-'}</div>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{m.Dept || '-'}</div>
                          </td>
                          <td style={tdStyle}>{m.MobileNumber || '-'}</td>
                          <td style={tdStyle}>{formatDate(m.CreatedAt)}</td>
                          <td style={tdStyle}>
                            <button className="btn-outline" onClick={() => handleEdit(m)} style={{ padding: '4px 10px', marginRight: '5px' }}><PencilSimpleIcon size={18} weight="duotone" /></button>
                            <button className="btn-outline" onClick={() => handleDelete(m.UserID)} style={{ padding: '4px 10px', color: '#ef4444', borderColor: '#ef4444' }}><TrashIcon size={18} weight="duotone" /></button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                          No members found matching filters.
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

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }} onClick={() => setShowModal(false)}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'white', margin: 0 }}>{editingMember ? 'Edit' : 'Add'} Member</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><XIcon size={20} weight="duotone" /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Name</label>
                  <input className="form-input" value={formData.Name} onChange={e => setFormData({ ...formData, Name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Email</label>
                  <input className="form-input" value={formData.Email} onChange={e => setFormData({ ...formData, Email: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Role</label>
                  <select className="form-input" value={formData.Role} onChange={e => setFormData({ ...formData, Role: e.target.value as any })} style={{ color: 'black' }}>
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Year</label>
                  <select className="form-input" value={formData.Year} onChange={e => setFormData({ ...formData, Year: e.target.value })} style={{ color: 'black' }}>
                    <option value="">Select Year</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Fourth Year">Fourth Year</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Department</label>
                  <select className="form-input" value={formData.Dept} onChange={e => setFormData({ ...formData, Dept: e.target.value })} style={{ color: 'black' }}>
                    <option value="">Select Dept</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EE">EE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Designation</label>
                  <input className="form-input" value={formData.Designation} onChange={e => setFormData({ ...formData, Designation: e.target.value })} placeholder="e.g. Member" />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Mobile</label>
                <input className="form-input" value={formData.MobileNumber} onChange={e => setFormData({ ...formData, MobileNumber: e.target.value })} placeholder="+91..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
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