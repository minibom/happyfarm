
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
- Receive in-game mail with potential rewards.

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
    -   `src/app/library/`: Game information library (redesigned with sidebar navigation).
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
    -   `src/lib/constants.ts`: Re-exports constants from modular files.
    -   `src/lib/crop-data.ts`: Crop definitions.
    -   `src/lib/fertilizer-data.ts`: Fertilizer definitions.
    -   `src/lib/tier-data.ts`: Tier definitions and logic.
    -   `src/lib/bonus-configurations.ts`: Definitions for automatic bonus rewards.
    -   `src/lib/mail-templates.ts`: Predefined mail templates for admin use.
    -   `src/lib/game-config.ts`: Core game numerical configurations.
    -   `src/lib/initial-states.ts`: Initial game state and market state.
    -   `src/lib/firebase.ts`: Firebase app initialization.
-   `public/`: Static assets.

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
-   **System Configuration**:
    -   Push local game data definitions from `src/lib/*.ts` files to Firestore. This is used to initialize or overwrite data in collections like `gameItems`, `gameFertilizers`, `gameTiers`, `gameBonusConfigurations`, and `gameMailTemplates`. Use this section to ensure Firestore has the latest static game data.

## Game Data Management

Core static game data such as crop details, fertilizer properties, tier progression, bonus rules, and mail templates are defined in TypeScript files within the `src/lib/` directory (e.g., `crop-data.ts`, `tier-data.ts`, `bonus-configurations.ts`, `mail-templates.ts`).

To populate or update your Firestore database with this data:
1.  Navigate to the **Admin Panel**.
2.  Go to the **"Cấu hình Hệ thống" (System Configuration)** page.
3.  Use the respective "Đồng Bộ" (Sync) buttons to push the local constant data to the corresponding Firestore collections. This ensures your game uses the most up-to-date definitions.

## Important: Firestore Security Rules

For a production environment, **it is crucial to set up robust Firestore Security Rules** to protect your game data and prevent cheating. The client-side logic currently has a high degree of trust, and security rules are the primary way to enforce game logic and permissions on the server side. Ensure that:
-   Users can only write to their own game state (`/users/{userId}/gameState/data`).
-   Data modifications are validated (e.g., gold cannot increase arbitrarily, XP and level progression is valid).
-   Collections like `gameItems`, `gameFertilizers`, `gameTiers`, `gameBonusConfigurations`, and `gameMailTemplates` are read-only for clients (or writable only by admin-privileged backend functions if you implement server-side management beyond the current constant pushing mechanism).
-   Mail subcollections (`/users/{userId}/mail`) are writable by admin-privileged functions for sending mail and readable by the recipient user. Users should only be able to update `isRead` and `isClaimed` fields on their own mail.
-   Chat messages in Realtime Database (`/messages`) should also have appropriate rules (e.g., authenticated users can write, all can read).

Happy farming!
