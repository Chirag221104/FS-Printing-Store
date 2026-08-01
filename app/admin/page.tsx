import React from 'react';
import { FiTrendingUp, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';
import styles from './admin.module.css';

export default function AdminDashboard() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Dashboard Overview</h1>
        <p>Welcome back, here's what's happening with your store today.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Total Revenue</div>
          <div className={styles.statValue}>₹45,231</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Orders (30 Days)</div>
          <div className={styles.statValue}>124</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Active Products</div>
          <div className={styles.statValue}>24</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Total Customers</div>
          <div className={styles.statValue}>89</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0 }}>Recent Orders</h3>
        </div>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#ORD-001</td>
              <td>John Doe</td>
              <td>Oct 24, 2023</td>
              <td><span className={`${styles.badge} ${styles.active}`}>Completed</span></td>
              <td>₹1,499</td>
            </tr>
            <tr>
              <td>#ORD-002</td>
              <td>Jane Smith</td>
              <td>Oct 24, 2023</td>
              <td><span className={styles.badge}>Processing</span></td>
              <td>₹2,999</td>
            </tr>
            <tr>
              <td>#ORD-003</td>
              <td>Raj Patel</td>
              <td>Oct 23, 2023</td>
              <td><span className={`${styles.badge} ${styles.active}`}>Completed</span></td>
              <td>₹499</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
