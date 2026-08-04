'use client';

import React, { useState, useCallback, useRef } from 'react';
import { ProductStudioState, ProductImage, Variant } from '@/lib/types/schema';
import styles from '../studio.module.css';
import { FiImage, FiUploadCloud, FiTrash2, FiStar, FiInfo, FiLayers, FiList } from 'react-icons/fi';

interface Props {
  state: Partial<ProductStudioState>;
  setState: React.Dispatch<React.SetStateAction<Partial<ProductStudioState>>>;
}

const IMAGE_TYPES = ['Front', 'Back', 'Side', 'Detail', 'Lifestyle', 'Packaging'];

export default function Step4Images({ state, setState }: Props) {
  const [groupingAttribute, setGroupingAttribute] = useState<string>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadContext, setActiveUploadContext] = useState<{ type: 'product' } | { type: 'attribute', value: string } | { type: 'variant', variantId: string } | null>(null);

  // Group variants by the selected attribute
  const groupedVariants = React.useMemo(() => {
    if (groupingAttribute === 'none' || !state.variants) return {};
    const groups: Record<string, Variant[]> = {};
    state.variants.forEach(v => {
      const val = v.attributes[groupingAttribute] || 'Unassigned';
      if (!groups[val]) groups[val] = [];
      groups[val].push(v);
    });
    return groups;
  }, [groupingAttribute, state.variants]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Compression Utility
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_SIZE = 1200;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file); // Fallback
            }
          }, 'image/jpeg', 0.85);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Smart Filename Detection
  const detectTypeFromFilename = (filename: string): string => {
    const lower = filename.toLowerCase();
    for (const t of IMAGE_TYPES) {
      if (lower.includes(t.toLowerCase())) return t;
    }
    return 'Front'; // Default
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !activeUploadContext) return;
    const files = Array.from(e.target.files);
    
    // Process files
    const newImages: ProductImage[] = [];
    for (const file of files) {
      const compressedFile = await compressImage(file);
      const type = detectTypeFromFilename(file.name);
      
      newImages.push({
        id: generateId(),
        storagePath: '', // Empty until published
        file: compressedFile,
        previewUrl: URL.createObjectURL(compressedFile),
        type,
        isPrimary: false
      });
    }

    // Apply to state based on context
    if (activeUploadContext.type === 'product') {
      const currentImages = state.product?.images || [];
      // If first image, make it primary
      if (currentImages.length === 0 && newImages.length > 0) newImages[0].isPrimary = true;
      
      setState(prev => ({
        ...prev,
        product: {
          ...prev.product!,
          images: [...currentImages, ...newImages]
        }
      }));
    } 
    else if (activeUploadContext.type === 'attribute') {
      const groupVal = activeUploadContext.value;
      const varsInGroup = groupedVariants[groupVal] || [];
      
      setState(prev => {
        const nextVars = [...(prev.variants || [])];
        varsInGroup.forEach(vg => {
          const vIdx = nextVars.findIndex(v => v.id === vg.id);
          if (vIdx > -1) {
            const curImgs = nextVars[vIdx].images || [];
            // For first image, set primary true, but since we reuse objects, we must map a copy
            const mappedNewImages = newImages.map((nImg, i) => ({
              ...nImg,
              id: generateId(), // New ID for each variant so they act independent after assignment
              isPrimary: curImgs.length === 0 && i === 0
            }));
            nextVars[vIdx] = {
              ...nextVars[vIdx],
              images: [...curImgs, ...mappedNewImages]
            };
          }
        });
        return { ...prev, variants: nextVars };
      });
    } else if (activeUploadContext.type === 'variant') {
      const vId = activeUploadContext.variantId;
      setState(prev => {
        const nextVars = [...(prev.variants || [])];
        const vIdx = nextVars.findIndex(v => v.id === vId);
        if (vIdx > -1) {
          const curImgs = nextVars[vIdx].images || [];
          if (curImgs.length === 0 && newImages.length > 0) newImages[0].isPrimary = true;
          nextVars[vIdx] = {
            ...nextVars[vIdx],
            images: [...curImgs, ...newImages]
          };
        }
        return { ...prev, variants: nextVars };
      });
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveUploadContext(null);
  };

  const removeImage = (context: 'product' | 'variant', imgId: string, variantId?: string) => {
    if (context === 'product') {
      setState(prev => ({
        ...prev,
        product: {
          ...prev.product!,
          images: (prev.product?.images || []).filter(img => (typeof img === 'string' ? img !== imgId : img.id !== imgId))
        }
      }));
    } else if (context === 'variant' && variantId) {
      setState(prev => ({
        ...prev,
        variants: prev.variants?.map(v => 
          v.id === variantId 
            ? { ...v, images: (v.images || []).filter(img => img.id !== imgId) }
            : v
        )
      }));
    }
  };

  const setPrimary = (context: 'product' | 'variant', imgId: string, variantId?: string) => {
    if (context === 'product') {
      setState(prev => ({
        ...prev,
        product: {
          ...prev.product!,
          images: (prev.product?.images || []).map(img => 
            typeof img === 'string'
              ? { storagePath: img, type: 'front', isPrimary: img === imgId }
              : { ...img, isPrimary: img.id === imgId }
          )
        }
      }));
    } else if (context === 'variant' && variantId) {
      setState(prev => ({
        ...prev,
        variants: prev.variants?.map(v => 
          v.id === variantId 
            ? { ...v, images: (v.images || []).map(img => ({ ...img, isPrimary: img.id === imgId })) }
            : v
        )
      }));
    }
  };

  const updateImageType = (context: 'product' | 'variant', imgId: string, type: string, variantId?: string) => {
    if (context === 'product') {
      setState(prev => ({
        ...prev,
        product: {
          ...prev.product!,
          images: (prev.product?.images || []).map(img => 
            typeof img === 'string'
              ? (img === imgId ? { storagePath: img, type } : img)
              : (img.id === imgId ? { ...img, type } : img)
          )
        }
      }));
    } else if (context === 'variant' && variantId) {
      setState(prev => ({
        ...prev,
        variants: prev.variants?.map(v => 
          v.id === variantId 
            ? { ...v, images: (v.images || []).map(img => img.id === imgId ? { ...img, type } : img) }
            : v
        )
      }));
    }
  };

  const openUploader = (context: typeof activeUploadContext) => {
    setActiveUploadContext(context);
    fileInputRef.current?.click();
  };

  const renderImageGrid = (rawImages: (ProductImage | string)[], context: 'product' | 'variant', variantId?: string) => {
    const images: (ProductImage & { id: string })[] = (rawImages || []).map((img, idx) => 
      typeof img === 'string' 
        ? { id: img, storagePath: img, type: 'front' } 
        : { ...img, id: img.id || img.storagePath || `img_${idx}` }
    );

    if (!images || images.length === 0) return (
      <div className={styles.emptyZone} onClick={() => openUploader(context === 'product' ? { type: 'product' } : { type: 'variant', variantId: variantId! })}>
        <FiUploadCloud size={32} />
        <p>Click to upload or drag and drop</p>
      </div>
    );

    return (
      <div className={styles.imageGrid}>
        {images.map(img => (
          <div key={img.id} className={`${styles.imageCard} ${img.isPrimary ? styles.primaryCard : ''}`}>
            {img.isPrimary && <div className={styles.primaryBadge}><FiStar size={12} /> Primary</div>}
            
            <div className={styles.imagePreview}>
              <img src={img.previewUrl || img.storagePath} alt={img.altText || 'Product'} />
              <div className={styles.imageOverlay}>
                <button type="button" onClick={() => setPrimary(context, img.id, variantId)} title="Set as Primary">
                  <FiStar />
                </button>
                <button type="button" onClick={() => removeImage(context, img.id, variantId)} className={styles.dangerBtn} title="Remove">
                  <FiTrash2 />
                </button>
              </div>
            </div>
            
            <div className={styles.imageMeta}>
              <select 
                value={img.type} 
                onChange={(e) => updateImageType(context, img.id, e.target.value, variantId)}
                className={styles.typeSelect}
              >
                {IMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        ))}
        <div className={styles.addMoreCard} onClick={() => openUploader(context === 'product' ? { type: 'product' } : { type: 'variant', variantId: variantId! })}>
          <FiUploadCloud size={24} />
          <span>Add</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className={styles.stepTitle}>Step 4: Image Manager</div>
      <div className={styles.stepSubtitle}>
        Upload and map images to your product and variants.
      </div>

      <input 
        type="file" 
        multiple 
        accept="image/*" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFilesSelected}
      />

      {/* Global Product Images */}
      <div className={styles.configSection}>
        <h3 className={styles.sectionHeader}><FiImage /> Overall Product Images</h3>
        <p className={styles.helperText}>Used as a fallback when a variant doesn't have its own images, or for lifestyle shots.</p>
        {renderImageGrid(state.product?.images || [], 'product')}
      </div>

      {/* Attribute Grouping Manager */}
      <div className={styles.configSection} style={{ marginTop: '32px' }}>
        <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3><FiLayers /> Variant Images</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Group variants by:</span>
            <select 
              className={styles.input} 
              style={{ width: 'auto', padding: '6px 12px' }}
              value={groupingAttribute}
              onChange={(e) => setGroupingAttribute(e.target.value)}
            >
              <option value="none">No Grouping (Individual SKUs)</option>
              {state.attributeDefinitions?.map(attr => (
                <option key={attr.name} value={attr.name}>{attr.name}</option>
              ))}
            </select>
          </div>
        </div>

        {state.variants?.length === 0 ? (
          <div className={styles.bulkBox}><p>Generate variants in Step 2 to assign images to them.</p></div>
        ) : groupingAttribute !== 'none' ? (
          // GROUPED VIEW
          <div className={styles.variantGroups}>
            {Object.entries(groupedVariants).map(([val, vars]) => {
              // Get images from the first variant in the group as a representative for the group's current state
              const representativeImages = vars[0].images || [];
              
              return (
                <div key={val} className={styles.groupCard}>
                  <div className={styles.groupHeader}>
                    <h4>{groupingAttribute}: <strong>{val}</strong></h4>
                    <span className={styles.badge}>{vars.length} SKUs</span>
                  </div>
                  
                  {/* Group Dropzone */}
                  <div className={styles.groupDropzone}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Images assigned to these {vars.length} SKUs</p>
                      <button 
                        type="button" 
                        className={styles.secondaryBtn} 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => openUploader({ type: 'attribute', value: val })}
                      >
                        <FiUploadCloud /> Upload to all {val}
                      </button>
                    </div>
                    
                    {representativeImages.length > 0 ? (
                      <div className={styles.miniImageGrid}>
                        {representativeImages.map(img => (
                          <div key={img.id} className={styles.miniImg}>
                            <img src={img.previewUrl || img.storagePath} alt="var" />
                            <span className={styles.miniType}>{img.type}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyStateMicro}>No images assigned. Using global fallback.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // INDIVIDUAL SKU VIEW
          <div className={styles.individualVars}>
            {state.variants?.map(v => (
              <div key={v.id} className={styles.skuCard}>
                <div className={styles.skuHeader}>
                  <h4>{v.sku}</h4>
                  <div className={styles.skuAttrs}>
                    {Object.entries(v.attributes).map(([k, val]) => (
                      <span key={k} className={styles.skuAttr}>{k}: {val}</span>
                    ))}
                  </div>
                </div>
                {renderImageGrid(v.images || [], 'variant', v.id)}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
