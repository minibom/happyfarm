
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
    // 1. Fetch current market state
    const marketDocRef = doc(db, 'marketState', 'global');
    const marketDocSnap = await getDoc(marketDocRef);
    
    let currentMarketData: MarketState;
    if (marketDocSnap.exists()) {
      currentMarketData = marketDocSnap.data() as MarketState;
    } else {
      console.warn("Market state document not found, using initial market state for price update job.");
      currentMarketData = INITIAL_MARKET_STATE;
      // Optionally, you might want to create the document here if it's missing,
      // but the updateDoc below with { merge: true } might handle it if prices are present.
      // For safety, let's ensure it's at least partially initialized if it was missing.
      await updateDoc(marketDocRef, { prices: INITIAL_MARKET_STATE.prices, priceChanges: {}, lastUpdated: serverTimestamp() }, { merge: true });
    }
    const currentPrices = currentMarketData.prices || INITIAL_MARKET_STATE.prices;

    // 2. Construct itemUnlockTiers from constants
    const itemUnlockTiers: Record<string, number> = {};
    for (const cropId in CROP_DATA) {
      itemUnlockTiers[cropId] = CROP_DATA[cropId as MarketItemId].unlockTier;
      itemUnlockTiers[CROP_DATA[cropId as MarketItemId].seedName] = CROP_DATA[cropId as MarketItemId].unlockTier;
    }
    for (const fertId in FERTILIZER_DATA) {
      itemUnlockTiers[fertId] = FERTILIZER_DATA[fertId as MarketItemId].unlockTier;
    }

    // 3. Aggregated Activity (Placeholder - implement actual logging and aggregation separately)
    const aggregatedActivity = {
      sells: {}, // TODO: Populate from actual sales logs
      buys: {},  // TODO: Populate from actual purchase logs
    };

    // 4. Prepare input for the AI flow
    const flowInput: PriceAdjustmentInput = {
      currentPrices,
      aggregatedActivity,
      itemUnlockTiers,
    };

    // 5. Call the AI flow
    const adjustmentOutput = await suggestPriceAdjustments(flowInput);

    // 6. Process the output and calculate new prices
    const newPrices: Record<string, number> = { ...currentPrices };
    const newPriceChanges: Record<string, number> = {};

    if (adjustmentOutput && adjustmentOutput.changes) {
      adjustmentOutput.changes.forEach(suggestion => {
        const itemId = suggestion.itemId as MarketItemId;
        const percentageChange = suggestion.percentageChange;
        const currentPrice = currentPrices[itemId];

        if (currentPrice !== undefined) {
          const calculatedNewPrice = currentPrice * (1 + percentageChange);
          newPrices[itemId] = Math.max(1, Math.round(calculatedNewPrice)); // Ensure price is at least 1
          newPriceChanges[itemId] = percentageChange;
        } else {
          console.warn(`Item ID "${itemId}" from AI suggestion not found in current market prices. Skipping.`);
        }
      });
    }

    // 7. Update Firestore
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
