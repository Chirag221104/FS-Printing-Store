'use client';

import React, { useState } from 'react';
import { Variant } from '@/lib/types/schema';
import styles from './studio.module.css';
import { FiTrash2, FiCopy, FiPlus } from 'react-icons/fi';

interface Props {
  variants: Variant[];
  setVariants: React.Dispatch<React.SetStateAction<Variant[]>>;
}

export default function VariantSpreadsheet({ variants, setVariants }: Props) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleCellChange = (index: number, field: keyof Variant, value: any) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };
    setVariants(next);
  };

  const toggleSelectRow = (index: number) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter(i => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === variants.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(variants.map((_, i) => i));
    }
  };

  const deleteSelected = () => {
    if (selectedRows.length === 0) return;
    const next = variants.filter((_, i) => !selectedRows.includes(i));
    setVariants(next);
    setSelectedRows([]);
  };

  const duplicateSelected = () => {
    if (selectedRows.length === 0) return;
    const copies = selectedRows.map(i => {
      const orig = variants[i];
      return {
        ...orig,
        sku: `${orig.sku || 'SKU'}-COPY-${Math.floor(Math.random() * 1000)}`,
      };
    });
    setVariants([...variants, ...copies]);
  };

  if (variants.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
        No variants generated yet. Select your attributes above and click &quot;Generate Variants&quot;.
      </div>
    );
  }

  return (
    <div>
      {/* Spreadsheet Control Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
          {variants.length} Variants Total {selectedRows.length > 0 && `(${selectedRows.length} selected)`}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {selectedRows.length > 0 && (
            <>
              <button className={styles.btnSecondary} onClick={duplicateSelected} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                <FiCopy /> Duplicate Selected
              </button>
              <button className={styles.btnSecondary} onClick={deleteSelected} style={{ padding: '6px 12px', fontSize: '0.85rem', color: '#ef4444', borderColor: '#fca5a5' }}>
                <FiTrash2 /> Delete Selected
              </button>
            </>
          )}
        </div>
      </div>

      {/* Excel Table */}
      <div className={styles.spreadsheetContainer}>
        <table className={styles.excelTable}>
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedRows.length === variants.length && variants.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>SKU</th>
              <th>Attributes</th>
              <th>Selling Price (₹)</th>
              <th>Original MRP (₹)</th>
              <th>Stock</th>
              <th>Weight (g)</th>
              <th>GST %</th>
              <th>Prod Days</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v, i) => {
              const attrString = Object.entries(v.attributes || {}).map(([k, val]) => `${k}: ${val}`).join(' | ');
              const isSelected = selectedRows.includes(i);

              return (
                <tr key={v.sku || i} style={{ background: isSelected ? '#eff6ff' : 'transparent' }}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(i)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className={styles.excelCellInput}
                      value={v.sku || ''}
                      onChange={(e) => handleCellChange(i, 'sku', e.target.value)}
                    />
                  </td>
                  <td style={{ color: '#475569', fontWeight: 500, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {attrString}
                  </td>
                  <td>
                    <input
                      type="number"
                      className={styles.excelCellInput}
                      value={v.price || 0}
                      onChange={(e) => handleCellChange(i, 'price', Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className={styles.excelCellInput}
                      value={v.compareAtPrice || 0}
                      onChange={(e) => handleCellChange(i, 'compareAtPrice', Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className={styles.excelCellInput}
                      value={v.stock || 0}
                      onChange={(e) => handleCellChange(i, 'stock', Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className={styles.excelCellInput}
                      value={v.weightGrams || 0}
                      onChange={(e) => handleCellChange(i, 'weightGrams', Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className={styles.excelCellInput}
                      value={v.gstPercent || 18}
                      onChange={(e) => handleCellChange(i, 'gstPercent', Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className={styles.excelCellInput}
                      value={v.productionDays || 3}
                      onChange={(e) => handleCellChange(i, 'productionDays', Number(e.target.value))}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={v.isActive ?? true}
                      onChange={(e) => handleCellChange(i, 'isActive', e.target.checked)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
