'use client';

import React from 'react';
import { Product } from '@/lib/types/schema';
import styles from './editor.module.css';

interface Props {
  product: Partial<Product>;
  setProduct: React.Dispatch<React.SetStateAction<Partial<Product>>>;
}

const AVAILABLE_LOCATIONS = ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Pocket', 'Full Wrap'];

export default function CustomPrintConfig({ product, setProduct }: Props) {
  const isCustomizable = product.isCustomizable || false;

  const toggleLocation = (loc: string) => {
    const current = product.printingLocations || [];
    if (current.includes(loc)) {
      setProduct(prev => ({ ...prev, printingLocations: current.filter(l => l !== loc) }));
    } else {
      setProduct(prev => ({ ...prev, printingLocations: [...current, loc] }));
    }
  };

  return (
    <div>
      {/* Master Toggle Control */}
      <div className={styles.formGroup}>
        <label style={{ fontSize: '1rem', fontWeight: 600, color: '#111' }}>Enable Customization</label>
        <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.25rem 0 0.75rem 0' }}>
          Turn this on if you want customers to upload logos or add custom text to this product.
        </p>
        <label className={styles.toggleSwitch}>
          <input 
            type="checkbox" 
            checked={isCustomizable}
            onChange={(e) => setProduct(prev => ({ ...prev, isCustomizable: e.target.checked }))}
          />
          <span className={styles.slider}></span>
          <span style={{ fontWeight: 600, color: isCustomizable ? '#c5a55a' : '#666' }}>
            {isCustomizable ? 'Web-to-Print Enabled (Active)' : 'Web-to-Print Disabled'}
          </span>
        </label>
      </div>

      {/* Smooth Collapsible Options Container */}
      <div className={`${styles.collapsibleContent} ${isCustomizable ? styles.open : ''}`}>
        <div className={styles.formGrid}>
          
          <div className={styles.formGroup}>
            <label>Allow Image Uploads</label>
            <label className={styles.toggleSwitch}>
              <input 
                type="checkbox" 
                checked={product.allowImageUpload || false}
                onChange={(e) => setProduct(prev => ({ ...prev, allowImageUpload: e.target.checked }))}
              />
              <span className={styles.slider}></span>
              <span style={{ fontWeight: 500, color: product.allowImageUpload ? '#111' : '#666' }}>
                {product.allowImageUpload ? 'Yes' : 'No'}
              </span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>Allow Custom Text</label>
            <label className={styles.toggleSwitch}>
              <input 
                type="checkbox" 
                checked={product.allowTextPrinting || false}
                onChange={(e) => setProduct(prev => ({ ...prev, allowTextPrinting: e.target.checked }))}
              />
              <span className={styles.slider}></span>
              <span style={{ fontWeight: 500, color: product.allowTextPrinting ? '#111' : '#666' }}>
                {product.allowTextPrinting ? 'Yes' : 'No'}
              </span>
            </label>
          </div>

          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Available Printing Locations</label>
            <div className={styles.chipList}>
              {AVAILABLE_LOCATIONS.map(loc => {
                const isSelected = (product.printingLocations || []).includes(loc);
                return (
                  <div 
                    key={loc} 
                    className={styles.chip}
                    style={{ 
                      cursor: 'pointer',
                      background: isSelected ? '#c5a55a' : '#e8e8e8',
                      color: isSelected ? '#000' : '#333',
                      border: isSelected ? 'none' : '1px solid #ccc',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => toggleLocation(loc)}
                  >
                    {loc}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
