
import { config } from 'dotenv';
config(); // Ensure this is the very first line executed

// import '@/ai/flows/ai-generated-item-descriptions.ts'; // This flow is not currently used
import '@/ai/flows/ai-farming-advisor.ts';
import '@/ai/flows/generate-display-name.ts';
