
'use client';

import type { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Inventory, SeedId, CropId, CropDetails, FertilizerId, FertilizerDetails } from '@/types';
import { PackageSearch, Wheat, Sprout, Clock, Coins, Zap as FertilizerIcon } from 'lucide-react'; // Added FertilizerIcon
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CROP_DATA, FERTILIZER_DATA, ALL_SEED_IDS, ALL_CROP_IDS, ALL_FERTILIZER_IDS } from '@/lib/constants'; // Ensure FERTILIZER_DATA and ALL_FERTILIZER_IDS are imported

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Inventory;
  // cropData and fertilizerData are now sourced from constants directly
  // cropData: Record<CropId, CropDetails> | null; // No longer needed as prop
  // fertilizerData: Record<FertilizerId, FertilizerDetails> | null; // No longer needed as prop
  // allSeedIds: SeedId[]; // No longer needed as prop
  // allCropIds: CropId[]; // No longer needed as prop
  // allFertilizerIds: FertilizerId[]; // No longer needed as prop
}

const formatMillisecondsToTime = (ms: number): string => {
  if (isNaN(ms) || ms <= 0) {
    return '0s';
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  } else if (minutes > 0) {
    return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  } else {
    return `${String(seconds)}s`;
  }
};

const InventoryModal: FC<InventoryModalProps> = ({
    isOpen,
    onClose,
    inventory,
}) => {
  // Data is now sourced from constants
  const cropData = CROP_DATA;
  const fertilizerData = FERTILIZER_DATA;

  if (!cropData || !fertilizerData) { // Should ideally always be available from constants
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg md:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
                        <PackageSearch className="w-7 h-7 text-primary" />
                        Kho Đồ Của Bạn
                    </DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground text-center py-8">Đang tải dữ liệu vật phẩm...</p>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
  }

  const seedsInInventory = ALL_SEED_IDS.filter(id => (inventory[id] || 0) > 0);
  const cropsInInventory = ALL_CROP_IDS.filter(id => (inventory[id] || 0) > 0);
  const fertilizersInInventory = ALL_FERTILIZER_IDS.filter(id => (inventory[id] || 0) > 0);

  const renderItemGrid = (items: Array<SeedId | CropId | FertilizerId>, type: 'seed' | 'crop' | 'fertilizer') => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
      {items.map((itemId) => {
        let itemDetails: CropDetails | FertilizerDetails | undefined;
        let displayName: string | undefined;
        let itemIcon: string | undefined;

        if (type === 'seed') {
          itemDetails = cropData[itemId.replace('Seed', '') as CropId];
          displayName = itemDetails ? `${itemDetails.name} (Hạt)` : 'Hạt Giống Lỗi';
          itemIcon = itemDetails?.icon || '🌱';
        } else if (type === 'crop') {
          itemDetails = cropData[itemId as CropId];
          displayName = itemDetails?.name || 'Nông Sản Lỗi';
          itemIcon = itemDetails?.icon || '❓';
        } else { // fertilizer
          itemDetails = fertilizerData[itemId as FertilizerId];
          displayName = itemDetails?.name || 'Phân Bón Lỗi';
          itemIcon = itemDetails?.icon || '🧪';
        }
        
        const quantity = inventory[itemId] || 0;
        if (!itemDetails) return null;

        return (
          <TooltipProvider key={itemId} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="overflow-hidden shadow-sm flex flex-col items-center justify-between h-28 sm:h-32 cursor-default">
                  <CardContent className="p-2 flex flex-col items-center justify-center flex-grow w-full relative">
                    <Badge className="absolute top-1 right-1 text-xs px-1.5 py-0.5 h-auto">{quantity}</Badge>
                    <span className="text-3xl sm:text-4xl my-1">{itemIcon}</span>
                    <p className="text-[10px] sm:text-xs font-medium text-center truncate w-full mt-auto" title={displayName}>
                      {displayName}
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="text-sm p-2 shadow-lg rounded-md bg-background border border-border">
                <div className="font-bold text-primary mb-1">{displayName}</div>
                {type === 'seed' && (itemDetails as CropDetails) && (
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>TG Thu Hoạch: {formatMillisecondsToTime((itemDetails as CropDetails).timeToGrowing + (itemDetails as CropDetails).timeToReady)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-yellow-500" />
                      <span>Giá Mua (Hạt): {(itemDetails as CropDetails).seedPrice}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-green-500" />
                      <span>Giá Bán (Nông Sản): {(itemDetails as CropDetails).cropPrice}</span>
                    </div>
                     <div className="flex items-center gap-1">
                       <Badge variant="outline" className="text-xs">Bậc {(itemDetails as CropDetails).unlockTier}</Badge>
                    </div>
                  </div>
                )}
                {type === 'crop' && (itemDetails as CropDetails) && (
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-green-500" />
                      <span>Giá Bán: {(itemDetails as CropDetails).cropPrice}</span>
                    </div>
                     <div className="flex items-center gap-1">
                       <Badge variant="outline" className="text-xs">Bậc {(itemDetails as CropDetails).unlockTier}</Badge>
                    </div>
                  </div>
                )}
                {type === 'fertilizer' && (itemDetails as FertilizerDetails) && (
                  <div className="space-y-0.5 text-xs">
                     <p>{(itemDetails as FertilizerDetails).description}</p>
                     <div className="flex items-center gap-1">
                       <Badge variant="outline" className="text-xs">Bậc {(itemDetails as FertilizerDetails).unlockTier}</Badge>
                    </div>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl"> {/* Increased width for more items */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <PackageSearch className="w-7 h-7 text-primary" />
            Kho Đồ Của Bạn
          </DialogTitle>
          <DialogDescription>
            Đây là những gì bạn hiện có.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] my-4 pr-1">
          {(seedsInInventory.length === 0 && cropsInInventory.length === 0 && fertilizersInInventory.length === 0) && (
            <p className="text-muted-foreground text-center py-6">Kho đồ của bạn trống rỗng.</p>
          )}

          {seedsInInventory.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1.5 sticky top-0 bg-background/95 py-2 z-10 px-2 -mx-2 border-b">
                <Sprout className="w-5 h-5 text-green-600" />Hạt Giống
              </h3>
              {renderItemGrid(seedsInInventory, 'seed')}
            </div>
          )}

          {cropsInInventory.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1.5 sticky top-0 bg-background/95 py-2 z-10 px-2 -mx-2 border-b">
                <Wheat className="w-5 h-5 text-yellow-600" />Nông Sản
                </h3>
              {renderItemGrid(cropsInInventory, 'crop')}
            </div>
          )}

          {fertilizersInInventory.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1.5 sticky top-0 bg-background/95 py-2 z-10 px-2 -mx-2 border-b">
                <FertilizerIcon className="w-5 h-5 text-blue-500" />Phân Bón
                </h3>
              {renderItemGrid(fertilizersInInventory, 'fertilizer')}
            </div>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryModal;
