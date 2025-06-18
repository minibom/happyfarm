
import React, { type FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coins, MinusCircle, PlusCircle, Wheat, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import type { MarketItem, InventoryItem, CropId, CropDetails, MarketPriceData, MarketPriceChange, MarketEventData, MarketItemId } from '@/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SellCropMarketProps {
  cropsToSell: MarketItem[];
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
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
        {cropsToSell.map(item => {
          const quantity = quantities[item.id] || 0;
          const itemDetails = getItemDetails(item.id);
          if (!itemDetails || !cropData) return null;

          const currentPrice = marketPrices[item.id] ?? itemDetails.basePrice;
          let eventAdjustedPrice = currentPrice;
          if (marketEvent?.isActive && marketEvent.itemId === item.id && marketEvent.priceModifier) {
            eventAdjustedPrice = Math.max(1, Math.round(currentPrice * marketEvent.priceModifier));
          }
          const finalPrice = eventAdjustedPrice;

          const priceChangePercent = priceChanges[item.id] || 0;
          const itemIcon = itemDetails.icon || <Wheat className="w-8 h-8 text-yellow-600"/>;
          const cropDetailFromData = cropData[item.id as CropId]; // Crops for selling are always CropId

          return (
            <Card key={item.id} className="overflow-hidden shadow-md flex flex-col">
              <CardContent className="p-2 flex flex-col items-center flex-grow">
                <div className="relative w-full flex justify-center">
                  {typeof itemIcon === 'string' ? <span className="text-3xl my-1">{itemIcon}</span> : <div className="my-1">{itemIcon}</div>}
                </div>
                <span className="text-xs font-semibold text-center truncate w-full mt-1 mb-0.5" title={itemDetails.name}>{itemDetails.name}</span>
                <div className="flex items-center gap-1 text-sm text-primary my-0.5">
                  <Coins className="w-4 h-4" />
                  <span>{finalPrice}</span>
                  {priceChangePercent > 0 && <TrendingUp className="w-3 h-3 text-green-500" />}
                  {priceChangePercent < 0 && <TrendingDown className="w-3 h-3 text-red-500" />}
                </div>
                <p className="text-[10px] text-muted-foreground text-center mb-1">
                  Trong kho: {playerInventory[item.id] || 0}
                </p>
                <div className="flex items-center gap-1 mt-auto">
                  <Button variant="ghost" size="icon" onClick={() => onQuantityButtonClick(item.id, -1, item.type, item.unlockTier)} className="h-6 w-6">
                    <MinusCircle className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => onQuantityInputChange(item.id, e.target.value, item.type, item.unlockTier)}
                    className="h-7 w-10 text-center px-1 text-sm"
                    min="0"
                    max={playerInventory[item.id] || 0}
                  />
                  <Button variant="ghost" size="icon" onClick={() => onQuantityButtonClick(item.id, 1, item.type, item.unlockTier)} className="h-6 w-6">
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {cropsToSell.length === 0 && (
            <p className="text-center text-muted-foreground py-4 col-span-full">Không có nông sản nào trong kho để bán.</p>
        )}
      </div>
    </TooltipProvider>
  );
};

export default SellCropMarket;
