import type { FC } from 'react';
import FarmPlot from './FarmPlot';
import type { Plot } from '@/types';

interface FarmGridProps {
  plots: Plot[];
  onPlotClick: (plotId: number) => void;
  selectedPlotId?: number;
  isPlanting?: boolean;
  isHarvesting?: boolean;
}

const FarmGrid: FC<FarmGridProps> = ({ plots, onPlotClick, selectedPlotId, isPlanting, isHarvesting }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 p-4 bg-green-200/30 rounded-lg shadow-inner">
      {plots.map((plot) => (
        <FarmPlot
          key={plot.id}
          plot={plot}
          onClick={() => onPlotClick(plot.id)}
          isSelected={plot.id === selectedPlotId}
          isPlanting={isPlanting}
          isHarvesting={isHarvesting}
        />
      ))}
    </div>
  );
};

export default FarmGrid;
