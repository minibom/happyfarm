
import React, { type FC, useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// ScrollArea import is no longer needed if we remove it
// import { ScrollArea } from '@/components/ui/scroll-area'; 
import type { InventoryItem, MarketItem, CropDetails, CropId } from '@/types';
import { ShoppingCart } from 'lucide-react';
import { getPlayerTierInfo } from '@/lib/constants';
import BuySeedMarket from './BuySeedMarket';
import SellCropMarket from './SellCropMarket';

interface MarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketItems: MarketItem[] | null;
  playerGold: number;
  playerInventory: Record<InventoryItem, number>;
  onBuyItem: (itemId: InventoryItem, quantity: number, price: number) => void;
  onSellItem: (itemId: InventoryItem, quantity: number, price: number) => void;
  cropData: Record<CropId, CropDetails> | null;
  playerTier: number;
}

const MarketModal: FC<MarketModalProps> = ({
  isOpen,
  onClose,
  marketItems,
  playerGold,
  playerInventory,
  onBuyItem,
  onSellItem,
  cropData,
  playerTier,
}) => {
  const [quantities, setQuantities] = useState<Record<InventoryItem, number>>({});

  const seedsToDisplay = useMemo(() => {
    if (!marketItems || !cropData) return [];
    const filteredSeeds = marketItems.filter(item =>
      item.type === 'seed'
    );
    return filteredSeeds.sort((a, b) => {
        const aIsLocked = a.unlockTier > playerTier;
        const bIsLocked = b.unlockTier > playerTier;

        if (aIsLocked !== bIsLocked) {
            return aIsLocked ? 1 : -1;
        }
        if (a.unlockTier !== b.unlockTier) {
            return a.unlockTier - b.unlockTier;
        }
        const cropDetailsA = cropData[a.id.replace('Seed', '') as CropId];
        const cropDetailsB = cropData[b.id.replace('Seed', '') as CropId];
        if (cropDetailsA && cropDetailsB) {
            return cropDetailsA.name.localeCompare(cropDetailsB.name);
        }
        return 0;
    });
  }, [marketItems, playerTier, cropData]);

  const cropsToSell = useMemo(() => {
    if (!marketItems || !playerInventory || !cropData) return [];
    return marketItems.filter(item =>
      item.type === 'crop' && (playerInventory[item.id] || 0) > 0
    ).sort((a,b) => {
        const cropDetailsA = cropData[a.id as CropId];
        const cropDetailsB = cropData[b.id as CropId];
        if (cropDetailsA && cropDetailsB) {
            return cropDetailsA.name.localeCompare(cropDetailsB.name);
        }
        return 0;
    });
  }, [marketItems, playerInventory, cropData]);


  if (!marketItems || !cropData) {
     return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                 <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
                        <ShoppingCart className="w-7 h-7 text-primary" /> Chợ
                    </DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground text-center py-8">Đang tải dữ liệu chợ...</p>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
  }

  const handleQuantityButtonClick = (itemId: InventoryItem, delta: number, type: 'seed' | 'crop', itemUnlockTier: number) => {
    if (type === 'seed' && playerTier < itemUnlockTier && delta > 0) return;

    setQuantities(prev => {
      const currentQuantity = prev[itemId] || 0;
      let newQuantity = currentQuantity + delta;
      if (newQuantity < 0) newQuantity = 0;

      if (type === 'crop') {
        const maxSellable = playerInventory[itemId] || 0;
        if (newQuantity > maxSellable) newQuantity = maxSellable;
      }
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const handleQuantityInputChange = (
    itemId: InventoryItem,
    value: string,
    type: 'seed' | 'crop',
    itemUnlockTier: number
  ) => {
    if (type === 'seed' && playerTier < itemUnlockTier && value !== '' && parseInt(value, 10) > 0) return;

    let numValue = parseInt(value, 10);
    if (isNaN(numValue) || value === '') {
      numValue = 0;
    }
    if (numValue < 0) numValue = 0;

    if (type === 'crop') {
      const maxSellable = playerInventory[itemId] || 0;
      if (numValue > maxSellable) numValue = maxSellable;
    }
    
    if (type === 'seed' && playerTier < itemUnlockTier) {
        setQuantities(prev => ({ ...prev, [itemId]: 0 }));
    } else {
        setQuantities(prev => ({ ...prev, [itemId]: numValue }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <ShoppingCart className="w-7 h-7 text-primary" /> Chợ
          </DialogTitle>
          <DialogDescription>
            Mua hạt giống và bán nông sản. Vàng: {playerGold.toLocaleString()} | Bậc: {getPlayerTierInfo(playerTier * 10 - 9).tierName} (Bậc {playerTier})
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="buy" className="w-full flex-grow flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Mua Hạt Giống</TabsTrigger>
            <TabsTrigger value="sell">Bán Nông Sản</TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="mt-4 flex-1 overflow-y-auto pr-3">
            <BuySeedMarket
              seedsToDisplay={seedsToDisplay}
              playerGold={playerGold}
              onBuyItem={onBuyItem}
              cropData={cropData}
              playerTier={playerTier}
              quantities={quantities}
              onQuantityButtonClick={handleQuantityButtonClick}
              onQuantityInputChange={handleQuantityInputChange}
              setQuantities={setQuantities}
            />
          </TabsContent>
          <TabsContent value="sell" className="mt-4 flex-1 overflow-y-auto pr-3">
            <SellCropMarket
              cropsToSell={cropsToSell}
              playerInventory={playerInventory}
              onSellItem={onSellItem}
              cropData={cropData}
              quantities={quantities}
              onQuantityButtonClick={handleQuantityButtonClick}
              onQuantityInputChange={handleQuantityInputChange}
              setQuantities={setQuantities}
            />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarketModal;
