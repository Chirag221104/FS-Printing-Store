'use client';

import React from 'react';
import { ProductStudioState } from '@/lib/types/schema';
import styles from '../studio.module.css';
import { FiCheckCircle, FiPackage, FiLayers, FiDollarSign } from 'react-icons/fi';

interface Props {
  state: Partial<ProductStudioState>;
  onPublish: () => void;
  publishing: boolean;
}

export default function Step7Review({ state, onPublish, publishing }: Props) {
  const product = state.product || {};
  const variants = state.variants || [];

  return (
    <div>
      <div className={styles.stepTitle}>Step 7: Review & Publish</div>
      <div className={styles.stepSubtitle}>
        Review your product configuration before publishing it to your live storefront catalog.
      </div>

      <div className={styles.formGrid} style={{ marginBottom: '24px' }}>
        <div className={styles.bulkBox} style={{ background: '#ffffff', margin: 0 }}>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            <FiPackage /> Product Name
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#3b82f6' }}>{product.name || 'Untitled Product'}</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Slug: /{product.slug}</div>
        </div>

        <div className={styles.bulkBox} style={{ background: '#ffffff', margin: 0 }}>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            <FiLayers /> Variant Count
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#10b981' }}>{variants.length} Variants Generated</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            {state.attributeDefinitions?.map(d => `${d.name} (${d.values.length})`).join(' · ')}
          </div>
        </div>

        <div className={styles.bulkBox} style={{ background: '#ffffff', margin: 0 }}>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            <FiDollarSign /> Selling Price
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>₹{product.basePrice || 0}</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Original MRP: ₹{product.compareAtPrice || 0}</div>
        </div>
      </div>

      {/* Publish Action Button */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          className={styles.btnSuccess}
          onClick={onPublish}
          disabled={publishing}
        >
          <FiCheckCircle size={20} />
          {publishing ? 'Publishing Product Studio Package...' : 'Publish Product to Live Catalog'}
        </button>
      </div>
    </div>
  );
}
