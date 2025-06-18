
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
import type { InventoryItem, CropDetails, CropId, MarketItemId, MarketEventData, MarketItemDisplay, FertilizerDetails, FertilizerId } from '@/types';
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
  cropData: Record<CropId, CropDetails> | null;
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
  cropData,
  playerTier,
}) => {
  const market = useMarket();
  const { toast } = useToast();
  const [quantities, setQuantities] = useState<Record<InventoryItem, number>>({});
  const [activeTab, setActiveTab] = useState<ActiveMarketTab>('buy_seed');

  useEffect(() => {
    if (isOpen) {
      setQuantities({}); // Reset quantities when modal opens or prices change (prices from market hook)
    }
  }, [isOpen, market.prices]);


  const seedsToDisplay = useMemo(() => {
    if (market.loading || !cropData) return [];
    return ALL_SEED_IDS.map(seedId => {
      const details = market.getItemDetails(seedId);
      if (!details) return null;
      return {
        id: seedId,
        name: details.name,
        price: market.prices[seedId] ?? details.basePrice,
        type: 'seed' as const,
        unlockTier: details.unlockTier,
        icon: details.icon,
        basePrice: details.basePrice,
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
  }, [market.loading, market.prices, market.getItemDetails, playerTier, cropData]);

  const cropsToSell = useMemo(() => {
    if (market.loading || !playerInventory || !cropData) return [];
    return ALL_CROP_IDS.map(cropId => {
      if ((playerInventory[cropId] || 0) <= 0) return null;
      const details = market.getItemDetails(cropId);
      if (!details) return null;
      return {
        id: cropId,
        name: details.name,
        price: market.prices[cropId] ?? details.basePrice,
        type: 'crop' as const,
        unlockTier: details.unlockTier,
        icon: details.icon,
        basePrice: details.basePrice,
      };
    }).filter(item => item !== null)
      .sort((a,b) => {
          if (!a || !b) return 0;
          return a.name.localeCompare(b.name);
      }) as MarketItemDisplay[];
  }, [market.loading, market.prices, playerInventory, market.getItemDetails, cropData]);

  const fertilizersToDisplay = useMemo(() => {
    return ALL_FERTILIZER_IDS.map(fertId => {
        const details = FERTILIZER_DATA[fertId];
        if (!details) return null;
        return { ...details };
    }).filter(item => item !== null)
      .sort((a,b) => {
          if (!a || !b) return 0;
          const aIsLocked = a.unlockTier > playerTier;
          const bIsLocked = b.unlockTier > playerTier;
          if (aIsLocked !== bIsLocked) return aIsLocked ? 1 : -1;
          if (a.unlockTier !== b.unlockTier) return a.unlockTier - b.unlockTier;
          return a.name.localeCompare(b.name);
      }) as FertilizerDetails[];
  }, [playerTier]);


  const handleQuantityButtonClick = (itemId: InventoryItem, delta: number, type: 'seed' | 'crop' | 'fertilizer', itemUnlockTier: number) => {
    const itemBaseDetails = type === 'seed' ? cropData?.[itemId.replace('Seed', '') as CropId]
                         : type === 'crop' ? cropData?.[itemId as CropId]
                         : FERTILIZER_DATA[itemId as FertilizerId];

    if (!itemBaseDetails) return;

    if (type === 'seed' || type === 'fertilizer') {
        if (playerTier < itemUnlockTier && delta > 0) return;
    }

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
    const itemBaseDetails = type === 'seed' ? cropData?.[itemId.replace('Seed', '') as CropId]
                         : type === 'crop' ? cropData?.[itemId as CropId]
                         : FERTILIZER_DATA[itemId as FertilizerId];
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
        let itemPrice = 0;
        let itemType: 'seed' | 'crop' | 'fertilizer' | undefined = undefined;

        if (activeTab === 'buy_seed' && seedsToDisplay.find(s => s.id === itemId)) {
          itemPrice = market.prices[itemId as MarketItemId] ?? seedsToDisplay.find(s => s.id === itemId)!.basePrice;
          itemType = 'seed';
        } else if (activeTab === 'sell_crop' && cropsToSell.find(c => c.id === itemId)) {
          itemPrice = market.prices[itemId as MarketItemId] ?? cropsToSell.find(c => c.id === itemId)!.basePrice;
          itemType = 'crop';
        } else if (activeTab === 'buy_fertilizer' && fertilizersToDisplay.find(f => f.id === itemId)) {
          itemPrice = fertilizersToDisplay.find(f => f.id === itemId)!.price;
          itemType = 'fertilizer';
        }

        if (itemPrice > 0 && itemType) {
            let effectivePrice = itemPrice;
            if (market.currentEvent?.isActive && market.currentEvent.itemId === itemId && market.currentEvent.priceModifier) {
                effectivePrice = Math.max(1, Math.round(itemPrice * market.currentEvent.priceModifier));
            }
            currentTotal += quantity * effectivePrice;
            count++;
        }
      }
    });
    return { totalAmount: currentTotal, itemsToTransactCount: count };
  }, [quantities, activeTab, seedsToDisplay, cropsToSell, fertilizersToDisplay, market.prices, market.currentEvent]);


  const handleCentralizedTransaction = () => {
    let itemsProcessed = 0;
    let totalGoldTransacted = 0;
    let successfulTransactions = 0;
    let failedTransactions = 0;

    Object.entries(quantities).forEach(([itemIdStr, quantity]) => {
      if (quantity > 0) {
        const itemId = itemIdStr as InventoryItem;
        let itemPrice = 0;
        let itemToTransact: MarketItemDisplay | FertilizerDetails | undefined;
        let itemName = "Vật phẩm không xác định";

        if (activeTab === 'buy_seed') {
          itemToTransact = seedsToDisplay.find(s => s.id === itemId);
          if (itemToTransact) itemPrice = market.prices[itemId as MarketItemId] ?? itemToTransact.basePrice;
          itemName = itemToTransact?.name || itemName;
        } else if (activeTab === 'sell_crop') {
          itemToTransact = cropsToSell.find(c => c.id === itemId);
          if (itemToTransact) itemPrice = market.prices[itemId as MarketItemId] ?? itemToTransact.basePrice;
          itemName = itemToTransact?.name || itemName;
        } else if (activeTab === 'buy_fertilizer') {
          itemToTransact = fertilizersToDisplay.find(f => f.id === itemId);
          if (itemToTransact) itemPrice = (itemToTransact as FertilizerDetails).price;
          itemName = itemToTransact?.name || itemName;
        }

        if (itemToTransact && itemPrice > 0) {
            let effectivePrice = itemPrice;
            if (market.currentEvent?.isActive && market.currentEvent.itemId === itemId && market.currentEvent.priceModifier) {
                effectivePrice = Math.max(1, Math.round(itemPrice * market.currentEvent.priceModifier));
            }

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
      setQuantities({}); // Reset quantities after attempting transactions
    } else {
      toast({ title: "Không Có Gì Để Giao Dịch", description: "Vui lòng chọn số lượng cho vật phẩm bạn muốn.", variant: "default" });
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

  if (market.loading && !market.prices) {
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

        {renderMarketEventBanner(market.currentEvent)}
        {market.error && (
            <div className="p-3 my-2 bg-destructive/10 border border-destructive text-destructive text-xs rounded-md flex items-center gap-2">
                <AlertTriangle className="h-4 w-4"/>
                Không thể tải dữ liệu thị trường mới nhất. Giá hiển thị có thể không chính xác.
            </div>
        )}

        <Tabs defaultValue="buy_seed" className="w-full flex-grow flex flex-col min-h-0" onValueChange={(value) => setActiveTab(value as ActiveMarketTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="buy_seed">Mua Hạt Giống</TabsTrigger>
            <TabsTrigger value="sell_crop">Bán Nông Sản</TabsTrigger>
            <TabsTrigger value="buy_fertilizer">
              <FertilizerIcon className="mr-1 h-4 w-4" /> Mua Phân Bón
            </TabsTrigger>
          </TabsList>
          <TabsContent value="buy_seed" className="mt-2 flex-1 overflow-y-auto pr-1 pb-1">
            <BuySeedMarket
              seedsToDisplay={seedsToDisplay}
              playerGold={playerGold}
              onBuyItem={onBuyItem}
              cropData={cropData}
              playerTier={playerTier}
              quantities={quantities}
              onQuantityButtonClick={handleQuantityButtonClick}
              onQuantityInputChange={handleQuantityInputChange}
              setQuantities={setQuantities} // No longer needed directly for button
              marketPrices={market.prices}
              priceChanges={market.priceChanges}
              marketEvent={market.currentEvent}
              getItemDetails={market.getItemDetails}
            />
          </TabsContent>
          <TabsContent value="sell_crop" className="mt-2 flex-1 overflow-y-auto pr-1 pb-1">
            <SellCropMarket
              cropsToSell={cropsToSell}
              playerInventory={playerInventory}
              onSellItem={onSellItem}
              cropData={cropData}
              quantities={quantities}
              onQuantityButtonClick={handleQuantityButtonClick}
              onQuantityInputChange={handleQuantityInputChange}
              setQuantities={setQuantities} // No longer needed directly for button
              marketPrices={market.prices}
              priceChanges={market.priceChanges}
              marketEvent={market.currentEvent}
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
              setQuantities={setQuantities} // No longer needed directly for button
            />
          </TabsContent>
        </Tabs>

        {/* Centralized Action Footer */}
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
