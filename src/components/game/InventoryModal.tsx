
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
import type { Inventory, SeedId, CropId, CropDetails } from '@/types';
import { PackageSearch, Wheat, Sprout } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card'; // Import Card for item display
import { Badge } from '@/components/ui/badge'; // For quantity display

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Inventory;
  cropData: Record<CropId, CropDetails> | null;
  allSeedIds: SeedId[];
  allCropIds: CropId[];
}

const InventoryModal: FC<InventoryModalProps> = ({
    isOpen,
    onClose,
    inventory,
    cropData,
    allSeedIds,
    allCropIds
}) => {
  if (!cropData) {
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

  const seedsInInventory = allSeedIds.filter(id => (inventory[id] || 0) > 0);
  const cropsInInventory = allCropIds.filter(id => (inventory[id] || 0) > 0);

  const renderItemGrid = (items: Array<SeedId | CropId>, type: 'seed' | 'crop') => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
      {items.map((itemId) => {
        const itemDetails = type === 'seed'
          ? cropData[itemId.replace('Seed', '') as CropId]
          : cropData[itemId as CropId];
        const displayName = type === 'seed' ? `${itemDetails?.name} (Hạt)` : itemDetails?.name;
        const itemIcon = itemDetails?.icon || (type === 'seed' ? '🌱' : '❓');
        const quantity = inventory[itemId] || 0;

        if (!itemDetails) return null;

        return (
          <Card key={itemId} className="overflow-hidden shadow-sm flex flex-col items-center justify-between h-28 sm:h-32">
            <CardContent className="p-2 flex flex-col items-center justify-center flex-grow w-full relative">
              <Badge className="absolute top-1 right-1 text-xs px-1.5 py-0.5 h-auto">{quantity}</Badge>
              <span className="text-3xl sm:text-4xl my-1">{itemIcon}</span>
              <p className="text-[10px] sm:text-xs font-medium text-center truncate w-full mt-auto" title={displayName}>
                {displayName}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
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
          {(seedsInInventory.length === 0 && cropsInInventory.length === 0) && (
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
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1.5 sticky top-0 bg-background/95 py-2 z-10 px-2 -mx-2 border-b">
                <Wheat className="w-5 h-5 text-yellow-600" />Nông Sản
                </h3>
              {renderItemGrid(cropsInInventory, 'crop')}
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
