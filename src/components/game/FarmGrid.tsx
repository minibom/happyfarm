
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
  cropData: Record<CropId, CropDetails>; // Added to pass crop details down
}

const FarmGrid: FC<FarmGridProps> = ({
  plots,
  onPlotClick,
  selectedPlotId,
  availableSeedsForPopover,
  onPlantFromPopover,
  isGloballyPlanting,
  isGloballyHarvesting,
  cropData, // Use this
}) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 p-4 bg-green-200/30 rounded-lg shadow-inner">
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
          cropData={cropData} // Pass down
        />
      ))}
    </div>
  );
};

export default FarmGrid;
