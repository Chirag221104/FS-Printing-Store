'use client';

import React, { useState } from 'react';
import { ProductStudioState, Variant } from '@/lib/types/schema';
import styles from '../studio.module.css';
import { FiCheckCircle, FiZap } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface Props {
  state: Partial<ProductStudioState>;
  setState: React.Dispatch<React.SetStateAction<Partial<ProductStudioState>>>;
}

export default function Step3BulkEditor({ state, setState }: Props) {
  const variants = state.variants || [];
  const defs = state.attributeDefinitions || [];

  // Target Filter state
  const [targetType, setTargetType] = useState<string>('all'); // 'all' or attribute name e.g. 'Color'
  const [targetValue, setTargetValue] = useState<string>('');  // e.g. 'Red'

  // Multi-field Bulk Operation State
  const [bulkPrice, setBulkPrice] = useState<string>('');
  const [bulkCompareAt, setBulkCompareAt] = useState<string>('');
  const [bulkStock, setBulkStock] = useState<string>('');
  const [bulkWeight, setBulkWeight] = useState<string>('');
  const [bulkGST, setBulkGST] = useState<string>('');
  const [bulkProdDays, setBulkProdDays] = useState<string>('');
  const [bulkIsActive, setBulkIsActive] = useState<string>('no_change');

  const handleApplyBulk = () => {
    if (variants.length === 0) {
      toast.error('No variants available to bulk update.');
      return;
    }

    let updatedCount = 0;
    const nextVariants = variants.map(v => {
      // Determine if this variant matches the target
      let matches = true;
      if (targetType !== 'all') {
        matches = v.attributes?.[targetType] === targetValue;
      }

      if (!matches) return v;

      updatedCount++;
      const updated = { ...v };

      if (bulkPrice !== '') updated.price = Number(bulkPrice);
      if (bulkCompareAt !== '') updated.compareAtPrice = Number(bulkCompareAt);
      if (bulkStock !== '') updated.stock = Number(bulkStock);
      if (bulkWeight !== '') updated.weightGrams = Number(bulkWeight);
      if (bulkGST !== '') updated.gstPercent = Number(bulkGST);
      if (bulkProdDays !== '') updated.productionDays = Number(bulkProdDays);
      if (bulkIsActive === 'active') updated.isActive = true;
      if (bulkIsActive === 'inactive') updated.isActive = false;

      return updated;
    });

    setState(prev => ({ ...prev, variants: nextVariants }));
    toast.success(`Bulk updated ${updatedCount} variants!`);
  };

  return (
    <div>
      <div className={styles.stepTitle}>Step 3: Advanced Bulk Operations</div>
      <div className={styles.stepSubtitle}>
        Update multiple fields simultaneously across all variants or specific target groups (e.g. Color = Red).
      </div>

      {/* Target Filtering Selector */}
      <div className={styles.bulkBox}>
        <div className={styles.bulkBoxTitle}>
          <FiZap /> 1. Select Target Scope
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Apply Changes To</label>
            <select
              className={styles.selectField}
              value={targetType}
              onChange={(e) => {
                setTargetType(e.target.value);
                setTargetValue('');
              }}
            >
              <option value="all">All Variants ({variants.length})</option>
              {defs.map(d => (
                <option key={d.name} value={d.name}>Attribute: {d.name}</option>
              ))}
            </select>
          </div>

          {targetType !== 'all' && (
            <div className={styles.formGroup}>
              <label>Select {targetType} Value</label>
              <select
                className={styles.selectField}
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              >
                <option value="">-- Choose Value --</option>
                {defs.find(d => d.name === targetType)?.values.map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Field Bulk Value Inputs */}
      <div className={styles.bulkBox} style={{ background: '#ffffff' }}>
        <div className={styles.bulkBoxTitle} style={{ color: '#0f172a' }}>
          2. Enter Fields to Update (Leave blank to keep existing values)
        </div>
        <div className={styles.bulkGrid}>
          <div className={styles.formGroup}>
            <label>Selling Price (₹)</label>
            <input
              type="number"
              className={styles.inputField}
              placeholder="e.g. 599"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Original MRP (₹)</label>
            <input
              type="number"
              className={styles.inputField}
              placeholder="e.g. 899"
              value={bulkCompareAt}
              onChange={(e) => setBulkCompareAt(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Stock Quantity</label>
            <input
              type="number"
              className={styles.inputField}
              placeholder="e.g. 100"
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Weight (grams)</label>
            <input
              type="number"
              className={styles.inputField}
              placeholder="e.g. 180"
              value={bulkWeight}
              onChange={(e) => setBulkWeight(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>GST Rate (%)</label>
            <input
              type="number"
              className={styles.inputField}
              placeholder="18"
              value={bulkGST}
              onChange={(e) => setBulkGST(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Production Days</label>
            <input
              type="number"
              className={styles.inputField}
              placeholder="3"
              value={bulkProdDays}
              onChange={(e) => setBulkProdDays(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              className={styles.selectField}
              value={bulkIsActive}
              onChange={(e) => setBulkIsActive(e.target.value)}
            >
              <option value="no_change">-- No Change --</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <button className={styles.btnPrimary} onClick={handleApplyBulk} style={{ width: '100%', height: '42px' }}>
              <FiCheckCircle /> Execute Bulk Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
