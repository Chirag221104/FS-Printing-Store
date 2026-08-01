'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingCustomer, setViewingCustomer] = useState<any>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'customers'), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    }
    setLoading(false);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Customers</h1>
        <p>View and manage customer details</p>
      </div>
      
      <div className={styles.tableContainer}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Last Active</th>
              <th>Last Order ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Loading customers...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No customers found.</td></tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: 500 }}>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.email || 'N/A'}</td>
                  <td>{formatDate(customer.updatedAt)}</td>
                  <td style={{ fontFamily: 'monospace' }}>{customer.lastOrderId?.slice(0, 8).toUpperCase() || 'N/A'}</td>
                  <td><button className={styles.actionBtn} onClick={() => setViewingCustomer(customer)}>View Profile</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewingCustomer && (
        <div className={styles.modalOverlay} onClick={() => setViewingCustomer(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h2>Customer Profile</h2>
              <button className={styles.closeBtn} onClick={() => setViewingCustomer(null)}>×</button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#c5a55a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600 }}>
                {viewingCustomer.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{viewingCustomer.name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Customer since {formatDate(viewingCustomer.updatedAt)}</p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', marginBottom: '12px' }}>Contact Information</h4>
              <p style={{ marginBottom: '8px' }}><strong>Email:</strong> {viewingCustomer.email || 'Not provided'}</p>
              <p style={{ marginBottom: '8px' }}><strong>Phone:</strong> {viewingCustomer.phone}</p>
              <p><strong>Primary Address:</strong> {viewingCustomer.address}</p>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.primaryBtn} onClick={() => setViewingCustomer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
