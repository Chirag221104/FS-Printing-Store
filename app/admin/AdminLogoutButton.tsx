'use client';

import React from 'react';
import { FiLogOut } from 'react-icons/fi';
import { handleLogout } from './AdminAuthProvider';
import styles from './admin.module.css';

export default function AdminLogoutButton() {
  return (
    <button onClick={handleLogout} className={styles.actionBtn} style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <FiLogOut /> Logout
    </button>
  );
}
