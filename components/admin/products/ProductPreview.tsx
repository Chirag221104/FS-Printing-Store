'use client';

import React, { useState } from 'react';
import { Product, Variant } from '@/lib/types/schema';
import styles from './editor.module.css';
import { FiImage } from 'react-icons/fi';

interface Props {
  product: Partial<Product>;
  variants: Partial<Variant>[];
}

export default function ProductPreview({ product, variants }: Props) {
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  const activeVariant = variants[activeVariantIndex] || variants[0];

  return (
    <div className={styles.previewPanel}>
      <div className={styles.previewHeader}>Live Preview</div>
      
      <div className={styles.previewMainImage}>
        {/* Placeholder since we don't have the async Firebase Storage URLs in this simple preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'rgba(255,255,255,0.2)' }}>
          <FiImage size={64} style={{ marginBottom: '1rem' }} />
          <span>{activeVariant?.images?.length ? `Image from ${activeVariant.sku}` : 'No Image Uploaded'}</span>
        </div>
      </div>

      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
        {product.brand || 'No Brand'}
      </div>
      
      <h3 className={styles.previewTitle}>
        {product.name || 'Product Name'}
      </h3>
      
      <div className={styles.previewPrice}>
        ₹{activeVariant ? activeVariant.price : (product.basePrice || 0)}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        {variants.length > 0 && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select Variant</div>
        )}
        <div className={styles.previewVariants}>
          {variants.map((v, idx) => (
            <div 
              key={idx} 
              className={`${styles.previewVariantChip} ${idx === activeVariantIndex ? styles.active : ''}`}
              onClick={() => setActiveVariantIndex(idx)}
            >
              {Object.values(v.attributes || {}).join(' · ') || v.sku}
            </div>
          ))}
        </div>
      </div>

      {product.isCustomizable && (
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginBottom: '1rem', background: 'var(--primary-gold)', color: '#000' }}
          disabled
        >
          Customize Design
        </button>
      )}
      
      <button 
        className="btn btn-secondary" 
        style={{ width: '100%' }}
        disabled
      >
        {activeVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>

      <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
        {product.shortDescription || 'Your short description will appear here.'}
      </div>

    </div>
  );
}
