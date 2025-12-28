'use client';

import React, { useState } from 'react';
import { changePassword } from '@/lib/firebase/auth';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
    }} onClick={onClose}>
      <div 
        className="glass-card"
        style={{ maxWidth: '450px', width: '90%', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'white', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🔒 Change Password
        </h3>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <CheckCircle size={48} color="#4ade80" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#4ade80', fontSize: '1.1rem', fontWeight: 'bold' }}>
              Password changed successfully!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Current Password</label>
              <input
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>New Password</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                placeholder="Min 6 characters"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {error && (
              <div style={{ padding: '10px', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}