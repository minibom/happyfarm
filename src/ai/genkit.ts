
import { genkit, type ModelReference } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI(), // API key should be set in environment variables like GEMINI_API_KEY or GOOGLE_API_KEY
  ],
});

// Set the default model for operations using this 'ai' instance,
// if no model is specified at the prompt/flow definition or generate call.
// The model 'googleai/gemini-2.0-flash' is used as the default.
const defaultModel = 'googleai/gemini-2.0-flash' as ModelReference;
ai.registry.setDefaultModel(defaultModel);
