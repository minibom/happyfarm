import type { FC } from 'react';
import FarmPlot from './FarmPlot';
import type { Plot, SeedId } from '@/types';

interface FarmGridProps {
  plots: Plot[];
  onPlotClick: (plotId: number) => void; // For global actions or when plot doesn't handle locally
  selectedPlotId?: number; // May be less relevant if direct interaction is preferred
  
  // Props for FarmPlot's local seed selector and timer
  availableSeedsForPopover: SeedId[];
  onPlantFromPopover: (plotId: number, seedId: SeedId) => void;
  isGloballyPlanting: boolean;
  isGloballyHarvesting: boolean;
}

const FarmGrid: FC<FarmGridProps> = ({
  plots,
  onPlotClick,
  selectedPlotId,
  availableSeedsForPopover,
  onPlantFromPopover,
  isGloballyPlanting,
  isGloballyHarvesting,
}) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 p-4 bg-green-200/30 rounded-lg shadow-inner">
      {plots.map((plot) => (
        <FarmPlot
          key={plot.id}
          plot={plot}
          onClick={() => onPlotClick(plot.id)} // This is the fallback click
          isSelected={plot.id === selectedPlotId}
          availableSeedsForPopover={availableSeedsForPopover}
          onPlantFromPopover={(seedId) => onPlantFromPopover(plot.id, seedId)}
          isGloballyPlanting={isGloballyPlanting}
          isGloballyHarvesting={isGloballyHarvesting}
        />
      ))}
    </div>
  );
};

export default FarmGrid;
