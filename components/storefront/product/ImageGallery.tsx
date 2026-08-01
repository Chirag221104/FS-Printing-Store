'use client';

import React, { useState, useEffect } from 'react';
import styles from './product-storefront.module.css';

interface GalleryImage {
  storagePath: string;
  type: string;
}

interface Props {
  images: GalleryImage[];
}

export default function ImageGallery({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset active index if the variants change and the images array changes length
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className={styles.imageGallery}>
        <div className={styles.mainImagePlaceholder}>
          <span>No Images Available</span>
        </div>
      </div>
    );
  }

  // In production, we would use Firebase getDownloadURL to convert storagePaths to actual URLs.
  // For now, since this is rapid prototyping and we might not have a cloud bucket ready with images, 
  // we'll assume storagePath points to a valid public URL or handle the placeholder.
  const activeImage = images[activeIndex];

  return (
    <div className={styles.imageGallery}>
      <div className={styles.mainImageContainer}>
        {/* Placeholder render logic for now */}
        <div className={styles.mainImagePlaceholder}>
          <span style={{ fontSize: '0.8rem', color: '#888', position: 'absolute', top: 10, left: 10 }}>{activeImage.type.toUpperCase()}</span>
          <span>Image Path: {activeImage.storagePath}</span>
        </div>
      </div>
      
      {images.length > 1 && (
        <div className={styles.thumbnailList}>
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className={`${styles.thumbnail} ${idx === activeIndex ? styles.activeThumbnail : ''}`}
              onClick={() => setActiveIndex(idx)}
            >
              <div className={styles.thumbPlaceholder}>
                <span style={{ fontSize: '0.6rem' }}>{img.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
