'use client';

import React, { useState } from 'react';

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSuccess(true);
        e.currentTarget.reset();
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(result.error || 'Failed to send.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ width: '100%' }}>
      {success && (
        <div style={{ padding: '10px', marginBottom: '1rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          ✓ Message sent successfully!
        </div>
      )}
      {error && (
        <div style={{ padding: '10px', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          ✗ {error}
        </div>
      )}
      
      <input type="text" name="name" className="form-input" placeholder="Your Name" required disabled={submitting} />
      <input type="email" name="email" className="form-input" placeholder="College Email" required disabled={submitting} />
      <textarea name="message" className="form-input" rows={4} placeholder="How can we help you?" required disabled={submitting} />
      
      <button type="submit" className="btn" style={{ width: '100%' }} disabled={submitting}>
        {submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}