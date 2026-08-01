'use client';

import React, { useMemo } from 'react';
import { Variant } from '@/lib/types/schema';
import styles from './product-storefront.module.css';

interface Props {
  variants: Variant[];
  selectedAttributes: Record<string, string>;
  onSelectAttribute: (key: string, value: string) => void;
}

export default function VariantSelector({ variants, selectedAttributes, onSelectAttribute }: Props) {
  
  // Extract all unique attribute keys (e.g., "Color", "Size")
  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    variants.forEach(v => {
      Object.keys(v.attributes || {}).forEach(k => keys.add(k));
    });
    return Array.from(keys);
  }, [variants]);

  // Extract all unique values for a given key
  const getValuesForKey = (key: string) => {
    const values = new Set<string>();
    variants.forEach(v => {
      if (v.attributes && v.attributes[key]) {
        values.add(v.attributes[key]);
      }
    });
    return Array.from(values);
  };

  // Check if a combination of the CURRENTLY selected attributes + a NEW specific attribute value exists in stock
  const isValueAvailable = (key: string, val: string) => {
    const tempAttributes = { ...selectedAttributes, [key]: val };
    
    // Find if ANY variant matches ALL the tempAttributes and has stock > 0
    return variants.some(v => {
      if (!v.isActive) return false;
      const match = Object.keys(tempAttributes).every(tempKey => v.attributes?.[tempKey] === tempAttributes[tempKey]);
      return match && v.stock > 0;
    });
  };

  if (attributeKeys.length === 0) return null;

  return (
    <div className={styles.variantSelector}>
      {attributeKeys.map(key => {
        const values = getValuesForKey(key);
        
        return (
          <div key={key} className={styles.attributeGroup}>
            <div className={styles.attributeLabel}>
              {key}: <span className={styles.attributeSelected}>{selectedAttributes[key] || 'Select'}</span>
            </div>
            
            <div className={styles.attributeValues}>
              {values.map(val => {
                const isSelected = selectedAttributes[key] === val;
                const available = isValueAvailable(key, val);
                
                // If it's Color, we might want to render swatches later, but for now buttons work perfectly
                return (
                  <button
                    key={val}
                    className={`${styles.attributeBtn} ${isSelected ? styles.selected : ''} ${!available ? styles.outOfStock : ''}`}
                    onClick={() => onSelectAttribute(key, val)}
                    disabled={!available && !isSelected} // Prevent clicking if genuinely unavailable, but allow unselecting if already selected
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
