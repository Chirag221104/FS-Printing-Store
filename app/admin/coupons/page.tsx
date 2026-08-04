'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import styles from '../admin.module.css';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { Coupon } from '@/lib/types/schema';
import CouponModal from './CouponModal';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'coupons'));
      const fetched = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Coupon));
      // Sort by creation date descending (newest first), fallback to ID if no date
      fetched.sort((a, b) => {
        const timeA = a.createdAt ? ((a.createdAt as any).seconds || 0) : 0;
        const timeB = b.createdAt ? ((b.createdAt as any).seconds || 0) : 0;
        return timeB - timeA;
      });
      setCoupons(fetched);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    }
    setLoading(false);
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    try {
      if (typeof dateValue.toDate === 'function') {
        return dateValue.toDate().toLocaleDateString();
      }
      if (dateValue.seconds) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString();
      }
      const d = new Date(dateValue);
      return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };

  const handleCreate = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleSoftDelete = async (coupon: Coupon) => {
    if (confirm(`Are you sure you want to disable coupon ${coupon.code}?`)) {
      try {
        const couponRef = doc(db, 'coupons', coupon.id);
        await setDoc(couponRef, { isActive: false, updatedBy: auth.currentUser?.uid || 'unknown' }, { merge: true });
        toast.success(`Coupon ${coupon.code} disabled.`);
        fetchCoupons();
      } catch (err) {
        toast.error('Failed to disable coupon.');
      }
    }
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>Disabled</span>;
    
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return <span className={`${styles.statusBadge} ${styles.statusProcessing}`}>Exhausted</span>;
    }

    if (coupon.expiresAt) {
      const expiry = (coupon.expiresAt as any).toDate ? (coupon.expiresAt as any).toDate() : new Date(coupon.expiresAt as string);
      if (expiry < new Date()) {
        return <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>Expired</span>;
      }
    }

    return <span className={`${styles.statusBadge} ${styles.statusDelivered}`}>Active</span>;
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    const now = new Date();
    const expiry = c.expiresAt ? ((c.expiresAt as any).toDate ? (c.expiresAt as any).toDate() : new Date(c.expiresAt as string)) : null;
    const isExpired = expiry && expiry < now;
    const isExhausted = c.usageLimit && c.usedCount >= c.usageLimit;

    if (statusFilter === 'active') matchesStatus = c.isActive && !isExpired && !isExhausted;
    if (statusFilter === 'expired') matchesStatus = !!isExpired;
    if (statusFilter === 'exhausted') matchesStatus = !!isExhausted;
    if (statusFilter === 'disabled') matchesStatus = !c.isActive;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className={styles.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Coupons</h1>
          <p>Create and manage discount codes for your customers.</p>
        </div>
        <button 
          onClick={handleCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}
        >
          <FiPlus /> Create Coupon
        </button>
      </div>

      <div className={styles.filtersContainer} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Search by code..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
          style={{ flex: 1 }}
        />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.searchInput}
          style={{ width: '200px' }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="exhausted">Exhausted</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No coupons found matching your criteria.
          </div>
        ) : (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Created</th>
                <th className={styles.actionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>
                    <strong>{coupon.code}</strong>
                    {coupon.minimumOrderValue && <div style={{ fontSize: '0.8rem', color: '#666' }}>Min Order: ₹{coupon.minimumOrderValue}</div>}
                  </td>
                  <td>
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                    {coupon.type === 'percentage' && coupon.maximumDiscount && <div style={{ fontSize: '0.8rem', color: '#666' }}>Max: ₹{coupon.maximumDiscount}</div>}
                  </td>
                  <td>
                    {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'uses'}
                  </td>
                  <td>{getCouponStatus(coupon)}</td>
                  <td>
                    {formatDate(coupon.createdAt)}
                  </td>
                  <td className={styles.actionsCell}>
                    <button className={styles.iconBtn} onClick={() => handleEdit(coupon)} title="Edit">
                      <FiEdit2 />
                    </button>
                    {coupon.isActive && (
                      <button className={`${styles.iconBtn} ${styles.dangerBtn}`} onClick={() => handleSoftDelete(coupon)} title="Disable">
                        <FiTrash2 />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <CouponModal 
          coupon={editingCoupon}
          adminId={auth.currentUser?.uid || 'unknown'}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchCoupons();
          }}
        />
      )}
    </div>
  );
}
