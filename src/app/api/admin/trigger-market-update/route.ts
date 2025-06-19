
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { suggestPriceAdjustments, type PriceAdjustmentInput } from '@/ai/flows/update-market-prices-flow';
import { CROP_DATA, FERTILIZER_DATA, INITIAL_MARKET_STATE } from '@/lib/constants';
import type { MarketState, MarketItemId } from '@/types';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.warn("CRON_SECRET is not set in environment variables. Denying unauthorized access to trigger-market-update.");
    return NextResponse.json({ error: 'Configuration error, admin should check CRON_SECRET.' }, { status: 500 });
  }

  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const marketDocRef = doc(db, 'marketState', 'global');
    const marketDocSnap = await getDoc(marketDocRef);
    
    let currentMarketData: MarketState;
    if (marketDocSnap.exists()) {
      currentMarketData = marketDocSnap.data() as MarketState;
    } else {
      console.warn("Market state document not found, using initial market state for price update job.");
      currentMarketData = INITIAL_MARKET_STATE;
      await updateDoc(marketDocRef, { prices: INITIAL_MARKET_STATE.prices, priceChanges: {}, lastUpdated: serverTimestamp() }, { merge: true });
    }
    const currentPrices = currentMarketData.prices || INITIAL_MARKET_STATE.prices;

    const itemUnlockTiers: Record<string, number> = {};
    for (const cropId in CROP_DATA) {
      itemUnlockTiers[cropId] = CROP_DATA[cropId as MarketItemId].unlockTier;
      itemUnlockTiers[CROP_DATA[cropId as MarketItemId].seedName] = CROP_DATA[cropId as MarketItemId].unlockTier;
    }
    for (const fertId in FERTILIZER_DATA) {
      itemUnlockTiers[fertId] = FERTILIZER_DATA[fertId as MarketItemId].unlockTier;
    }

    const aggregatedActivity = {
      sells: {}, 
      buys: {},  
    };

    const flowInput: PriceAdjustmentInput = {
      currentPrices,
      aggregatedActivity,
      itemUnlockTiers,
    };

    const adjustmentOutput = await suggestPriceAdjustments(flowInput);

    const newPrices: Record<string, number> = { ...currentPrices };
    const newPriceChanges: Record<string, number> = {};

    if (adjustmentOutput && adjustmentOutput.changes) {
      adjustmentOutput.changes.forEach(suggestion => {
        const itemId = suggestion.itemId as MarketItemId;
        const percentageChange = suggestion.percentageChange;
        const currentPrice = currentPrices[itemId];

        if (currentPrice !== undefined) {
          const calculatedNewPrice = currentPrice * (1 + percentageChange);
          newPrices[itemId] = Math.max(1, Math.round(calculatedNewPrice)); 
          newPriceChanges[itemId] = percentageChange;
        } else {
          console.warn(`Item ID "${itemId}" from AI suggestion not found in current market prices. Skipping.`);
        }
      });
    }

    await updateDoc(marketDocRef, {
      prices: newPrices,
      priceChanges: newPriceChanges,
      lastUpdated: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Market prices updated successfully.',
      changesApplied: adjustmentOutput?.changes?.length || 0,
      updatedPricesCount: Object.keys(newPriceChanges).length,
    });

  } catch (error: any) {
    console.error('Error in trigger-market-update API route:', error);
    return NextResponse.json({ error: 'Failed to update market prices.', details: error.message }, { status: 500 });
  }
}
