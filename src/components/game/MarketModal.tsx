
import React, { type FC, useState, useMemo, useEffect } from 'react';
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
import type { InventoryItem, CropDetails, CropId, MarketItemId, MarketEventData } from '@/types';
import { ShoppingCart, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { getPlayerTierInfo, CROP_DATA, ALL_SEED_IDS, ALL_CROP_IDS } from '@/lib/constants';
import BuySeedMarket from './BuySeedMarket';
import SellCropMarket from './SellCropMarket';
import { useMarket, type MarketData } from '@/hooks/useMarket'; // Updated import
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface MarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerGold: number;
  playerInventory: Record<InventoryItem, number>;
  onBuyItem: (itemId: InventoryItem, quantity: number, price: number) => void;
  onSellItem: (itemId: InventoryItem, quantity: number, price: number) => void;
  // cropData and playerTier are now less directly used for pricing, but good for context
  cropData: Record<CropId, CropDetails> | null; 
  playerTier: number;
}

const MarketModal: FC<MarketModalProps> = ({
  isOpen,
  onClose,
  playerGold,
  playerInventory,
  onBuyItem,
  onSellItem,
  cropData, // Keep for potential fallbacks or detailed item info not in market state
  playerTier,
}) => {
  const market = useMarket();
  const [quantities, setQuantities] = useState<Record<InventoryItem, number>>({});

  // Reset quantities when modal opens or market data changes significantly
  useEffect(() => {
    if (isOpen) {
      setQuantities({});
    }
  }, [isOpen, market.prices]);


  const seedsToDisplay = useMemo(() => {
    if (market.loading || !cropData) return [];
    // Use ALL_SEED_IDS from constants to ensure all potential seeds are considered
    return ALL_SEED_IDS.map(seedId => {
      const details = market.getItemDetails(seedId);
      if (!details) return null;
      return {
        id: seedId,
        name: details.name,
        price: market.prices[seedId] ?? details.basePrice, // Use dynamic price, fallback to base
        type: 'seed' as 'seed',
        unlockTier: details.unlockTier,
        icon: details.icon,
      };
    }).filter(item => item !== null)
      .sort((a, b) => {
          if (!a || !b) return 0;
          const aIsLocked = a.unlockTier > playerTier;
          const bIsLocked = b.unlockTier > playerTier;
          if (aIsLocked !== bIsLocked) return aIsLocked ? 1 : -1;
          if (a.unlockTier !== b.unlockTier) return a.unlockTier - b.unlockTier;
          return a.name.localeCompare(b.name);
      }) as MarketItem[]; // Assert type after filtering nulls
  }, [market.loading, market.prices, market.getItemDetails, playerTier, cropData]);

  const cropsToSell = useMemo(() => {
    if (market.loading || !playerInventory || !cropData) return [];
    // Use ALL_CROP_IDS for available crops to sell
    return ALL_CROP_IDS.map(cropId => {
      if ((playerInventory[cropId] || 0) <= 0) return null; // Only if player has some
      const details = market.getItemDetails(cropId);
      if (!details) return null;
      return {
        id: cropId,
        name: details.name,
        price: market.prices[cropId] ?? details.basePrice, // Use dynamic price
        type: 'crop' as 'crop',
        unlockTier: details.unlockTier, // For consistency, though not directly used for selling
        icon: details.icon,
      };
    }).filter(item => item !== null)
      .sort((a,b) => {
          if (!a || !b) return 0;
          return a.name.localeCompare(b.name);
      }) as MarketItem[];
  }, [market.loading, market.prices, playerInventory, market.getItemDetails, cropData]);


  if (market.loading && !market.prices) { // Show loader if critical data isn't ready
     return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg md:max-w-xl">
                 <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
                        <ShoppingCart className="w-7 h-7 text-primary" /> Chợ
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-lg text-muted-foreground">Đang tải dữ liệu chợ...</p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
  }

  const handleQuantityButtonClick = (itemId: InventoryItem, delta: number, type: 'seed' | 'crop', itemUnlockTier: number) => {
    const itemDetails = market.getItemDetails(itemId);
    if (!itemDetails) return;
    const currentMarketPrice = market.prices[itemId] ?? itemDetails.basePrice;

    if (type === 'seed' && playerTier < itemUnlockTier && delta > 0) return;

    setQuantities(prev => {
      const currentQuantity = prev[itemId] || 0;
      let newQuantity = currentQuantity + delta;
      if (newQuantity < 0) newQuantity = 0;

      if (type === 'crop') {
        const maxSellable = playerInventory[itemId] || 0;
        if (newQuantity > maxSellable) newQuantity = maxSellable;
      }
      // Consider max buyable based on gold for seeds if desired
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const handleQuantityInputChange = (
    itemId: InventoryItem,
    value: string,
    type: 'seed' | 'crop',
    itemUnlockTier: number
  ) => {
    const itemDetails = market.getItemDetails(itemId);
    if (!itemDetails) return;

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
  
  const renderMarketEventBanner = (event: MarketEventData | null) => {
    if (!event || !event.isActive) return null;

    let bgColor = "bg-blue-500";
    let icon = <Info className="w-5 h-5" />;
    if (event.priceModifier && event.priceModifier > 1) {
        bgColor = "bg-green-500";
        icon = <TrendingUp className="w-5 h-5" />;
    } else if (event.priceModifier && event.priceModifier < 1) {
        bgColor = "bg-red-500";
        icon = <TrendingDown className="w-5 h-5" />;
    }

    return (
      <div className={cn("p-3 rounded-md text-sm text-white mb-4 shadow-lg", bgColor)}>
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h4 className="font-bold text-base">{event.eventName}</h4>
        </div>
        <p className="text-xs leading-relaxed">{event.description}</p>
        {event.effectDescription && <p className="mt-1 text-xs font-semibold">{event.effectDescription}</p>}
        {event.expiresAt && (
          <p className="mt-1 text-xs opacity-80">
            Kết thúc sau: {new Date(event.expiresAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            {' '}({new Date(event.expiresAt).toLocaleDateString('vi-VN')})
          </p>
        )}
      </div>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <ShoppingCart className="w-7 h-7 text-primary" /> Chợ Nông Sản
          </DialogTitle>
          <DialogDescription>
            Giá cả có thể thay đổi! Vàng: {playerGold.toLocaleString()} | Bậc: {getPlayerTierInfo(playerTier * 10 - 9).tierName} (Bậc {playerTier})
          </DialogDescription>
        </DialogHeader>

        {renderMarketEventBanner(market.currentEvent)}
        {market.error && (
            <div className="p-3 my-2 bg-destructive/10 border border-destructive text-destructive text-xs rounded-md flex items-center gap-2">
                <AlertTriangle className="h-4 w-4"/>
                Không thể tải dữ liệu thị trường mới nhất. Giá hiển thị có thể không chính xác.
            </div>
        )}

        <Tabs defaultValue="buy" className="w-full flex-grow flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Mua Hạt Giống</TabsTrigger>
            <TabsTrigger value="sell">Bán Nông Sản</TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="mt-2 flex-1 overflow-y-auto pr-1 pb-1">
            <BuySeedMarket
              seedsToDisplay={seedsToDisplay}
              playerGold={playerGold}
              onBuyItem={onBuyItem}
              cropData={cropData} // Pass full CROP_DATA for item details
              playerTier={playerTier}
              quantities={quantities}
              onQuantityButtonClick={handleQuantityButtonClick}
              onQuantityInputChange={handleQuantityInputChange}
              setQuantities={setQuantities}
              marketPrices={market.prices}
              priceChanges={market.priceChanges}
              marketEvent={market.currentEvent}
              getItemDetails={market.getItemDetails}
            />
          </TabsContent>
          <TabsContent value="sell" className="mt-2 flex-1 overflow-y-auto pr-1 pb-1">
            <SellCropMarket
              cropsToSell={cropsToSell}
              playerInventory={playerInventory}
              onSellItem={onSellItem}
              cropData={cropData} // Pass full CROP_DATA
              quantities={quantities}
              onQuantityButtonClick={handleQuantityButtonClick}
              onQuantityInputChange={handleQuantityInputChange}
              setQuantities={setQuantities}
              marketPrices={market.prices}
              priceChanges={market.priceChanges}
              marketEvent={market.currentEvent}
              getItemDetails={market.getItemDetails}
            />
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarketModal;
