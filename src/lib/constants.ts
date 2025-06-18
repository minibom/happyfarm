
// Re-export all constants from the new modular files
export * from './game-config';
export * from './tier-data';
export * from './crop-data';
export * from './fertilizer-data';
export * from './initial-states';
export * from './bonus-configurations'; // Added export for bonus configurations

// Type re-exports are primarily handled by types/index.ts
// but if specific types were defined ONLY in the old constants.ts and used elsewhere,
// they should be moved to an appropriate new file or to src/types/index.ts.
// For this refactoring, we assume all necessary types are already in src/types/index.ts
// or are now co-located with their respective data (e.g., TierDetail in tier-data.ts).
