
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
import type { Inventory, SeedId, CropId } from '@/types';
import { CROP_DATA, ALL_SEED_IDS, ALL_CROP_IDS } from '@/lib/constants';
import { PackageSearch, Wheat, Sprout } from 'lucide-react'; // Added Sprout for seeds

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Inventory;
}

const InventoryModal: FC<InventoryModalProps> = ({ isOpen, onClose, inventory }) => {
  const seeds = ALL_SEED_IDS.filter(id => inventory[id] > 0);
  const crops = ALL_CROP_IDS.filter(id => inventory[id] > 0);

  const getSeedDisplayInfo = (seedId: SeedId) => {
    const cropId = seedId.replace('Seed', '') as CropId;
    const cropDetail = CROP_DATA[cropId];
    return {
      name: cropDetail ? `${cropDetail.name} (Hạt Giống)` : seedId,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <PackageSearch className="w-7 h-7 text-primary" />
            Kho Đồ Của Bạn
          </DialogTitle>
          <DialogDescription>
            Đây là những gì bạn hiện có.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 my-4">
          {seeds.length === 0 && crops.length === 0 && (
            <p className="text-muted-foreground text-center">Kho đồ của bạn trống rỗng.</p>
          )}
          {seeds.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1">
                <Sprout className="w-5 h-5 text-green-600" />Hạt Giống
              </h3>
              <ul className="space-y-1 mb-4 pr-2">
                {seeds.map((seedId) => (
                  <li key={seedId} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                    <span>{getSeedDisplayInfo(seedId).name}</span>
                    <span className="font-bold text-primary">{inventory[seedId]}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {crops.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1">
                <Wheat className="w-5 h-5 text-yellow-600" />Nông Sản (Thành Phẩm)
                </h3>
              <ul className="space-y-1 pr-2">
                {crops.map((cropId) => (
                  <li key={cropId} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                    <span className="flex items-center gap-1">
                      {CROP_DATA[cropId]?.icon && <span className="text-xl">{CROP_DATA[cropId].icon}</span>}
                      {CROP_DATA[cropId]?.name || cropId}
                    </span>
                    <span className="font-bold text-primary">{inventory[cropId]}</span>
                  </li>
                ))}
              </ul>
            </>
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
