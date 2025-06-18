
import React, { type FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coins, MinusCircle, PlusCircle, Lock, Clock, Wheat, TrendingUp, TrendingDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { MarketItem, InventoryItem, CropId, CropDetails, MarketPriceData, MarketPriceChange, MarketEventData, MarketItemId } from '@/types';
import { getPlayerTierInfo } from '@/lib/constants';

interface BuySeedMarketProps {
  seedsToDisplay: MarketItem[]; // This now includes dynamic price from MarketModal
  playerGold: number;
  onBuyItem: (itemId: InventoryItem, quantity: number, price: number) => void;
  cropData: Record<CropId, CropDetails> | null; // For detailed info not in MarketItem
  playerTier: number;
  quantities: Record<InventoryItem, number>;
  onQuantityButtonClick: (itemId: InventoryItem, delta: number, type: 'seed' | 'crop', itemUnlockTier: number) => void;
  onQuantityInputChange: (itemId: InventoryItem, value: string, type: 'seed' | 'crop', itemUnlockTier: number) => void;
  setQuantities: React.Dispatch<React.SetStateAction<Record<InventoryItem, number>>>;
  marketPrices: MarketPriceData;
  priceChanges: MarketPriceChange;
  marketEvent: MarketEventData | null;
  getItemDetails: (itemId: MarketItemId) => ({ name: string, icon: string, basePrice: number, type: 'seed' | 'crop', unlockTier: number }) | null;
}

const formatMillisecondsToTime = (ms: number): string => {
  if (isNaN(ms) || ms <= 0) {
    return '0s';
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  let formattedTime = "";

  if (hours > 0) {
    formattedTime += `${String(hours).padStart(2, '0')}h `;
  }
  if (hours > 0 || minutes > 0) {
    formattedTime += `${String(minutes).padStart(2, '0')}m `;
  }
  formattedTime += `${String(seconds).padStart(2, '0')}s`;
  
  return formattedTime.trim();
};

const BuySeedMarket: FC<BuySeedMarketProps> = ({
  seedsToDisplay,
  playerGold,
  onBuyItem,
  cropData, // Now primarily for non-price details
  playerTier,
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
        {seedsToDisplay.map(item => {
          const quantity = quantities[item.id] || 0;
          const isLockedForPurchase = playerTier < item.unlockTier;
          const requiredTierInfo = isLockedForPurchase ? getPlayerTierInfo( (item.unlockTier-1) * 10 +1 ) : null;
          
          const itemDetails = getItemDetails(item.id); // Get base details
          if (!itemDetails || !cropData) return null;

          const currentPrice = marketPrices[item.id] ?? itemDetails.basePrice;
          let eventAdjustedPrice = currentPrice;
          if (marketEvent?.isActive && marketEvent.itemId === item.id && marketEvent.priceModifier) {
            eventAdjustedPrice = Math.max(1, Math.round(currentPrice * marketEvent.priceModifier));
          }
          const finalPrice = eventAdjustedPrice;


          const priceChangePercent = priceChanges[item.id] || 0;

          const itemIcon = itemDetails.icon || <Wheat className="w-8 h-8 text-yellow-600"/>;
          const cropDetailFromData = cropData[item.id.replace('Seed', '') as CropId]; // For timeToGrow etc.
          const totalHarvestTime = cropDetailFromData ? cropDetailFromData.timeToGrowing + cropDetailFromData.timeToReady : 0;
          const formattedHarvestTime = formatMillisecondsToTime(totalHarvestTime);

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
                <span className="text-xs font-semibold text-center truncate w-full mt-1 mb-0.5" title={itemDetails.name}>{itemDetails.name}</span>
                <div className="flex items-center gap-1 text-sm text-primary my-0.5">
                  <Coins className="w-4 h-4" />
                  <span>{finalPrice}</span>
                  {priceChangePercent > 0 && <TrendingUp className="w-3 h-3 text-green-500" />}
                  {priceChangePercent < 0 && <TrendingDown className="w-3 h-3 text-red-500" />}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Clock className="w-3 h-3" />
                  <span>{formattedHarvestTime}</span>
                </div>
                <div className="flex items-center gap-1 mt-auto">
                  <Button variant="ghost" size="icon" onClick={() => onQuantityButtonClick(item.id, -1, item.type, item.unlockTier)} className="h-6 w-6" disabled={isLockedForPurchase}>
                    <MinusCircle className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={isLockedForPurchase ? 0 : quantity}
                    onChange={(e) => onQuantityInputChange(item.id, e.target.value, item.type, item.unlockTier)}
                    className="h-7 w-10 text-center px-1 text-sm"
                    readOnly={isLockedForPurchase}
                    min="0"
                  />
                  <Button variant="ghost" size="icon" onClick={() => onQuantityButtonClick(item.id, 1, item.type, item.unlockTier)} className="h-6 w-6" disabled={isLockedForPurchase}>
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
              <Button
                size="sm"
                onClick={() => {
                  onBuyItem(item.id, quantity, finalPrice); // Use finalPrice for transaction
                  setQuantities(prev => ({ ...prev, [item.id]: 0 }));
                }}
                disabled={isLockedForPurchase || quantity === 0 || playerGold < finalPrice * quantity}
                className="w-full rounded-t-none bg-accent hover:bg-accent/90 text-xs py-1 h-auto"
              >
                Mua
              </Button>
            </Card>
          );
        })}
        {seedsToDisplay.length === 0 && (
              <p className="text-center text-muted-foreground py-4 col-span-full">Không có hạt giống nào để mua.</p>
          )}
      </div>
    </TooltipProvider>
  );
};

export default BuySeedMarket;
