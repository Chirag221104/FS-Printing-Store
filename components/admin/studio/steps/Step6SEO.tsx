'use client';

import React from 'react';
import { ProductStudioState } from '@/lib/types/schema';
import styles from '../studio.module.css';

interface Props {
  state: Partial<ProductStudioState>;
  setState: React.Dispatch<React.SetStateAction<Partial<ProductStudioState>>>;
}

export default function Step6SEO({ state, setState }: Props) {
  const seo = state.product?.seoMeta || { title: '', description: '' };

  const updateSEO = (field: 'title' | 'description', value: string) => {
    setState(prev => ({
      ...prev,
      product: {
        ...prev.product,
        seoMeta: {
          ...seo,
          [field]: value
        }
      }
    }));
  };

  return (
    <div>
      <div className={styles.stepTitle}>Step 6: Search Engine Optimization (SEO)</div>
      <div className={styles.stepSubtitle}>
        Optimize your product for Google search rankings and social media previews.
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
          <label>Meta Title</label>
          <input
            type="text"
            className={styles.inputField}
            value={seo.title || ''}
            onChange={(e) => updateSEO('title', e.target.value)}
            placeholder="e.g. Custom Printed T-Shirt | F.S Print Works"
          />
        </div>

        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
          <label>Meta Description</label>
          <textarea
            className={styles.textareaField}
            value={seo.description || ''}
            onChange={(e) => updateSEO('description', e.target.value)}
            placeholder="Search result snippet summary (under 160 characters)..."
          />
        </div>
      </div>
    </div>
  );
}
