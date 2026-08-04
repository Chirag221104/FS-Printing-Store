'use client';

import React from 'react';
import { CustomizationState } from './CustomizationPanel';
import { MockupSet, PrintLocation, PrintArea } from '@/lib/types/schema';
import styles from './LivePreview.module.css';
import { useDesignEditor, TransformState } from './hooks/useDesignEditor';

interface Props {
  baseImage: string; // legacy fallback
  activeMockupSet?: MockupSet;
  activeLocationId?: string;
  customizations: Record<string, CustomizationState>;
  updateTransform?: (locationId: string, updates: Partial<TransformState>) => void;
}

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

export default function LivePreview({ baseImage, activeMockupSet, activeLocationId, customizations, updateTransform }: Props) {
  const [loadedImage, setLoadedImage] = React.useState<string | null>(null);

  // Determine active location
  const location = activeMockupSet?.locations.find(l => l.id === activeLocationId) 
    || activeMockupSet?.locations[0];

  const displayImage = location?.baseImage?.storagePath || location?.baseImage?.previewUrl || baseImage || 'https://via.placeholder.com/600';

  React.useEffect(() => {
    if (loadedImage !== displayImage) {
      // It will reset immediately and hide areas until load fires
      setLoadedImage(null);
    }
  }, [displayImage, loadedImage]);

  const isImageReady = loadedImage === displayImage;

  return (
    <div className={styles.previewContainer}>
      <img 
        src={displayImage} 
        alt="Product Mockup" 
        className={styles.baseImage} 
        onLoad={() => setLoadedImage(displayImage)}
      />
      
      {/* Show Loading Spinner if image is changing */}
      {!isImageReady && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
      
      {/* Render all custom print areas for the ACTIVE location only */}
      {isImageReady && location && location.printAreas?.map((area, idx) => {
        const areaCust = customizations[location.id] || { type: 'none' };
        
        if (!areaCust || areaCust.type === 'none') return (
          <EmptyPrintAreaOverlay key={area.id} area={area} />
        );

        return <InteractiveArea key={area.id} area={area} areaCust={areaCust} locationId={location.id} updateTransform={updateTransform} />;
      })}

      {/* Legacy Fallback if no locations defined */}
      {isImageReady && !location && Object.values(customizations).some(c => c.type !== 'none') && (
        <div className={styles.overlayArea}>
          {Object.values(customizations).find(c => c.type === 'image' && c.artworkPreviewUrl)?.artworkPreviewUrl && (
            <img src={Object.values(customizations).find(c => c.type === 'image' && c.artworkPreviewUrl)?.artworkPreviewUrl} className={styles.overlayImage} />
          )}
          {Object.values(customizations).find(c => c.type === 'text' && c.customText)?.customText && (
            <div className={styles.overlayText}>{Object.values(customizations).find(c => c.type === 'text' && c.customText)?.customText}</div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyPrintAreaOverlay({ area }: { area: PrintArea }) {
  return (
    <div 
      className={styles.overlayArea}
      style={{
        left: `${area.bounds.x}%`,
        top: `${area.bounds.y}%`,
        width: `${area.bounds.width}%`,
        height: `${area.bounds.height}%`,
        transform: `rotate(${area.bounds.rotation}deg)`,
        ...getShapeStyle(area.shape),
        position: 'absolute',
        border: '2px dashed rgba(255, 255, 255, 0.7)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 10
      }}
    >
      <span style={{ 
        color: 'white', 
        fontSize: '0.75rem', 
        fontWeight: 'bold', 
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {area.label || area.name || 'Print Area'}
      </span>
    </div>
  );
}

function InteractiveArea({ area, areaCust, locationId, updateTransform }: { area: PrintArea, areaCust: any, locationId: string, updateTransform?: (locId: string, updates: Partial<TransformState>) => void }) {
  
  // Custom setter that proxies to parent updateTransform
  const handleSetState = (newStateOrUpdater: any) => {
    if (updateTransform) {
      const currentTransform = areaCust.transform || { x: 0, y: 0, scale: 1, rotation: 0, flipX: false, flipY: false };
      const updatedTransform = typeof newStateOrUpdater === 'function' ? newStateOrUpdater(currentTransform) : newStateOrUpdater;
      updateTransform(locationId, updatedTransform);
    }
  };

  // Pass 100x100 since the bounds are percentages relative to the container
  const { state, onPointerDown, onWheel, isDragging } = useDesignEditor({
    state: areaCust.transform,
    setState: handleSetState,
    bounds: { width: area.bounds.width, height: area.bounds.height },
    contentBounds: { width: area.bounds.width, height: area.bounds.height }, // Simplified for now
    constraints: {
      minScale: area.minScale || 10,
      maxScale: area.maxScale || 300,
    }
  });

  return (
    <div 
      className={styles.overlayArea}
      onPointerDown={onPointerDown}
      onWheel={onWheel}
      style={{
        left: `${area.bounds.x}%`,
        top: `${area.bounds.y}%`,
        width: `${area.bounds.width}%`,
        height: `${area.bounds.height}%`,
        transform: `rotate(${area.bounds.rotation}deg)`,
        ...getShapeStyle(area.shape),
        position: 'absolute',
        overflow: 'hidden',
        border: '1px dashed rgba(255, 255, 255, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none', // Prevent page scroll on mobile while dragging
        zIndex: 20
      }}
    >
      {areaCust.type === 'image' && areaCust.artworkPreviewUrl && (
        <img 
          src={areaCust.artworkPreviewUrl} 
          alt="Custom Artwork" 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '100%', 
            objectFit: 'contain',
            transform: `translate(${state.x}px, ${state.y}px) scale(${state.scale}) rotate(${state.rotation || 0}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            pointerEvents: 'none' // Let the container handle the drag events
          }}
          draggable={false}
        />
      )}

      {areaCust.type === 'text' && areaCust.customText && (
        <div style={{
          fontFamily: areaCust.textFont || 'sans-serif',
          color: areaCust.textColor || '#000',
          fontWeight: areaCust.isBold ? 'bold' : 'normal',
          fontStyle: areaCust.isItalic ? 'italic' : 'normal',
          fontSize: '24px', 
          textAlign: 'center',
          wordBreak: 'break-word',
          transform: `translate(${state.x}px, ${state.y}px) scale(${state.scale}) rotate(${state.rotation || 0}deg)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          pointerEvents: 'none'
        }}>
          {areaCust.customText}
        </div>
      )}
    </div>
  );
}
