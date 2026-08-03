'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { FiPackage } from 'react-icons/fi';
import Link from 'next/link';

export default function OrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '120px 20px 60px', background: '#f9fafb' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          background: '#ffffff',
          padding: '60px 40px',
          borderRadius: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <FiPackage size={48} color="#999" style={{ marginBottom: '16px' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '8px' }}>My Orders</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Order tracking is coming soon! You&apos;ll be able to view and track all your orders here.
          </p>
          <Link href="/shop" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #FF7A00, #FF9B3F)',
            color: '#fff',
            fontWeight: 700,
            borderRadius: '999px',
            textDecoration: 'none',
          }}>
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
