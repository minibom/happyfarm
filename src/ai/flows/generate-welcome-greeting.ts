
'use server';
/**
 * @fileOverview A Genkit flow to generate a welcome greeting for returning players.
 *
 * - generateWelcomeGreeting - Returns a randomly generated welcome message.
 * - WelcomeGreetingOutput - The return type for the generateWelcomeGreeting function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { AIGreetingOutput } from '@/types'; // Reusing the type definition for clarity

const WelcomeGreetingOutputSchema = z.object({
  greeting: z.string().describe("A short, friendly, and cheerful welcome-back message for a player in a farming game called Happy Farm. It should sound exciting to play again. Examples: 'Chào mừng bạn đã trở lại Happy Farm! Những cánh đồng đang chờ bạn chăm sóc đó!', 'Thật vui khi gặp lại bạn! Hãy xem nông trại của bạn có gì mới nào!', 'Happy Farm nhớ bạn lắm! Cùng vào xem thành quả thôi nào!'"),
});

export type WelcomeGreetingOutput = z.infer<typeof WelcomeGreetingOutputSchema>;

export async function generateWelcomeGreeting(): Promise<WelcomeGreetingOutput> {
  return generateWelcomeGreetingFlow({});
}

const prompt = ai.definePrompt({
  name: 'generateWelcomeGreetingPrompt',
  model: 'googleai/gemini-1.5-flash-latest', // Explicitly define the model
  output: { schema: WelcomeGreetingOutputSchema },
  prompt: `You are a friendly and enthusiastic mascot for a cheerful farming game called 'Happy Farm'.
A player has just returned to the game. Generate a short (1-2 sentences), warm, and encouraging welcome-back message for them.
Make it sound exciting to play again. The message should be in Vietnamese.

Examples:
- "Chào mừng bạn đã trở lại Happy Farm! Những cánh đồng đang chờ bạn chăm sóc đó!"
- "Thật vui khi gặp lại bạn! Hãy xem nông trại của bạn có gì mới nào!"
- "Happy Farm nhớ bạn lắm! Cùng vào xem thành quả thôi nào!"
- "Ồ, bạn quay lại rồi! Nông trại vắng bạn thật buồn, cùng làm việc thôi!"
- "Chào mừng trở lại, nhà nông tài ba! Cây cối đang mong chờ bạn lắm đấy."
`,
});

const generateWelcomeGreetingFlow = ai.defineFlow(
  {
    name: 'generateWelcomeGreetingFlow',
    outputSchema: WelcomeGreetingOutputSchema,
  },
  async () => {
    try {
      const { output } = await prompt({});
      if (!output) {
        console.error('AI failed to generate a welcome greeting (output was null).');
        return { greeting: "Chào mừng bạn trở lại Happy Farm! Chúc bạn chơi game vui vẻ!" }; // Fallback
      }
      return output;
    } catch (error) {
      console.error('Error in generateWelcomeGreetingFlow during prompt execution:', error);
      // Return a generic fallback on any error during prompt execution
      return { greeting: "Chào bạn! Chúc bạn có một ngày làm nông thật vui!" };
    }
  }
);

