
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
// import type { ModelReference } from 'genkit/models'; // Not used

export const ai = genkit({
  plugins: [
    googleAI(), // API key should be set in environment variables like GEMINI_API_KEY or GOOGLE_API_KEY
  ],
  // Removed logLevel: 'debug' as it's not a standard v1.x top-level option here.
  // For detailed logging, you might configure it per plugin or use Genkit's CLI tools.
});

// Genkit will use the first configured compatible model from the plugins as a default
// for operations like ai.generate() or ai.definePrompt() if no model is
// explicitly specified in those calls.
// For instance, 'googleai/gemini-2.0-flash' is a common default with the googleAI plugin.

// If you need to ensure a specific model for a prompt, define it like this:
// const myPrompt = ai.definePrompt({
//   name: 'mySpecificPrompt',
//   model: 'googleai/gemini-2.0-flash', // or another specific model
//   prompt: 'Your prompt text here...',
//   // ... other options
// });

// Or for a direct generation call:
// async function someFunction() {
//   const { text } = await ai.generate({
//     model: 'googleai/gemini-2.0-flash',
//     prompt: 'Generate something useful.',
//   });
//   return text; // Correct 1.x syntax is response.text, not response.text()
// }
