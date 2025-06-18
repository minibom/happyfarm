
import { config } from 'dotenv';
config(); // Ensure this is the very first line executed

// import '@/ai/flows/ai-generated-item-descriptions.ts'; // This flow is not currently used
import '@/ai/flows/ai-farming-advisor.ts';
import '@/ai/flows/generate-display-name.ts';
import '@/ai/flows/update-market-prices-flow.ts';
import '@/ai/flows/create-market-event-flow.ts';
import '@/ai/flows/generate-welcome-greeting.ts'; // Added new flow
