
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
import type { InventoryItem, MarketItem } from '@/types';
import { Coins, MinusCircle, PlusCircle, ShoppingCart, Wheat } from 'lucide-react';
import { CROP_DATA } from '@/lib/constants';

interface MarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketItems: MarketItem[];
  playerGold: number;
  playerInventory: Record<InventoryItem, number>;
  onBuyItem: (itemId: InventoryItem, quantity: number, price: number) => void;
  onSellItem: (itemId: InventoryItem, quantity: number, price: number) => void;
}

const MarketModal: FC<MarketModalProps> = ({
  isOpen,
  onClose,
  marketItems,
  playerGold,
  playerInventory,
  onBuyItem,
  onSellItem,
}) => {
  const [quantities, setQuantities] = useState<Record<InventoryItem, number>>({});

  const handleQuantityChange = (itemId: InventoryItem, delta: number, type: 'seed' | 'crop') => {
    setQuantities(prev => {
      const currentQuantity = prev[itemId] || 0;
      let newQuantity = currentQuantity + delta;
      if (newQuantity < 0) newQuantity = 0;
      
      if (type === 'crop') { // Selling
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
      <div className="space-y-3 pr-2">
        {items.map(item => {
          const quantity = quantities[item.id] || 0;
          const cropDetails = item.type === 'crop' ? CROP_DATA[item.id as keyof typeof CROP_DATA] : CROP_DATA[item.id.replace('Seed','') as keyof typeof CROP_DATA]
          const displayName = item.name; // MarketItem already has localized name
          const displayIcon = item.type === 'crop' ? cropDetails?.icon : undefined;

          return (
            <Card key={item.id} className="overflow-hidden shadow">
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    {actionType === 'buy' ? <Wheat className="w-5 h-5 text-yellow-600"/> : displayIcon ? <span className="text-xl">{displayIcon}</span> : <Coins className="w-5 h-5 text-green-600"/>}
                    <span className="font-semibold">{displayName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-primary">
                    <Coins className="w-4 h-4" />
                    <span>{item.price}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(item.id, -1, item.type)} className="h-7 w-7">
                      <MinusCircle className="w-5 h-5" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(item.id, 1, item.type)} className="h-7 w-7">
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
                    disabled={quantity === 0 || (actionType === 'buy' && playerGold < item.price * quantity)}
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
            Mua hạt giống và bán nông sản thu hoạch được. Vàng hiện tại: {playerGold}
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
