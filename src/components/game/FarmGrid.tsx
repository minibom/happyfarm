
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
  cropData: Record<CropId, CropDetails>;
  playerTier: number;
  unlockedPlotsCount: number; // New prop
  onUnlockPlot: (plotId: number) => void; // New prop
}

const FarmGrid: FC<FarmGridProps> = ({
  plots,
  onPlotClick,
  selectedPlotId,
  availableSeedsForPopover,
  onPlantFromPopover,
  isGloballyPlanting,
  isGloballyHarvesting,
  cropData,
  playerTier,
  unlockedPlotsCount, // Use new prop
  onUnlockPlot, // Use new prop
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
          cropData={cropData}
          playerTier={playerTier}
          isLocked={plot.id >= unlockedPlotsCount} // Determine if locked
          unlockCost={plot.id === unlockedPlotsCount ? cropData.tomato.seedPrice : 0} // Example, replace with actual cost logic
          onUnlockPlot={() => onUnlockPlot(plot.id)}
          unlockedPlotsCount={unlockedPlotsCount}
        />
      ))}
    </div>
  );
};

export default FarmGrid;
