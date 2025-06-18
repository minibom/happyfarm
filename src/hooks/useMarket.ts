
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react'; // Added useCallback
import { db } from '@/lib/firebase';
import { doc, onSnapshot, type DocumentData } from 'firebase/firestore';
import type { MarketState, MarketPriceData, MarketPriceChange, MarketEventData, MarketItemId, CropDetails, CropId } from '@/types';
import { INITIAL_MARKET_STATE, CROP_DATA } from '@/lib/constants'; // Assuming CROP_DATA holds base item details

export interface MarketData {
  prices: MarketPriceData;
  priceChanges: MarketPriceChange;
  currentEvent: MarketEventData | null;
  lastUpdated: number;
  loading: boolean;
  error: Error | null;
  getItemDetails: (itemId: MarketItemId) => ({ name: string, icon: string, basePrice: number, type: 'seed' | 'crop', unlockTier: number }) | null;
}

export const useMarket = (): MarketData => {
  const [marketState, setMarketState] = useState<MarketState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const marketDocRef = doc(db, 'marketState', 'global');
    const unsubscribe = onSnapshot(
      marketDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as MarketState;
          // Ensure all fields are present, falling back to initial if not
          const validatedPrices = { ...INITIAL_MARKET_STATE.prices, ...(data.prices || {}) };
          const validatedPriceChanges = { ...INITIAL_MARKET_STATE.priceChanges, ...(data.priceChanges || {}) };
          
          setMarketState({
            prices: validatedPrices,
            priceChanges: validatedPriceChanges,
            currentEvent: data.currentEvent || INITIAL_MARKET_STATE.currentEvent,
            lastUpdated: data.lastUpdated || INITIAL_MARKET_STATE.lastUpdated,
          });
        } else {
          // Document doesn't exist, use initial state
          // This could be a good place to *create* the initial document if desired,
          // but for now, we'll just use the client-side initial state.
          console.warn("Market state document '/marketState/global' does not exist. Using initial default state.");
          setMarketState(INITIAL_MARKET_STATE);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching market state:", err);
        setError(err);
        setMarketState(INITIAL_MARKET_STATE); // Fallback on error
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getItemDetails = useCallback((itemId: MarketItemId): ({ name: string, icon: string, basePrice: number, type: 'seed' | 'crop', unlockTier: number }) | null => {
    const isSeed = itemId.endsWith('Seed');
    const cropId = isSeed ? itemId.replace('Seed', '') as CropId : itemId as CropId;
    const cropDetail: CropDetails | undefined = CROP_DATA[cropId];

    if (!cropDetail) return null;

    return {
      name: isSeed ? `${cropDetail.name} (Hạt)` : cropDetail.name,
      icon: cropDetail.icon,
      basePrice: isSeed ? cropDetail.seedPrice : cropDetail.cropPrice,
      type: isSeed ? 'seed' : 'crop',
      unlockTier: cropDetail.unlockTier,
    };
  }, []);


  return {
    prices: marketState?.prices || INITIAL_MARKET_STATE.prices,
    priceChanges: marketState?.priceChanges || INITIAL_MARKET_STATE.priceChanges,
    currentEvent: marketState?.currentEvent || INITIAL_MARKET_STATE.currentEvent,
    lastUpdated: marketState?.lastUpdated || INITIAL_MARKET_STATE.lastUpdated,
    loading,
    error,
    getItemDetails,
  };
};

