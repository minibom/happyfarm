
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
  isGloballyPlanting: boolean;
  isGloballyHarvesting: boolean;
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
          // The game loop in useGameLogic will handle the state transition
          // so we don't strictly need to clearInterval here if the component might re-render due to state change
        } else {
          const totalSeconds = Math.floor(remaining / 1000);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          setTimeLeftDisplay(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      };

      updateTimer(); // Initial call
      intervalId = setInterval(updateTimer, 1000);
    } else {
      setTimeLeftDisplay(null); // Clear timer if not planted or growing
    }

    return () => clearInterval(intervalId); // Cleanup interval on unmount or dependency change
  }, [plot.state, plot.plantedAt, plot.cropId]);

  const getPlotContent = () => {
    const cropName = plot.cropId ? CROP_DATA[plot.cropId]?.name : null;
    const cropNameElement = cropName ? (
      <span className="text-xs font-medium text-center text-yellow-900 dark:text-yellow-200 -mb-1">
        {cropName}
      </span>
    ) : null;

    switch (plot.state) {
      case 'empty':
        return <div className="text-xs text-muted-foreground">Trống</div>;
      case 'planted':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            {cropNameElement}
            <Sprout className="w-8 h-8 text-green-700 plot-sway" />
          </div>
        );
      case 'growing':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            {cropNameElement}
            <LeafIcon className="w-10 h-10 text-green-600 plot-sway" />
          </div>
        );
      case 'ready_to_harvest':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            {cropNameElement}
            {plot.cropId && CROP_DATA[plot.cropId] ? (
              <span className={cn("text-3xl", plot.state === 'ready_to_harvest' ? 'gentle-pulse' : 'plot-sway')}>
                {CROP_DATA[plot.cropId].icon}
              </span>
            ) : (
              <Gift className={cn("w-10 h-10 text-red-500", plot.state === 'ready_to_harvest' ? 'gentle-pulse' : 'plot-sway')} />
            )}
            <span className="text-xs font-semibold text-primary-foreground bg-primary/80 px-1 rounded mt-0.5">Sẵn Sàng</span>
          </div>
        );
      default:
        return null;
    }
  };

  const handlePlotGUIClick = () => {
    if (isGloballyPlanting || isGloballyHarvesting) {
      onClick(); // Defer to global actions if active
    }
    else if (plot.state === 'empty') {
      setIsSeedSelectorOpen(true); // Open local seed selector if plot is empty and no global action
    }
    else {
      onClick(); // Fallback, could be for info or other actions if plot not empty and no global action
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
    actionableClass = 'ring-4 ring-green-500 ring-offset-2';
  }
  if (isGloballyHarvesting && plot.state === 'ready_to_harvest') {
    actionableClass = 'ring-4 ring-yellow-400 ring-offset-2';
  }
  if (isSelected) { // This might be for a future "selected plot info" feature
     actionableClass = cn(actionableClass, 'ring-4 ring-primary ring-offset-2');
  }


  return (
    <Popover open={isSeedSelectorOpen} onOpenChange={setIsSeedSelectorOpen}>
      <PopoverTrigger asChild>
        <div
          onClick={handlePlotGUIClick}
          className={cn(
            baseClasses,
            stateClasses[plot.state],
            actionableClass
          )}
          aria-label={`Thửa đất ${plot.id + 1}, trạng thái: ${plot.state}${plot.cropId ? `, cây trồng: ${CROP_DATA[plot.cropId!]?.name}` : ''}`}
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
      {plot.state === 'empty' && !isGloballyPlanting && ( // Only show popover if not in global planting mode
        <PopoverContent className="w-auto p-2" side="bottom" align="center">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium mb-1 text-center">Trồng hạt giống:</p>
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
                    <span className="mr-2 text-lg">{crop?.icon}</span> Trồng {crop?.name || seedId}
                  </Button>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground text-center">Không có hạt giống trong kho.</p>
            )}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default FarmPlot;
