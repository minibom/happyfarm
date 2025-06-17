
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Sprout, Gift } from 'lucide-react';
import { LeafIcon } from '@/components/icons/LeafIcon';
import type { Plot, SeedId, CropId } from '@/types';
import { CROP_DATA } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface FarmPlotProps {
  plot: Plot;
  onClick: () => void; // Original click handler from HomePage for global actions
  availableSeedsForPopover: SeedId[];
  onPlantFromPopover: (seedId: SeedId) => void;
  isGloballyPlanting: boolean; // True if currentAction === 'planting' in HomePage
  isGloballyHarvesting: boolean; // True if currentAction === 'harvesting' in HomePage
  isSelected?: boolean; 
}

const FarmPlot: FC<FarmPlotProps> = ({
  plot,
  onClick,
  availableSeedsForPopover,
  onPlantFromPopover,
  isGloballyPlanting,
  isGloballyHarvesting,
  isSelected,
}) => {
  const [isSeedSelectorOpen, setIsSeedSelectorOpen] = useState(false);
  const [timeLeftDisplay, setTimeLeftDisplay] = useState<string | null>(null);

  useEffect(() => {
    if (!plot.plantedAt || !plot.cropId) {
      setTimeLeftDisplay(null);
      return;
    }

    let intervalId: NodeJS.Timeout;

    if (plot.state === 'planted' || plot.state === 'growing') {
      const cropDetail = CROP_DATA[plot.cropId];
      const targetTime = plot.state === 'planted'
        ? plot.plantedAt + cropDetail.timeToGrowing
        : plot.plantedAt + cropDetail.timeToReady;

      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, targetTime - now);

        if (remaining === 0) {
          setTimeLeftDisplay("00:00"); 
          clearInterval(intervalId);
        } else {
          const totalSeconds = Math.floor(remaining / 1000);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          setTimeLeftDisplay(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      };

      updateTimer();
      intervalId = setInterval(updateTimer, 1000);
    } else {
      setTimeLeftDisplay(null);
    }

    return () => clearInterval(intervalId);
  }, [plot.state, plot.plantedAt, plot.cropId]);

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

  const handlePlotGUIClick = () => {
    if (plot.state === 'empty' && !isGloballyPlanting) {
      // If plot is empty and not in global planting mode, always try to open local seed selector popover.
      // The popover itself will display "No seeds in inventory." if availableSeedsForPopover is empty.
      setIsSeedSelectorOpen(true);
    } else {
      // For all other cases (e.g. global planting active, harvesting, clicking non-empty plot)
      // defer to the main click handler from HomePage
      onClick();
    }
  };
  
  const baseClasses = "w-24 h-28 sm:w-28 sm:h-32 md:w-32 md:h-36 rounded-lg shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 relative overflow-hidden border-2 border-yellow-800/50";
  const stateClasses = {
    empty: 'bg-yellow-700/30 hover:bg-yellow-700/40',
    planted: 'bg-lime-700/30 hover:bg-lime-700/40',
    growing: 'bg-green-700/40 hover:bg-green-700/50',
    ready_to_harvest: 'bg-primary/40 hover:bg-primary/50 border-2 border-primary',
  };

  let actionableClass = '';
  if (isGloballyPlanting && plot.state === 'empty') {
    actionableClass = 'ring-4 ring-accent ring-offset-2';
  }
  if (isGloballyHarvesting && plot.state === 'ready_to_harvest') {
    actionableClass = 'ring-4 ring-blue-500 ring-offset-2';
  }

  return (
    <Popover open={isSeedSelectorOpen} onOpenChange={setIsSeedSelectorOpen}>
      <PopoverTrigger asChild>
        <div
          onClick={handlePlotGUIClick}
          className={cn(
            baseClasses,
            stateClasses[plot.state],
            isSelected && 'ring-4 ring-primary ring-offset-2',
            actionableClass
          )}
          aria-label={`Farm plot ${plot.id + 1}, state: ${plot.state}${plot.cropId ? `, crop: ${CROP_DATA[plot.cropId!]?.name}` : ''}`}
          role="button"
          tabIndex={0}
        >
          <div className="absolute top-1 left-1 text-xs bg-black/30 text-white px-1 rounded">
            {plot.id + 1}
          </div>
          {getPlotContent()}
          {(plot.state === 'planted' || plot.state === 'growing') && timeLeftDisplay && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
              {timeLeftDisplay}
            </div>
          )}
        </div>
      </PopoverTrigger>
      {plot.state === 'empty' && (
        <PopoverContent className="w-auto p-2" side="bottom" align="center">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium mb-1 text-center">Plant a seed:</p>
            {availableSeedsForPopover.length > 0 ? (
              availableSeedsForPopover.map(seedId => {
                const crop = CROP_DATA[seedId.replace('Seed', '') as CropId];
                return (
                  <Button
                    key={seedId}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onPlantFromPopover(seedId);
                      setIsSeedSelectorOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <span className="mr-2">{crop?.icon}</span> Plant {crop?.name || seedId}
                  </Button>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground text-center">No seeds in inventory.</p>
            )}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default FarmPlot;

