'use client';

import React, { useEffect, useState } from 'react';
import { getFile } from '@/lib/utils/idb';

interface Props {
  localFileId?: string;
  fallbackImage?: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function CustomArtworkThumbnail({ localFileId, fallbackImage, alt, style, className }: Props) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    
    const loadArtwork = async () => {
      if (localFileId) {
        try {
          const file = await getFile(localFileId);
          if (file) {
            objectUrl = URL.createObjectURL(file);
            setImgSrc(objectUrl);
            return;
          }
        } catch (err) {
          console.error("Failed to load artwork from IDB", err);
        }
      }
      
      // If we reach here, we failed to load from IDB or localFileId is empty
      if (fallbackImage) {
        setImgSrc(fallbackImage);
      }
    };

    loadArtwork();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [localFileId, fallbackImage]);

  if (!imgSrc) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0' }} className={className}>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>No Image</span>
      </div>
    );
  }

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      style={style} 
      className={className} 
      onError={(e) => {
        if (fallbackImage && e.currentTarget.src !== fallbackImage) {
          e.currentTarget.src = fallbackImage;
        }
      }}
    />
  );
}
