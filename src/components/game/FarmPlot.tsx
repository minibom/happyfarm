
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Sprout, Gift, Lock } from 'lucide-react';
import { LeafIcon } from '@/components/icons/LeafIcon';
import type { Plot, SeedId, CropId, CropDetails } from '@/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getPlayerTierInfo } from '@/lib/constants';


interface FarmPlotProps {
  plot: Plot;
  onClick: () => void;
  availableSeedsForPopover: SeedId[];
  onPlantFromPopover: (seedId: SeedId) => void;
  isGloballyPlanting: boolean;
  isGloballyHarvesting: boolean;
  isSelected?: boolean;
  cropData: Record<CropId, CropDetails>; 
  playerTier: number; // Add playerTier
}

const FarmPlot: FC<FarmPlotProps> = ({
  plot,
  onClick,
  availableSeedsForPopover,
  onPlantFromPopover,
  isGloballyPlanting,
  isGloballyHarvesting,
  isSelected,
  cropData, 
  playerTier,
}) => {
  const [isSeedSelectorOpen, setIsSeedSelectorOpen] = useState(false);
  const [timeLeftDisplay, setTimeLeftDisplay] = useState<string | null>(null);

  useEffect(() => {
    if (!plot.plantedAt || !plot.cropId || !cropData[plot.cropId]) { 
      setTimeLeftDisplay(null);
      return;
    }

    let intervalId: NodeJS.Timeout;

    if (plot.state === 'planted' || plot.state === 'growing') {
      const cropDetail = cropData[plot.cropId];
      if (!cropDetail) { 
        setTimeLeftDisplay(null);
        return;
      }
      const targetTime = plot.state === 'planted'
        ? plot.plantedAt + cropDetail.timeToGrowing
        : plot.plantedAt + cropDetail.timeToReady;

      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, targetTime - now);

        if (remaining === 0) {
          setTimeLeftDisplay("00:00");
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
  }, [plot.state, plot.plantedAt, plot.cropId, cropData]);

  const getPlotContent = () => {
    const currentCropDetail = plot.cropId ? cropData[plot.cropId] : null;
    const cropName = currentCropDetail?.name;

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
            {currentCropDetail ? (
              <span className={cn("text-3xl gentle-pulse", plot.state === 'ready_to_harvest' ? 'gentle-pulse' : 'plot-sway')}>
                {currentCropDetail.icon}
              </span>
            ) : (
              <Gift className={cn("w-10 h-10 text-red-500 gentle-pulse", plot.state === 'ready_to_harvest' ? 'gentle-pulse' : 'plot-sway')} />
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
      onClick();
    }
    else if (plot.state === 'empty') {
      setIsSeedSelectorOpen(true);
    }
    else {
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
    actionableClass = 'ring-4 ring-green-500 ring-offset-2';
  }
  if (isGloballyHarvesting && plot.state === 'ready_to_harvest') {
    actionableClass = 'ring-4 ring-yellow-400 ring-offset-2';
  }
  if (isSelected) {
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
          aria-label={`Thửa đất ${plot.id + 1}, trạng thái: ${plot.state}${plot.cropId && cropData[plot.cropId] ? `, cây trồng: ${cropData[plot.cropId].name}` : ''}`}
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
      {plot.state === 'empty' && !isGloballyPlanting && cropData && (
        <PopoverContent className="w-auto p-2" side="bottom" align="center">
           <TooltipProvider>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium mb-1 text-center">Trồng hạt giống:</p>
            {availableSeedsForPopover.length > 0 ? (
              availableSeedsForPopover.map(seedId => {
                const cropId = seedId.replace('Seed', '') as CropId;
                const crop = cropData[cropId];
                const isSeedLocked = playerTier < crop.unlockTier;
                 const requiredTierName = isSeedLocked ? getPlayerTierInfo( (crop.unlockTier -1) * 10 +1 ).tierName : "";


                return (
                  <Tooltip key={seedId} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div className={cn("w-full", isSeedLocked && "opacity-50 cursor-not-allowed")}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!isSeedLocked) {
                              onPlantFromPopover(seedId);
                              setIsSeedSelectorOpen(false);
                            }
                          }}
                          className={cn("w-full justify-start", isSeedLocked && "pointer-events-none")}
                          disabled={!crop || isSeedLocked} 
                        >
                          {crop?.icon && <span className="mr-2 text-lg">{crop.icon}</span>}
                          Trồng {crop?.name || seedId}
                          {isSeedLocked && <Lock className="ml-auto h-3 w-3" />}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {isSeedLocked && (
                      <TooltipContent side="right" align="start">
                        <p>Mở khóa ở {requiredTierName} (Bậc {crop.unlockTier})</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground text-center">Không có hạt giống trong kho.</p>
            )}
          </div>
          </TooltipProvider>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default FarmPlot;
