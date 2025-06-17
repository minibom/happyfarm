
// src/ai/flows/ai-farming-advisor.ts
'use server';

/**
 * @fileOverview An AI farming advisor that provides tips to the player.
 *
 * - getFarmingAdvice - A function that returns farming advice based on the current game state.
 * - FarmingAdviceInput - The input type for the getFarmingAdvice function.
 * - FarmingAdviceOutput - The return type for the getFarmingAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FarmingAdviceInputSchema = z.object({
  gold: z.number().describe('The current amount of gold the player has.'),
  xp: z.number().describe('The current amount of experience the player has.'),
  level: z.number().describe('The current level of the player.'),
  plots: z
    .array(
      z.object({
        state: z
          .enum(['empty', 'planted', 'growing', 'ready_to_harvest'])
          .describe('The current state of the plot.'),
        crop: z.string().optional().describe('The type of crop planted in the plot.'),
      })
    )
    .describe('The current state of each farm plot.'),
  inventory:
    z.record(z.number()).describe('The current inventory of seeds and harvested crops.'),
  marketPrices:
    z.record(z.number()).describe('The current market prices for seeds and harvested crops.'),
});
export type FarmingAdviceInput = z.infer<typeof FarmingAdviceInputSchema>;

const FarmingAdviceOutputSchema = z.object({
  advice: z.string().describe('The farming advice for the player.'),
});
export type FarmingAdviceOutput = z.infer<typeof FarmingAdviceOutputSchema>;

export async function getFarmingAdvice(input: FarmingAdviceInput): Promise<FarmingAdviceOutput> {
  return farmingAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'farmingAdvisorPrompt',
  input: {schema: FarmingAdviceInputSchema},
  output: {schema: FarmingAdviceOutputSchema},
  prompt: `You are a helpful AI farming advisor. Provide helpful tips to the player based on the current game state, market prices, and resource levels.

Current Game State:
Gold: {{gold}}
XP: {{xp}}
Level: {{level}}
Plots: {{#each plots}}State: {{this.state}}{{#if this.crop}} (Crop: {{this.crop}}){{/if}}; {{/each}}
Inventory: {{#each inventory}}{{@key}}: {{this}}; {{/each}}
Market Prices: {{#each marketPrices}}{{@key}}: {{this}}; {{/each}}`,
});

const farmingAdviceFlow = ai.defineFlow(
  {
    name: 'farmingAdviceFlow',
    inputSchema: FarmingAdviceInputSchema,
    outputSchema: FarmingAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
