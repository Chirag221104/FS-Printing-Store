import React from 'react';
import Link from 'next/link';
import { FiHome, FiBox, FiShoppingBag, FiUsers, FiSettings, FiLogOut } from 'react-icons/fi';
import styles from './admin.module.css';
import AdminAuthProvider from './AdminAuthProvider';
import AdminLogoutButton from './AdminLogoutButton';

export const metadata = {
  title: 'Admin Dashboard | F.S Print Works',
  description: 'Manage store products, orders, and settings',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>FS Admin</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <Link href="/admin" className={styles.navLink}><FiHome /> Dashboard</Link>
          <Link href="/admin/products" className={styles.navLink}><FiBox /> Products</Link>
          <Link href="/admin/orders" className={styles.navLink}><FiShoppingBag /> Orders</Link>
          <Link href="/admin/customers" className={styles.navLink}><FiUsers /> Customers</Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.navLink}><FiLogOut /> Storefront</Link>
        </div>
      </aside>
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search..." className={styles.searchInput} />
          </div>
          <div className={styles.userProfile} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className={styles.avatar}>A</div>
              <span>Admin User</span>
            </div>
            <AdminLogoutButton />
          </div>
        </header>
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
    </AdminAuthProvider>
  );
}
