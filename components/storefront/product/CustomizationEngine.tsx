'use client';

import React, { useState, useRef } from 'react';
import { Product } from '@/lib/types/schema';
import styles from './product-storefront.module.css';
import { FiUploadCloud, FiTrash2, FiType, FiImage, FiCheck } from 'react-icons/fi';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';
import { getAuth } from 'firebase/auth';

interface Props {
  product: Product;
  customization: any;
  setCustomization: React.Dispatch<React.SetStateAction<any>>;
}

const PREMIUM_FONTS = ['Poppins', 'Montserrat', 'Bebas Neue', 'Playfair Display', 'Pacifico'];

export default function CustomizationEngine({ product, customization, setCustomization }: Props) {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to get a stable session ID for guests
  const getSessionId = () => {
    let sid = localStorage.getItem('guest_session_id');
    if (!sid) {
      sid = 'guest_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guest_session_id', sid);
    }
    return sid;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (product.maxUploadSizeBytes && file.size > product.maxUploadSizeBytes) {
      toast.error(`File is too large. Max size is ${Math.round(product.maxUploadSizeBytes / 1024 / 1024)}MB.`);
      return;
    }

    // Validate type
    if (product.acceptedFileTypes && product.acceptedFileTypes.length > 0 && !product.acceptedFileTypes.includes(file.type)) {
      toast.error(`Invalid file type. Please upload: ${product.acceptedFileTypes.join(', ')}`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const auth = getAuth();
    const user = auth.currentUser;
    const storagePath = user 
      ? `private/artworks/${user.uid}/${Date.now()}_${file.name}`
      : `private/artworks/guests/${getSessionId()}/${Date.now()}_${file.name}`;

    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error(error);
        toast.error('Failed to upload artwork securely.');
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // In a full implementation, we'd also write to the `artworks` Firestore collection here.
        // For the sake of the checkout flow, we embed the necessary data in customization state.
        setCustomization((prev: any) => ({
          ...prev,
          artworkUrl: downloadURL,
          artworkStoragePath: storagePath,
          artworkName: file.name
        }));
        
        setIsUploading(false);
        toast.success('Artwork uploaded successfully!');
      }
    );
  };

  const removeArtwork = () => {
    setCustomization((prev: any) => ({
      ...prev,
      artworkUrl: undefined,
      artworkStoragePath: undefined,
      artworkName: undefined
    }));
  };

  if (!product.isCustomizable) return null;

  return (
    <div className={styles.customizationEngine}>
      <h3 className={styles.engineTitle}>Personalize Your Product</h3>
      
      <div className={styles.engineTabs}>
        {product.allowImageUpload && (
          <button 
            className={`${styles.tabBtn} ${activeTab === 'upload' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <FiImage /> Upload Design
          </button>
        )}
        {product.allowTextPrinting && (
          <button 
            className={`${styles.tabBtn} ${activeTab === 'text' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('text')}
          >
            <FiType /> Add Text
          </button>
        )}
      </div>

      <div className={styles.engineContent}>
        {activeTab === 'upload' && product.allowImageUpload && (
          <div className={styles.uploadSection}>
            {customization.artworkUrl ? (
              <div className={styles.uploadedArtwork}>
                <img src={customization.artworkUrl} alt="Uploaded Artwork" className={styles.artworkThumb} />
                <div className={styles.artworkDetails}>
                  <span className={styles.artworkName}>{customization.artworkName}</span>
                  <button className={styles.removeArtworkBtn} onClick={removeArtwork}>
                    <FiTrash2 /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className={styles.uploadDropzone} 
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className={styles.uploadProgress}>
                    <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }}></div>
                    <span>{Math.round(uploadProgress)}% Uploaded</span>
                  </div>
                ) : (
                  <>
                    <FiUploadCloud size={32} />
                    <span>Click or drag to upload high-res design</span>
                    <span className={styles.uploadHint}>Max size: {Math.round((product.maxUploadSizeBytes || 0)/1024/1024)}MB</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload}
                  accept={product.acceptedFileTypes?.join(',')}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'text' && product.allowTextPrinting && (
          <div className={styles.textSection}>
            <textarea 
              placeholder="Enter your custom text here..."
              className={styles.textInput}
              value={customization.customText || ''}
              onChange={(e) => setCustomization((prev: any) => ({ ...prev, customText: e.target.value }))}
            />
            
            <div className={styles.fontSelector}>
              <label>Select Font</label>
              <div className={styles.fontGrid}>
                {PREMIUM_FONTS.map(font => (
                  <button 
                    key={font}
                    className={`${styles.fontBtn} ${customization.textFont === font ? styles.fontBtnActive : ''}`}
                    style={{ fontFamily: font }}
                    onClick={() => setCustomization((prev: any) => ({ ...prev, textFont: font }))}
                  >
                    {font} {customization.textFont === font && <FiCheck />}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.colorSelector}>
              <label>Text Color</label>
              <input 
                type="color" 
                value={customization.textColor || '#000000'}
                onChange={(e) => setCustomization((prev: any) => ({ ...prev, textColor: e.target.value }))}
              />
            </div>
          </div>
        )}

        {product.printingLocations && product.printingLocations.length > 0 && (
          <div className={styles.placementSelector}>
            <label>Print Location</label>
            <select 
              value={customization.placement || product.printingLocations[0]}
              onChange={(e) => setCustomization((prev: any) => ({ ...prev, placement: e.target.value }))}
            >
              <option value="">Select placement...</option>
              {product.printingLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
