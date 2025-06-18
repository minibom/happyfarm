
'use client';

import type { FC } from 'react';
import { useRef, useEffect } from 'react';
import FarmGrid from '@/components/game/FarmGrid';
import ChatPanel from '@/components/game/ChatPanel';
import type { GameState, SeedId, CropId, CropDetails, TierInfo, FertilizerId, FertilizerDetails } from '@/types';
import { FERTILIZER_DATA } from '@/lib/constants';

interface GameAreaProps {
  gameState: GameState;
  cropData: Record<CropId, CropDetails>;
  playerTierInfo: TierInfo;
  currentAction: 'none' | 'planting' | 'harvesting' | 'fertilizing';
  selectedSeedToPlant?: SeedId;
  selectedFertilizerId?: FertilizerId;
  availableSeedsForPlanting: SeedId[];
  availableFertilizersForPopover: FertilizerDetails[]; // New prop for fertilizer popover
  handlePlotClick: (plotId: number) => void;
  plantSeedFromPlotPopover: (plotId: number, seedId: SeedId) => void;
  fertilizeFromPlotPopover: (plotId: number, fertilizerId: FertilizerId) => void; // New prop
  unlockPlot: (plotId: number) => void;
  userStatus: 'active' | 'banned_chat';
}

const GameArea: FC<GameAreaProps> = ({
  gameState,
  cropData,
  playerTierInfo,
  currentAction,
  selectedSeedToPlant,
  selectedFertilizerId,
  availableSeedsForPlanting,
  availableFertilizersForPopover, // Destructure new prop
  handlePlotClick,
  plantSeedFromPlotPopover,
  fertilizeFromPlotPopover, // Destructure new prop
  unlockPlot,
  userStatus,
}) => {
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = gameAreaRef.current;
    if (!element) return;

    if (!cropData || !FERTILIZER_DATA) { 
      element.style.cursor = 'default';
      return;
    }

    if (currentAction === 'harvesting') {
      element.style.cursor = 'grab';
    } else if (currentAction === 'planting' && selectedSeedToPlant) {
      const cropId = selectedSeedToPlant.replace('Seed', '') as CropId;
      const cropDetail = cropData[cropId];
      if (cropDetail && cropDetail.icon) {
        const encodedIcon = encodeURIComponent(cropDetail.icon);
        element.style.cursor = `url("data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><text x='2' y='22' font-size='20'>${encodedIcon}</text></svg>") 14 14, auto`;
      } else {
        element.style.cursor = 'crosshair';
      }
    } else if (currentAction === 'fertilizing' && selectedFertilizerId) {
      const fertilizerDetail = FERTILIZER_DATA[selectedFertilizerId];
      if (fertilizerDetail && fertilizerDetail.icon) {
        const encodedIcon = encodeURIComponent(fertilizerDetail.icon);
        element.style.cursor = `url("data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><text x='2' y='22' font-size='20'>${encodedIcon}</text></svg>") 14 14, auto`;
      } else {
        element.style.cursor = 'crosshair'; 
      }
    } else {
      element.style.cursor = 'default';
    }
  }, [currentAction, selectedSeedToPlant, selectedFertilizerId, cropData]);

  return (
    <main ref={gameAreaRef} className="flex flex-col items-center w-full max-w-7xl mt-4">
      <div className="flex flex-row w-full gap-6 justify-center items-start">
        <div className="flex-shrink-0">
          <FarmGrid
            plots={gameState.plots}
            onPlotClick={handlePlotClick}
            availableSeedsForPopover={availableSeedsForPlanting}
            availableFertilizersForPopover={availableFertilizersForPopover} // Pass down
            onPlantFromPopover={plantSeedFromPlotPopover}
            onFertilizeFromPopover={fertilizeFromPlotPopover} // Pass down
            isGloballyPlanting={currentAction === 'planting'}
            isGloballyHarvesting={currentAction === 'harvesting'}
            isGloballyFertilizing={currentAction === 'fertilizing'} 
            cropData={cropData}
            playerTier={playerTierInfo.tier}
            unlockedPlotsCount={gameState.unlockedPlotsCount}
            onUnlockPlot={unlockPlot}
          />
        </div>
        <div className="flex-shrink-0 hidden md:block">
          <ChatPanel userStatus={userStatus} />
        </div>
      </div>
    </main>
  );
};

export default GameArea;
