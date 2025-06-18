
import type { FC } from 'react';
import FarmPlot from './FarmPlot';
import type { Plot, SeedId, CropDetails, CropId } from '@/types';

interface FarmGridProps {
  plots: Plot[];
  onPlotClick: (plotId: number) => void;
  selectedPlotId?: number;
  availableSeedsForPopover: SeedId[];
  onPlantFromPopover: (plotId: number, seedId: SeedId) => void;
  isGloballyPlanting: boolean;
  isGloballyHarvesting: boolean;
  isGloballyFertilizing: boolean; // New prop
  cropData: Record<CropId, CropDetails>;
  playerTier: number;
  unlockedPlotsCount: number;
  onUnlockPlot: (plotId: number) => void;
}

const FarmGrid: FC<FarmGridProps> = ({
  plots,
  onPlotClick,
  selectedPlotId,
  availableSeedsForPopover,
  onPlantFromPopover,
  isGloballyPlanting,
  isGloballyHarvesting,
  isGloballyFertilizing, // Destructure new prop
  cropData,
  playerTier,
  unlockedPlotsCount,
  onUnlockPlot,
}) => {
  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-2 p-2 sm:p-3 bg-green-200/30 rounded-lg shadow-inner">
      {plots.map((plot) => (
        <FarmPlot
          key={plot.id}
          plot={plot}
          onClick={() => onPlotClick(plot.id)}
          isSelected={plot.id === selectedPlotId}
          availableSeedsForPopover={availableSeedsForPopover}
          onPlantFromPopover={(seedId) => onPlantFromPopover(plot.id, seedId)}
          isGloballyPlanting={isGloballyPlanting}
          isGloballyHarvesting={isGloballyHarvesting}
          isGloballyFertilizing={isGloballyFertilizing} // Pass down
          cropData={cropData}
          playerTier={playerTier}
          isLocked={plot.id >= unlockedPlotsCount}
          unlockCost={plot.id === unlockedPlotsCount ? cropData.tomato.seedPrice : 0}
          onUnlockPlot={() => onUnlockPlot(plot.id)}
          unlockedPlotsCount={unlockedPlotsCount}
        />
      ))}
    </div>
  );
};

export default FarmGrid;
