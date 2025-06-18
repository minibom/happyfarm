
import React, { type FC, useState, useMemo, useEffect, useCallback } from 'react';
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
import type { InventoryItem, CropDetails, CropId, MarketItemId, MarketEventData, MarketItemDisplay, FertilizerDetails, FertilizerId, ActiveGameEvent } from '@/types';
import { ShoppingCart, TrendingUp, TrendingDown, AlertTriangle, Info, Zap as FertilizerIcon, Coins } from 'lucide-react';
import { getPlayerTierInfo, CROP_DATA, ALL_SEED_IDS, ALL_CROP_IDS, FERTILIZER_DATA, ALL_FERTILIZER_IDS } from '@/lib/constants';
import BuySeedMarket from './BuySeedMarket';
import SellCropMarket from './SellCropMarket';
import BuyFertilizerMarket from './BuyFertilizerMarket';
import { useMarket } from '@/hooks/useMarket';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerGold: number;
  playerInventory: Record<InventoryItem, number>;
  onBuyItem: (itemId: InventoryItem, quantity: number, price: number) => void;
  onSellItem: (itemId: InventoryItem, quantity: number, price: number) => void;
  cropData: Record<CropId, CropDetails> | null; // Still useful for base details if market hook doesn't provide all
  playerTier: number;
}

type ActiveMarketTab = 'buy_seed' | 'sell_crop' | 'buy_fertilizer';

const MarketModal: FC<MarketModalProps> = ({
  isOpen,
  onClose,
  playerGold,
  playerInventory,
  onBuyItem,
  onSellItem,
  cropData, // Kept for fallback/direct access if needed, though useMarket is primary
  playerTier,
}) => {
  const market = useMarket();
  const { toast } = useToast();
  const [quantities, setQuantities] = useState<Record<InventoryItem, number>>({});
  const [activeTab, setActiveTab] = useState<ActiveMarketTab>('buy_seed');

  useEffect(() => {
    if (isOpen) {
      setQuantities({});
    }
  }, [isOpen, market.prices]); // Reset quantities when modal opens or market prices change


  const seedsToDisplay = useMemo(() => {
    if (market.loading) return [];
    return ALL_SEED_IDS.map(seedId => {
      const details = market.getItemDetails(seedId);
      if (!details) return null;
      return { // This structure matches MarketItemDisplay
        id: seedId,
        name: details.name,
        price: details.effectivePrice, // Use effectivePrice from market hook
        type: 'seed' as const,
        unlockTier: details.unlockTier,
        icon: details.icon,
        basePrice: details.basePrice,
        description: CROP_DATA[seedId.replace('Seed','') as CropId]?.description || ""
      };
    }).filter(item => item !== null)
      .sort((a, b) => {
          if (!a || !b) return 0;
          const aIsLocked = a.unlockTier > playerTier;
          const bIsLocked = b.unlockTier > playerTier;
          if (aIsLocked !== bIsLocked) return aIsLocked ? 1 : -1;
          if (a.unlockTier !== b.unlockTier) return a.unlockTier - b.unlockTier;
          return a.name.localeCompare(b.name);
      }) as MarketItemDisplay[];
  }, [market.loading, market.getItemDetails, playerTier]);

  const cropsToSell = useMemo(() => {
    if (market.loading || !playerInventory) return [];
    return ALL_CROP_IDS.map(cropId => {
      if ((playerInventory[cropId] || 0) <= 0) return null;
      const details = market.getItemDetails(cropId);
      if (!details) return null;
      return {
        id: cropId,
        name: details.name,
        price: details.effectivePrice, // Use effectivePrice
        type: 'crop' as const,
        unlockTier: details.unlockTier,
        icon: details.icon,
        basePrice: details.basePrice,
        description: CROP_DATA[cropId]?.description || ""
      };
    }).filter(item => item !== null)
      .sort((a,b) => {
          if (!a || !b) return 0;
          return a.name.localeCompare(b.name);
      }) as MarketItemDisplay[];
  }, [market.loading, playerInventory, market.getItemDetails]);

  const fertilizersToDisplay = useMemo(() => {
    if (market.loading) return [];
    return ALL_FERTILIZER_IDS.map(fertId => {
        const details = market.getItemDetails(fertId as FertilizerId); // Assuming getItemDetails can handle FertilizerId
        if (!details) return null;
        return {
            id: fertId,
            name: details.name,
            icon: details.icon,
            description: FERTILIZER_DATA[fertId as FertilizerId]?.description || "",
            unlockTier: details.unlockTier,
            price: details.effectivePrice, // Use effectivePrice
            timeReductionPercent: FERTILIZER_DATA[fertId as FertilizerId]?.timeReductionPercent || 0, // Assuming this is not price-event sensitive
            basePrice: details.basePrice
        };
    }).filter(item => item !== null)
      .sort((a,b) => {
          if (!a || !b) return 0;
          const aIsLocked = a.unlockTier > playerTier;
          const bIsLocked = b.unlockTier > playerTier;
          if (aIsLocked !== bIsLocked) return aIsLocked ? 1 : -1;
          if (a.unlockTier !== b.unlockTier) return a.unlockTier - b.unlockTier;
          return a.name.localeCompare(b.name);
      }) as (FertilizerDetails & {effectivePrice: number, basePrice?: number})[];
  }, [market.loading, market.getItemDetails, playerTier]);


  const handleQuantityButtonClick = (itemId: InventoryItem, delta: number, type: 'seed' | 'crop' | 'fertilizer', itemUnlockTier: number) => {
     const itemBaseDetails = market.getItemDetails(itemId as MarketItemId);

    if (!itemBaseDetails) return;
    if ((type === 'seed' || type === 'fertilizer') && playerTier < itemUnlockTier && delta > 0) return;

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
    type: 'seed' | 'crop' | 'fertilizer',
    itemUnlockTier: number
  ) => {
    const itemBaseDetails = market.getItemDetails(itemId as MarketItemId);
    if (!itemBaseDetails) return;

    if ((type === 'seed' || type === 'fertilizer') && playerTier < itemUnlockTier && value !== '' && parseInt(value, 10) > 0) return;

    let numValue = parseInt(value, 10);
    if (isNaN(numValue) || value === '') {
      numValue = 0;
    }
    if (numValue < 0) numValue = 0;

    if (type === 'crop') {
      const maxSellable = playerInventory[itemId] || 0;
      if (numValue > maxSellable) numValue = maxSellable;
    }

    if ((type === 'seed' || type === 'fertilizer') && playerTier < itemUnlockTier) {
        setQuantities(prev => ({ ...prev, [itemId]: 0 }));
    } else {
        setQuantities(prev => ({ ...prev, [itemId]: numValue }));
    }
  };

  const { totalAmount, itemsToTransactCount } = useMemo(() => {
    let currentTotal = 0;
    let count = 0;
    Object.entries(quantities).forEach(([itemId, quantity]) => {
      if (quantity > 0) {
        const details = market.getItemDetails(itemId as MarketItemId);
        if (details && details.effectivePrice > 0) {
            currentTotal += quantity * details.effectivePrice;
            count++;
        }
      }
    });
    return { totalAmount: currentTotal, itemsToTransactCount: count };
  }, [quantities, activeTab, market.getItemDetails]); // Depend on getItemDetails for prices


  const handleCentralizedTransaction = () => {
    let itemsProcessed = 0;
    let totalGoldTransacted = 0;
    let successfulTransactions = 0;
    let failedTransactions = 0;

    Object.entries(quantities).forEach(([itemIdStr, quantity]) => {
      if (quantity > 0) {
        const itemId = itemIdStr as InventoryItem;
        const details = market.getItemDetails(itemId as MarketItemId);
        
        if (details && details.effectivePrice > 0) {
          const effectivePrice = details.effectivePrice;
          const itemName = details.name;
          try {
            if (activeTab === 'buy_seed' || activeTab === 'buy_fertilizer') {
              if (playerGold >= quantity * effectivePrice) {
                onBuyItem(itemId, quantity, effectivePrice);
                totalGoldTransacted -= quantity * effectivePrice;
                successfulTransactions++;
              } else {
                failedTransactions++;
                toast({ title: "Mua Thất Bại", description: `Không đủ vàng để mua ${quantity}x ${itemName}.`, variant: "destructive" });
              }
            } else if (activeTab === 'sell_crop') {
              onSellItem(itemId, quantity, effectivePrice);
              totalGoldTransacted += quantity * effectivePrice;
              successfulTransactions++;
            }
            itemsProcessed++;
          } catch (e) {
            failedTransactions++;
            toast({ title: "Giao Dịch Lỗi", description: `Có lỗi khi xử lý ${itemName}.`, variant: "destructive" });
          }
        }
      }
    });

    if (itemsProcessed > 0) {
      if (successfulTransactions > 0 && failedTransactions === 0) {
        toast({ title: "Giao Dịch Hoàn Tất!", description: `Đã ${activeTab.startsWith('buy') ? 'mua' : 'bán'} ${successfulTransactions} loại vật phẩm. Tổng: ${Math.abs(totalGoldTransacted).toLocaleString()} vàng.`, className: "bg-green-500 text-white" });
      } else if (successfulTransactions > 0 && failedTransactions > 0) {
        toast({ title: "Giao Dịch Một Phần Hoàn Tất", description: `Đã ${activeTab.startsWith('buy') ? 'mua' : 'bán'} ${successfulTransactions} loại vật phẩm, ${failedTransactions} thất bại.`, variant: "default" });
      } else if (failedTransactions > 0) {
         toast({ title: "Giao Dịch Thất Bại", description: `Tất cả ${failedTransactions} giao dịch vật phẩm đã chọn đều thất bại.`, variant: "destructive" });
      }
      setQuantities({});
    } else {
      toast({ title: "Không Có Gì Để Giao Dịch", description: "Vui lòng chọn số lượng cho vật phẩm bạn muốn.", variant: "default" });
    }
  };


  const renderActiveMarketEvents = () => {
    if (market.activeMarketEvents.length === 0) return null;
    // Display only one relevant event or a summary
    const relevantEvent = market.activeMarketEvents.find(event => {
        if (activeTab === 'buy_seed' && event.type === 'ITEM_PURCHASE_PRICE_MODIFIER' && (event.affectedItemIds === 'ALL_SEEDS' || seedsToDisplay.some(s => Array.isArray(event.affectedItemIds) && event.affectedItemIds.includes(s.id)))) return true;
        if (activeTab === 'buy_fertilizer' && event.type === 'ITEM_PURCHASE_PRICE_MODIFIER' && (event.affectedItemIds === 'ALL_FERTILIZERS' || fertilizersToDisplay.some(f => Array.isArray(event.affectedItemIds) && event.affectedItemIds.includes(f.id as FertilizerId)))) return true;
        if (activeTab === 'sell_crop' && event.type === 'ITEM_SELL_PRICE_MODIFIER' && (event.affectedItemIds === 'ALL_CROPS' || cropsToSell.some(c => Array.isArray(event.affectedItemIds) && event.affectedItemIds.includes(c.id)))) return true;
        return false;
    });

    if (!relevantEvent) return null;

    let bgColor = "bg-blue-500";
    let icon = <Info className="w-5 h-5" />;
    if (relevantEvent.effects[0]?.value > 1 && (relevantEvent.type === 'ITEM_SELL_PRICE_MODIFIER' || relevantEvent.type === 'ITEM_PURCHASE_PRICE_MODIFIER')) { // Assuming value > 1 is price increase for sell, or higher cost for buy (less likely for player beneficial events)
        bgColor = "bg-green-500"; icon = <TrendingUp className="w-5 h-5" />;
    } else if (relevantEvent.effects[0]?.value < 1 && (relevantEvent.type === 'ITEM_SELL_PRICE_MODIFIER' || relevantEvent.type === 'ITEM_PURCHASE_PRICE_MODIFIER')) { // value < 1 is price decrease for sell (bad) or buy (good)
        bgColor = relevantEvent.type === 'ITEM_PURCHASE_PRICE_MODIFIER' ? "bg-green-500" : "bg-red-500";
        icon = relevantEvent.type === 'ITEM_PURCHASE_PRICE_MODIFIER' ? <TrendingDown className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />;
    }
    
    const effectDescription = relevantEvent.effects.map(eff => {
        let target = "mọi thứ";
        if (Array.isArray(eff.affectedItemIds)) target = eff.affectedItemIds.slice(0,2).join(', ') + (eff.affectedItemIds.length > 2 ? '...' : '');
        else if (eff.affectedItemIds) target = eff.affectedItemIds.replace('ALL_', '').toLowerCase();
        
        if (eff.type === 'ITEM_PURCHASE_PRICE_MODIFIER' || eff.type === 'ITEM_SELL_PRICE_MODIFIER') {
            return `${target} giá ${((eff.value -1) * 100).toFixed(0)}%`;
        }
        return "";
    }).join('; ');


    return (
      <div className={cn("p-3 rounded-md text-sm text-white mb-4 shadow-lg", bgColor)}>
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h4 className="font-bold text-base">{relevantEvent.name}</h4>
        </div>
        <p className="text-xs leading-relaxed">{relevantEvent.description}</p>
        {effectDescription && <p className="mt-1 text-xs font-semibold">{effectDescription}</p>}
        {relevantEvent.endTime && (
          <p className="mt-1 text-xs opacity-80">
            Kết thúc sau: {new Date(relevantEvent.endTime.toDate()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            {' '}({new Date(relevantEvent.endTime.toDate()).toLocaleDateString('vi-VN')})
          </p>
        )}
      </div>
    );
  };

  if (market.loading) {
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

  const centralButtonDisabled = itemsToTransactCount === 0 ||
                               ((activeTab === 'buy_seed' || activeTab === 'buy_fertilizer') && playerGold < totalAmount);
  const centralButtonText = activeTab === 'buy_seed' ? "Mua Hạt Giống Đã Chọn" :
                           activeTab === 'buy_fertilizer' ? "Mua Phân Bón Đã Chọn" :
                           "Bán Nông Sản Đã Chọn";


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <ShoppingCart className="w-7 h-7 text-primary" /> Chợ Nông Sản
          </DialogTitle>
          <DialogDescription>
            Giá cả có thể thay đổi! Vàng: {playerGold.toLocaleString()} | Bậc: {getPlayerTierInfo(playerTier * 10 - 9).tierName} (Bậc {playerTier})
          </DialogDescription>
        </DialogHeader>

        {renderActiveMarketEvents()}
        {market.error && (
            <div className="p-3 my-2 bg-destructive/10 border border-destructive text-destructive text-xs rounded-md flex items-center gap-2">
                <AlertTriangle className="h-4 w-4"/>
                Không thể tải dữ liệu thị trường mới nhất. Giá hiển thị có thể không chính xác.
            </div>
        )}

        <Tabs defaultValue="buy_seed" className="w-full flex-grow flex flex-col min-h-0" onValueChange={(value) => setActiveTab(value as ActiveMarketTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="buy_seed">Mua Hạt Giống</TabsTrigger>
            <TabsTrigger value="buy_fertilizer">
              <FertilizerIcon className="mr-1 h-4 w-4" /> Mua Phân Bón
            </TabsTrigger>
            <TabsTrigger value="sell_crop">Bán Nông Sản</TabsTrigger>
          </TabsList>
          <TabsContent value="buy_seed" className="mt-2 flex-1 overflow-y-auto pr-1 pb-1">
            <BuySeedMarket
              seedsToDisplay={seedsToDisplay}
              playerGold={playerGold}
              onBuyItem={onBuyItem}
              cropData={CROP_DATA} // Pass CROP_DATA directly
              playerTier={playerTier}
              quantities={quantities}
              onQuantityButtonClick={handleQuantityButtonClick}
              onQuantityInputChange={handleQuantityInputChange}
              setQuantities={setQuantities}
              marketPrices={market.prices}
              priceChanges={market.priceChanges}
              marketEvent={market.currentEvent} // Legacy, may remove
              getItemDetails={market.getItemDetails}
            />
          </TabsContent>
           <TabsContent value="buy_fertilizer" className="mt-2 flex-1 overflow-y-auto pr-1 pb-1">
            <BuyFertilizerMarket
              fertilizersToDisplay={fertilizersToDisplay}
              playerGold={playerGold}
              onBuyItem={onBuyItem}
              playerTier={playerTier}
              quantities={quantities}
              onQuantityButtonClick={handleQuantityButtonClick}
              onQuantityInputChange={handleQuantityInputChange}
              setQuantities={setQuantities}
            />
          </TabsContent>
          <TabsContent value="sell_crop" className="mt-2 flex-1 overflow-y-auto pr-1 pb-1">
            <SellCropMarket
              cropsToSell={cropsToSell}
              playerInventory={playerInventory}
              onSellItem={onSellItem}
              cropData={CROP_DATA} // Pass CROP_DATA directly
              quantities={quantities}
              onQuantityButtonClick={handleQuantityButtonClick}
              onQuantityInputChange={handleQuantityInputChange}
              setQuantities={setQuantities}
              marketPrices={market.prices}
              priceChanges={market.priceChanges}
              marketEvent={market.currentEvent} // Legacy, may remove
              getItemDetails={market.getItemDetails}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button 
                    onClick={handleCentralizedTransaction} 
                    disabled={centralButtonDisabled}
                    className={cn(activeTab.startsWith('buy') ? "bg-accent hover:bg-accent/90" : "bg-blue-500 hover:bg-blue-600", "text-white")}
                >
                    {centralButtonText} ({itemsToTransactCount})
                </Button>
            </div>
            <div className="text-right">
                <p className="text-sm text-muted-foreground">
                    {activeTab.startsWith('buy') ? "Tổng chi phí:" : "Tổng thu nhập:"}
                </p>
                <p className={cn("text-lg font-semibold flex items-center justify-end gap-1", (activeTab.startsWith('buy') && totalAmount > playerGold) ? "text-destructive" : "text-primary")}>
                    <Coins className="w-5 h-5" /> {totalAmount.toLocaleString()}
                </p>
            </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarketModal;
