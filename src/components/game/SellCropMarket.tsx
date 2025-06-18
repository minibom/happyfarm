
import React, { type FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coins, MinusCircle, PlusCircle, Wheat, TrendingUp, TrendingDown } from 'lucide-react';
import type { MarketItem, InventoryItem, CropId, CropDetails, MarketPriceData, MarketPriceChange, MarketEventData, MarketItemId } from '@/types';
import { cn } from '@/lib/utils';

interface SellCropMarketProps {
  cropsToSell: MarketItem[]; // Includes dynamic price from MarketModal
  playerInventory: Record<InventoryItem, number>;
  onSellItem: (itemId: InventoryItem, quantity: number, price: number) => void;
  cropData: Record<CropId, CropDetails> | null;
  quantities: Record<InventoryItem, number>;
  onQuantityButtonClick: (itemId: InventoryItem, delta: number, type: 'seed' | 'crop', itemUnlockTier: number) => void;
  onQuantityInputChange: (itemId: InventoryItem, value: string, type: 'seed' | 'crop', itemUnlockTier: number) => void;
  setQuantities: React.Dispatch<React.SetStateAction<Record<InventoryItem, number>>>;
  marketPrices: MarketPriceData;
  priceChanges: MarketPriceChange;
  marketEvent: MarketEventData | null;
  getItemDetails: (itemId: MarketItemId) => ({ name: string, icon: string, basePrice: number, type: 'seed' | 'crop', unlockTier: number }) | null;
}

const SellCropMarket: FC<SellCropMarketProps> = ({
  cropsToSell,
  playerInventory,
  onSellItem,
  cropData,
  quantities,
  onQuantityButtonClick,
  onQuantityInputChange,
  setQuantities,
  marketPrices,
  priceChanges,
  marketEvent,
  getItemDetails,
}) => {
  return (
    <div className="space-y-3 p-1">
      {cropsToSell.map(item => {
        const quantity = quantities[item.id] || 0;

        const itemDetails = getItemDetails(item.id);
        if (!itemDetails) return null;

        const currentPrice = marketPrices[item.id] ?? itemDetails.basePrice;
        let eventAdjustedPrice = currentPrice;
        if (marketEvent?.isActive && marketEvent.itemId === item.id && marketEvent.priceModifier) {
          eventAdjustedPrice = Math.max(1, Math.round(currentPrice * marketEvent.priceModifier));
        }
        const finalPrice = eventAdjustedPrice;

        const priceChangePercent = priceChanges[item.id] || 0;
        const itemIcon = itemDetails.icon || <Wheat className="w-5 h-5 text-yellow-600"/>;

        return (
          <Card key={item.id} className="overflow-hidden shadow">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {typeof itemIcon === 'string' ? <span className="text-xl">{itemIcon}</span> : itemIcon}
                  <span className="font-semibold">{itemDetails.name}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-primary">
                  <Coins className="w-4 h-4" />
                  <span>{finalPrice}</span>
                  {priceChangePercent > 0 && <TrendingUp className="w-3 h-3 text-green-500" />}
                  {priceChangePercent < 0 && <TrendingDown className="w-3 h-3 text-red-500" />}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onQuantityButtonClick(item.id, -1, item.type, item.unlockTier)} className="h-7 w-7">
                    <MinusCircle className="w-5 h-5" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => onQuantityInputChange(item.id, e.target.value, item.type, item.unlockTier)}
                    className="h-8 w-12 text-center px-1"
                    min="0"
                    max={playerInventory[item.id] || 0}
                  />
                  <Button variant="ghost" size="icon" onClick={() => onQuantityButtonClick(item.id, 1, item.type, item.unlockTier)} className="h-7 w-7">
                    <PlusCircle className="w-5 h-5" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    onSellItem(item.id, quantity, finalPrice); // Use finalPrice for transaction
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
  );
};

export default SellCropMarket;
