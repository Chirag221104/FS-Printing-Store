import { useState, useCallback, useRef, useEffect } from 'react';

export interface TransformState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

export interface DesignEditorProps {
  initialState?: Partial<TransformState>;
  state?: TransformState;
  setState?: (state: TransformState | ((prev: TransformState) => TransformState)) => void;
  bounds: { width: number; height: number }; // The printable area container dimensions
  contentBounds: { width: number; height: number }; // The artwork dimensions
  constraints?: {
    minScale?: number;
    maxScale?: number;
    allowRotation?: boolean;
    allowFlip?: boolean;
    lockAspectRatio?: boolean;
  };
}

export function useDesignEditor({ initialState, state: externalState, setState: externalSetState, bounds, contentBounds, constraints }: DesignEditorProps) {
  const defaultState: TransformState = {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    flipX: false,
    flipY: false,
    ...initialState
  };

  const [internalState, setInternalState] = useState<TransformState>(defaultState);
  const state = externalState || internalState;
  
  const setActualState = useCallback((newStateOrUpdater: TransformState | ((prev: TransformState) => TransformState)) => {
    if (externalSetState) {
      externalSetState(newStateOrUpdater);
    } else {
      setInternalState(newStateOrUpdater);
    }
  }, [externalSetState]);

  const [history, setHistory] = useState<TransformState[]>([state]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const stateStart = useRef({ x: 0, y: 0 });

  // Add state to history for undo/redo
  const commitHistory = useCallback((newState: TransformState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setActualState(history[historyIndex - 1]);
    }
  }, [history, historyIndex, setActualState]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setActualState(history[historyIndex + 1]);
    }
  }, [history, historyIndex, setActualState]);

  const reset = useCallback(() => {
    setActualState(defaultState);
    commitHistory(defaultState);
  }, [defaultState, commitHistory, setActualState]);

  const constrainPosition = useCallback((newX: number, newY: number, currentScale: number) => {
    if (!bounds.width || !bounds.height || !contentBounds.width || !contentBounds.height) return { x: newX, y: newY };
    
    // Calculate the scaled dimensions of the artwork
    const scaledWidth = contentBounds.width * currentScale;
    const scaledHeight = contentBounds.height * currentScale;
    
    // The bounds are centered at (0,0) in our coordinate system
    // Calculate the maximum allowed translation so the artwork doesn't leave the bounds
    const maxX = Math.max(0, (bounds.width - scaledWidth) / 2);
    const maxY = Math.max(0, (bounds.height - scaledHeight) / 2);
    
    return {
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY))
    };
  }, [bounds, contentBounds]);

  const onPointerDown = useCallback((e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    dragStart.current = { x: clientX, y: clientY };
    stateStart.current = { x: state.x, y: state.y };
  }, [state]);

  const onPointerMove = useCallback((e: React.PointerEvent | React.TouchEvent | React.MouseEvent | Event) => {
    if (!isDragging) return;
    
    let clientX, clientY;
    if ('touches' in e) {
      // @ts-ignore
      clientX = e.touches[0].clientX;
      // @ts-ignore
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    const deltaX = clientX - dragStart.current.x;
    const deltaY = clientY - dragStart.current.y;

    const newX = stateStart.current.x + deltaX;
    const newY = stateStart.current.y + deltaY;

    // Apply constraints dynamically while dragging
    const constrained = constrainPosition(newX, newY, state.scale);
    
    setActualState((prev: TransformState) => ({ ...prev, x: constrained.x, y: constrained.y }));
  }, [isDragging, state.scale, constrainPosition, setActualState]);

  const onPointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      commitHistory(state);
    }
  }, [isDragging, state, commitHistory]);

  const onWheel = useCallback((e: React.WheelEvent | WheelEvent) => {
    // Only prevent default if we can, React synthetic events might not allow it on passive listeners
    if (e.cancelable) {
      e.preventDefault();
    }
    const deltaY = 'deltaY' in e ? e.deltaY : 0;
    const scaleAdjust = deltaY > 0 ? 0.9 : 1.1; // Zoom out or zoom in
    
    let newScale = state.scale * scaleAdjust;
    const minScale = constraints?.minScale ? constraints.minScale / 100 : 0.1;
    const maxScale = constraints?.maxScale ? constraints.maxScale / 100 : 3.0;
    
    newScale = Math.max(minScale, Math.min(maxScale, newScale));
    
    const constrained = constrainPosition(state.x, state.y, newScale);
    
    const newState = { ...state, scale: newScale, x: constrained.x, y: constrained.y };
    setActualState(newState);
    
    // We should probably debounce commitHistory for wheel events so we don't spam the history,
    // but for now, simple implementation.
  }, [state, constraints, constrainPosition, setActualState]);

  // Set up global event listeners for move/up to allow dragging outside the element
  useEffect(() => {
    const handleMove = (e: Event) => onPointerMove(e);
    const handleUp = () => onPointerUp();
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [onPointerMove, onPointerUp]);

  return {
    state,
    setState: setActualState,
    isDragging,
    onPointerDown,
    onWheel,
    undo,
    redo,
    reset,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
}
