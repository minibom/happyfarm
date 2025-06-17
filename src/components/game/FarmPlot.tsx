import type { FC } from 'react';
import { Sprout, Gift } from 'lucide-react';
import { LeafIcon } from '@/components/icons/LeafIcon';
import type { Plot } from '@/types';
import { CROP_DATA } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface FarmPlotProps {
  plot: Plot;
  onClick: () => void;
  isSelected?: boolean;
  isPlanting?: boolean;
  isHarvesting?: boolean;
}

const FarmPlot: FC<FarmPlotProps> = ({ plot, onClick, isSelected, isPlanting, isHarvesting }) => {
  const getPlotContent = () => {
    switch (plot.state) {
      case 'empty':
        return <div className="text-xs text-muted-foreground">Empty</div>;
      case 'planted':
        return <Sprout className="w-8 h-8 text-green-700 plot-sway" />;
      case 'growing':
        return <LeafIcon className="w-10 h-10 text-green-600 plot-sway" />;
      case 'ready_to_harvest':
        return (
          <div className="flex flex-col items-center">
            {plot.cropId && CROP_DATA[plot.cropId] ? (
              <span className="text-3xl plot-sway">{CROP_DATA[plot.cropId].icon}</span>
            ) : (
              <Gift className="w-10 h-10 text-red-500 plot-sway" />
            )}
            <span className="text-xs font-semibold text-primary-foreground bg-primary/80 px-1 rounded">Ready</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  const baseClasses = "w-24 h-28 sm:w-28 sm:h-32 md:w-32 md:h-36 rounded-lg shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105";
  const stateClasses = {
    empty: 'bg-yellow-700/30 hover:bg-yellow-700/40', // Soil color
    planted: 'bg-lime-700/30 hover:bg-lime-700/40',
    growing: 'bg-green-700/40 hover:bg-green-700/50',
    ready_to_harvest: 'bg-primary/40 hover:bg-primary/50 border-2 border-primary',
  };

  let actionableClass = '';
  if (isPlanting && plot.state === 'empty') {
    actionableClass = 'ring-4 ring-accent ring-offset-2';
  }
  if (isHarvesting && plot.state === 'ready_to_harvest') {
    actionableClass = 'ring-4 ring-blue-500 ring-offset-2';
  }


  return (
    <div
      onClick={onClick}
      className={cn(
        baseClasses,
        stateClasses[plot.state],
        isSelected && 'ring-4 ring-primary ring-offset-2',
        actionableClass,
        'relative overflow-hidden border-2 border-yellow-800/50'
      )}
      aria-label={`Farm plot ${plot.id + 1}, state: ${plot.state}${plot.cropId ? `, crop: ${CROP_DATA[plot.cropId!]?.name}` : ''}`}
      role="button"
      tabIndex={0}
    >
      <div className="absolute top-1 left-1 text-xs bg-black/30 text-white px-1 rounded">
        {plot.id + 1}
      </div>
      {getPlotContent()}
    </div>
  );
};

export default FarmPlot;
