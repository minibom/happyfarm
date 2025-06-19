
'use server';
/**
 * @fileOverview AI flow to analyze market activity and suggest price updates.
 * This flow is intended to be called by a scheduled backend process (e.g., Google Cloud Function via Cloud Scheduler).
 * The backend process would:
 * 1. Aggregate `marketActivityLogs` from Firestore for the relevant period.
 * 2. Fetch current market prices from `/marketState/global` in Firestore.
 * 3. Call this `updateMarketPricesFlow` with the aggregated data and current prices.
 * 4. Receive the suggested `PriceAdjustmentOutput` from this flow.
 * 5. Calculate new prices based on the suggestions.
 * 6. Update the `/marketState/global` document in Firestore with new prices and price changes.
 *
 * - suggestPriceAdjustments - A function that handles the price adjustment suggestion process.
 * - PriceAdjustmentInput - The input type for the suggestPriceAdjustments function.
 * - PriceAdjustmentOutput - The return type for the suggestPriceAdjustments function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { MarketItemId } from '@/types';

// ----- Input Schema -----
const AggregatedActivitySchema = z.object({
  sells: z.record(z.string(), z.number()).describe('Total quantity sold per itemId. Example: { "wheat": 2500, "carrot": 800 }'),
  buys: z.record(z.string(), z.number()).describe('Total quantity bought per itemId (for seeds). Example: { "wheatSeed": 150, "strawberrySeed": 120 }'),
});

const PriceAdjustmentInputSchema = z.object({
  currentPrices: z.record(z.string(), z.number()).describe('Current prices of all market items. Example: { "wheat": 10, "carrot": 25, "strawberrySeed": 5 }'),
  aggregatedActivity: AggregatedActivitySchema.describe('Aggregated buy and sell activity for a defined period (e.g., last hour).'),
  itemUnlockTiers: z.record(z.string(), z.number()).optional().describe('Optional: Unlock tiers for items, to consider item progression.'),
});
export type PriceAdjustmentInput = z.infer<typeof PriceAdjustmentInputSchema>;

// ----- Output Schema -----
const PriceChangeSuggestionSchema = z.object({
  itemId: z.string().describe('The ID of the item (e.g., "wheat", "carrotSeed").'),
  percentageChange: z.number().min(-0.25).max(0.25).describe('The suggested percentage change in price (e.g., 0.1 for +10%, -0.05 for -5%). Max change +/- 25%.'),
  reason: z.string().describe('A brief reason for the suggested change based on supply/demand.'),
});

const PriceAdjustmentOutputSchema = z.object({
  changes: z.array(PriceChangeSuggestionSchema).describe('An array of suggested price changes for items.'),
});
export type PriceAdjustmentOutput = z.infer<typeof PriceAdjustmentOutputSchema>;

// ----- Wrapper Function -----
export async function suggestPriceAdjustments(input: PriceAdjustmentInput): Promise<PriceAdjustmentOutput> {
  return updateMarketPricesFlow(input);
}

// ----- Prompt Definition -----
const updateMarketPricesPrompt = ai.definePrompt({
  name: 'updateMarketPricesPrompt',
  input: { schema: PriceAdjustmentInputSchema },
  output: { schema: PriceAdjustmentOutputSchema },
  prompt: `You are an expert economic analyst for the farming game 'Happy Farm'.
Your task is to suggest price adjustments for various items based on recent market activity and current prices.

Current Market Prices:
{{{json currentPrices}}}

Aggregated Market Activity (quantities bought/sold in the last period):
Sells (Player to Market): {{{json aggregatedActivity.sells}}}
Buys (Player from Market - typically seeds): {{{json aggregatedActivity.buys}}}

{{#if itemUnlockTiers}}
Item Unlock Tiers (for context, lower tier items might be more volatile or have different demand patterns):
{{{json itemUnlockTiers}}}
{{/if}}

Analyze the supply and demand for each item.
- If an item (e.g., 'wheat') has high sell volume compared to its buy volume (or if it's a crop with no buy volume), its price should generally decrease.
- If an item (e.g., 'wheatSeed') has high buy volume from players, its price should generally increase.
- Consider the magnitude of the imbalance. A small imbalance might warrant a small change, a large imbalance a larger change.
- If an item has no significant trading activity, its price should remain stable (percentageChange: 0).

Constraints:
- Suggested 'percentageChange' MUST be between -0.25 (-25%) and +0.25 (+25%).
- Provide a concise 'reason' for each significant price change. For stable prices, a reason like "Stable demand" or "No significant activity" is fine.
- Only suggest changes for items present in the 'currentPrices' list.
- For items that are sold by players (crops like "wheat"), focus on 'aggregatedActivity.sells'.
- For items that are bought by players (seeds like "wheatSeed"), focus on 'aggregatedActivity.buys'.

Return your suggestions as a JSON object matching the specified output schema.
Example for a single item: { "changes": [{ "itemId": "wheat", "percentageChange": -0.05, "reason": "High supply of wheat from players." }] }
`,
});

// ----- Flow Definition -----
const updateMarketPricesFlow = ai.defineFlow(
  {
    name: 'updateMarketPricesFlow',
    inputSchema: PriceAdjustmentInputSchema,
    outputSchema: PriceAdjustmentOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await updateMarketPricesPrompt(input);
      if (!output) {
        console.error('AI failed to generate price adjustment suggestions (output was null).');
        return { changes: [] }; // Fallback
      }
      // The caller of this flow (e.g., a Cloud Function)
      // will be responsible for applying these percentage changes to the actual prices
      // and updating Firestore. This flow only suggests the changes.
      return output;
    } catch (error) {
      console.error('Error in updateMarketPricesFlow during prompt execution:', error);
      return { changes: [] }; // Fallback on any error
    }
  }
);

