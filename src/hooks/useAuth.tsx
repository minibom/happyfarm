
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import type { User as FirebaseUser, AuthError } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { GameState } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userId: string | null;
  loading: boolean;
  error: AuthError | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  initialGameState?: GameState;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [initialGameState, setInitialGameState] = useState<GameState | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Set loading true at the start of auth state change
      if (firebaseUser) {
        setUser(firebaseUser);
        setUserId(firebaseUser.uid);
        setError(null);
        // If logged-in user is on login or register page, redirect to game page
        if (pathname === '/login' || pathname === '/register') {
          router.push('/game');
        }
      } else {
        setUser(null);
        setUserId(null);
        // If not logged in, and tries to access /game or /admin, redirect to login
        // The landing page (/) is public.
        // Admin layout handles its own more specific admin role check.
        if (pathname === '/game' || pathname.startsWith('/admin')) {
          router.push('/login');
        }
      }
      setLoading(false); // Set loading false after processing
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle user state and redirect
    } catch (e) {
      setError(e as AuthError);
      setLoading(false); // Ensure loading is false on error
      throw e;
    }
    // No setLoading(false) here, onAuthStateChanged will do it
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle user state and redirect
    } catch (e) {
      setError(e as AuthError);
      setLoading(false); // Ensure loading is false on error
      throw e;
    }
    // No setLoading(false) here, onAuthStateChanged will do it
  };

  const logOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      setInitialGameState(undefined); // Reset initial game state on logout
      // onAuthStateChanged will handle user state and redirect to /login if necessary
    } catch (e) {
      setError(e as AuthError);
    } finally {
      // setLoading(false) will be handled by onAuthStateChanged
    }
  };

  const value = { user, userId, loading, error, signUp, signIn, logOut, initialGameState };

  return (<AuthContext.Provider value={value}>{children}</AuthContext.Provider>);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
