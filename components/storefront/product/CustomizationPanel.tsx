'use client';

import React, { useRef } from 'react';
import { FiImage, FiType, FiX, FiUploadCloud } from 'react-icons/fi';
import styles from './CustomizationPanel.module.css';

import { TransformState } from './hooks/useDesignEditor';

export interface CustomizationState {
  type: 'image' | 'text' | 'none';
  artworkFile: File | null;
  artworkPreviewUrl: string;
  customText: string;
  textFont: string;
  textColor: string;
  isBold?: boolean;
  isItalic?: boolean;
  placement: string;
  transform?: TransformState;
}

interface Props {
  product: any;
  customizations: Record<string, CustomizationState>;
  setCustomizations: React.Dispatch<React.SetStateAction<Record<string, CustomizationState>>>;
  activeMockupSet?: any;
  activeLocationId?: string;
  setActiveLocationId?: (id: string) => void;
}

const FONTS = ['Poppins', 'Inter', 'Roboto', 'Playfair Display', 'Oswald', 'Montserrat', 'Lato', 'Merriweather', 'Bebas Neue', 'Caveat'];

const getShapeStyle = (shape: string = 'rectangle'): React.CSSProperties => {
  switch (shape) {
    case 'circle': return { borderRadius: '50%' };
    case 'ellipse': return { borderRadius: '50%' };
    case 'triangle': return { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' };
    case 'hexagon': return { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' };
    case 'diamond': return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' };
    default: return {};
  }
};

export default function CustomizationPanel({ product, customizations, setCustomizations, activeMockupSet, activeLocationId, setActiveLocationId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!product.isCustomizable) return null;

  // Find active location and area based on new MockupSet logic
  const activeLocation = activeMockupSet?.locations?.find((l: any) => l.id === activeLocationId) || activeMockupSet?.locations?.[0];
  const activeArea = activeLocation?.printAreas?.[0]; // Default to first area for now

  let areaShape = activeArea?.shape || 'rectangle';
  let allowImages = activeArea?.allowImages ?? product.allowImageUpload;
  let allowText = activeArea?.allowText ?? product.allowTextPrinting;
  let maxUploadSize = activeArea?.maxUploadSizeBytes || product.maxUploadSizeBytes || 5242880;
  let acceptedFileTypes = activeArea?.acceptedFileTypes || product.acceptedFileTypes;

  const customization = (activeLocationId && customizations[activeLocationId]) || {
    type: 'none',
    artworkFile: null,
    artworkPreviewUrl: '',
    customText: '',
    textFont: 'Poppins',
    textColor: '#000000',
    placement: activeLocation?.label || 'Front'
  };

  const updateCustomization = (updater: (prev: CustomizationState) => CustomizationState) => {
    if (!activeLocationId) return;
    setCustomizations(prev => ({
      ...prev,
      [activeLocationId]: updater(prev[activeLocationId] || customization)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (maxUploadSize && file.size > maxUploadSize) {
      alert(`File is too large. Max size is ${Math.round(maxUploadSize / 1024 / 1024)}MB`);
      return;
    }

    if (acceptedFileTypes && acceptedFileTypes.length > 0) {
      if (!acceptedFileTypes.includes(file.type)) {
        alert(`Invalid file type. Accepted: ${acceptedFileTypes.join(', ')}`);
        return;
      }
    }

    // Use Blob URL instead of Base64 to prevent huge payloads crashing Firestore cart sync
    const previewUrl = URL.createObjectURL(file);
    updateCustomization(prev => ({
      ...prev,
      type: 'image',
      artworkFile: file,
      artworkPreviewUrl: previewUrl,
      transform: { x: 0, y: 0, scale: activeArea?.defaultScale ? activeArea.defaultScale / 100 : 1, rotation: 0, flipX: false, flipY: false }
    }));
  };

  const handleClearImage = () => {
    updateCustomization(prev => ({
      ...prev,
      artworkFile: null,
      artworkPreviewUrl: ''
    }));
  };

  const updateTransform = (updates: Partial<TransformState>) => {
    updateCustomization(prev => {
      const current = prev.transform || { x: 0, y: 0, scale: 1, rotation: 0, flipX: false, flipY: false };
      return { ...prev, transform: { ...current, ...updates } };
    });
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Customize Your Product</h3>
      
      <div className={styles.tabs}>
        {allowImages && (
          <button 
            type="button"
            className={`${styles.tab} ${customization.type === 'image' ? styles.active : ''}`}
            onClick={() => updateCustomization(prev => ({ ...prev, type: 'image' }))}
          >
            <FiImage /> Upload Logo
          </button>
        )}
        {allowText && (
          <button 
            type="button"
            className={`${styles.tab} ${customization.type === 'text' ? styles.active : ''}`}
            onClick={() => updateCustomization(prev => ({ 
              ...prev, 
              type: 'text',
              transform: prev.transform || { x: 0, y: 0, scale: activeArea?.defaultScale ? activeArea.defaultScale / 100 : 1, rotation: 0, flipX: false, flipY: false }
            }))}
          >
            <FiType /> Add Text
          </button>
        )}
      </div>

      <div className={styles.content}>
        {customization.type === 'image' && allowImages && (
          <div className={styles.imageUploader}>
            {!customization.artworkPreviewUrl ? (
              <div 
                className={styles.dropzone}
                onClick={() => fileInputRef.current?.click()}
              >
                <FiUploadCloud size={32} color="#888" />
                <p>Click to upload your artwork</p>
                <span>Max size: {Math.round((maxUploadSize || 5242880) / 1024 / 1024)}MB</span>
              </div>
            ) : (
              <div className={styles.previewContainer}>
                <img 
                  src={customization.artworkPreviewUrl} 
                  alt="Artwork Preview" 
                  className={styles.thumbnail} 
                  style={getShapeStyle(areaShape)}
                />
                <button type="button" className={styles.removeBtn} onClick={handleClearImage}>
                  <FiX /> Remove
                </button>
              </div>
            )}

            {customization.artworkPreviewUrl && (
              <div className={styles.designControls}>
                <label className={styles.label}>Scale</label>
                <input 
                  type="range" 
                  min={activeArea?.minScale ? activeArea.minScale / 100 : 0.1} 
                  max={activeArea?.maxScale ? activeArea.maxScale / 100 : 3.0} 
                  step="0.05"
                  value={customization.transform?.scale || 1}
                  onChange={(e) => updateTransform({ scale: parseFloat(e.target.value) })}
                  className={styles.slider}
                />
                
                {activeArea?.allowRotation !== false && (
                  <div className={styles.designButtons}>
                    <button type="button" onClick={() => updateTransform({ rotation: ((customization.transform?.rotation || 0) - 90) % 360 })}>Rotate -90°</button>
                    <button type="button" onClick={() => updateTransform({ rotation: ((customization.transform?.rotation || 0) + 90) % 360 })}>Rotate +90°</button>
                    <button type="button" onClick={() => updateTransform({ x: 0, y: 0 })}>Center</button>
                  </div>
                )}
              </div>
            )}
              <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept={acceptedFileTypes?.join(',')}
              onChange={handleFileChange}
            />
          </div>
        )}

        {customization.type === 'text' && allowText && (
          <div className={styles.textEditor}>
            <input 
              type="text" 
              className={styles.input}
              placeholder="Enter your custom text..."
              value={customization.customText}
              onChange={(e) => updateCustomization(prev => ({ ...prev, customText: e.target.value }))}
            />
              <div className={styles.textOptions}>
              <select 
                className={styles.select}
                value={customization.textFont}
                onChange={(e) => updateCustomization(prev => ({ ...prev, textFont: e.target.value }))}
              >
                {FONTS.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                ))}
              </select>
                <input 
                  type="color" 
                  className={styles.colorPicker}
                  value={customization.textColor}
                  onChange={(e) => updateCustomization(prev => ({ ...prev, textColor: e.target.value }))}
                  title="Choose text color"
                />
                <button 
                  type="button" 
                  className={`${styles.iconBtn} ${customization.isBold ? styles.activeTextModifier : ''}`}
                  onClick={() => updateCustomization(prev => ({ ...prev, isBold: !prev.isBold }))}
                  title="Bold"
                  style={{ fontWeight: 'bold' }}
                >
                  B
                </button>
                <button 
                  type="button" 
                  className={`${styles.iconBtn} ${customization.isItalic ? styles.activeTextModifier : ''}`}
                  onClick={() => updateCustomization(prev => ({ ...prev, isItalic: !prev.isItalic }))}
                  title="Italic"
                  style={{ fontStyle: 'italic', fontFamily: 'serif' }}
                >
                  I
                </button>
              </div>

              <div className={styles.designControls} style={{ marginTop: '16px' }}>
                <label className={styles.label}>Scale</label>
                <input 
                  type="range" 
                  min={activeArea?.minScale ? activeArea.minScale / 100 : 0.1} 
                  max={activeArea?.maxScale ? activeArea.maxScale / 100 : 3.0} 
                  step="0.05"
                  value={customization.transform?.scale || 1}
                  onChange={(e) => updateTransform({ scale: parseFloat(e.target.value) })}
                  className={styles.slider}
                />
                
                {activeArea?.allowRotation !== false && (
                  <div className={styles.designButtons}>
                    <button type="button" onClick={() => updateTransform({ rotation: ((customization.transform?.rotation || 0) - 90) % 360 })}>Rotate -90°</button>
                    <button type="button" onClick={() => updateTransform({ rotation: ((customization.transform?.rotation || 0) + 90) % 360 })}>Rotate +90°</button>
                    <button type="button" onClick={() => updateTransform({ x: 0, y: 0 })}>Center</button>
                  </div>
                )}
              </div>
            </div>
          )}

        {activeMockupSet?.locations && activeMockupSet.locations.length > 0 && (
          <div className={styles.placementContainer}>
            <label className={styles.label}>Printing Placement</label>
            <div className={styles.placementOptions}>
              {activeMockupSet.locations.filter((loc: any) => loc.printAreas && loc.printAreas.length > 0).map((loc: any) => (
                <button
                  type="button"
                  key={loc.id}
                  className={`${styles.placementBtn} ${activeLocationId === loc.id ? styles.active : ''}`}
                  onClick={() => {
                    setCustomizations(prev => {
                      const existing = prev[loc.id] || { type: 'none', artworkFile: null, artworkPreviewUrl: '', customText: '', textFont: 'Poppins', textColor: '#000000', placement: loc.name };
                      return { ...prev, [loc.id]: { ...existing, placement: loc.name } };
                    });
                    if (setActiveLocationId) {
                      setActiveLocationId(loc.id);
                    }
                  }}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
