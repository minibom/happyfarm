
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ResourceBar from '@/components/game/ResourceBar';
import FarmGrid from '@/components/game/FarmGrid';
import MarketModal from '@/components/game/MarketModal';
import AdvisorDialog from '@/components/game/AdvisorDialog';
import BottomNavBar from '@/components/game/BottomNavBar';
import InventoryModal from '@/components/game/InventoryModal';
import ChatPanel from '@/components/game/ChatPanel';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/hooks/useAuth';
import type { SeedId } from '@/types';
import { ALL_SEED_IDS, MARKET_ITEMS } from '@/lib/constants'; // Ensure MARKET_ITEMS is imported
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
    isInitialized,
    advisorTip,
    fetchAdvisorTip,
    isAdvisorLoading,
  } = useGameLogic();

  const [showMarket, setShowMarket] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);

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

  const availableSeedsForPlanting = ALL_SEED_IDS.filter(seedId => gameState.inventory[seedId] > 0);

  if (authLoading || !isInitialized || !user) {
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
            />
          </div>
          <ChatPanel /> 
        </div>
      </main>
      
      <BottomNavBar 
        onOpenInventory={() => setShowInventoryModal(true)}
        onOpenMarket={() => setShowMarket(true)}
        onSetPlantMode={handleSetPlantMode}
        onToggleHarvestMode={handleToggleHarvestMode}
        onClearAction={handleClearAction}
        currentAction={currentAction}
        selectedSeed={selectedSeedToPlant}
        availableSeeds={availableSeedsForPlanting}
        inventory={gameState.inventory}
      />

      <MarketModal
        isOpen={showMarket}
        onClose={() => setShowMarket(false)}
        marketItems={MARKET_ITEMS} // Pass MARKET_ITEMS here
        playerGold={gameState.gold}
        playerInventory={gameState.inventory}
        onBuyItem={buyItem}
        onSellItem={sellItem}
      />
      <AdvisorDialog
        isOpen={showAdvisor}
        onClose={() => setShowAdvisor(false)}
        advice={advisorTip}
        onGetNewAdvice={fetchAdvisorTip}
        isLoading={isAdvisorLoading}
      />
      <InventoryModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        inventory={gameState.inventory}
      />
    </div>
  );
}
