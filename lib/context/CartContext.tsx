'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export interface CartItem {
  id: string; // unique item id in cart (e.g., variantId + customization hash)
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  quantity: number;
  customization?: any;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Partial<CartItem> & { name: string; price: number }) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  totalSavings: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');

  // 1. Establish Session/Auth ID and merge guest cart on login
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const guestSid = localStorage.getItem('guest_session_id');
        setSessionId(user.uid);

        // Merge guest cart into user cart if guest session exists
        if (guestSid) {
          try {
            const guestCartRef = doc(db, 'carts', guestSid);
            const guestSnap = await getDoc(guestCartRef);
            if (guestSnap.exists()) {
              const guestItems: CartItem[] = guestSnap.data().items || [];
              if (guestItems.length > 0) {
                // Load user's existing cart
                const userCartRef = doc(db, 'carts', user.uid);
                const userSnap = await getDoc(userCartRef);
                const userItems: CartItem[] = userSnap.exists() ? (userSnap.data().items || []) : [];

                // Merge: add guest items that don't already exist in user cart
                const mergedItems = [...userItems];
                for (const guestItem of guestItems) {
                  const exists = mergedItems.some(i => i.id === guestItem.id);
                  if (!exists) {
                    mergedItems.push(guestItem);
                  }
                }

                // Save merged cart to user's cart
                const sanitized = JSON.parse(JSON.stringify(mergedItems));
                await setDoc(userCartRef, { items: sanitized, updatedAt: new Date().toISOString() }, { merge: true });
                setItems(mergedItems);
              }
            }
            // Clear guest session
            localStorage.removeItem('guest_session_id');
          } catch (err) {
            console.error('Error merging guest cart:', err);
          }
        }
      } else {
        // Fallback to guest session
        let sid = localStorage.getItem('guest_session_id');
        if (!sid) {
          sid = 'guest_' + Math.random().toString(36).substring(2, 15);
          localStorage.setItem('guest_session_id', sid);
        }
        setSessionId(sid);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Load Cart from Firestore when session changes
  useEffect(() => {
    if (!sessionId) return;
    
    const loadCart = async () => {
      setIsLoading(true);
      try {
        const cartRef = doc(db, 'carts', sessionId);
        const snap = await getDoc(cartRef);
        if (snap.exists()) {
          setItems(snap.data().items || []);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Failed to load cart from cloud', err);
      }
      setIsLoading(false);
    };
    
    loadCart();
  }, [sessionId]);

  // Sync to Firestore helper
  const syncToCloud = async (newItems: CartItem[]) => {
    if (!sessionId) return;
    try {
      // JSON serialization strips out any 'undefined' properties which Firestore rejects
      const sanitizedItems = JSON.parse(JSON.stringify(newItems));
      const cartRef = doc(db, 'carts', sessionId);
      await setDoc(cartRef, {
        items: sanitizedItems,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error('Error syncing cart to Firestore:', err);
    }
  };

  const addToCart = useCallback(async (item: Partial<CartItem> & { name: string; price: number }) => {
    const safeItem: CartItem = {
      id: item.id || item.variantId || item.name,
      productId: item.productId || item.id || item.name,
      variantId: item.variantId || item.id || 'default',
      sku: item.sku || '',
      name: item.name || 'Product',
      price: item.price || 0,
      originalPrice: item.originalPrice,
      image: item.image || '',
      category: item.category || 'General',
      quantity: item.quantity || 1,
      ...(item.customization ? { customization: item.customization } : {}),
    };

    setItems(prev => {
      // Create a unique hash for the cart item so identical items stack, but different customizations stay separate
      const customizationHash = safeItem.customization ? JSON.stringify(safeItem.customization) : '';
      const cartItemId = `${safeItem.variantId}_${customizationHash}`;
      
      const existing = prev.find(i => i.id === cartItemId);
      let newItems;
      if (existing) {
        newItems = prev.map(i => i.id === cartItemId ? { ...i, quantity: i.quantity + safeItem.quantity } : i);
      } else {
        newItems = [...prev, { ...safeItem, id: cartItemId }];
      }
      
      syncToCloud(newItems);
      return newItems;
    });
    setIsCartOpen(true);
  }, [sessionId]);

  const removeFromCart = useCallback(async (id: string) => {
    setItems(prev => {
      const newItems = prev.filter(i => i.id !== id);
      syncToCloud(newItems);
      return newItems;
    });
  }, [sessionId]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    setItems(prev => {
      let newItems;
      if (quantity <= 0) {
        newItems = prev.filter(i => i.id !== id);
      } else {
        newItems = prev.map(i => i.id === id ? { ...i, quantity } : i);
      }
      syncToCloud(newItems);
      return newItems;
    });
  }, [sessionId]);

  const clearCart = useCallback(async () => {
    setItems([]);
    if (sessionId) {
      await setDoc(doc(db, 'carts', sessionId), { items: [], updatedAt: new Date().toISOString() });
    }
  }, [sessionId]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSavings = 0;

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      totalSavings,
      isCartOpen,
      setIsCartOpen,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
