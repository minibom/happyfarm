
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, Timestamp } from 'firebase/firestore';
import type { MarketState, MarketPriceData, MarketPriceChange, MarketEventData, MarketItemId, CropDetails, CropId, FertilizerId, FertilizerDetails, ActiveGameEvent, GameEventEffect } from '@/types';
import { INITIAL_MARKET_STATE, CROP_DATA, FERTILIZER_DATA, ALL_SEED_IDS, ALL_CROP_IDS, ALL_FERTILIZER_IDS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast'; 

export interface MarketData {
  prices: MarketPriceData; 
  priceChanges: MarketPriceChange; 
  activeMarketEvents: ActiveGameEvent[]; 
  currentEvent: MarketEventData | null; 
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
      },
      (err) => {
        console.error("Error fetching market state:", err);
        setError(err);
        setMarketState(INITIAL_MARKET_STATE);
        setLoading(false); 
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
      setLoading(false); 
    }, (eventError) => {
      console.error("Error fetching active market events:", eventError);
      toast({ title: "Lỗi Sự Kiện Chợ", description: "Không thể tải sự kiện chợ.", variant: "destructive" });
      setActiveMarketEvents([]);
      setLoading(false); 
    });


    return () => {
      unsubscribeMarketState();
      unsubscribeEvents();
    };
  }, [toast]);

  const calculateEffectivePrice = useCallback((
    basePrice: number, // The original price from constants (CROP_DATA, FERTILIZER_DATA)
    aiAdjustedPrice: number, // Price from marketState.prices (after AI flow adjustments)
    itemId: MarketItemId,
    itemType: 'seed' | 'crop' | 'fertilizer',
    events: ActiveGameEvent[] // All currently active game events
  ): number => {
    let currentPrice = aiAdjustedPrice; // Start with the AI-adjusted price

    const potentiallyApplicableEffects: Array<{ eventName: string, effect: GameEventEffect, specificity: 'item' | 'category' }> = [];

    events.forEach(event => {
      event.effects.forEach(effect => {
        let typeMatches = false;
        if ((itemType === 'seed' || itemType === 'fertilizer') && effect.type === 'ITEM_PURCHASE_PRICE_MODIFIER') {
          typeMatches = true;
        } else if (itemType === 'crop' && effect.type === 'ITEM_SELL_PRICE_MODIFIER') {
          typeMatches = true;
        }

        if (typeMatches) {
          if (Array.isArray(effect.affectedItemIds) && effect.affectedItemIds.includes(itemId)) {
            potentiallyApplicableEffects.push({ eventName: event.name, effect, specificity: 'item' });
          } else if (typeof effect.affectedItemIds === 'string') { // ALL_...
            const categoryString = `ALL_${itemType.toUpperCase()}S`; 
            const fertilizerCategoryString = 'ALL_FERTILIZERS';
            if (effect.affectedItemIds === categoryString || (itemType === 'fertilizer' && effect.affectedItemIds === fertilizerCategoryString)) {
              potentiallyApplicableEffects.push({ eventName: event.name, effect, specificity: 'category' });
            }
          }
        }
      });
    });

    if (potentiallyApplicableEffects.length > 0) {
      const specificEffects = potentiallyApplicableEffects.filter(e => e.specificity === 'item');
      const categoryEffects = potentiallyApplicableEffects.filter(e => e.specificity === 'category');

      let bestEffectValue: number | undefined = undefined;
      let chosenEventName: string | undefined;

      // Determine the best modifier based on item type (buy low, sell high)
      const getBestModifier = (effectsToConsider: typeof potentiallyApplicableEffects) => {
        if (effectsToConsider.length === 0) return undefined;
        let bestVal: number | undefined = undefined;
        let bestEvtName: string | undefined;

        if (itemType === 'seed' || itemType === 'fertilizer') { // Buying: seek lowest modifier value
          bestVal = Math.min(...effectsToConsider.map(e => e.effect.value));
          bestEvtName = effectsToConsider.find(e => e.effect.value === bestVal)?.eventName;
        } else { // Selling crops: seek highest modifier value
          bestVal = Math.max(...effectsToConsider.map(e => e.effect.value));
          bestEvtName = effectsToConsider.find(e => e.effect.value === bestVal)?.eventName;
        }
        return {value: bestVal, eventName: bestEvtName};
      };

      const specificResult = getBestModifier(specificEffects);
      const categoryResult = getBestModifier(categoryEffects);

      if (specificResult?.value !== undefined) {
        bestEffectValue = specificResult.value;
        chosenEventName = specificResult.eventName;
      } else if (categoryResult?.value !== undefined) {
        bestEffectValue = categoryResult.value;
        chosenEventName = categoryResult.eventName;
      }
      
      if (bestEffectValue !== undefined) {
        // console.log(`Applying event "${chosenEventName}" modifier ${bestEffectValue} to ${itemId}`);
        currentPrice *= bestEffectValue;
      }
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
      basePrice: basePrice, 
      type: itemType,
      unlockTier: itemDetails.unlockTier,
      effectivePrice: effectivePrice, 
    };
  }, [marketState?.prices, activeMarketEvents, calculateEffectivePrice]);


  return {
    prices: marketState?.prices || INITIAL_MARKET_STATE.prices,
    priceChanges: marketState?.priceChanges || INITIAL_MARKET_STATE.priceChanges,
    currentEvent: marketState?.currentEvent || INITIAL_MARKET_STATE.currentEvent, 
    activeMarketEvents: activeMarketEvents, 
    lastUpdated: marketState?.lastUpdated || INITIAL_MARKET_STATE.lastUpdated,
    loading,
    error,
    getItemDetails,
  };
};
