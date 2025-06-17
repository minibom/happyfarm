# **App Name**: Happy Farm

## Core Features:

- Resource Display: Display the current gold, XP, and level in a resource bar at the top.
- Farm Grid Display: Render a 3x5 grid of farm plots that changes its appearance based on the states ('empty', 'planted', 'growing', 'ready_to_harvest')
- Inventory Display: Display an inventory showing the quantities of different seeds and harvested crops.
- Action Selection: Enable users to choose actions like planting or harvesting via buttons.
- Market Interaction: Show the market, enabling users to buy seeds or sell crops. Initially, hardcode prices and quantities. Consider implementing a tool for dynamically adjusting pricing using generative AI based on global events, like in-game weather or season, or other user driven events. The tool should learn which events will affect pricing of particular items in the farm.
- Automated Plot Updates: Update plots automatically based on time, changing the appearance and status of the plots.
- Game Persistence: Use local storage to save and load the user's game state, including gold, XP, level, plots, and inventory.
- AI Farming Advisor: An NPC character will appear and provide advice to the player based on the current state of the farm. The AI will analyze economic factors (market prices), resource levels (gold), and potential problems (unharvested crops) to provide helpful tips.
- AI-Generated Item Descriptions: When the player harvests a perfect crop, the AI will generate a unique name and description for the item.

## Style Guidelines:

- Primary color: HSL 50, 70%, 50% which converts to a vivid gold (#E0B319) to symbolize the in-game currency and the rewards of farming.
- Background color:  HSL 50, 20%, 95% which converts to a light off-white (#FAF7EB) to create a bright and cheerful environment reminiscent of a sunny day on the farm.
- Accent color: HSL 80, 60%, 40% which converts to an earthy green (#5EB83D) to highlight interactive elements like buttons and selected seeds, grounding the UI in the theme of nature and growth.
- Body and headline font: 'PT Sans', a humanist sans-serif, to provide a modern yet approachable and friendly feel for easy readability on farm-related content.
- Use hand-drawn, cheerful icons for crops, tools, and resources to enhance the game's friendly atmosphere.
- Add subtle animations such as gentle swaying crops or twinkling icons upon harvest to give a dynamic and lively feel.
- Maintain a clear, grid-based layout for the farm plots, ensuring ease of interaction and a visually appealing distribution of space.