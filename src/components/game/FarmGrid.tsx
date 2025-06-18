
import type { FC } from 'react';
import FarmPlot from './FarmPlot';
import type { Plot, SeedId, CropDetails, CropId, FertilizerDetails, FertilizerId } from '@/types'; // Added Fertilizer types

interface FarmGridProps {
  plots: Plot[];
  onPlotClick: (plotId: number) => void;
  selectedPlotId?: number;
  availableSeedsForPopover: SeedId[];
  availableFertilizersForPopover: FertilizerDetails[]; // New prop
  onPlantFromPopover: (plotId: number, seedId: SeedId) => void;
  onFertilizeFromPopover: (plotId: number, fertilizerId: FertilizerId) => void; // New prop
  onUprootCrop: (plotId: number) => void; // New prop
  isGloballyPlanting: boolean;
  isGloballyHarvesting: boolean;
  isGloballyFertilizing: boolean;
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
  availableFertilizersForPopover, // Destructure
  onPlantFromPopover,
  onFertilizeFromPopover, // Destructure
  onUprootCrop, // Destructure
  isGloballyPlanting,
  isGloballyHarvesting,
  isGloballyFertilizing,
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
          onUprootCrop={onUprootCrop} // Pass onUprootCrop
          isGloballyPlanting={isGloballyPlanting}
          isGloballyHarvesting={isGloballyHarvesting}
          isGloballyFertilizing={isGloballyFertilizing}
          cropData={cropData}
          playerTier={playerTier}
          isLocked={plot.id >= unlockedPlotsCount}
          unlockCost={plot.id === unlockedPlotsCount ? cropData.tomato.seedPrice : 0} // This might need a more dynamic cost calculation
          onUnlockPlot={() => onUnlockPlot(plot.id)}
          unlockedPlotsCount={unlockedPlotsCount}
        />
      ))}
    </div>
  );
};

export default FarmGrid;

