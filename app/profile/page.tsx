'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserAddress } from '@/lib/context/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiTrash2, FiPlus, FiLogOut, FiShield, FiPackage, FiX, FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import styles from './page.module.css';

export default function ProfilePage() {
  const { user, profile, isLoading, isAdmin, signOut, updateUserProfile } = useAuth();
  const router = useRouter();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<Partial<UserAddress>>({
    label: '',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  // ─── Inline Edit Handlers ──────────────────────────
  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = async () => {
    if (!editingField) return;
    setSaving(true);
    try {
      await updateUserProfile({ [editingField]: editValue.trim() });
    } catch (err) {
      console.error('Error updating profile:', err);
    }
    setEditingField(null);
    setSaving(false);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  // ─── Address Handlers ──────────────────────────────
  const handleAddAddress = async () => {
    if (!addressForm.fullName || !addressForm.addressLine1 || !addressForm.city || !addressForm.pincode) return;
    setSaving(true);
    try {
      const newAddress: UserAddress = {
        id: 'addr_' + Date.now(),
        label: addressForm.label || 'Home',
        fullName: addressForm.fullName || '',
        phone: addressForm.phone || '',
        addressLine1: addressForm.addressLine1 || '',
        addressLine2: addressForm.addressLine2 || '',
        city: addressForm.city || '',
        state: addressForm.state || '',
        pincode: addressForm.pincode || '',
        isDefault: profile.addresses.length === 0, // First address is default
      };
      const updatedAddresses = [...(profile.addresses || []), newAddress];
      await updateUserProfile({ addresses: updatedAddresses });
      setShowAddressForm(false);
      setAddressForm({ label: '', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
    } catch (err) {
      console.error('Error adding address:', err);
    }
    setSaving(false);
  };

  const handleDeleteAddress = async (addressId: string) => {
    setSaving(true);
    try {
      const updatedAddresses = (profile.addresses || []).filter(a => a.id !== addressId);
      await updateUserProfile({ addresses: updatedAddresses });
    } catch (err) {
      console.error('Error deleting address:', err);
    }
    setSaving(false);
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    setSaving(true);
    try {
      const updatedAddresses = (profile.addresses || []).map(a => ({
        ...a,
        isDefault: a.id === addressId,
      }));
      await updateUserProfile({ addresses: updatedAddresses });
    } catch (err) {
      console.error('Error setting default address:', err);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} referrerPolicy="no-referrer" />
              ) : (
                <span>{(profile.displayName || profile.email || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className={styles.headerInfo}>
              <h1>{profile.displayName || 'User'}</h1>
              <p className={styles.emailText}>{profile.email}</p>
              {isAdmin && (
                <span className={styles.adminBadge}>
                  <FiShield size={14} /> Admin
                </span>
              )}
            </div>
          </div>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            <FiLogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <Link href="/orders" className={styles.actionCard}>
            <FiPackage size={24} />
            <span>My Orders</span>
          </Link>
          {isAdmin && (
            <Link href="/admin" className={styles.actionCard}>
              <FiShield size={24} />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>

        {/* Personal Info */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Personal Information</h2>
          <div className={styles.infoGrid}>
            {/* Display Name */}
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>
                <FiUser size={16} /> Name
              </div>
              {editingField === 'displayName' ? (
                <div className={styles.editRow}>
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className={styles.editInput}
                    autoFocus
                  />
                  <button onClick={saveEdit} className={styles.saveBtn} disabled={saving}>
                    <FiCheck size={16} />
                  </button>
                  <button onClick={cancelEdit} className={styles.cancelBtn}>
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div className={styles.infoValue}>
                  <span>{profile.displayName || '—'}</span>
                  <button onClick={() => startEdit('displayName', profile.displayName || '')} className={styles.editBtn}>
                    <FiEdit2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Email (read-only) */}
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>
                <FiMail size={16} /> Email
              </div>
              <div className={styles.infoValue}>
                <span>{profile.email}</span>
              </div>
            </div>

            {/* Phone */}
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>
                <FiPhone size={16} /> Phone
              </div>
              {editingField === 'phone' ? (
                <div className={styles.editRow}>
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className={styles.editInput}
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    autoFocus
                  />
                  <button onClick={saveEdit} className={styles.saveBtn} disabled={saving}>
                    <FiCheck size={16} />
                  </button>
                  <button onClick={cancelEdit} className={styles.cancelBtn}>
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div className={styles.infoValue}>
                  <span>{profile.phone || '—'}</span>
                  <button onClick={() => startEdit('phone', profile.phone || '')} className={styles.editBtn}>
                    <FiEdit2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Saved Addresses */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Saved Addresses</h2>
            <button className={styles.addAddressBtn} onClick={() => setShowAddressForm(!showAddressForm)}>
              {showAddressForm ? <FiX size={16} /> : <FiPlus size={16} />}
              {showAddressForm ? 'Cancel' : 'Add Address'}
            </button>
          </div>

          {/* Add Address Form */}
          {showAddressForm && (
            <div className={styles.addressForm}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label>Label</label>
                  <input
                    placeholder="e.g., Home, Office"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm(p => ({ ...p, label: e.target.value }))}
                  />
                </div>
                <div className={styles.formField}>
                  <label>Full Name *</label>
                  <input
                    placeholder="Recipient name"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm(p => ({ ...p, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label>Phone</label>
                  <input
                    placeholder="+91 XXXXX XXXXX"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className={`${styles.formField} ${styles.fullWidth}`}>
                  <label>Address Line 1 *</label>
                  <input
                    placeholder="House no., Street, Area"
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm(p => ({ ...p, addressLine1: e.target.value }))}
                    required
                  />
                </div>
                <div className={`${styles.formField} ${styles.fullWidth}`}>
                  <label>Address Line 2</label>
                  <input
                    placeholder="Landmark (optional)"
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm(p => ({ ...p, addressLine2: e.target.value }))}
                  />
                </div>
                <div className={styles.formField}>
                  <label>City *</label>
                  <input
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(p => ({ ...p, city: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label>State</label>
                  <input
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm(p => ({ ...p, state: e.target.value }))}
                  />
                </div>
                <div className={styles.formField}>
                  <label>PIN Code *</label>
                  <input
                    placeholder="400001"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm(p => ({ ...p, pincode: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <button className={styles.saveAddressBtn} onClick={handleAddAddress} disabled={saving}>
                {saving ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          )}

          {/* Address Cards */}
          <div className={styles.addressList}>
            {(!profile.addresses || profile.addresses.length === 0) && !showAddressForm && (
              <div className={styles.emptyState}>
                <FiMapPin size={32} />
                <p>No saved addresses yet</p>
              </div>
            )}
            {(profile.addresses || []).map((addr) => (
              <div key={addr.id} className={`${styles.addressCard} ${addr.isDefault ? styles.defaultAddress : ''}`}>
                <div className={styles.addressTop}>
                  <span className={styles.addressLabel}>{addr.label}</span>
                  {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                </div>
                <p className={styles.addressName}>{addr.fullName}</p>
                <p className={styles.addressText}>
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                </p>
                <p className={styles.addressText}>
                  {addr.city}{addr.state && `, ${addr.state}`} — {addr.pincode}
                </p>
                {addr.phone && <p className={styles.addressPhone}>{addr.phone}</p>}
                <div className={styles.addressActions}>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefaultAddress(addr.id)} className={styles.setDefaultBtn}>
                      Set as Default
                    </button>
                  )}
                  <button onClick={() => handleDeleteAddress(addr.id)} className={styles.deleteBtn}>
                    <FiTrash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
