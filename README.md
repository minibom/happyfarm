# Happy Farm - A Next.js Farming Game 🚜🌾

Welcome to Happy Farm! This is a delightful farming game built with Next.js, React, and powered by Firebase for backend services and Genkit for AI features.

## Overview

In Happy Farm, players can:
- Plant and grow various crops.
- Harvest their produce.
- Buy and sell items in the market.
- Level up and unlock new tiers with special perks.
- Chat with other players.
- Compete on the leaderboard.
- Customize their display name.

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
  - [Genkit](https://firebase.google.com/docs/genkit) (For AI-powered features like display name generation and farming advice)
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
    -   `src/app/library/`: Game information library.
    -   `src/app/login/`, `src/app/register/`: Auth pages.
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
    -   `src/lib/constants.ts`: Core game data like crop details, tiers, initial game state.
    -   `src/lib/firebase.ts`: Firebase app initialization.
-   `public/`: Static assets.

## Admin Panel

The game includes an admin panel accessible at `/admin`.
To grant admin access:
1.  Find the Firebase UID of the user(s) you want to be admins (you can get this from the Firebase Authentication console).
2.  Set the `NEXT_PUBLIC_ADMIN_UIDS` environment variable in your `.env` file, with UIDs separated by commas.

The admin panel allows:
-   Managing game items (from Firestore).
-   Viewing user data.
-   Reviewing tier configurations.
-   Pushing local item data from `constants.ts` to Firestore.

## Important: Firestore Security Rules

For a production environment, **it is crucial to set up robust Firestore Security Rules** to protect your game data and prevent cheating. The client-side logic currently has a high degree of trust, and security rules are the primary way to enforce game logic and permissions on the server side. Ensure that:
-   Users can only write to their own game state.
-   Data modifications are validated (e.g., gold cannot increase arbitrarily, XP and level progression is valid).
-   `gameItems` collection is not writable by clients.

Happy farming!