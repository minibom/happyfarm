
// Core game numerical configurations and utility functions related to game setup
export const GRID_ROWS = 5;
export const GRID_COLS = 5;
export const TOTAL_PLOTS = GRID_ROWS * GRID_COLS;

export const INITIAL_GOLD = 100;
export const INITIAL_XP = 0;
export const INITIAL_LEVEL = 1;
export const INITIAL_UNLOCKED_PLOTS = 10;

export const LEVEL_UP_XP_THRESHOLD = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

export const getPlotUnlockCost = (plotIndex: number): number => {
  if (plotIndex < INITIAL_UNLOCKED_PLOTS) return 0;
  const baseCost = 500;
  const increment = 250;
  return baseCost + (plotIndex - INITIAL_UNLOCKED_PLOTS) * increment;
};

export const LOCAL_STORAGE_GAME_KEY = 'happyFarmGame';

// Maximum cap for combined growth time reduction (e.g., 90%)
export const MAX_GROWTH_TIME_REDUCTION_CAP = 0.9;
