'use client';

import React, { useState } from 'react';
import { PaperPlaneRight, CheckCircle, WarningCircle } from '@phosphor-icons/react/dist/ssr';

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    
    // FIX: Capture the form element immediately, before 'await'
    const form = e.currentTarget;
    const formData = new FormData(form);
    
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
        // FIX: Use the captured 'form' variable, not e.currentTarget
        form.reset(); 
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(result.error || 'Failed to send.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ width: '100%' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>Send a Message</h3>

      {success && (
        <div style={{ padding: '10px', marginBottom: '1rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={20} weight="fill" /> Message sent successfully!
        </div>
      )}
      {error && (
        <div style={{ padding: '10px', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WarningCircle size={20} weight="duotone" /> {error}
        </div>
      )}
      
      <div style={{ marginBottom: '1rem' }}>
        <input type="text" name="name" className="form-input" placeholder="Your Name" required disabled={submitting} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <input type="email" name="email" className="form-input" placeholder="College Email" required disabled={submitting} />
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <textarea name="message" className="form-input" rows={4} placeholder="How can we help you?" required disabled={submitting} />
      </div>
      
      <button type="submit" className="btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={submitting}>
        {submitting ? 'Sending...' : <>Send Message <PaperPlaneRight size={18} weight="duotone"/></>}
      </button>
    </form>
  );
}