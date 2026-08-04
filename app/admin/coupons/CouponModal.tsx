'use client';

import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import styles from '../admin.module.css';
import { Coupon } from '@/lib/types/schema';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface Props {
  coupon?: Coupon | null;
  onClose: () => void;
  onSuccess: () => void;
  adminId: string;
}

export default function CouponModal({ coupon, onClose, onSuccess, adminId }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'flat',
    value: '',
    minimumOrderValue: '',
    maximumDiscount: '',
    usageLimit: '',
    expiresAt: '',
    isActive: true,
  });

  useEffect(() => {
    if (coupon) {
      let dateStr = '';
      if (coupon.expiresAt) {
        // Handle Firestore Timestamp
        const date = (coupon.expiresAt as any).toDate ? (coupon.expiresAt as any).toDate() : new Date(coupon.expiresAt as string);
        dateStr = date.toISOString().slice(0, 16); // YYYY-MM-DDThh:mm format for datetime-local input
      }
      
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value.toString(),
        minimumOrderValue: coupon.minimumOrderValue?.toString() || '',
        maximumDiscount: coupon.maximumDiscount?.toString() || '',
        usageLimit: coupon.usageLimit?.toString() || '',
        expiresAt: dateStr,
        isActive: coupon.isActive,
      });
    }
  }, [coupon]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.value) {
      toast.error('Code and Value are required.');
      return;
    }

    setLoading(true);
    try {
      const normalizedCode = formData.code.trim().toUpperCase();
      const couponRef = doc(db, 'coupons', normalizedCode);
      
      if (!coupon) {
        // Creating a new coupon
        const existingDoc = await getDoc(couponRef);
        if (existingDoc.exists()) {
          toast.error('A coupon with this code already exists.');
          setLoading(false);
          return;
        }
      }

      const expiryDate = formData.expiresAt ? new Date(formData.expiresAt) : null;
      
      const couponData: any = {
        code: formData.code.trim(),
        normalizedCode: normalizedCode,
        type: formData.type,
        value: Number(formData.value),
        isActive: formData.isActive,
        updatedBy: adminId,
        updatedAt: serverTimestamp(),
      };

      if (formData.minimumOrderValue) couponData.minimumOrderValue = Number(formData.minimumOrderValue);
      if (formData.maximumDiscount) couponData.maximumDiscount = Number(formData.maximumDiscount);
      if (formData.usageLimit) couponData.usageLimit = Number(formData.usageLimit);
      if (expiryDate) couponData.expiresAt = expiryDate;

      if (!coupon) {
        couponData.usedCount = 0;
        couponData.createdBy = adminId;
        couponData.createdAt = serverTimestamp();
      }

      await setDoc(couponRef, couponData, { merge: true });
      toast.success(coupon ? 'Coupon updated!' : 'Coupon created!');
      onSuccess();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error('Failed to save coupon.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
        <div className={styles.modalHeader}>
          <h2>{coupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
          <button onClick={onClose} className={styles.closeBtn}><FiX size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Coupon Code</label>
            <input 
              type="text" 
              name="code" 
              value={formData.code} 
              onChange={handleChange} 
              className={styles.inputField} 
              disabled={!!coupon} 
              placeholder="e.g. SAVE20"
              required 
            />
            {!!coupon && <small>Code cannot be changed after creation.</small>}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Discount Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className={styles.inputField}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Discount Value</label>
              <input 
                type="number" 
                name="value" 
                value={formData.value} 
                onChange={handleChange} 
                className={styles.inputField} 
                min="0"
                step="0.01"
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Min Order Value (₹) - Optional</label>
              <input 
                type="number" 
                name="minimumOrderValue" 
                value={formData.minimumOrderValue} 
                onChange={handleChange} 
                className={styles.inputField} 
                min="0"
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Max Discount (₹) - Optional</label>
              <input 
                type="number" 
                name="maximumDiscount" 
                value={formData.maximumDiscount} 
                onChange={handleChange} 
                className={styles.inputField} 
                min="0"
                disabled={formData.type === 'flat'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Usage Limit (Total) - Optional</label>
              <input 
                type="number" 
                name="usageLimit" 
                value={formData.usageLimit} 
                onChange={handleChange} 
                className={styles.inputField} 
                min="1"
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Expiry Date - Optional</label>
              <input 
                type="datetime-local" 
                name="expiresAt" 
                value={formData.expiresAt} 
                onChange={handleChange} 
                className={styles.inputField} 
              />
            </div>
          </div>

          <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input 
              type="checkbox" 
              name="isActive" 
              id="isActive"
              checked={formData.isActive} 
              onChange={handleChange} 
              style={{ width: '20px', height: '20px', accentColor: 'var(--primary-orange)' }}
            />
            <label htmlFor="isActive" style={{ margin: 0, cursor: 'pointer' }}>Active (Coupon can be used)</label>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.secondaryBtn}>Cancel</button>
            <button type="submit" className={styles.primaryBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Save Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
