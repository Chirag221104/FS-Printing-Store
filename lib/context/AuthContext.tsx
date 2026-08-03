'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// ─── Types ──────────────────────────────────────────────
export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phone: string;
  role: UserRole;
  addresses: UserAddress[];
  createdAt: any;
  updatedAt: any;
}

export interface UserAddress {
  id: string;
  label: string;      // e.g., "Home", "Office"
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

// ─── Helper: Get user role ─────────────────────────────
// Currently reads from Firestore. To migrate to Custom Claims later,
// replace this function body with:
//   const token = await user.getIdTokenResult();
//   return (token.claims.role as UserRole) || 'customer';
async function getUserRole(uid: string): Promise<UserRole> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return (userDoc.data().role as UserRole) || 'customer';
    }
  } catch (err) {
    console.error('Error fetching user role:', err);
  }
  return 'customer';
}

// ─── Helper: Create or update user document ─────────────
async function ensureUserDocument(user: User, extraData?: Partial<UserProfile>): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const existing = await getDoc(userRef);

  if (existing.exists()) {
    // User doc exists — return existing data merged with any updates
    const data = existing.data() as UserProfile;
    return { ...data, uid: user.uid };
  }

  // First-time sign-up: create the user document
  const newProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: extraData?.displayName || user.displayName || '',
    photoURL: user.photoURL || null,
    phone: '',
    role: 'customer', // Default role; admins are promoted manually
    addresses: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, JSON.parse(JSON.stringify({
    ...newProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })));

  return newProfile;
}

// ─── Provider ───────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived state
  const isAdmin = profile?.role === 'admin';

  // Fetch full profile from Firestore
  const fetchProfile = useCallback(async (firebaseUser: User) => {
    try {
      const userProfile = await ensureUserDocument(firebaseUser);
      setProfile(userProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [fetchProfile]);

  // ─── Auth Methods ───────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await fetchProfile(credential.user);
  }, [fetchProfile]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    // Set display name on Firebase Auth profile
    await updateProfile(credential.user, { displayName });
    // Create Firestore user doc
    await ensureUserDocument(credential.user, { displayName });
    await fetchProfile(credential.user);
  }, [fetchProfile]);

  const signInWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserDocument(result.user);
    await fetchProfile(result.user);
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  }, []);

  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');
    const userRef = doc(db, 'users', user.uid);
    const sanitized = JSON.parse(JSON.stringify({
      ...data,
      updatedAt: serverTimestamp(),
    }));
    await setDoc(userRef, sanitized, { merge: true });
    await fetchProfile(user);
  }, [user, fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user);
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      isAdmin,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      updateUserProfile,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
