
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Sprout, Gift, Lock, Coins } from 'lucide-react'; // Added Lock and Coins
import { LeafIcon } from '@/components/icons/LeafIcon';
import type { Plot, SeedId, CropId, CropDetails } from '@/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getPlayerTierInfo, getPlotUnlockCost, TOTAL_PLOTS, INITIAL_UNLOCKED_PLOTS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

interface FarmPlotProps {
  plot: Plot;
  onClick: () => void;
  availableSeedsForPopover: SeedId[];
  onPlantFromPopover: (seedId: SeedId) => void;
  isGloballyPlanting: boolean;
  isGloballyHarvesting: boolean;
  isSelected?: boolean;
  cropData: Record<CropId, CropDetails>;
  playerTier: number;
  isLocked: boolean; 
  unlockCost: number; 
  onUnlockPlot: () => void; 
  unlockedPlotsCount: number; 
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
  isLocked,
  onUnlockPlot,
  unlockedPlotsCount,
}) => {
  const [isSeedSelectorOpen, setIsSeedSelectorOpen] = useState(false);
  const [timeLeftDisplay, setTimeLeftDisplay] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isLocked || !plot.plantedAt || !plot.cropId || !cropData[plot.cropId]) {
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
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          if (hours > 0) {
            setTimeLeftDisplay(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
          } else {
            setTimeLeftDisplay(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
          }
        }
      };

      updateTimer();
      intervalId = setInterval(updateTimer, 1000);
    } else {
      setTimeLeftDisplay(null);
    }

    return () => clearInterval(intervalId);
  }, [plot.state, plot.plantedAt, plot.cropId, cropData, isLocked]);

  const actualUnlockCost = getPlotUnlockCost(plot.id);

  const getPlotContent = () => {
    if (isLocked) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
          {plot.id === unlockedPlotsCount && unlockedPlotsCount < TOTAL_PLOTS && (
            <div className="flex items-center text-xs mt-1">
              <Coins className="w-3 h-3 mr-0.5 text-yellow-500" />
              <span>{actualUnlockCost}</span>
            </div>
          )}
        </div>
      );
    }

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
            <Sprout className="w-6 h-6 sm:w-8 sm:h-8 text-green-700 plot-sway" />
          </div>
        );
      case 'growing':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            {cropNameElement}
            <LeafIcon className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 plot-sway" />
          </div>
        );
      case 'ready_to_harvest':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            {cropNameElement}
            {currentCropDetail ? (
              <span className={cn("text-2xl sm:text-3xl", plot.state === 'ready_to_harvest' ? 'gentle-pulse' : 'plot-sway')}>
                {currentCropDetail.icon}
              </span>
            ) : (
              <Gift className={cn("w-8 h-8 sm:w-10 sm:h-10 text-red-500", plot.state === 'ready_to_harvest' ? 'gentle-pulse' : 'plot-sway')} />
            )}
            <span className="text-xs font-semibold text-primary-foreground bg-primary/80 px-1 rounded mt-0.5">Sẵn Sàng</span>
          </div>
        );
      default:
        return null;
    }
  };

  const handlePlotGUIClick = () => {
    if (isLocked) {
      if (plot.id === unlockedPlotsCount && unlockedPlotsCount < TOTAL_PLOTS) {
        onUnlockPlot(); 
      } else if (unlockedPlotsCount < TOTAL_PLOTS) {
        toast({ title: "Đất Bị Khóa", description: "Bạn cần mở khóa ô đất trước đó theo thứ tự.", variant: "destructive" });
      } else {
        toast({ title: "Đã Mở Hết", description: "Tất cả ô đất đã được mở khóa.", variant: "default" });
      }
      return;
    }

    if (isGloballyPlanting || isGloballyHarvesting) {
      onClick();
    } else if (plot.state === 'empty') {
      setIsSeedSelectorOpen(true);
    } else {
      onClick();
    }
  };

  const baseClasses = "w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-lg shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 relative overflow-hidden border-2 border-yellow-800/50";
  const stateClasses = isLocked
    ? 'bg-gray-500/30 hover:bg-gray-500/40 border-gray-600/50'
    : {
        empty: 'bg-yellow-700/30 hover:bg-yellow-700/40',
        planted: 'bg-lime-700/30 hover:bg-lime-700/40',
        growing: 'bg-green-700/40 hover:bg-green-700/50',
        ready_to_harvest: 'bg-primary/40 hover:bg-primary/50 border-2 border-primary',
      }[plot.state];


  let actionableClass = '';
  if (!isLocked) {
    if (isGloballyPlanting && plot.state === 'empty') {
      actionableClass = 'ring-4 ring-green-500 ring-offset-2';
    }
    if (isGloballyHarvesting && plot.state === 'ready_to_harvest') {
      actionableClass = 'ring-4 ring-yellow-400 ring-offset-2';
    }
  }
  if (isSelected && !isLocked) {
     actionableClass = cn(actionableClass, 'ring-4 ring-primary ring-offset-2');
  }

  const tooltipContent = isLocked
    ? plot.id === unlockedPlotsCount && unlockedPlotsCount < TOTAL_PLOTS
      ? `Mở khóa: ${actualUnlockCost} vàng`
      : unlockedPlotsCount < TOTAL_PLOTS
        ? "Bạn cần mở ô đất trước đó"
        : "Đã mở tất cả ô đất"
    : plot.cropId && cropData[plot.cropId]
      ? cropData[plot.cropId].name
      : plot.state.charAt(0).toUpperCase() + plot.state.slice(1);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover open={isSeedSelectorOpen && !isLocked} onOpenChange={setIsSeedSelectorOpen}>
            <PopoverTrigger asChild>
              <div
                onClick={handlePlotGUIClick}
                className={cn(
                  baseClasses,
                  stateClasses,
                  actionableClass
                )}
                aria-label={`Thửa đất ${plot.id + 1}, trạng thái: ${isLocked ? 'Bị khóa' : plot.state}${!isLocked && plot.cropId && cropData[plot.cropId] ? `, cây trồng: ${cropData[plot.cropId].name}` : ''}`}
                role="button"
                tabIndex={0}
              >
                <div className="absolute top-0.5 left-0.5 text-xs bg-black/40 text-white px-1.5 py-0.5 rounded-br-md rounded-tl-md text-[10px] sm:text-xs">
                  {plot.id + 1}
                </div>
                {getPlotContent()}
                {!isLocked && (plot.state === 'planted' || plot.state === 'growing') && timeLeftDisplay && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded">
                    {timeLeftDisplay}
                  </div>
                )}
              </div>
            </PopoverTrigger>
            {!isLocked && plot.state === 'empty' && !isGloballyPlanting && !isGloballyHarvesting && cropData && (
              <PopoverContent className="w-auto p-2" side="bottom" align="center">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium mb-1 text-center">Trồng hạt giống:</p>
                  {availableSeedsForPopover.length > 0 ? (
                    availableSeedsForPopover.map(seedId => {
                      const cropId = seedId.replace('Seed', '') as CropId;
                      const crop = cropData[cropId];
                      const isSeedLockedByTier = playerTier < crop.unlockTier;
                      const requiredTierName = isSeedLockedByTier ? getPlayerTierInfo( (crop.unlockTier -1) * 10 +1 ).tierName : "";

                      return (
                        <Tooltip key={seedId} delayDuration={100}>
                          <TooltipTrigger asChild>
                            <div className={cn("w-full", isSeedLockedByTier && "opacity-50 cursor-not-allowed")}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (!isSeedLockedByTier) {
                                    onPlantFromPopover(seedId);
                                    setIsSeedSelectorOpen(false);
                                  }
                                }}
                                className={cn("w-full justify-start", isSeedLockedByTier && "pointer-events-none")}
                                disabled={!crop || isSeedLockedByTier}
                              >
                                {crop?.icon && <span className="mr-2 text-lg">{crop.icon}</span>}
                                Trồng {crop?.name || seedId}
                                {isSeedLockedByTier && <Lock className="ml-auto h-3 w-3" />}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {isSeedLockedByTier && (
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
              </PopoverContent>
            )}
          </Popover>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FarmPlot;
