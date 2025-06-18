
'use client';

import { useItemData } from './useItemData';
import { useGameStateCore } from './useGameStateCore';
import { usePlotActions } from './usePlotActions';
import { usePlayerActions } from './usePlayerActions';
import { useTransactionActions } from './useTransactionActions';

// This main hook now composes the smaller, focused hooks.
export const useGameLogic = () => {
  // 1. Fetch item definitions (crops, fertilizers)
  const { cropData, fertilizerData, itemDataLoaded, fertilizerDataLoaded } = useItemData();

  // 2. Manage core game state, depends on item data for game loop, etc.
  const { gameState, setGameState, isInitialized, playerTierInfo, gameDataLoaded } = useGameStateCore({
    cropData,
    itemDataLoaded,
    fertilizerDataLoaded,
  });

  // We need a ref to gameState for actions that need the *latest* state in their callbacks
  // This is implicitly handled by useGameStateCore returning gameState which is stateful.
  // For action hooks, we pass gameState (current snapshot) and setGameState.
  // If actions need truly latest state *during* their execution for complex logic,
  // they might need gameStateRef from useGameStateCore or adjust to work with the snapshot.
  // For now, passing gameState (as a snapshot at the time of hook setup) and setGameState is common.
  // More robust would be for action hooks to also use a gameStateRef if they perform read-modify-write
  // operations that are sensitive to state changes between when the action is invoked and when setGameState is called.
  // However, the current structure of action hooks taking setGameState and calculating changes based on `prev`
  // in setGameState updater function is generally safe.
  // Let's assume gameStateRef is not strictly needed to be passed to action hooks if they correctly use `setGameState(prev => ...)`

  // 3. Plot-related actions
  const plotActions = usePlotActions({
    setGameState,
    gameStateRef: { current: gameState }, // Pass current gameState snapshot as a ref-like object
    cropData,
    fertilizerData,
  });

  // 4. Player-related actions
  const playerActions = usePlayerActions({
    setGameState,
  });

  // 5. Transaction-related actions (buy/sell)
  const transactionActions = useTransactionActions({
    setGameState,
    gameStateRef: { current: gameState }, // Pass current gameState snapshot
    cropData,
    fertilizerData,
  });

  return {
    // State from useGameStateCore
    gameState,
    setGameState, // Added setGameState to the return object
    isInitialized, // This is the overall initialization status
    playerTierInfo,
    gameDataLoaded, // Specifically if user's game data from Firestore is loaded

    // Data from useItemData (might be useful for UI)
    cropData,
    fertilizerData,
    itemDataLoaded, // Specifically if crop/item definitions are loaded
    fertilizerDataLoaded,

    // Actions from various hooks
    ...plotActions,
    ...playerActions,
    ...transactionActions,
  };
};
