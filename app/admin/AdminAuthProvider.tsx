'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import styles from './admin.module.css';
import { FiLock } from 'react-icons/fi';

export const handleLogout = async () => {
  try {
    await signOut(auth);
    toast.success('Logged out successfully');
  } catch (error) {
    toast.error('Error logging out');
  }
};

export default function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully');
    } catch (error: any) {
      toast.error('Invalid credentials');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#64748b' }}>Loading Admin Panel...</div>;
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#3b82f6' }}>
            <FiLock size={48} />
          </div>
          <h2 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '1.8rem', color: '#0f172a' }}>Admin Login</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input type="email" className={styles.inputField} value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@fsprintworks.com" />
            </div>
            <div className={styles.formGroup}>
              <label>Password</label>
              <input type="password" className={styles.inputField} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button type="submit" className={styles.primaryBtn} style={{ marginTop: '16px', padding: '14px', fontSize: '1rem' }}>Log In to Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
