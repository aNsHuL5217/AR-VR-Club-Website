'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp, signInWithGoogle, signOutUser, resetPassword } from '@/lib/firebase/auth';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import {
  XIcon,
  EnvelopeSimpleIcon,
  CheckCircleIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react/dist/ssr';

export default function LoginPage() {
  const router = useRouter();
  const { authUser, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loginRole, setLoginRole] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [dept, setDept] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // FIX: Dark style for dropdown options to match glass theme
  const optionStyle = { backgroundColor: '#1e293b', color: 'white' };

  useEffect(() => {
    if (!authLoading && authUser && !loading) {
      if (authUser.role === 'admin') router.push('/admin');
      else router.push('/dashboard');
    }
  }, [authUser, authLoading, router, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const userCredential = await signIn(email, password);
        const userId = userCredential.uid;

        try {
          const response = await fetch(`/api/users?userId=${userId}`);
          if (!response.ok) throw new Error('Failed to fetch user profile');
          
          const data = await response.json();
          if (!data.success || !data.data) throw new Error('User profile not found.');

          const userRole = data.data.Role?.toLowerCase() || 'student';
          const selectedRole = loginRole.toLowerCase();

          if (userRole !== selectedRole) {
            await signOutUser();
            throw new Error(`Access Denied: You are registered as a ${userRole}, but tried to login as a ${selectedRole}.`);
          }

          if (userRole === 'admin') router.push('/admin');
          else router.push('/dashboard');

        } catch (fetchError: any) {
          await signOutUser();
          throw fetchError;
        }

      } else {
        if (!name || !year || !dept || !rollNo || !mobileNumber) throw new Error("Please fill all fields");
        await signUp(email, password, name, year, dept, rollNo, mobileNumber);
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Authentication failed');
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await resetPassword(forgotPasswordEmail);
      setForgotSuccess(true);
    } catch (e: any) { setError(e.message); }
    finally { setForgotLoading(false); }
  }

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px', background: 'radial-gradient(circle at 50% 50%, #172554 0%, #020617 100%)' }}>
        <div className="glass-card" style={{ maxWidth: '420px', width: '90%', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'white', fontSize: '1.8rem' }}>
            {isLogin ? 'Welcome Back' : 'Join the Club'}
          </h2>

          {error && <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'center' }}><WarningCircleIcon size={18} weight="duotone" /> {error}</div>}

          <form onSubmit={handleSubmit}>
            {isLogin && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.8rem', color: '#cbd5e1', fontSize: '0.9rem' }}>I am a:</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['student', 'admin'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setLoginRole(role as any);
                        if (role === 'admin') { setIsLogin(true); setError(''); }
                      }}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '8px',
                        border: `1px solid ${loginRole === role ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                        background: loginRole === role ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: loginRole === role ? '#60a5fa' : '#94a3b8',
                        cursor: 'pointer', textTransform: 'capitalize', fontWeight: loginRole === role ? '600' : '400',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isLogin && (
              <>
                <input type="text" className="form-input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select className="form-input" value={year} onChange={(e) => setYear(e.target.value)} required>
                    <option value="" style={optionStyle}>Year</option>
                    <option value="First Year" style={optionStyle}>1st</option>
                    <option value="Second Year" style={optionStyle}>2nd</option>
                    <option value="Third Year" style={optionStyle}>3rd</option>
                    <option value="Fourth Year" style={optionStyle}>4th</option>
                  </select>
                  <select className="form-input" value={dept} onChange={(e) => setDept(e.target.value)} required>
                    <option value="" style={optionStyle}>Dept</option>
                    <option value="CSE" style={optionStyle}>CSE</option>
                    <option value="IT" style={optionStyle}>IT</option>
                    <option value="ECE" style={optionStyle}>ECE</option>
                    <option value="AIML" style={optionStyle}>AIML</option>
                    <option value="AIDS" style={optionStyle}>AIDS</option>
                  </select>
                </div>
                <input type="text" className="form-input" placeholder="Roll Number (e.g. TY-CSE-01)" value={rollNo} onChange={(e) => setRollNo(e.target.value)} required />
                <input type="tel" className="form-input" placeholder="Mobile Number (+91...)" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
              </>
            )}

            <input type="email" className="form-input" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" className="form-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

            {isLogin && (
              <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1.5rem' }}>
                <button type="button" onClick={() => { setShowForgotPassword(true); setForgotPasswordEmail(email); }} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Forgot Password?
                </button>
              </div>
            )}

            <button type="submit" className="btn" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          </div>

          <button onClick={handleGoogleSignIn} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            Sign in with Google
          </button>

          {loginRole !== 'admin' && (
            <p style={{ textAlign: 'center', marginTop: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              {isLogin ? "New here? " : "Already a member? "}
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 'bold' }}>
                {isLogin ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
        }} onClick={() => !forgotLoading && setShowForgotPassword(false)}>
          <div className="glass-card" style={{ maxWidth: '450px', width: '90%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowForgotPassword(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <XIcon size={20} />
            </button>

            {forgotSuccess ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <CheckCircleIcon size={48} color="#4ade80" weight="duotone" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Check your inbox</h3>
                <p style={{ color: '#94a3b8' }}>We sent a reset link to <strong>{forgotPasswordEmail}</strong></p>
              </div>
            ) : (
              <>
                <h3 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <EnvelopeSimpleIcon size={24} weight="duotone" /> Reset Password
                </h3>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Enter your email to receive a reset link.</p>
                <form onSubmit={handleForgotPassword}>
                  <input type="email" className="form-input" placeholder="Enter your email" value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} required />
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="button" className="btn-outline" onClick={() => setShowForgotPassword(false)}>Cancel</button>
                    <button type="submit" className="btn" disabled={forgotLoading}>{forgotLoading ? 'Sending...' : 'Send Link'}</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}