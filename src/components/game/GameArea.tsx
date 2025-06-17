
'use client';

import type { FC } from 'react';
import FarmGrid from '@/components/game/FarmGrid';
import ChatPanel from '@/components/game/ChatPanel';
import type { GameState, SeedId, CropId, CropDetails, TierInfo } from '@/types';

interface GameAreaProps {
  gameState: GameState;
  cropData: Record<CropId, CropDetails>;
  playerTierInfo: TierInfo;
  currentAction: 'none' | 'planting' | 'harvesting';
  availableSeedsForPlanting: SeedId[];
  handlePlotClick: (plotId: number) => void;
  plantSeedFromPlotPopover: (plotId: number, seedId: SeedId) => void;
  unlockPlot: (plotId: number) => void;
}

const GameArea: FC<GameAreaProps> = ({
  gameState,
  cropData,
  playerTierInfo,
  currentAction,
  availableSeedsForPlanting,
  handlePlotClick,
  plantSeedFromPlotPopover,
  unlockPlot,
}) => {
  return (
    <main className="flex flex-col items-center w-full max-w-7xl mt-4">
      <div className="flex flex-row w-full gap-6 justify-center items-start">
        <div className="flex-shrink-0">
          <FarmGrid
            plots={gameState.plots}
            onPlotClick={handlePlotClick}
            availableSeedsForPopover={availableSeedsForPlanting}
            onPlantFromPopover={plantSeedFromPlotPopover}
            isGloballyPlanting={currentAction === 'planting'}
            isGloballyHarvesting={currentAction === 'harvesting'}
            cropData={cropData}
            playerTier={playerTierInfo.tier}
            unlockedPlotsCount={gameState.unlockedPlotsCount}
            onUnlockPlot={unlockPlot}
          />
        </div>
        <div className="flex-shrink-0 hidden md:block">
          <ChatPanel />
        </div>
      </div>
    </main>
  );
};

export default GameArea;
