
# Happy Farm - A Next.js Farming Game 🚜🌾

Welcome to Happy Farm! This is a delightful farming game built with Next.js, React, and powered by Firebase for backend services and Genkit for AI features.

## Overview

In Happy Farm, players can:
- Plant and grow various crops.
- Harvest their produce.
- Buy and sell items in the market.
- Level up and unlock new tiers with special perks.
- Complete a variety of missions:
    - **Main Missions**: Follow a storyline and unlock major game features.
    - **Daily Missions**: Receive new, short-term objectives each day for quick rewards.
    - **Weekly Missions**: Tackle more involved tasks for better rewards over the week.
    - (Future) **Random & Event Missions**: Encounter spontaneous tasks and special event-related objectives.
- Chat with other players.
- Compete on the leaderboard.
- Customize their display name.
- Receive in-game mail with potential rewards.
- Experience dynamic game events affecting gameplay (e.g., price changes, growth boosts).

## Technology Stack

- **Frontend:**
  - [Next.js](https://nextjs.org/) (App Router)
  - [React](https://reactjs.org/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [ShadCN UI](https://ui.shadcn.com/) (Component Library)
  - [Tailwind CSS](https://tailwindcss.com/) (Styling)
- **Backend & Database:**
  - [Firebase](https://firebase.google.com/) (Authentication, Firestore, Realtime Database for Chat)
- **AI Features:**
  - [Genkit](https://firebase.google.com/docs/genkit) (For AI-powered features like display name generation, farming advice, market price updates, event generation)
  - Google AI (Gemini models)

## Getting Started

1.  **Prerequisites:**
    *   Node.js (version 18 or higher recommended)
    *   npm or yarn

2.  **Firebase Setup:**
    *   Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/).
    *   Enable Authentication (Email/Password).
    *   Set up Firestore (Native mode).
    *   Set up Realtime Database.
    *   Obtain your Firebase project configuration details.

3.  **Environment Variables:**
    *   Create a `.env` file in the root of the project.
    *   Add your Firebase configuration:
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
        NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
        NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_realtime_database_url
        ```
    *   Add your Genkit Google AI API Key:
        ```env
        GEMINI_API_KEY=your_gemini_api_key
        ```
    *   (Optional) For admin access, define a comma-separated list of Firebase User UIDs:
        ```env
        NEXT_PUBLIC_ADMIN_UIDS=your_admin_uid1,your_admin_uid2
        ```
    *   (Optional) For securing scheduled tasks like market updates:
        ```env
        CRON_SECRET=your_strong_random_secret_for_cron_jobs
        ```


4.  **Install Dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

5.  **Run the Development Server:**
    *   For the Next.js app:
        ```bash
        npm run dev
        ```
        The app will be available at `http://localhost:9002`.
    *   For Genkit (in a separate terminal, if you need to inspect or test flows directly):
        ```bash
        npm run genkit:watch
        ```

## Project Structure

-   `src/app/`: Contains the Next.js App Router pages and layouts.
    -   `src/app/game/`: Main game page.
    -   `src/app/admin/`: Admin panel pages.
    -   `src/app/library/`: Game information library (redesigned with sidebar navigation).
    -   `src/app/login/`, `src/app/register/`: Auth pages.
    -   `src/app/api/`: API routes, including scheduled task triggers.
-   `src/components/`: Reusable UI components.
    -   `src/components/game/`: Components specific to the game UI.
    -   `src/components/admin/`: Components for the admin panel.
    -   `src/components/library/`: Components for the game library pages.
    -   `src/components/ui/`: ShadCN UI components.
-   `src/hooks/`: Custom React hooks (e.g., `useAuth.tsx`, `useGameLogic.tsx`).
-   `src/ai/`: Genkit AI related code.
    -   `src/ai/flows/`: Genkit flows for AI features.
    -   `src/ai/genkit.ts`: Genkit client initialization.
    -   `src/ai/dev.ts`: Genkit development server entry point.
-   `src/lib/`: Utility functions, constants, and Firebase configuration.
    -   `src/lib/constants.ts`: Re-exports constants from modular files.
    -   `src/lib/crop-data.ts`: Crop definitions.
    -   `src/lib/fertilizer-data.ts`: Fertilizer definitions.
    -   `src/lib/tier-data.ts`: Tier definitions and logic.
    -   `src/lib/mission-data.ts`: Definitions for Main, Daily, Weekly, and Random missions.
    -   `src/lib/bonus-configurations.ts`: Definitions for automatic bonus rewards.
    -   `src/lib/mail-templates.ts`: Predefined mail templates for admin use.
    -   `src/lib/event-templates.ts`: Predefined game event templates.
    -   `src/lib/game-config.ts`: Core game numerical configurations.
    -   `src/lib/initial-states.ts`: Initial game state and market state.
    -   `src/lib/firebase.ts`: Firebase app initialization.
-   `public/`: Static assets.

## Scheduled Tasks (e.g., Market Updates)

The game includes AI flows that can be used to dynamically update aspects like market prices or generate market events. These are designed to be triggered by a scheduled backend process.

### Market Price Updates

An API route `/api/admin/trigger-market-update` is provided to facilitate automated market price updates.
This route:
1.  Fetches current market data.
2.  Calls the `suggestPriceAdjustments` Genkit flow (from `src/ai/flows/update-market-prices-flow.ts`).
3.  Processes the AI's suggestions to calculate new prices.
4.  Updates the market state in Firestore.

**How to Automate:**
1.  **Set a Cron Secret:**
    *   In your `.env` file, define a strong, random secret for `CRON_SECRET`.
        ```env
        CRON_SECRET=your_very_strong_and_random_secret_here
        ```
    *   This secret will be used to authorize requests to the API route.
2.  **Deploy Your Application:** Ensure your Next.js application is deployed to a hosting environment (e.g., Firebase Hosting with Cloud Functions for Next.js, Vercel).
3.  **Set up Cloud Scheduler (or similar cron service):**
    *   Go to the Google Cloud Console for your Firebase project.
    *   Navigate to Cloud Scheduler.
    *   Create a new job:
        *   **Frequency:** e.g., `0 */12 * * *` (every 12 hours at the start of the hour).
        *   **Target type:** HTTP.
        *   **URL:** The fully qualified URL of your deployed API route (e.g., `https://your-app-domain.com/api/admin/trigger-market-update`).
        *   **HTTP method:** `POST`.
        *   **Headers:** Add an `Authorization` header with the value `Bearer your_very_strong_and_random_secret_here` (replace with your actual `CRON_SECRET`).
        *   **Body:** Can be empty or a simple JSON like `{}`.

This setup will periodically call your API route, which in turn uses the AI flow to update market prices.
**Note on Market Activity Logs:** The `update-market-prices-flow` is designed to potentially use aggregated market activity (buys/sells). Currently, the API route sends placeholder activity data. Full implementation would require logging player transactions to a separate Firestore collection (e.g., `marketActivityLogs`) and then aggregating this data before calling the flow.

### Market Event Generation
Similarly, the `createMarketEventFlow` (in `src/ai/flows/create-market-event-flow.ts`) can be triggered by a scheduled function to automatically generate and activate new market events. The setup would be similar to the market price updates, with a dedicated API route or Cloud Function calling this flow.

## Admin Panel

The game includes an admin panel accessible at `/admin`.
To grant admin access:
1.  Find the Firebase UID of the user(s) you want to be admins (you can get this from the Firebase Authentication console).
2.  Set the `NEXT_PUBLIC_ADMIN_UIDS` environment variable in your `.env` file, with UIDs separated by commas.

The admin panel allows:
-   **Items Management**: View, create, edit, and delete game items (crops) and fertilizers directly in Firestore.
-   **Users & Tiers Management**:
    -   View a list of registered users, their basic game state, and status (active/banned_chat).
    -   View and edit tier configurations (name, icon, color, buff percentages) stored in Firestore.
-   **Mail & Bonus Management**:
    -   Compose and send mail to all users or specific users, with optional item/currency rewards.
    -   Use predefined mail templates to quickly draft messages.
    -   View, create, edit, and delete bonus configurations (e.g., first login bonus, tier-up rewards).
-   **Missions & Events Management**:
    -   **Events Tab**: View, create, edit, and delete active/scheduled game events. Base new events on predefined templates.
    -   **Missions Tab**: View, create, edit, and delete mission definitions (main, daily, weekly, random) directly in Firestore.
-   **System Configuration**:
    -   Push local game data definitions from `src/lib/*.ts` files to Firestore. This is used to initialize or overwrite data in collections like `gameItems`, `gameFertilizers`, `gameTiers`, `gameBonusConfigurations`, `gameMailTemplates`, `gameEventTemplates`, `gameMainMissions`, `gameDailyMissionTemplates`, `gameWeeklyMissionTemplates`, and `gameRandomMissionPool`. Use this section to ensure Firestore has the latest static game data.

## Game Data Management

Core static game data such as crop details, fertilizer properties, tier progression, bonus rules, mail templates, event templates, and mission definitions are defined in TypeScript files within the `src/lib/` directory (e.g., `crop-data.ts`, `tier-data.ts`, `mission-data.ts`, `bonus-configurations.ts`, `mail-templates.ts`, `event-templates.ts`).

To populate or update your Firestore database with this data:
1.  Navigate to the **Admin Panel**.
2.  Go to the **"Cấu hình Hệ thống" (System Configuration)** page.
3.  Use the respective "Đồng Bộ" (Sync) buttons to push the local constant data to the corresponding Firestore collections.

## Important: Firestore Security Rules

For a production environment, **it is crucial to set up robust Firestore Security Rules** to protect your game data and prevent cheating. The client-side logic currently has a high degree of trust, and security rules are the primary way to enforce game logic and permissions on the server side.

Happy farming!
