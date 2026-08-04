'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ProductStudioState, MockupSet, PrintLocation, PrintArea, PrintBounds, ProductImage } from '@/lib/types/schema';
import styles from './printStudio.module.css';
import { FiPlus, FiTrash2, FiCopy, FiLock, FiUnlock, FiEye, FiEyeOff, FiZoomIn, FiZoomOut, FiMove, FiGrid, FiRotateCw } from 'react-icons/fi';

interface Props {
  state: Partial<ProductStudioState>;
  setState: React.Dispatch<React.SetStateAction<Partial<ProductStudioState>>>;
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

export default function PrintProductionStudio({ state, setState }: Props) {
  // Initialization: If no mockup sets exist, create a default one
  useEffect(() => {
    if (!state.mockupSets || state.mockupSets.length === 0) {
      const category = (state.product?.categoryId || (state.product as any)?.category || '').toLowerCase();
      
      let defaultLocationNames = ['Front', 'Back']; // Fallback
      if (category.includes('t-shirt') || category.includes('tshirt')) {
        defaultLocationNames = ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Neck Label'];
      } else if (category.includes('hoodie')) {
        defaultLocationNames = ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Hood', 'Pocket'];
      } else if (category.includes('mug')) {
        defaultLocationNames = ['Front', 'Back', 'Full Wrap', 'Handle Side'];
      } else if (category.includes('bottle')) {
        defaultLocationNames = ['Front', 'Back', 'Wrap Around'];
      } else if (category.includes('frame')) {
        defaultLocationNames = ['Front'];
      }

      const defaultLocations: PrintLocation[] = defaultLocationNames.map((name, idx) => ({
        id: `loc_${Date.now()}_${idx}`,
        name,
        baseImage: { id: `img_${Date.now()}_${idx}`, storagePath: '', type: 'mockup' },
        printAreas: []
      }));

      setState(prev => ({
        ...prev,
        mockupSets: [{
          id: `mset_${Date.now()}`,
          name: 'Default Mockup Set',
          attributeMatch: {},
          locations: defaultLocations,
          lifestyleImages: []
        }]
      }));
    }
  }, []);

  const mockupSets = state.mockupSets || [];
  const [activeSetId, setActiveSetId] = useState<string>(mockupSets[0]?.id || '');
  const [activeLocationId, setActiveLocationId] = useState<string>('');
  const [activeAreaId, setActiveAreaId] = useState<string>('');

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [editingAreaId, setEditingAreaId] = useState<string>('');
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [unit, setUnit] = useState<'mm' | 'in' | '%'>('mm');

  const canvasRef = useRef<HTMLDivElement>(null);

  // Derived Active Entities
  const activeSet = mockupSets.find(s => s.id === (activeSetId || mockupSets[0]?.id));
  const activeLocation = activeSet?.locations.find(l => l.id === activeLocationId);
  const activeArea = activeLocation?.printAreas.find(a => a.id === activeAreaId);

  // Handlers for Sets/Locations
  const addLocation = () => {
    if (!activeSet) return;
    const newLoc: PrintLocation = {
      id: `loc_${Date.now()}`,
      name: 'New Location',
      baseImage: { id: `img_${Date.now()}`, storagePath: '', type: 'mockup' },
      printAreas: []
    };
    updateSet(activeSet.id, { locations: [...activeSet.locations, newLoc] });
    setActiveLocationId(newLoc.id);
  };

  const addPrintArea = () => {
    if (!activeSet || !activeLocation) return;
    const newArea: PrintArea = {
      id: `area_${Date.now()}`,
      name: 'New Print Area',
      label: 'Custom Area',
      shape: 'rectangle',
      bounds: { x: 25, y: 25, width: 50, height: 50, rotation: 0 },
      isLocked: false,
      isVisible: true,
      productionMethods: ['DTF'],
      maxUploadSizeBytes: 10485760,
      acceptedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'],
      recommendedDpi: 300,
      allowImages: true,
      allowText: true,
      lockAspectRatio: false
    };
    
    updateLocation(activeSet.id, activeLocation.id, {
      printAreas: [...activeLocation.printAreas, newArea]
    });
    setActiveAreaId(newArea.id);
  };

  const updateSet = (setId: string, updates: Partial<MockupSet>) => {
    setState(prev => ({
      ...prev,
      mockupSets: prev.mockupSets?.map(s => s.id === setId ? { ...s, ...updates } : s)
    }));
  };

  const updateLocation = (setId: string, locId: string, updates: Partial<PrintLocation>) => {
    setState(prev => ({
      ...prev,
      mockupSets: prev.mockupSets?.map(s => s.id === setId ? {
        ...s,
        locations: s.locations.map(l => l.id === locId ? { ...l, ...updates } : l)
      } : s)
    }));
  };

  const updateArea = (setId: string, locId: string, areaId: string, updates: Partial<PrintArea>) => {
    setState(prev => ({
      ...prev,
      mockupSets: prev.mockupSets?.map(s => s.id === setId ? {
        ...s,
        locations: s.locations.map(l => l.id === locId ? {
          ...l,
          printAreas: l.printAreas.map(a => a.id === areaId ? { ...a, ...updates } : a)
        } : l)
      } : s)
    }));
  };

  // Unit Conversion
  const toDisplayUnit = (percentage: number, physicalWidthMm?: number) => {
    if (unit === '%') return percentage.toFixed(1);
    if (!physicalWidthMm) return percentage.toFixed(1); // fallback
    
    const physicalValueMm = (percentage / 100) * physicalWidthMm;
    if (unit === 'in') return (physicalValueMm / 25.4).toFixed(2);
    return physicalValueMm.toFixed(1); // mm
  };

  const fromDisplayUnit = (valStr: string, physicalWidthMm?: number) => {
    const val = parseFloat(valStr) || 0;
    if (unit === '%') return val;
    if (!physicalWidthMm) return val; // fallback assumes percentage
    
    if (unit === 'mm') {
      return (val / physicalWidthMm) * 100;
    }
    if (unit === 'in') {
      return ((val * 25.4) / physicalWidthMm) * 100;
    }
    return val;
  };

  const handleBoundsChange = (areaId: string, newBounds: PrintBounds) => {
    if (!activeSet || !activeLocation) return;
    updateArea(activeSet.id, activeLocation.id, areaId, { bounds: newBounds });
  };

  const handleDimensionChange = (areaId: string, field: keyof PrintBounds, valStr: string) => {
    if (!activeSet || !activeLocation) return;
    const area = activeLocation.printAreas.find(a => a.id === areaId);
    if (!area) return;
    
    const newPercent = fromDisplayUnit(valStr, activeLocation.physicalWidthMm);
    handleBoundsChange(areaId, { ...area.bounds, [field]: newPercent });
  };

  const handleResizeDown = (e: React.PointerEvent, area: PrintArea, corner: string) => {
    e.stopPropagation();
    if (area.isLocked) return;
    setActiveAreaId(area.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startBounds = { ...area.bounds };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      let deltaX = ((moveEvent.clientX - startX) / 500) * (100 / zoom);
      let deltaY = ((moveEvent.clientY - startY) / 500) * (100 / zoom);

      let newX = startBounds.x;
      let newY = startBounds.y;
      let newW = startBounds.width;
      let newH = startBounds.height;

      // Lock aspect ratio
      if (area.lockAspectRatio || area.shape === 'circle') {
        const avgDelta = (Math.abs(deltaX) + Math.abs(deltaY)) / 2;
        const sign = (deltaX + deltaY) > 0 ? 1 : -1;
        
        if (corner === 'br' || corner === 'tr') deltaX = avgDelta * sign;
        else deltaX = -avgDelta * sign;
        
        if (corner === 'br' || corner === 'bl') deltaY = avgDelta * sign;
        else deltaY = -avgDelta * sign;
      }

      if (corner.includes('l')) { newX += deltaX; newW -= deltaX; }
      if (corner.includes('r')) { newW += deltaX; }
      if (corner.includes('t')) { newY += deltaY; newH -= deltaY; }
      if (corner.includes('b')) { newH += deltaY; }

      if (area.lockAspectRatio || area.shape === 'circle') {
        newH = newW; // Force perfectly square bounds
      }

      if (newW < 2) newW = 2;
      if (newH < 2) newH = 2;

      handleBoundsChange(area.id, { ...startBounds, x: newX, y: newY, width: newW, height: newH });
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    if ((e.target as HTMLElement).closest(`.${styles.boundingBox}`)) return;

    setActiveAreaId('');

    const startX = e.clientX;
    const startY = e.clientY;
    const startPanX = pan.x;
    const startPanY = pan.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      setPan({
        x: startPanX + (moveEvent.clientX - startX),
        y: startPanY + (moveEvent.clientY - startY)
      });
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  // Quick drag implementation for moving bounding box
  const handlePointerDown = (e: React.PointerEvent, area: PrintArea) => {
    e.stopPropagation();
    if (area.isLocked) return;
    setActiveAreaId(area.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startBounds = { ...area.bounds };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      // 500px is the hardcoded canvas width right now in CSS
      const deltaX = ((moveEvent.clientX - startX) / 500) * (100 / zoom);
      const deltaY = ((moveEvent.clientY - startY) / 500) * (100 / zoom);

      let snapX = startBounds.x + deltaX;
      let snapY = startBounds.y + deltaY;

      // Basic snap-to-grid logic (10% increments)
      if (snapToGrid) {
        snapX = Math.round(snapX / 10) * 10;
        snapY = Math.round(snapY / 10) * 10;
      }

      handleBoundsChange(area.id, {
        ...startBounds,
        x: snapX,
        y: snapY
      });
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  if (!activeSet) return <div>Loading...</div>;

  return (
    <div className={styles.studioContainer}>
      
      {/* LEFT PANEL: Hierarchy (Sets, Locations) */}
      <div className={styles.leftPanel}>
        <div className={styles.panelSection}>
          <h4 className={styles.panelTitle}>Mockup Sets</h4>
          <select 
            value={activeSet.id} 
            onChange={(e) => setActiveSetId(e.target.value)}
            className={styles.selectInput}
          >
            {mockupSets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className={styles.secondaryBtn} style={{ marginTop: '8px', width: '100%' }}>
            <FiPlus /> Add Mockup Set
          </button>
        </div>

        <div className={styles.panelSection}>
          <div className={styles.panelHeaderRow}>
            <h4 className={styles.panelTitle}>Print Locations</h4>
            <button className={styles.iconBtn} onClick={addLocation} title="Add Location"><FiPlus /></button>
          </div>
          
          <ul className={styles.hierarchyList}>
            {activeSet.locations.map(loc => (
              <li 
                key={loc.id} 
                className={`${styles.hierarchyItem} ${loc.id === activeLocationId ? styles.active : ''}`}
                onClick={() => setActiveLocationId(loc.id)}
              >
                {loc.name}
              </li>
            ))}
            {activeSet.locations.length === 0 && (
              <p className={styles.emptyText}>No locations. Add one!</p>
            )}
          </ul>
        </div>

        {activeLocation && (
          <div className={styles.panelSection}>
            <div className={styles.panelHeaderRow}>
              <h4 className={styles.panelTitle}>Layers (Areas)</h4>
              <button className={styles.iconBtn} onClick={addPrintArea} title="Add Area"><FiPlus /></button>
            </div>
            
            <ul className={styles.layerList}>
              {activeLocation.printAreas.map(area => (
                <li 
                  key={area.id} 
                  className={`${styles.layerItem} ${area.id === activeAreaId ? styles.active : ''}`}
                  onClick={() => setActiveAreaId(area.id)}
                >
                  <div className={styles.layerName}>{area.name}</div>
                  <div className={styles.layerActions}>
                    <button className={styles.iconBtnMicro} onClick={(e) => { e.stopPropagation(); updateArea(activeSet.id, activeLocation.id, area.id, { isVisible: !area.isVisible }); }}>
                      {area.isVisible === false ? <FiEyeOff /> : <FiEye />}
                    </button>
                    <button className={styles.iconBtnMicro} onClick={(e) => { e.stopPropagation(); updateArea(activeSet.id, activeLocation.id, area.id, { isLocked: !area.isLocked }); }}>
                      {area.isLocked ? <FiLock /> : <FiUnlock />}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* CENTER: Canvas Editor */}
      <div className={styles.centerCanvasWrapper}>
        <div className={styles.toolbar}>
          <div className={styles.toolGroup}>
            <button className={styles.toolBtn} onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}><FiZoomOut /></button>
            <span className={styles.zoomText}>{Math.round(zoom * 100)}%</span>
            <button className={styles.toolBtn} onClick={() => setZoom(z => Math.min(3, z + 0.2))}><FiZoomIn /></button>
          </div>
          <div className={styles.toolGroup}>
            <button className={`${styles.toolBtn} ${showGrid ? styles.active : ''}`} onClick={() => setShowGrid(!showGrid)} title="Toggle Grid"><FiGrid /></button>
            <button className={`${styles.toolBtn} ${snapToGrid ? styles.active : ''}`} onClick={() => setSnapToGrid(!snapToGrid)} title="Snap to Grid">Snap</button>
          </div>
          <div className={styles.toolGroup}>
            <select value={unit} onChange={(e) => setUnit(e.target.value as any)} className={styles.unitSelect}>
              <option value="mm">mm</option>
              <option value="in">inches</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>

        <div className={styles.canvasContainer} onPointerDown={handleCanvasPointerDown} style={{ cursor: 'grab' }}>
          {activeLocation ? (
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
              <div 
                className={styles.mockupCanvas} 
                ref={canvasRef}
                style={{ 
                  transform: `scale(${zoom})`,
                  backgroundImage: showGrid ? 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)' : 'none',
                  backgroundSize: '10% 10%'
                }}
              >
                {/* Render Mockup Base Image */}
              {activeLocation.baseImage.storagePath || activeLocation.baseImage.previewUrl ? (
                <img 
                  src={activeLocation.baseImage.previewUrl || activeLocation.baseImage.storagePath} 
                  alt="Mockup" 
                  className={styles.mockupBg} 
                  draggable={false}
                />
              ) : (
                <div className={styles.noImagePlaceholder}>No Base Image Uploaded</div>
              )}

              {/* Render Print Areas as interactive bounding boxes */}
              {activeLocation.printAreas.map(area => {
                if (area.isVisible === false) return null;
                const isSelected = area.id === activeAreaId;
                
                return (
                  <div
                    key={area.id}
                    className={`${styles.boundingBox} ${isSelected ? styles.selected : ''} ${area.isLocked ? styles.locked : ''}`}
                    style={{
                      left: `${area.bounds.x}%`,
                      top: `${area.bounds.y}%`,
                      width: `${area.bounds.width}%`,
                      height: `${area.bounds.height}%`,
                      transform: `rotate(${area.bounds.rotation}deg)`
                    }}
                    onPointerDown={(e) => handlePointerDown(e, area)}
                  >
                    <div className={styles.shapeMask} style={getShapeStyle(area.shape)}></div>
                    {editingAreaId === area.id ? (
                      <input 
                        type="text" 
                        autoFocus
                        defaultValue={area.name} 
                        className={styles.boxLabel} 
                        style={{ border: 'none', outline: 'none', background: 'rgba(255,255,255,0.9)', color: 'black', pointerEvents: 'auto' }}
                        onBlur={(e) => {
                          updateArea(activeSet.id, activeLocation.id, area.id, { name: e.target.value });
                          setEditingAreaId('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateArea(activeSet.id, activeLocation.id, area.id, { name: e.currentTarget.value });
                            setEditingAreaId('');
                          }
                        }}
                        onPointerDown={e => e.stopPropagation()}
                      />
                    ) : (
                      <span 
                        className={styles.boxLabel} 
                        style={{ pointerEvents: 'auto', cursor: 'text' }}
                        onDoubleClick={(e) => { e.stopPropagation(); setEditingAreaId(area.id); }}
                      >
                        {area.name}
                      </span>
                    )}
                    {isSelected && !area.isLocked && (
                      <>
                        <div className={`${styles.handle} ${styles.tl}`} onPointerDown={(e) => handleResizeDown(e, area, 'tl')}></div>
                        <div className={`${styles.handle} ${styles.tr}`} onPointerDown={(e) => handleResizeDown(e, area, 'tr')}></div>
                        <div className={`${styles.handle} ${styles.bl}`} onPointerDown={(e) => handleResizeDown(e, area, 'bl')}></div>
                        <div className={`${styles.handle} ${styles.br}`} onPointerDown={(e) => handleResizeDown(e, area, 'br')}></div>
                        <div className={styles.rotator}><FiRotateCw size={12} /></div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          ) : (
            <div className={styles.emptyState}>Select or create a Print Location to begin editing.</div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Properties */}
      <div className={styles.rightPanel}>
        {activeArea ? (
          <div className={styles.propertiesPanel}>
            <h4 className={styles.panelTitle}>Area Properties</h4>
            
            <div className={styles.propGroup}>
              <label>Name (Internal)</label>
              <input 
                type="text" 
                value={activeArea.name} 
                onChange={e => updateArea(activeSet.id, activeLocation!.id, activeArea.id, { name: e.target.value })}
                className={styles.input}
              />
            </div>
            
            <div className={styles.propGroup}>
              <label>Label (Storefront)</label>
              <input 
                type="text" 
                value={activeArea.label} 
                onChange={e => updateArea(activeSet.id, activeLocation!.id, activeArea.id, { label: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.propGroup}>
              <label>Shape</label>
              <select 
                value={activeArea.shape || 'rectangle'} 
                onChange={e => {
                  const newShape = e.target.value as any;
                  const updates: Partial<PrintArea> = { shape: newShape };
                  if (newShape === 'circle') {
                    // Force square bounds so the circle looks perfect
                    const side = Math.max(activeArea.bounds.width, activeArea.bounds.height);
                    updates.bounds = { ...activeArea.bounds, width: side, height: side };
                  }
                  updateArea(activeSet.id, activeLocation!.id, activeArea.id, updates);
                }}
                className={styles.input}
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="ellipse">Ellipse</option>
                <option value="triangle">Triangle</option>
                <option value="hexagon">Hexagon</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>

            <div className={styles.propHeader}>Dimensions ({unit})</div>
            <div className={styles.grid2Col}>
              <div className={styles.propGroup}>
                <label>X Pos</label>
                <input type="number" disabled={activeArea.isLocked} value={toDisplayUnit(activeArea.bounds.x, activeLocation?.physicalWidthMm)} onChange={e => handleDimensionChange(activeArea.id, 'x', e.target.value)} className={styles.input} />
              </div>
              <div className={styles.propGroup}>
                <label>Y Pos</label>
                <input type="number" disabled={activeArea.isLocked} value={toDisplayUnit(activeArea.bounds.y, activeLocation?.physicalWidthMm)} onChange={e => handleDimensionChange(activeArea.id, 'y', e.target.value)} className={styles.input} />
              </div>
              <div className={styles.propGroup}>
                <label>Width</label>
                <input type="number" disabled={activeArea.isLocked} value={toDisplayUnit(activeArea.bounds.width, activeLocation?.physicalWidthMm)} onChange={e => handleDimensionChange(activeArea.id, 'width', e.target.value)} className={styles.input} />
              </div>
              <div className={styles.propGroup}>
                <label>Height</label>
                <input type="number" disabled={activeArea.isLocked} value={toDisplayUnit(activeArea.bounds.height, activeLocation?.physicalWidthMm)} onChange={e => handleDimensionChange(activeArea.id, 'height', e.target.value)} className={styles.input} />
              </div>
            </div>

            <div className={styles.propHeader}>Advanced Rules</div>
            
            <div className={styles.propGroup}>
              <label>Recommended DPI</label>
              <input 
                type="number" 
                value={activeArea.recommendedDpi} 
                onChange={e => updateArea(activeSet.id, activeLocation!.id, activeArea.id, { recommendedDpi: Number(e.target.value) })}
                className={styles.input}
              />
            </div>

            <div className={styles.toggleGroup}>
              <label><input type="checkbox" checked={activeArea.allowImages ?? true} onChange={e => updateArea(activeSet.id, activeLocation!.id, activeArea.id, { allowImages: e.target.checked })} /> Allow Images</label>
              <label><input type="checkbox" checked={activeArea.allowText ?? true} onChange={e => updateArea(activeSet.id, activeLocation!.id, activeArea.id, { allowText: e.target.checked })} /> Allow Text</label>
              <label><input type="checkbox" checked={activeArea.lockAspectRatio ?? false} onChange={e => updateArea(activeSet.id, activeLocation!.id, activeArea.id, { lockAspectRatio: e.target.checked })} /> Lock Aspect Ratio</label>
              <label><input type="checkbox" checked={activeArea.allowRotation ?? true} onChange={e => updateArea(activeSet.id, activeLocation!.id, activeArea.id, { allowRotation: e.target.checked })} /> Allow Rotation</label>
              <label><input type="checkbox" checked={activeArea.allowFlip ?? true} onChange={e => updateArea(activeSet.id, activeLocation!.id, activeArea.id, { allowFlip: e.target.checked })} /> Allow Flip</label>
            </div>

            <div className={styles.grid2Col} style={{ marginTop: '16px' }}>
              <div className={styles.propGroup}>
                <label>Max Layers</label>
                <input 
                  type="number" 
                  value={activeArea.maxLayers || 1} 
                  onChange={e => updateArea(activeSet.id, activeLocation!.id, activeArea.id, { maxLayers: Number(e.target.value) })}
                  className={styles.input}
                />
              </div>
              <div className={styles.propGroup}>
                <label>Default Scale (%)</label>
                <input 
                  type="number" 
                  value={activeArea.defaultScale || 100} 
                  onChange={e => updateArea(activeSet.id, activeLocation!.id, activeArea.id, { defaultScale: Number(e.target.value) })}
                  className={styles.input}
                />
              </div>
              <div className={styles.propGroup}>
                <label>Min Scale (%)</label>
                <input 
                  type="number" 
                  value={activeArea.minScale || 10} 
                  onChange={e => updateArea(activeSet.id, activeLocation!.id, activeArea.id, { minScale: Number(e.target.value) })}
                  className={styles.input}
                />
              </div>
              <div className={styles.propGroup}>
                <label>Max Scale (%)</label>
                <input 
                  type="number" 
                  value={activeArea.maxScale || 300} 
                  onChange={e => updateArea(activeSet.id, activeLocation!.id, activeArea.id, { maxScale: Number(e.target.value) })}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.propGroup} style={{ marginTop: '24px' }}>
              <button 
                className={styles.dangerBtn}
                onClick={() => {
                  updateLocation(activeSet.id, activeLocation!.id, {
                    printAreas: activeLocation!.printAreas.filter(a => a.id !== activeArea.id)
                  });
                  setActiveAreaId('');
                }}
              >
                <FiTrash2 /> Delete Area
              </button>
            </div>

          </div>
        ) : activeLocation ? (
          <div className={styles.propertiesPanel}>
            <h4 className={styles.panelTitle}>Location Properties</h4>
            <div className={styles.propGroup}>
              <label>Location Name</label>
              <input 
                type="text" 
                value={activeLocation.name} 
                onChange={e => updateLocation(activeSet.id, activeLocation.id, { name: e.target.value })}
                className={styles.input}
              />
            </div>
            
            <div className={styles.propGroup}>
              <label>Physical Canvas Width (mm)</label>
              <input 
                type="number" 
                value={activeLocation.physicalWidthMm || 0} 
                onChange={e => updateLocation(activeSet.id, activeLocation.id, { physicalWidthMm: Number(e.target.value) })}
                className={styles.input}
                placeholder="e.g. 500 for a 50cm shirt"
              />
              <p className={styles.helperText} style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Used to convert % bounds into real mm for production.</p>
            </div>

            <div className={styles.propGroup}>
              <label>Base Mockup Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    updateLocation(activeSet.id, activeLocation.id, {
                      baseImage: {
                        id: `img_${Date.now()}`,
                        storagePath: '',
                        file: file,
                        previewUrl: URL.createObjectURL(file),
                        type: 'mockup'
                      }
                    });
                  }
                }}
                className={styles.input}
              />
              <p className={styles.helperText} style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Recommended: 2000x2000px (1:1 ratio, High Res JPEG/PNG).</p>
            </div>
          </div>
        ) : (
          <div className={styles.emptyStateMicro}>Select an element to view properties.</div>
        )}
      </div>

    </div>
  );
}
