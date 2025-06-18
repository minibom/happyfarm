
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
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Added serverTimestamp
import type { GameState } from '@/types';
import { INITIAL_GAME_STATE } from '@/lib/constants';
import { generateDisplayName } from '@/ai/flows/generate-display-name';
import { useToast } from './use-toast';


interface AuthContextType {
  user: FirebaseUser | null;
  userId: string | null;
  loading: boolean;
  error: AuthError | null;
  signUp: (email: string, password: string, optionalDisplayNameFromForm?: string) => Promise<void>;
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
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        setUserId(firebaseUser.uid);
        setError(null);

        // Update lastLogin for the top-level user document
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
        } catch (e) {
          console.error("Failed to update lastLogin for user:", e);
          // Non-critical error, app can continue
        }

        if (pathname === '/login' || pathname === '/register') {
          router.push('/game');
        }
      } else {
        setUser(null);
        setUserId(null);
        if (pathname === '/game' || pathname.startsWith('/admin') || pathname.startsWith('/library')) {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const signUp = async (email: string, password: string, optionalDisplayNameFromForm?: string) => {
    setLoading(true);
    setError(null);
    try {
      let finalDisplayName = optionalDisplayNameFromForm?.trim() || '';
      if (!finalDisplayName) {
        toast({ title: "Đang Tạo Tên AI...", description: "Vui lòng đợi trong khi AI tạo tên cho bạn.", duration: 3000});
        try {
            const aiNameOutput = await generateDisplayName();
            finalDisplayName = aiNameOutput.displayName;
            toast({ title: "Tên AI Đã Tạo!", description: `Tên của bạn là: ${finalDisplayName}`, className: "bg-accent text-accent-foreground" });
        } catch (aiError) {
            console.error("AI name generation failed:", aiError);
            finalDisplayName = email.split('@')[0] || `Farmer${Date.now().toString().slice(-4)}`; // Fallback name
            toast({ title: "Lỗi Tạo Tên AI", description: `Sử dụng tên tạm: ${finalDisplayName}`, variant: "destructive" });
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const userEmail = userCredential.user.email;

      // Create GameState in subcollection
      const initialGs: GameState = {
        ...INITIAL_GAME_STATE,
        inventory: { ...INITIAL_GAME_STATE.inventory }, 
        plots: INITIAL_GAME_STATE.plots.map(p => ({ ...p })), 
        email: userEmail || undefined,
        displayName: finalDisplayName,
        lastLogin: Date.now(), // Use client-side timestamp for initial GameState consistency
        lastUpdate: Date.now(),
        status: 'active',
        unlockedPlotsCount: INITIAL_GAME_STATE.unlockedPlotsCount,
      };
      
      const gameDocRef = doc(db, 'users', uid, 'gameState', 'data');
      await setDoc(gameDocRef, initialGs);

      // Create top-level user document for admin querying
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, {
        email: userEmail,
        displayName: finalDisplayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(), 
        uid: uid, // Often useful to have uid also in the document
      });

    } catch (e) {
      setError(e as AuthError);
      setLoading(false);
      throw e;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // onAuthStateChanged will handle updating lastLogin for the top-level doc
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(e as AuthError);
      setLoading(false);
      throw e;
    }
  };

  const logOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      setInitialGameState(undefined);
    } catch (e) {
      setError(e as AuthError);
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
