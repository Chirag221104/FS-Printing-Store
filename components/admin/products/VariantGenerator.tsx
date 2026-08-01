'use client';

import React, { useState } from 'react';
import { Product, Variant } from '@/lib/types/schema';
import styles from './editor.module.css';
import { FiPlus, FiX, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface Props {
  baseProduct: Partial<Product>;
  variants: Partial<Variant>[];
  setVariants: React.Dispatch<React.SetStateAction<Partial<Variant>[]>>;
}

export default function VariantGenerator({ baseProduct, variants, setVariants }: Props) {
  
  // Local state to hold attribute definitions before generating variants
  // e.g., { "Color": ["Red", "Blue"], "Size": ["M", "L"] }
  const [attributes, setAttributes] = useState<Record<string, string[]>>({});
  
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [activeAttr, setActiveAttr] = useState<string | null>(null);

  const addAttributeType = () => {
    if (!newAttrName) return;
    if (attributes[newAttrName]) {
      toast.error('Attribute already exists');
      return;
    }
    setAttributes(prev => ({ ...prev, [newAttrName]: [] }));
    setActiveAttr(newAttrName);
    setNewAttrName('');
  };

  const addAttributeValue = (attr: string) => {
    if (!newAttrValue) return;
    if (attributes[attr].includes(newAttrValue)) return;
    
    setAttributes(prev => ({
      ...prev,
      [attr]: [...prev[attr], newAttrValue]
    }));
    setNewAttrValue('');
  };

  const removeAttributeValue = (attr: string, valToRemove: string) => {
    setAttributes(prev => ({
      ...prev,
      [attr]: prev[attr].filter(v => v !== valToRemove)
    }));
  };

  const removeAttributeType = (attr: string) => {
    const newAttrs = { ...attributes };
    delete newAttrs[attr];
    setAttributes(newAttrs);
    if (activeAttr === attr) setActiveAttr(null);
  };

  // Cartesian Product Generator
  const generateVariants = () => {
    if (!baseProduct.slug) {
      toast.error('Please define a Product URL Slug first to generate SKUs.');
      return;
    }

    const attrKeys = Object.keys(attributes);
    if (attrKeys.length === 0) {
      toast.error('Add at least one attribute to generate variants.');
      return;
    }

    // Filter out attributes that have no values
    const validKeys = attrKeys.filter(k => attributes[k].length > 0);
    if (validKeys.length === 0) return;

    // Recursive function to generate all combinations
    const generateCombinations = (keys: string[], currentIndex: number, currentCombo: Record<string, string>): Record<string, string>[] => {
      if (currentIndex === keys.length) {
        return [currentCombo];
      }

      const key = keys[currentIndex];
      const values = attributes[key];
      const combinations: Record<string, string>[] = [];

      for (const val of values) {
        combinations.push(...generateCombinations(keys, currentIndex + 1, { ...currentCombo, [key]: val }));
      }

      return combinations;
    };

    const newCombos = generateCombinations(validKeys, 0, {});

    // Map combinations to actual Variant objects
    const newVariants: Partial<Variant>[] = newCombos.map(combo => {
      // Create a deterministic SKU string
      const skuSuffix = Object.values(combo).map(v => v.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 3)).join('-');
      const generatedSku = `${baseProduct.slug?.toUpperCase()}-${skuSuffix}`;

      // Check if variant already exists (preserve data if it does)
      const existing = variants.find(v => {
        // Compare by attributes
        if (!v.attributes) return false;
        return Object.keys(combo).every(k => v.attributes![k] === combo[k]);
      });

      if (existing) return existing;

      return {
        sku: generatedSku,
        attributes: combo,
        price: baseProduct.basePrice || 0,
        stock: 0,
        weightGrams: 200,
        images: [],
        bulkPricing: [],
        isActive: true,
      };
    });

    setVariants(newVariants);
    toast.success(`Generated ${newVariants.length} variants!`);
  };

  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Define attributes (like Color, Size, Material) to automatically generate product variants.
      </p>

      {/* Attribute Builder */}
      <div className={styles.attributeBuilder}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder="New Option (e.g., Size)" 
            value={newAttrName}
            onChange={e => setNewAttrName(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#111' }}
          />
          <button className="btn btn-secondary" onClick={addAttributeType} type="button">
            Add Option
          </button>
        </div>

        {Object.keys(attributes).map(attr => (
          <div key={attr} style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong>{attr}</strong>
              <button type="button" onClick={() => removeAttributeType(attr)} style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer' }}>
                <FiX />
              </button>
            </div>
            
            <div className={styles.chipList} style={{ marginBottom: '1rem' }}>
              {attributes[attr].map(val => (
                <div key={val} className={styles.chip}>
                  {val}
                  <button type="button" onClick={() => removeAttributeValue(attr, val)}><FiX size={14}/></button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder={`Add value for ${attr} (e.g., XL)`}
                value={activeAttr === attr ? newAttrValue : ''}
                onChange={e => { setActiveAttr(attr); setNewAttrValue(e.target.value); }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAttributeValue(attr);
                  }
                }}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#111' }}
              />
              <button type="button" className="btn btn-secondary" onClick={() => addAttributeValue(attr)} style={{ padding: '0.5rem 1rem' }}>
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        type="button" 
        className="btn btn-primary" 
        onClick={generateVariants}
        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
      >
        <FiRefreshCw /> Generate Variant Combinations
      </button>

    </div>
  );
}
