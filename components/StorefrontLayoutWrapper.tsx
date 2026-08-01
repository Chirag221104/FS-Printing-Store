'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import WhatsAppButton from './WhatsAppButton';

export default function StorefrontLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we are in the admin routes
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    // Render only the children for admin routes without Storefront UI
    return <>{children}</>;
  }

  // Render the full storefront UI
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main style={{ paddingTop: 'var(--navbar-height)' }}>
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
