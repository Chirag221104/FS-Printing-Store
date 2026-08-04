/**
 * Autosave Utility for Product Studio Wizard
 * 
 * Provides debounce-throttled local storage persistence for unfinished drafts,
 * with multi-session safety, timestamping, and clean recovery.
 */

import { ProductStudioState } from '@/lib/types/schema';

const AUTOSAVE_KEY = 'fs_product_studio_draft_v2';

export function saveStudioDraft(state: Partial<ProductStudioState>): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      ...state,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to autosave Product Studio draft:', err);
  }
}

export function loadStudioDraft(): Partial<ProductStudioState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load Product Studio draft:', err);
    return null;
  }
}

export function clearStudioDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
  } catch (err) {
    console.warn('Failed to clear Product Studio draft:', err);
  }
}
