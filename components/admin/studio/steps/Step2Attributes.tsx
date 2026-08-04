'use client';

import React, { useState } from 'react';
import { ProductStudioState, Variant } from '@/lib/types/schema';
import styles from '../studio.module.css';
import { FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import VariantSpreadsheet from '../VariantSpreadsheet';

interface Props {
  state: Partial<ProductStudioState>;
  setState: React.Dispatch<React.SetStateAction<Partial<ProductStudioState>>>;
}

export default function Step2Attributes({ state, setState }: Props) {
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrVal, setNewAttrVal] = useState('');
  const [selectedAttrForVal, setSelectedAttrForVal] = useState<string>('');

  const defs = state.attributeDefinitions || [];
  const selectedProduct = state.product || {};

  // Delete an entire attribute category
  const deleteAttrCategory = (attrName: string) => {
    const nextDefs = defs.filter(d => d.name !== attrName);
    setState(prev => ({ ...prev, attributeDefinitions: nextDefs }));
  };

  // Toggle selection of a specific value in an attribute
  const toggleValue = (attrName: string, val: string) => {
    const nextDefs = defs.map(d => {
      if (d.name === attrName) {
        const selected = d.values || [];
        const isCurrentlySelected = selected.includes(val);
        const nextSelected = isCurrentlySelected 
          ? selected.filter(v => v !== val) 
          : [...selected, val];

        // Ensure allValues keeps track of all known options so unselected pills stay visible
        const allVals = d.allValues || Array.from(new Set([...d.values, ...(d.allValues || [])]));
        if (!allVals.includes(val)) allVals.push(val);

        return {
          ...d,
          values: nextSelected,
          allValues: allVals,
        };
      }
      return d;
    });
    setState(prev => ({ ...prev, attributeDefinitions: nextDefs }));
  };

  // Add custom attribute name
  const addCustomAttr = () => {
    if (!newAttrName.trim()) return;
    if (defs.some(d => d.name.toLowerCase() === newAttrName.trim().toLowerCase())) return;
    setState(prev => ({
      ...prev,
      attributeDefinitions: [
        ...(prev.attributeDefinitions || []), 
        { name: newAttrName.trim(), values: [], allValues: [] }
      ]
    }));
    setNewAttrName('');
  };

  // Add custom value to an attribute
  const addCustomValue = (attrName: string) => {
    const val = newAttrVal.trim();
    if (!val) return;
    const nextDefs = defs.map(d => {
      if (d.name === attrName) {
        const curValues = d.values || [];
        const curAll = d.allValues || [...curValues];
        const nextValues = curValues.includes(val) ? curValues : [...curValues, val];
        const nextAll = curAll.includes(val) ? curAll : [...curAll, val];
        return { ...d, values: nextValues, allValues: nextAll };
      }
      return d;
    });
    setState(prev => ({ ...prev, attributeDefinitions: nextDefs }));
    setNewAttrVal('');
  };

  // Generate Cartesian Product Variants
  const handleGenerateVariants = () => {
    const validDefs = defs.filter(d => d.values.length > 0);
    if (validDefs.length === 0) return;

    const slug = selectedProduct.slug || 'product';

    const cartesian = (args: string[][]): string[][] => {
      const r: string[][] = [];
      const max = args.length - 1;
      function helper(arr: string[], i: number) {
        for (let j = 0, l = args[i].length; j < l; j++) {
          const a = [...arr, args[i][j]];
          if (i === max) r.push(a);
          else helper(a, i + 1);
        }
      }
      helper([], 0);
      return r;
    };

    const keys = validDefs.map(d => d.name);
    const valueMatrix = validDefs.map(d => d.values);
    const combos = cartesian(valueMatrix);

    const generated: Variant[] = combos.map(combo => {
      const attrMap: Record<string, string> = {};
      combo.forEach((val, idx) => {
        attrMap[keys[idx]] = val;
      });

      const skuSuffix = combo.map(v => v.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 3)).join('-');
      const sku = `${slug.toUpperCase()}-${skuSuffix}`;

      return {
        id: `variant_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        sku,
        attributes: attrMap,
        price: selectedProduct.basePrice || 499,
        compareAtPrice: selectedProduct.compareAtPrice || 0,
        stock: 50,
        weightGrams: 200,
        gstPercent: 18,
        productionDays: 3,
        isActive: true,
        images: [],
        bulkPricing: []
      };
    });

    setState(prev => ({ ...prev, variants: generated }));
  };

  return (
    <div>
      <div className={styles.stepTitle}>Step 2: Attributes & Variant Generator</div>
      <div className={styles.stepSubtitle}>
        Check the attributes you want for this product. Click &quot;Generate Variants&quot; to automatically build all combinations.
      </div>

      {/* Attribute Defs Checkbox Lists */}
      {defs.map(def => {
        const allOptionValues = Array.from(new Set([...(def.allValues || []), ...(def.values || [])]));

        return (
          <div key={def.name} className={styles.attrSection}>
            <div className={styles.attrHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{def.name} Options</span>
                <button
                  type="button"
                  onClick={() => deleteAttrCategory(def.name)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  title={`Delete ${def.name} Category`}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {selectedAttrForVal === def.name ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder={`Add custom ${def.name}...`}
                      value={newAttrVal}
                      onChange={(e) => setNewAttrVal(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                    />
                    <button type="button" className={styles.btnPrimary} onClick={() => addCustomValue(def.name)} style={{ padding: '4px 10px', fontSize: '0.85rem' }}>
                      Add
                    </button>
                    <button type="button" className={styles.btnSecondary} onClick={() => setSelectedAttrForVal('')} style={{ padding: '4px 8px', fontSize: '0.85rem' }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setSelectedAttrForVal(def.name)}
                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  >
                    + Add Custom {def.name}
                  </button>
                )}
              </div>
            </div>

            <div className={styles.chipGrid}>
              {allOptionValues.map(val => {
                const isChecked = (def.values || []).includes(val);
                return (
                  <div
                    key={val}
                    className={`${styles.chipCheck} ${isChecked ? styles.checked : ''}`}
                    onClick={() => toggleValue(def.name, val)}
                    style={{
                      background: isChecked ? '#3b82f6' : '#f1f5f9',
                      color: isChecked ? '#ffffff' : '#64748b',
                      borderColor: isChecked ? '#3b82f6' : '#cbd5e1',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {isChecked ? `✓ ${val}` : `+ ${val}`}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Add Custom Attribute Type */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', background: '#ffffff', padding: '12px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
        <input
          type="text"
          className={styles.inputField}
          placeholder="New Attribute Name (e.g. Material, Finish, Capacity)..."
          value={newAttrName}
          onChange={(e) => setNewAttrName(e.target.value)}
        />
        <button className={styles.btnSecondary} onClick={addCustomAttr}>
          <FiPlus /> Add Attribute Category
        </button>
      </div>

      {/* Generate Action Button */}
      <div style={{ margin: '24px 0', textAlign: 'center' }}>
        <button className={styles.btnPrimary} onClick={handleGenerateVariants} style={{ padding: '12px 28px', fontSize: '1rem' }}>
          <FiRefreshCw /> Generate / Refresh Variant Combinations
        </button>
      </div>

      {/* Inline Variant Spreadsheet */}
      <div className={styles.stepTitle} style={{ marginTop: '32px' }}>Generated Variant Table</div>
      <VariantSpreadsheet variants={state.variants || []} setVariants={(v) => setState(prev => ({ ...prev, variants: typeof v === 'function' ? v(prev.variants || []) : v }))} />
    </div>
  );
}
