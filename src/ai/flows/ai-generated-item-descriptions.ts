'use server';
/**
 * @fileOverview Generates a unique name and description for a perfect crop.
 *
 * - generateItemDescription - A function that generates the name and description.
 * - ItemDescriptionInput - The input type for the generateItemDescription function.
 * - ItemDescriptionOutput - The return type for the generateItemDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ItemDescriptionInputSchema = z.object({
  cropType: z.string().describe('The type of crop harvested (e.g., tomato, corn).'),
  harvestQuality: z.string().describe('The quality of the harvest (e.g., perfect, good, average). Should always be perfect.'),
});

export type ItemDescriptionInput = z.infer<typeof ItemDescriptionInputSchema>;

const ItemDescriptionOutputSchema = z.object({
  itemName: z.string().describe('A unique and creative name for the harvested crop.'),
  itemDescription: z.string().describe('A short, engaging description of the harvested crop, adding to the game lore.'),
});

export type ItemDescriptionOutput = z.infer<typeof ItemDescriptionOutputSchema>;

export async function generateItemDescription(input: ItemDescriptionInput): Promise<ItemDescriptionOutput> {
  return generateItemDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'itemDescriptionPrompt',
  input: {schema: ItemDescriptionInputSchema},
  output: {schema: ItemDescriptionOutputSchema},
  prompt: `You are a creative storyteller in a farming game. When a player harvests a perfect crop, you generate a unique name and description for the item to make it feel special.

Crop Type: {{{cropType}}}
Harvest Quality: {{{harvestQuality}}}

Generate a unique name and a short description for this perfect crop. The name should be creative and fit the farming game setting. The description should add to the game's lore and make the item feel special. Focus on positive aspects and potential uses of the crop in the game.

Output format: JSON`,
});

const generateItemDescriptionFlow = ai.defineFlow(
  {
    name: 'generateItemDescriptionFlow',
    inputSchema: ItemDescriptionInputSchema,
    outputSchema: ItemDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
