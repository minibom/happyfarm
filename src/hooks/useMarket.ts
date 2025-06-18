
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, Timestamp } from 'firebase/firestore';
import type { MarketState, MarketPriceData, MarketPriceChange, MarketEventData, MarketItemId, CropDetails, CropId, FertilizerId, FertilizerDetails, ActiveGameEvent } from '@/types';
import { INITIAL_MARKET_STATE, CROP_DATA, FERTILIZER_DATA, ALL_SEED_IDS, ALL_CROP_IDS, ALL_FERTILIZER_IDS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast'; // Added useToast

export interface MarketData {
  prices: MarketPriceData; // Prices after AI adjustment but BEFORE live events
  priceChanges: MarketPriceChange; // AI-driven price changes
  activeMarketEvents: ActiveGameEvent[]; // Live game events affecting the market
  currentEvent: MarketEventData | null; // Legacy event from marketState/global
  lastUpdated: number;
  loading: boolean;
  error: Error | null;
  getItemDetails: (itemId: MarketItemId) => ({ name: string, icon: string, basePrice: number, type: 'seed' | 'crop' | 'fertilizer', unlockTier: number, effectivePrice: number }) | null;
}

export const useMarket = (): MarketData => {
  const [marketState, setMarketState] = useState<MarketState | null>(null);
  const [activeMarketEvents, setActiveMarketEvents] = useState<ActiveGameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const marketDocRef = doc(db, 'marketState', 'global');
    const unsubscribeMarketState = onSnapshot(
      marketDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as MarketState;
          const validatedPrices = { ...INITIAL_MARKET_STATE.prices, ...(data.prices || {}) };
          const validatedPriceChanges = { ...INITIAL_MARKET_STATE.priceChanges, ...(data.priceChanges || {}) };
          setMarketState({
            prices: validatedPrices,
            priceChanges: validatedPriceChanges,
            currentEvent: data.currentEvent || INITIAL_MARKET_STATE.currentEvent,
            lastUpdated: data.lastUpdated || INITIAL_MARKET_STATE.lastUpdated,
          });
        } else {
          console.warn("Market state document '/marketState/global' does not exist. Using initial default state.");
          setMarketState(INITIAL_MARKET_STATE);
        }
        // Keep loading true until events also load or fail
      },
      (err) => {
        console.error("Error fetching market state:", err);
        setError(err);
        setMarketState(INITIAL_MARKET_STATE);
        setLoading(false); // Stop loading on error
      }
    );

    const now = Timestamp.now();
    const eventsCollectionRef = collection(db, 'activeGameEvents');
    const q = query(
      eventsCollectionRef,
      where('isActive', '==', true),
      where('startTime', '<=', now)
    );
    const unsubscribeEvents = onSnapshot(q, (snapshot) => {
      const fetchedEvents: ActiveGameEvent[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Omit<ActiveGameEvent, 'id'>;
        if (data.endTime.toMillis() > now.toMillis()) {
          fetchedEvents.push({ id: docSnap.id, ...data });
        }
      });
      setActiveMarketEvents(fetchedEvents);
      setLoading(false); // Stop loading after events are fetched
    }, (eventError) => {
      console.error("Error fetching active market events:", eventError);
      toast({ title: "Lỗi Sự Kiện Chợ", description: "Không thể tải sự kiện chợ.", variant: "destructive" });
      setActiveMarketEvents([]);
      setLoading(false); // Stop loading on error
    });


    return () => {
      unsubscribeMarketState();
      unsubscribeEvents();
    };
  }, [toast]);

  const calculateEffectivePrice = useCallback((
    basePrice: number,
    aiAdjustedPrice: number,
    itemId: MarketItemId,
    itemType: 'seed' | 'crop' | 'fertilizer',
    events: ActiveGameEvent[]
  ): number => {
    let currentPrice = aiAdjustedPrice; // Start with AI adjusted price
    let bestModifier = 1.0;

    const relevantEvents = events.filter(event => {
      const typeMatch = (itemType === 'seed' && event.type === 'ITEM_PURCHASE_PRICE_MODIFIER') ||
                        (itemType === 'crop' && event.type === 'ITEM_SELL_PRICE_MODIFIER') ||
                        (itemType === 'fertilizer' && event.type === 'ITEM_PURCHASE_PRICE_MODIFIER');
      if (!typeMatch) return false;

      const itemMatch = (event.affectedItemIds === `ALL_${itemType.toUpperCase()}S` || // e.g. ALL_SEEDS, ALL_CROPS
                        event.affectedItemIds === 'ALL_FERTILIZERS' && itemType === 'fertilizer') ||
                        (Array.isArray(event.affectedItemIds) && event.affectedItemIds.includes(itemId));
      return itemMatch;
    });

    if (relevantEvents.length > 0) {
      const specificEvents = relevantEvents.filter(event => Array.isArray(event.affectedItemIds));
      const generalEvents = relevantEvents.filter(event => typeof event.affectedItemIds === 'string');

      let finalModifier = 1.0;

      const findBestModifier = (eventList: ActiveGameEvent[], currentBest: number) => {
        return eventList.reduce((best, event) => {
          return (itemType === 'seed' || itemType === 'fertilizer') ? Math.min(best, event.value) : Math.max(best, event.value);
        }, currentBest);
      };

      if (specificEvents.length > 0) {
        finalModifier = findBestModifier(specificEvents, (itemType === 'seed' || itemType === 'fertilizer') ? Infinity : 0);
      } else if (generalEvents.length > 0) {
        finalModifier = findBestModifier(generalEvents, (itemType === 'seed' || itemType === 'fertilizer') ? Infinity : 0);
      }
      
      if ((itemType === 'seed' || itemType === 'fertilizer' ) && finalModifier === Infinity) finalModifier = 1.0;
      if (itemType === 'crop' && finalModifier === 0) finalModifier = 1.0;

      currentPrice *= finalModifier;
    }
    return Math.max(1, Math.round(currentPrice));
  }, []);


  const getItemDetails = useCallback((itemId: MarketItemId): ({ name: string, icon: string, basePrice: number, type: 'seed' | 'crop' | 'fertilizer', unlockTier: number, effectivePrice: number }) | null => {
    let itemDetails;
    let itemType: 'seed' | 'crop' | 'fertilizer';
    let basePrice: number;

    if (ALL_FERTILIZER_IDS.includes(itemId as FertilizerId)) {
        itemDetails = FERTILIZER_DATA[itemId as FertilizerId];
        itemType = 'fertilizer';
        basePrice = itemDetails?.price || 0;
    } else {
        const isSeed = itemId.endsWith('Seed');
        const cropId = isSeed ? itemId.replace('Seed', '') as CropId : itemId as CropId;
        itemDetails = CROP_DATA[cropId];
        itemType = isSeed ? 'seed' : 'crop';
        basePrice = isSeed ? (itemDetails?.seedPrice || 0) : (itemDetails?.cropPrice || 0);
    }

    if (!itemDetails) return null;

    const aiAdjustedPrice = marketState?.prices[itemId] ?? basePrice;
    const effectivePrice = calculateEffectivePrice(basePrice, aiAdjustedPrice, itemId, itemType, activeMarketEvents);

    return {
      name: itemType === 'seed' ? `${itemDetails.name} (Hạt)` : itemDetails.name,
      icon: itemDetails.icon,
      basePrice: basePrice, // The original base price from constants
      type: itemType,
      unlockTier: itemDetails.unlockTier,
      effectivePrice: effectivePrice, // The final price after AI and event adjustments
    };
  }, [marketState?.prices, activeMarketEvents, calculateEffectivePrice]);


  return {
    prices: marketState?.prices || INITIAL_MARKET_STATE.prices,
    priceChanges: marketState?.priceChanges || INITIAL_MARKET_STATE.priceChanges,
    currentEvent: marketState?.currentEvent || INITIAL_MARKET_STATE.currentEvent, // Legacy
    activeMarketEvents: activeMarketEvents, // New live events
    lastUpdated: marketState?.lastUpdated || INITIAL_MARKET_STATE.lastUpdated,
    loading,
    error,
    getItemDetails,
  };
};

