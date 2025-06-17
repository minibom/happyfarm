
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
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { InventoryItem, MarketItem, CropDetails, CropId } from '@/types';
import { Coins, MinusCircle, PlusCircle, ShoppingCart, Wheat, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TIER_NAMES, getPlayerTierInfo } from '@/lib/constants';
import { Input } from '@/components/ui/input';

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
      item.type === 'seed' && (item.unlockTier <= playerTier || item.unlockTier === playerTier + 1)
    );
    // Sort: unlocked first (by tier, then name), then locked (next tier, by name).
    return filteredSeeds.sort((a, b) => {
        const aIsLocked = a.unlockTier > playerTier;
        const bIsLocked = b.unlockTier > playerTier;

        if (aIsLocked !== bIsLocked) {
            return aIsLocked ? 1 : -1; // Unlocked items first
        }

        // If both are locked or both are unlocked, sort by tier then by name
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
    ).sort((a,b) => { // Optional: sort sellable crops by name
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
    if (type === 'seed' && playerTier < itemUnlockTier) return;

    let numValue = parseInt(value, 10);
    if (isNaN(numValue) || value === '') {
      numValue = 0;
    }
    if (numValue < 0) numValue = 0;

    if (type === 'crop') {
      const maxSellable = playerInventory[itemId] || 0;
      if (numValue > maxSellable) numValue = maxSellable;
    }

    setQuantities(prev => ({ ...prev, [itemId]: numValue }));
  };


  const renderSeedMarketGrid = () => (
    <ScrollArea className="max-h-[60vh]">
      <TooltipProvider>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
          {seedsToDisplay.map(item => {
            const quantity = quantities[item.id] || 0;
            const isLockedForPurchase = playerTier < item.unlockTier;
            const requiredTierInfo = isLockedForPurchase ? getPlayerTierInfo( (item.unlockTier-1) * 10 +1 ) : null;

            const itemIcon = item.icon || <Wheat className="w-8 h-8 text-yellow-600"/>;

            return (
              <Card key={item.id} className={cn("overflow-hidden shadow-md flex flex-col", isLockedForPurchase && "bg-muted/60 opacity-70")}>
                <CardContent className="p-2 flex flex-col items-center flex-grow">
                  <div className="relative w-full flex justify-center">
                    {typeof itemIcon === 'string' ? <span className="text-3xl my-1">{itemIcon}</span> : <div className="my-1">{itemIcon}</div>}
                    {isLockedForPurchase && (
                      <div className="absolute top-0 right-0 p-1 bg-black/50 rounded-bl-md">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Lock className="w-3 h-3 text-white cursor-help" />
                            </TooltipTrigger>
                             {requiredTierInfo && (
                                <TooltipContent>
                                    <p>Mở khóa ở {requiredTierInfo.tierName} (Bậc {item.unlockTier})</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-center truncate w-full mt-1 mb-0.5" title={item.name}>{item.name}</span>
                  <div className="flex items-center gap-1 text-sm text-primary my-0.5">
                    <Coins className="w-4 h-4" />
                    <span>{item.price}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-auto">
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityButtonClick(item.id, -1, item.type, item.unlockTier)} className="h-6 w-6" disabled={isLockedForPurchase}>
                      <MinusCircle className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={isLockedForPurchase ? 0 : quantity}
                      onChange={(e) => handleQuantityInputChange(item.id, e.target.value, item.type, item.unlockTier)}
                      className="h-7 w-10 text-center px-1 text-sm"
                      readOnly={isLockedForPurchase}
                      min="0"
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityButtonClick(item.id, 1, item.type, item.unlockTier)} className="h-6 w-6" disabled={isLockedForPurchase}>
                      <PlusCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
                <Button
                  size="sm"
                  onClick={() => {
                    onBuyItem(item.id, quantity, item.price);
                    setQuantities(prev => ({ ...prev, [item.id]: 0 }));
                  }}
                  disabled={isLockedForPurchase || quantity === 0 || playerGold < item.price * quantity}
                  className="w-full rounded-t-none bg-accent hover:bg-accent/90 text-xs py-1 h-auto"
                >
                  Mua
                </Button>
              </Card>
            );
          })}
           {seedsToDisplay.length === 0 && (
                <p className="text-center text-muted-foreground py-4 col-span-full">Không có hạt giống nào để mua ở bậc này.</p>
            )}
        </div>
      </TooltipProvider>
    </ScrollArea>
  );

  const renderCropSellList = () => (
    <ScrollArea className="max-h-[60vh]">
      <div className="space-y-3 pr-2">
        {cropsToSell.map(item => {
          const quantity = quantities[item.id] || 0;
          const itemIcon = item.icon || <Coins className="w-5 h-5 text-green-600"/>;
          return (
            <Card key={item.id} className="overflow-hidden shadow">
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    {typeof itemIcon === 'string' ? <span className="text-xl">{itemIcon}</span> : itemIcon}
                    <span className="font-semibold">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-primary">
                    <Coins className="w-4 h-4" />
                    <span>{item.price}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityButtonClick(item.id, -1, item.type, item.unlockTier)} className="h-7 w-7">
                      <MinusCircle className="w-5 h-5" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityInputChange(item.id, e.target.value, item.type, item.unlockTier)}
                      className="h-8 w-12 text-center px-1"
                      min="0"
                      max={playerInventory[item.id] || 0}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityButtonClick(item.id, 1, item.type, item.unlockTier)} className="h-7 w-7">
                      <PlusCircle className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      onSellItem(item.id, quantity, item.price);
                      setQuantities(prev => ({ ...prev, [item.id]: 0 }));
                    }}
                    disabled={quantity === 0 || (playerInventory[item.id] || 0) < quantity}
                    className='bg-blue-500 hover:bg-blue-500/90'
                  >
                    Bán
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Bạn có: {playerInventory[item.id] || 0}</p>
              </CardContent>
            </Card>
          );
        })}
        {cropsToSell.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Không có nông sản nào trong kho để bán.</p>
        )}
      </div>
    </ScrollArea>
  );


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <ShoppingCart className="w-7 h-7 text-primary" /> Chợ
          </DialogTitle>
          <DialogDescription>
            Mua hạt giống và bán nông sản. Vàng: {playerGold.toLocaleString()} | Bậc: {getPlayerTierInfo(playerTier * 10 - 9).tierName} (Bậc {playerTier})
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Mua Hạt Giống</TabsTrigger>
            <TabsTrigger value="sell">Bán Nông Sản</TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="mt-4">
            {renderSeedMarketGrid()}
          </TabsContent>
          <TabsContent value="sell" className="mt-4">
            {renderCropSellList()}
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

