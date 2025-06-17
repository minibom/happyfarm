
import React, { type FC, useState } from 'react';
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

  if (!marketItems || !cropData) {
     return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
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

  const handleQuantityChange = (itemId: InventoryItem, delta: number, type: 'seed' | 'crop', itemUnlockTier: number) => {
    if (type === 'seed' && playerTier < itemUnlockTier && delta > 0) return; // Prevent increasing quantity for locked items

    setQuantities(prev => {
      const currentQuantity = prev[itemId] || 0;
      let newQuantity = currentQuantity + delta;
      if (newQuantity < 0) newQuantity = 0;
      
      if (type === 'crop') { // Selling crops
        const maxSellable = playerInventory[itemId] || 0;
        if (newQuantity > maxSellable) newQuantity = maxSellable;
      }
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const seedsToBuy = marketItems.filter(item => item.type === 'seed');
  const cropsToSell = marketItems.filter(item => item.type === 'crop');

  const renderMarketList = (items: MarketItem[], actionType: 'buy' | 'sell') => (
    <ScrollArea className="h-72">
      <TooltipProvider>
        <div className="space-y-3 pr-2">
          {items.map(item => {
            const quantity = quantities[item.id] || 0;
            const isLocked = actionType === 'buy' && playerTier < item.unlockTier;
            const requiredTierName = isLocked ? getPlayerTierInfo((item.unlockTier -1) * 10 + 1).tierName : "";


            const itemIcon = item.icon || (item.type === 'seed' ? <Wheat className="w-5 h-5 text-yellow-600"/> : <Coins className="w-5 h-5 text-green-600"/>);
            
            return (
              <Card key={item.id} className={cn("overflow-hidden shadow", isLocked && "bg-muted/50 opacity-70")}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      {typeof itemIcon === 'string' ? <span className="text-xl">{itemIcon}</span> : itemIcon}
                      <span className="font-semibold">{item.name}</span>
                      {isLocked && (
                         <Tooltip>
                            <TooltipTrigger>
                                <Lock className="w-4 h-4 text-destructive" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Mở khóa ở {requiredTierName} (Bậc {item.unlockTier})</p>
                            </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-primary">
                      <Coins className="w-4 h-4" />
                      <span>{item.price}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(item.id, -1, item.type, item.unlockTier)} className="h-7 w-7" disabled={isLocked}>
                        <MinusCircle className="w-5 h-5" />
                      </Button>
                      <span className="w-8 text-center font-medium">{isLocked ? 0 : quantity}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(item.id, 1, item.type, item.unlockTier)} className="h-7 w-7" disabled={isLocked}>
                        <PlusCircle className="w-5 h-5" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (actionType === 'buy') onBuyItem(item.id, quantity, item.price);
                        else onSellItem(item.id, quantity, item.price);
                        setQuantities(prev => ({ ...prev, [item.id]: 0 }));
                      }}
                      disabled={isLocked || quantity === 0 || (actionType === 'buy' && playerGold < item.price * quantity)}
                      className={actionType === 'buy' ? 'bg-accent hover:bg-accent/90' : 'bg-blue-500 hover:bg-blue-500/90'}
                    >
                      {actionType === 'buy' ? 'Mua' : 'Bán'}
                    </Button>
                  </div>
                  {actionType === 'sell' && <p className="text-xs text-muted-foreground mt-1">Bạn có: {playerInventory[item.id] || 0}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TooltipProvider>
    </ScrollArea>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <ShoppingCart className="w-7 h-7 text-primary" /> Chợ
          </DialogTitle>
          <DialogDescription>
            Mua hạt giống và bán nông sản thu hoạch được. Vàng hiện tại: {playerGold.toLocaleString()}
            <br />
            Bậc hiện tại: {getPlayerTierInfo(playerTier * 10 - 9).tierName} (Bậc {playerTier})
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Mua Hạt Giống</TabsTrigger>
            <TabsTrigger value="sell">Bán Nông Sản</TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="mt-4">
            {renderMarketList(seedsToBuy, 'buy')}
          </TabsContent>
          <TabsContent value="sell" className="mt-4">
            {renderMarketList(cropsToSell, 'sell')}
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
