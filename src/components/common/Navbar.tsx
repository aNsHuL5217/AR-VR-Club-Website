'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOutUser } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { ListIcon, XCircleIcon } from '@phosphor-icons/react/dist/ssr';

export default function Navbar() {
  const { user, authUser, loading } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/');
      setShowMenu(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const closeMenu = () => setShowMenu(false);

  return (
    <nav className="navbar-glass">
      <div className="container nav-container">
        <Link href="/" className="brand-container" onClick={closeMenu}>
          <img
            src="/Assets/logo-clear-bg.png"
            alt="Logo"
            className="nav-logo"
          />
          <div className="brand-text">
            <span className="brand-title">AR VR Club | Computer Engineering Department</span>
            <span className="brand-subtitle">GHRCEM</span>
          </div>
        </Link>

        <button 
          className="mobile-toggle" 
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Toggle Menu"
        >
          {showMenu ? <XCircleIcon size={24} color="white" weight="duotone" /> : <ListIcon size={24} color="white" />}
        </button>

        <ul className={`nav-links ${showMenu ? 'active' : ''}`}>
          <li><Link href="/" onClick={closeMenu}>Home</Link></li>
          <li><Link href="/#about" onClick={closeMenu}>About</Link></li>
          <li><Link href="/#team" onClick={closeMenu}>Team</Link></li>
          <li><Link href="/#contact" onClick={closeMenu}>Contact</Link></li>

          {loading ? (
            <li style={{ color: '#94a3b8' }}>...</li>
          ) : user ? (
            <>
              {authUser?.role === 'admin' ? (
                <li>
                  <Link href="/admin" className="btn-nav" onClick={closeMenu}>
                    Admin Panel
                  </Link>
                </li>
              ) : (
                <li>
                  <Link href="/dashboard" className="btn-nav" onClick={closeMenu}>
                    Dashboard
                  </Link>
                </li>
              )}
              <li>
                <button onClick={handleSignOut} className="btn-nav-outline">
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link href="/login" className="btn-nav-primary" onClick={closeMenu}>
                Sign In
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
