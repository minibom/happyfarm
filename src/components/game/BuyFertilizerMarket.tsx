
import React, { type FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coins, MinusCircle, PlusCircle, Lock, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { FertilizerDetails, FertilizerId, InventoryItem, MarketItemDisplay } from '@/types'; // Added MarketItemDisplay
import { getPlayerTierInfo } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

interface BuyFertilizerMarketProps {
  fertilizersToDisplay: (FertilizerDetails & {effectivePrice: number, basePrice?: number})[]; // Updated type
  playerGold: number;
  onBuyItem: (itemId: InventoryItem, quantity: number, price: number) => void;
  playerTier: number;
  quantities: Record<InventoryItem, number>;
  onQuantityButtonClick: (itemId: InventoryItem, delta: number, type: 'fertilizer', itemUnlockTier: number) => void;
  onQuantityInputChange: (itemId: InventoryItem, value: string, type: 'fertilizer', itemUnlockTier: number) => void;
  setQuantities: React.Dispatch<React.SetStateAction<Record<InventoryItem, number>>>;
}

const BuyFertilizerMarket: FC<BuyFertilizerMarketProps> = ({
  fertilizersToDisplay,
  playerGold,
  onBuyItem,
  playerTier,
  quantities,
  onQuantityButtonClick,
  onQuantityInputChange,
  setQuantities,
}) => {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
        {fertilizersToDisplay.map(item => {
          const quantity = quantities[item.id] || 0;
          const isLockedForPurchase = playerTier < item.unlockTier;
          const requiredTierInfo = isLockedForPurchase ? getPlayerTierInfo( (item.unlockTier-1) * 10 +1 ) : null;
          
          // Use effectivePrice from the item itself, which is pre-calculated by useMarket
          const finalPrice = item.effectivePrice;
          const basePrice = item.basePrice || item.price; // Fallback to item.price if basePrice isn't on the extended type
          const priceChangeIndicator = finalPrice > basePrice ? <TrendingUp className="w-3 h-3 text-green-500" /> : finalPrice < basePrice ? <TrendingDown className="w-3 h-3 text-red-500" /> : null;

          return (
            <Card key={item.id} className={cn("overflow-hidden shadow-md flex flex-col", isLockedForPurchase && "bg-muted/60 opacity-70")}>
              <CardContent className="p-2 flex flex-col items-center flex-grow">
                <div className="relative w-full flex justify-center">
                  <span className="text-3xl my-1">{item.icon}</span>
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
                   {priceChangeIndicator && !isLockedForPurchase && ( // Show event hint if price changed
                     <div className="absolute top-0 left-0 p-0.5 bg-blue-500/70 rounded-br-md">
                        <Tooltip>
                            <TooltipTrigger asChild>
                               <Info className="w-3 h-3 text-white cursor-help"/>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-xs">
                                <p>Giá bị ảnh hưởng bởi sự kiện!</p>
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
                <Tooltip>
                    <TooltipTrigger asChild>
                        <p className="text-[10px] text-muted-foreground text-center line-clamp-2 mb-1 cursor-help h-7">
                            {item.description}
                        </p>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                        <p className="text-xs">{item.description}</p>
                    </TooltipContent>
                </Tooltip>
                <div className="flex items-center gap-1 mt-auto">
                  <Button variant="ghost" size="icon" onClick={() => onQuantityButtonClick(item.id, -1, 'fertilizer', item.unlockTier)} className="h-6 w-6" disabled={isLockedForPurchase}>
                    <MinusCircle className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={isLockedForPurchase ? 0 : quantity}
                    onChange={(e) => onQuantityInputChange(item.id, e.target.value, 'fertilizer', item.unlockTier)}
                    className="h-7 w-10 text-center px-1 text-sm"
                    readOnly={isLockedForPurchase}
                    min="0"
                  />
                  <Button variant="ghost" size="icon" onClick={() => onQuantityButtonClick(item.id, 1, 'fertilizer', item.unlockTier)} className="h-6 w-6" disabled={isLockedForPurchase}>
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {fertilizersToDisplay.length === 0 && (
              <p className="text-center text-muted-foreground py-4 col-span-full">Không có phân bón nào để mua hoặc bạn chưa đạt bậc yêu cầu.</p>
          )}
      </div>
    </TooltipProvider>
  );
};

export default BuyFertilizerMarket;
