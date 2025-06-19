
'use server';
/**
 * @fileOverview AI flow to generate random, engaging market events.
 * This flow is intended to be called by a scheduled backend process (e.g., Google Cloud Function via Cloud Scheduler).
 * The backend process would:
 * 1. Fetch the list of all available item IDs.
 * 2. Call this `createMarketEventFlow` with the item list.
 * 3. Receive the suggested `MarketEventOutput` from this flow.
 * 4. Update the `/marketState/global` document's `currentEvent` field in Firestore.
 *
 * - generateMarketEvent - A function that handles the market event generation process.
 * - MarketEventInput - The input type for the generateMarketEvent function.
 * - MarketEventOutput - The return type for the generateMarketEvent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { MarketItemId } from '@/types';

// ----- Input Schema -----
const MarketEventInputSchema = z.object({
  availableItemIds: z.array(z.string()).describe('A list of all item IDs available in the game (e.g., ["wheat", "carrotSeed", "tomato"]).'),
  // Potentially add current game date/season or other contextual info later
});
export type MarketEventInput = z.infer<typeof MarketEventInputSchema>;

// ----- Output Schema -----
const MarketEventOutputSchema = z.object({
  eventName: z.string().describe('A creative and engaging name for the market event (e.g., "Tomato Festival!", "Carrot Craze").'),
  description: z.string().describe('A short, flavorful description of the event for players.'),
  itemId: z.string().describe('The ID of the item primarily affected by the event. Could be a crop or a seed.'),
  priceModifier: z.number().min(0.5).max(2.0)
    .describe('A multiplier for the item\'s price. E.g., 1.3 for +30% price, 0.75 for -25% price. Must be between 0.5 and 2.0.'),
  effectDescription: z.string().describe('A brief summary of the event\'s effect, e.g., "Tomato sell price +30%!" or "Carrot seed price -20%!"'),
  durationHours: z.number().int().min(1).max(72).describe('The duration of the event in hours (e.g., 24 for one day).'),
});
export type MarketEventOutput = z.infer<typeof MarketEventOutputSchema>;

const FALLBACK_MARKET_EVENT: MarketEventOutput = {
  eventName: "EVENT_GENERATION_FAILURE",
  description: "The AI could not generate a new market event at this time. The market remains stable.",
  itemId: "none", // Placeholder or a specific error code
  priceModifier: 1.0, // Neutral modifier
  effectDescription: "No market changes due to event generation failure.",
  durationHours: 1 // Minimal duration
};

// ----- Wrapper Function -----
export async function generateMarketEvent(input: MarketEventInput): Promise<MarketEventOutput> {
  return createMarketEventFlow(input);
}

// ----- Prompt Definition -----
const createMarketEventPrompt = ai.definePrompt({
  name: 'createMarketEventPrompt',
  input: { schema: MarketEventInputSchema },
  output: { schema: MarketEventOutputSchema },
  prompt: `You are the Event Manager for the cheerful farming game 'Happy Farm'.
Your goal is to create a fun and engaging market event that will temporarily affect the price of one item.

Here is a list of available item IDs in the game:
{{{json availableItemIds}}}

Please select ONE item from the list and design an event around it. The event should:
1.  Have a creative and appealing 'eventName'.
2.  Have a short, flavorful 'description' that explains the event to players.
3.  Specify the 'itemId' that is affected.
4.  Determine a 'priceModifier' for that item's price. This modifier should be between 0.5 (50% price, a big discount) and 2.0 (200% price, a big premium).
    - If it's a crop (e.g., "tomato"), the modifier typically applies to its sell price.
    - If it's a seed (e.g., "tomatoSeed"), the modifier typically applies to its buy price.
5.  Create an 'effectDescription' summarizing the change (e.g., "Tomato sell price +30%!", "Carrot seed price -20%!").
6.  Set a 'durationHours' for the event, between 1 and 72 hours.

Make the event sound exciting and fit the theme of a happy farming game. Avoid generic events.
Think about festivals, sudden demands, special orders, or even humorous occurrences.

Return your event details as a JSON object matching the specified output schema.
Example Output:
{
  "eventName": "Royal Carrot Feast",
  "description": "The King is hosting a grand feast and demands an enormous amount of carrots! Farmers are being paid a premium for their carrot harvests.",
  "itemId": "carrot",
  "priceModifier": 1.5,
  "effectDescription": "Carrot sell price +50%!",
  "durationHours": 48
}
Another Example:
{
  "eventName": "Seedling Surplus Sale",
  "description": "Thanks to a breakthrough in farming techniques, there's a temporary surplus of tomato seeds! Get them while they're cheap!",
  "itemId": "tomatoSeed",
  "priceModifier": 0.7,
  "effectDescription": "Tomato seed buy price -30%!",
  "durationHours": 24
}
`,
});

// ----- Flow Definition -----
const createMarketEventFlow = ai.defineFlow(
  {
    name: 'createMarketEventFlow',
    inputSchema: MarketEventInputSchema,
    outputSchema: MarketEventOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await createMarketEventPrompt(input);
      if (!output) {
        console.error('AI failed to generate a market event (output was null).');
        return FALLBACK_MARKET_EVENT;
      }
      return output;
    } catch (error) {
        console.error('Error in createMarketEventFlow during prompt execution:', error);
        // The caller of this flow (e.g., a Cloud Function)
        // should ideally check the eventName for "EVENT_GENERATION_FAILURE"
        // or handle the fallback appropriately.
        return FALLBACK_MARKET_EVENT;
    }
  }
);

