
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ResourceBar from '@/components/game/ResourceBar';
import FarmGrid from '@/components/game/FarmGrid';
import MarketModal from '@/components/game/MarketModal';
import BottomNavBar from '@/components/game/BottomNavBar';
import InventoryModal from '@/components/game/InventoryModal';
import ChatPanel from '@/components/game/ChatPanel';
import PlayerProfileModal from '@/components/game/PlayerProfileModal';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/hooks/useAuth';
import type { SeedId, CropId } from '@/types';
import { LEVEL_UP_XP_THRESHOLD, getPlayerTierInfo, TOTAL_PLOTS, getPlotUnlockCost, INITIAL_UNLOCKED_PLOTS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const {
    gameState,
    plantCrop,
    harvestCrop,
    buyItem,
    sellItem,
    unlockPlot, // Get unlockPlot from useGameLogic
    isInitialized,
    playerTierInfo,
    marketItems,
    allSeedIds,
    cropData,
  } = useGameLogic();

  const [showMarket, setShowMarket] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [currentAction, setCurrentAction] = useState<'none' | 'planting' | 'harvesting'>('none');
  const [selectedSeedToPlant, setSelectedSeedToPlant] = useState<SeedId | undefined>(undefined);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handlePlotClick = (plotId: number) => {
    const plot = gameState.plots.find(p => p.id === plotId);
    if (!plot || !cropData) return;

    // Check if plot is locked
    if (plotId >= gameState.unlockedPlotsCount) {
      if (plotId === gameState.unlockedPlotsCount && gameState.unlockedPlotsCount < TOTAL_PLOTS) {
        const cost = getPlotUnlockCost(plotId);
        // Confirm and unlock action can be triggered here or directly in FarmPlot component
        unlockPlot(plotId);
      } else if (gameState.unlockedPlotsCount < TOTAL_PLOTS) {
        toast({ title: "Đất Bị Khóa", description: "Bạn cần mở khóa ô đất trước đó theo thứ tự.", variant: "destructive" });
      } else {
         toast({ title: "Đã Mở Hết", description: "Tất cả ô đất đã được mở.", variant: "default" });
      }
      return;
    }

    // If plot is unlocked, proceed with existing logic
    if (currentAction === 'planting' && selectedSeedToPlant) {
      const seedCropDetail = cropData[selectedSeedToPlant.replace('Seed','') as CropId];
      if (plot.state === 'empty' && seedCropDetail && playerTierInfo.tier >= seedCropDetail.unlockTier) {
        plantCrop(plotId, selectedSeedToPlant);
      } else if (plot.state === 'empty' && seedCropDetail && playerTierInfo.tier < seedCropDetail.unlockTier) {
        toast({ title: "Bậc Chưa Mở Khóa", description: `Bạn cần đạt ${getPlayerTierInfo( (seedCropDetail.unlockTier -1) * 10 +1 ).tierName} (Bậc ${seedCropDetail.unlockTier}) để trồng ${seedCropDetail.name}.`, variant: "destructive" });
      }
    } else if (currentAction === 'harvesting') {
      if (plot.state === 'ready_to_harvest') {
        harvestCrop(plotId);
      }
    }
  };

  const plantSeedFromPlotPopover = (plotId: number, seedId: SeedId) => {
     if (!cropData) return;
     // Check if plot is locked first
     if (plotId >= gameState.unlockedPlotsCount) {
        toast({ title: "Đất Bị Khóa", description: "Không thể trồng trên ô đất bị khóa.", variant: "destructive"});
        return;
     }

     const seedCropDetail = cropData[seedId.replace('Seed','') as CropId];
     if (seedCropDetail && playerTierInfo.tier >= seedCropDetail.unlockTier) {
        plantCrop(plotId, seedId);
     } else if (seedCropDetail) {
        toast({ title: "Bậc Chưa Mở Khóa", description: `Bạn cần đạt ${getPlayerTierInfo( (seedCropDetail.unlockTier -1) * 10 +1 ).tierName} (Bậc ${seedCropDetail.unlockTier}) để trồng ${seedCropDetail.name}.`, variant: "destructive" });
     }
  };

  const handleSetPlantMode = (seedId: SeedId) => {
    if (!cropData) return;
    const seedCropDetail = cropData[seedId.replace('Seed','') as CropId];
    if (!seedCropDetail || playerTierInfo.tier < seedCropDetail.unlockTier) {
      toast({ title: "Bậc Chưa Mở Khóa", description: `Bạn cần đạt ${getPlayerTierInfo( (seedCropDetail.unlockTier-1) * 10 +1 ).tierName} (Bậc ${seedCropDetail.unlockTier}) để chọn hạt giống ${seedCropDetail.name}.`, variant: "destructive" });
      setCurrentAction('none');
      setSelectedSeedToPlant(undefined);
      return;
    }

    if (currentAction === 'planting' && selectedSeedToPlant === seedId) {
      setCurrentAction('none');
      setSelectedSeedToPlant(undefined);
    } else {
      setCurrentAction('planting');
      setSelectedSeedToPlant(seedId);
    }
  };

  const handleToggleHarvestMode = () => {
    if (currentAction === 'harvesting') {
      setCurrentAction('none');
    } else {
      setCurrentAction('harvesting');
      setSelectedSeedToPlant(undefined);
    }
  };

  const handleClearAction = () => {
    setCurrentAction('none');
    setSelectedSeedToPlant(undefined);
  }

  const availableSeedsForPlanting = allSeedIds
    .filter(seedId => (gameState.inventory[seedId] || 0) > 0)
    .filter(seedId => {
        if (!cropData) return false;
        const cropDetail = cropData[seedId.replace('Seed','') as CropId];
        return cropDetail && playerTierInfo.tier >= cropDetail.unlockTier;
    });

  const allAvailableSeedsInInventory = allSeedIds
    .filter(seedId => (gameState.inventory[seedId] || 0) > 0);


  if (authLoading || !isInitialized || !user || !marketItems || !cropData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl font-semibold bg-background">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        Đang tải Happy Farm...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground items-center p-2 sm:p-4 pb-24">
      <ResourceBar gold={gameState.gold} xp={gameState.xp} level={gameState.level} />

      <main className="flex flex-col items-center w-full max-w-7xl mt-4">
        <div className="flex flex-row w-full gap-6 justify-center items-start">
          <div className="flex-shrink-0">
            <FarmGrid
              plots={gameState.plots}
              onPlotClick={handlePlotClick}
              availableSeedsForPopover={availableSeedsForPlanting}
              onPlantFromPopover={plantSeedFromPlotPopover}
              isGloballyPlanting={currentAction === 'planting'}
              isGloballyHarvesting={currentAction === 'harvesting'}
              cropData={cropData}
              playerTier={playerTierInfo.tier}
              unlockedPlotsCount={gameState.unlockedPlotsCount}
              onUnlockPlot={unlockPlot} // Pass down the unlockPlot function
            />
          </div>
          <ChatPanel />
        </div>
      </main>

      <BottomNavBar
        onOpenInventory={() => setShowInventoryModal(true)}
        onOpenMarket={() => setShowMarket(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onSetPlantMode={handleSetPlantMode}
        onToggleHarvestMode={handleToggleHarvestMode}
        onClearAction={handleClearAction}
        currentAction={currentAction}
        selectedSeed={selectedSeedToPlant}
        availableSeeds={allAvailableSeedsInInventory}
        inventory={gameState.inventory}
        cropData={cropData}
        playerTier={playerTierInfo.tier}
      />

      <MarketModal
        isOpen={showMarket}
        onClose={() => setShowMarket(false)}
        marketItems={marketItems}
        playerGold={gameState.gold}
        playerInventory={gameState.inventory}
        onBuyItem={buyItem}
        onSellItem={sellItem}
        cropData={cropData}
        playerTier={playerTierInfo.tier}
      />
      <InventoryModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        inventory={gameState.inventory}
        cropData={cropData}
        allSeedIds={allSeedIds}
        allCropIds={cropData ? Object.keys(cropData) as CropId[] : []}
      />
      <PlayerProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        playerEmail={user.email || 'Không có email'}
        playerLevel={gameState.level}
        playerGold={gameState.gold}
        playerXP={gameState.xp}
        xpToNextLevel={LEVEL_UP_XP_THRESHOLD(gameState.level)}
        playerTierInfo={playerTierInfo}
      />
    </div>
  );
}
