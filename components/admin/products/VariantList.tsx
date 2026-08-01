'use client';

import React, { useState } from 'react';
import { Variant } from '@/lib/types/schema';
import styles from './editor.module.css';
import { FiChevronDown, FiChevronUp, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';

interface Props {
  variants: Partial<Variant>[];
  setVariants: React.Dispatch<React.SetStateAction<Partial<Variant>[]>>;
  productSlug: string;
}

export default function VariantList({ variants, setVariants, productSlug }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [uploading, setUploading] = useState<string | null>(null);

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'side' | 'lifestyle' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const variant = variants[index];
    if (!variant.sku) return;

    setUploading(`${index}-${type}`);
    try {
      const storagePath = `public/products/${productSlug}/${variant.sku}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      
      const newImages = [...(variant.images || [])];
      newImages.push({ storagePath, type });
      
      updateVariant(index, 'images', newImages);
      toast.success('Image uploaded!');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    }
    setUploading(null);
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    const variant = variants[variantIndex];
    const newImages = [...(variant.images || [])];
    newImages.splice(imageIndex, 1);
    updateVariant(variantIndex, 'images', newImages);
  };

  return (
    <div>
      {variants.map((variant, index) => {
        const isExpanded = expandedIndex === index;
        const attrString = Object.entries(variant.attributes || {}).map(([k,v]) => `${v}`).join(' · ');

        return (
          <div key={variant.sku || index} className={styles.variantCard}>
            <div className={styles.variantHeader} onClick={() => setExpandedIndex(isExpanded ? null : index)}>
              <div>
                <div className={styles.variantTitle}>{variant.sku}</div>
                <div className={styles.variantSummary}>
                  <span>{attrString}</span>
                  <span>₹{variant.price}</span>
                  <span>{variant.stock} in stock</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); removeVariant(index); }}
                  style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer' }}
                >
                  <FiTrash2 size={18} />
                </button>
                {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
              </div>
            </div>

            {isExpanded && (
              <div className={styles.variantBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>SKU</label>
                    <input 
                      type="text" 
                      value={variant.sku || ''} 
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Price (₹)</label>
                    <input 
                      type="number" 
                      value={variant.price || 0} 
                      onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Compare at Price (₹)</label>
                    <input 
                      type="number" 
                      value={variant.compareAtPrice || ''} 
                      onChange={(e) => updateVariant(index, 'compareAtPrice', Number(e.target.value))}
                      placeholder="Optional"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Stock Quantity</label>
                    <input 
                      type="number" 
                      value={variant.stock || 0} 
                      onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Weight (grams)</label>
                    <input 
                      type="number" 
                      value={variant.weightGrams || 0} 
                      onChange={(e) => updateVariant(index, 'weightGrams', Number(e.target.value))}
                    />
                  </div>
                  <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                    <label className={styles.toggleSwitch}>
                      <input 
                        type="checkbox" 
                        checked={variant.isActive ?? true}
                        onChange={(e) => updateVariant(index, 'isActive', e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                    <label>Active Variant</label>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Variant Images</label>
                  <div className={styles.imageGrid}>
                    
                    {/* Render Existing Images */}
                    {(variant.images || []).map((img, imgIdx) => (
                      <div key={imgIdx} className={styles.imageUploadBox} style={{ border: 'none' }}>
                        {/* We are storing raw paths. To show preview instantly we'd ideally fetch a downloadURL, 
                            but for the sake of admin performance we'll just show a placeholder or we can use a helper hook later.
                            For now, just showing the type. */}
                        <div style={{ position: 'absolute', zIndex: 2, background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                          {img.type.toUpperCase()}
                        </div>
                        <span style={{ fontSize: '2rem' }}>🖼️</span>
                        <button type="button" className={styles.deleteImageBtn} onClick={() => removeImage(index, imgIdx)}><FiTrash2 size={12}/></button>
                      </div>
                    ))}

                    {/* Upload Buttons */}
                    <label className={styles.imageUploadBox}>
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageUpload(index, e, 'front')} />
                      {uploading === `${index}-front` ? 'Uploading...' : <><FiUploadCloud size={24} style={{marginBottom: '0.5rem'}}/> Add Front</>}
                    </label>
                    <label className={styles.imageUploadBox}>
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageUpload(index, e, 'back')} />
                      {uploading === `${index}-back` ? 'Uploading...' : <><FiUploadCloud size={24} style={{marginBottom: '0.5rem'}}/> Add Back</>}
                    </label>
                    <label className={styles.imageUploadBox}>
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageUpload(index, e, 'gallery')} />
                      {uploading === `${index}-gallery` ? 'Uploading...' : <><FiUploadCloud size={24} style={{marginBottom: '0.5rem'}}/> Add Gallery</>}
                    </label>

                  </div>
                </div>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
