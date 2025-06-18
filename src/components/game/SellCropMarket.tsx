
import React, { type FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coins, MinusCircle, PlusCircle, Wheat, TrendingUp, TrendingDown, Clock, Info } from 'lucide-react';
import type { MarketItemDisplay, InventoryItem, CropId, CropDetails, MarketPriceData, MarketPriceChange, MarketEventData, MarketItemId } from '@/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SellCropMarketProps {
  cropsToSell: MarketItemDisplay[]; // Changed
  playerInventory: Record<InventoryItem, number>;
  onSellItem: (itemId: InventoryItem, quantity: number, price: number) => void;
  cropData: Record<CropId, CropDetails> | null;
  quantities: Record<InventoryItem, number>;
  onQuantityButtonClick: (itemId: InventoryItem, delta: number, type: 'seed' | 'crop', itemUnlockTier: number) => void;
  onQuantityInputChange: (itemId: InventoryItem, value: string, type: 'seed' | 'crop', itemUnlockTier: number) => void;
  setQuantities: React.Dispatch<React.SetStateAction<Record<InventoryItem, number>>>;
  marketPrices: MarketPriceData; // Keep for reference
  priceChanges: MarketPriceChange; // Keep for reference
  marketEvent: MarketEventData | null; // Legacy
  getItemDetails: (itemId: MarketItemId) => ({ name: string, icon: string, basePrice: number, type: 'seed' | 'crop', unlockTier: number, effectivePrice: number }) | null;
}

const SellCropMarket: FC<SellCropMarketProps> = ({
  cropsToSell,
  playerInventory,
  onSellItem,
  cropData, // Unused if MarketItemDisplay has all info
  quantities,
  onQuantityButtonClick,
  onQuantityInputChange,
  setQuantities,
  marketPrices,
  priceChanges,
  marketEvent, // Legacy
  getItemDetails,
}) => {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
        {cropsToSell.map(item => {
          const quantity = quantities[item.id] || 0;
          
          // Price is now directly from item.price (which is effectivePrice)
          const finalPrice = item.price;
          const basePrice = item.basePrice || finalPrice; // Fallback
          const priceChangeIndicator = finalPrice > basePrice ? <TrendingUp className="w-3 h-3 text-green-500" /> : finalPrice < basePrice ? <TrendingDown className="w-3 h-3 text-red-500" /> : null;

          const itemIcon = item.icon || <Wheat className="w-8 h-8 text-yellow-600"/>;
          const eventTooltip = marketEvent?.isActive && marketEvent.itemId === item.id ? marketEvent.effectDescription : null;

          return (
            <Card key={item.id} className="overflow-hidden shadow-md flex flex-col">
              <CardContent className="p-2 flex flex-col items-center flex-grow">
                <div className="relative w-full flex justify-center">
                  {typeof itemIcon === 'string' ? <span className="text-3xl my-1">{itemIcon}</span> : <div className="my-1">{itemIcon}</div>}
                  {eventTooltip && (
                     <div className="absolute top-0 left-0 p-0.5 bg-blue-500/70 rounded-br-md">
                        <Tooltip>
                            <TooltipTrigger asChild>
                               <Info className="w-3 h-3 text-white cursor-help"/>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-xs">
                                <p>{eventTooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                     </div>
                   )}
                </div>
                <span className="text-xs font-semibold text-center truncate w-full mt-1 mb-0.5" title={item.name}>{item.name}</span>
                <div className="flex items-center gap-1 text-sm text-primary my-0.5">
                  <Coins className="w-4 h-4" />
                  <span>{finalPrice}</span>
                  {priceChangeIndicator}
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
