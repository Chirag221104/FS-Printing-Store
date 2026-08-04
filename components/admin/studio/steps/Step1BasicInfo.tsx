'use client';

import React from 'react';
import { Product, ProductStudioState } from '@/lib/types/schema';
import { categoryTemplates } from '@/lib/data/categoryTemplates';
import styles from '../studio.module.css';

interface Props {
  state: Partial<ProductStudioState>;
  updateProduct: (fields: Partial<Product>) => void;
  selectTemplate: (templateId: string) => void;
}

export default function Step1BasicInfo({ state, updateProduct, selectTemplate }: Props) {
  const product = state.product || {};

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    updateProduct({ name, slug });
  };

  return (
    <div>
      <div className={styles.stepTitle}>Step 1: Category & Basic Information</div>
      <div className={styles.stepSubtitle}>
        Select a Category Preset to automatically load print locations, attributes, and default settings for your product type.
      </div>

      {/* Category Template Preset Selector */}
      <label className={styles.formGroup} style={{ marginBottom: '12px', fontWeight: 700 }}>
        Select Product Type (Category Template)
      </label>
      <div className={styles.templateGrid}>
        {categoryTemplates.map(t => {
          const isSelected = state.selectedTemplate === t.id;
          return (
            <div
              key={t.id}
              className={`${styles.templateCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => selectTemplate(t.id)}
            >
              <div className={styles.templateName}>{t.name}</div>
            </div>
          );
        })}
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Product Name *</label>
          <input
            type="text"
            className={styles.inputField}
            value={product.name || ''}
            onChange={handleNameChange}
            placeholder="e.g. Premium Oversized Heavyweight T-Shirt"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>URL Slug *</label>
          <input
            type="text"
            className={styles.inputField}
            value={product.slug || ''}
            onChange={(e) => updateProduct({ slug: e.target.value })}
            placeholder="e.g. premium-oversized-heavyweight-tshirt"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Selling Price (₹) *</label>
          <input
            type="number"
            className={styles.inputField}
            value={product.basePrice || 0}
            onChange={(e) => updateProduct({ basePrice: Number(e.target.value) })}
            placeholder="499"
            min="0"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Original MRP (₹) <span style={{ fontWeight: 400, color: '#64748b' }}>(For Discount)</span></label>
          <input
            type="number"
            className={styles.inputField}
            value={product.compareAtPrice || 0}
            onChange={(e) => updateProduct({ compareAtPrice: Number(e.target.value) })}
            placeholder="799"
            min="0"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Brand</label>
          <input
            type="text"
            className={styles.inputField}
            value={product.brand || 'F.S Print Works'}
            onChange={(e) => updateProduct({ brand: e.target.value })}
          />
        </div>

        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
          <label>Short Description</label>
          <input
            type="text"
            className={styles.inputField}
            value={product.shortDescription || ''}
            onChange={(e) => updateProduct({ shortDescription: e.target.value })}
            placeholder="Brief summary displayed on product cards..."
          />
        </div>

        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
          <label>Full Description</label>
          <textarea
            className={styles.textareaField}
            value={product.description || ''}
            onChange={(e) => updateProduct({ description: e.target.value })}
            placeholder="Detailed description, fabric specs, care instructions..."
          />
        </div>
      </div>
    </div>
  );
}
