
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ResourceBar from '@/components/game/ResourceBar';
import FarmGrid from '@/components/game/FarmGrid';
import MarketModal from '@/components/game/MarketModal';
// import AdvisorDialog from '@/components/game/AdvisorDialog'; // Temporarily remove if not used
import BottomNavBar from '@/components/game/BottomNavBar';
import InventoryModal from '@/components/game/InventoryModal';
import ChatPanel from '@/components/game/ChatPanel';
import PlayerProfileModal from '@/components/game/PlayerProfileModal';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/hooks/useAuth';
import type { SeedId } from '@/types';
import { LEVEL_UP_XP_THRESHOLD } from '@/lib/constants';
import { Loader2 } from 'lucide-react';


export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    gameState,
    plantCrop,
    harvestCrop,
    buyItem,
    sellItem,
    isInitialized, // This now includes item data loading
    // advisorTip,
    // fetchAdvisorTip,
    // isAdvisorLoading,
    marketItems, // Now from useGameLogic, derived from Firestore
    allSeedIds,  // Now from useGameLogic
    cropData,    // Now from useGameLogic
  } = useGameLogic();

  const [showMarket, setShowMarket] = useState(false);
  // const [showAdvisor, setShowAdvisor] = useState(false);
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
    if (!plot) return;

    if (currentAction === 'planting' && selectedSeedToPlant) {
      if (plot.state === 'empty') {
        plantCrop(plotId, selectedSeedToPlant);
      }
    } else if (currentAction === 'harvesting') {
      if (plot.state === 'ready_to_harvest') {
        harvestCrop(plotId);
      }
    }
  };
  
  const plantSeedFromPlotPopover = (plotId: number, seedId: SeedId) => {
    plantCrop(plotId, seedId);
  };

  const handleSetPlantMode = (seedId: SeedId) => {
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

  // Derive available seeds from gameState.inventory and allSeedIds (from useGameLogic)
  const availableSeedsForPlanting = allSeedIds.filter(seedId => gameState.inventory[seedId] > 0);

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
              cropData={cropData} // Pass cropData to FarmGrid
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
        availableSeeds={availableSeedsForPlanting}
        inventory={gameState.inventory}
        cropData={cropData} // Pass cropData for tooltips/names
      />

      <MarketModal
        isOpen={showMarket}
        onClose={() => setShowMarket(false)}
        marketItems={marketItems} // Use dynamic marketItems
        playerGold={gameState.gold}
        playerInventory={gameState.inventory}
        onBuyItem={buyItem}
        onSellItem={sellItem}
        cropData={cropData} // Pass cropData for display details
      />
      {/* <AdvisorDialog
        isOpen={showAdvisor}
        onClose={() => setShowAdvisor(false)}
        advice={advisorTip}
        onGetNewAdvice={fetchAdvisorTip}
        isLoading={isAdvisorLoading}
      /> */}
      <InventoryModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        inventory={gameState.inventory}
        cropData={cropData} // Pass cropData
        allSeedIds={allSeedIds} // Pass allSeedIds
        allCropIds={cropData ? Object.keys(cropData) as CropId[] : []} // Derive allCropIds
      />
      <PlayerProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        playerEmail={user.email || 'Không có email'}
        playerLevel={gameState.level}
        playerGold={gameState.gold}
        playerXP={gameState.xp}
        xpToNextLevel={LEVEL_UP_XP_THRESHOLD(gameState.level)}
      />
    </div>
  );
}
