
'use server';
/**
 * @fileOverview A Genkit flow to generate a display name for a player.
 *
 * - generateDisplayName - A function that returns a randomly generated display name.
 * - DisplayNameOutput - The return type for the generateDisplayName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DisplayNameOutputSchema = z.object({
  displayName: z.string().describe('A fun, friendly, and unique display name suitable for a farming game player. It should be relatively short (e.g., Captain Carrot, Sunshine Farmer, Pixel Planter).'),
});
export type DisplayNameOutput = z.infer<typeof DisplayNameOutputSchema>;

// Optional: If you want to provide context like preferred style later
// const PlayerContextSchema = z.object({
//   preferredStyle: z.string().optional().describe('Optional style hint for the name (e.g., "cute", "cool", "nature-themed").'),
// });
// export type PlayerContext = z.infer<typeof PlayerContextSchema>;

export async function generateDisplayName(): Promise<DisplayNameOutput> {
  return generateDisplayNameFlow({}); // Pass empty object if no input schema for prompt
}

const prompt = ai.definePrompt({
  name: 'generateDisplayNamePrompt',
  // input: {schema: PlayerContextSchema}, // Uncomment if using input schema
  output: {schema: DisplayNameOutputSchema},
  prompt: `Generate a fun, friendly, and unique display name suitable for a new player in a cheerful farming game.
The name should be relatively short and evoke a sense of farming, nature, or happiness.
Examples: Captain Carrot, Sunshine Farmer, Pixel Planter, MeadowSweet, Barnaby, DaisyDew.
Avoid names that are too generic or already very common in games.
`,
// Example with input:
// {{#if preferredStyle}}Consider this style: {{preferredStyle}}.{{/if}}
});

const generateDisplayNameFlow = ai.defineFlow(
  {
    name: 'generateDisplayNameFlow',
    // inputSchema: PlayerContextSchema, // Uncomment if using input schema
    outputSchema: DisplayNameOutputSchema,
  },
  async (input) => { // Input type matches inputSchema if used
    const {output} = await prompt(input); // Pass input to prompt
    if (!output) {
      console.error('AI failed to generate a display name matching the schema. Output was null or undefined.');
      // Fallback or throw a more specific error
      // For example, you could return a default name:
      // return { displayName: `Farmer${Math.floor(Math.random() * 10000)}` };
      // Or throw a specific error to be caught upstream:
      throw new Error('AI failed to generate a valid display name structure.');
    }
    return output;
  }
);
