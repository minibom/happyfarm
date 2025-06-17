
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ResourceBar from '@/components/game/ResourceBar';
import FarmGrid from '@/components/game/FarmGrid';
import MarketModal from '@/components/game/MarketModal';
import AdvisorDialog from '@/components/game/AdvisorDialog';
import BottomNavBar from '@/components/game/BottomNavBar';
import InventoryModal from '@/components/game/InventoryModal';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/hooks/useAuth';
import type { SeedId } from '@/types';
import { ALL_SEED_IDS, MARKET_ITEMS, CROP_DATA } from '@/lib/constants';
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
  const [showAdvisor, setShowAdvisor] = useState(false); // Retain advisor state if needed later
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
    // If plot is empty and currentAction is 'none', FarmPlot's internal popover logic takes precedence.
    // The onClick passed to FarmPlot from here will be called by FarmPlot if it doesn't open its popover.
  };
  
  const plantSeedFromPlotPopover = (plotId: number, seedId: SeedId) => {
    plantCrop(plotId, seedId);
    // If a global action was active, planting from popover might clear it or not, depending on desired UX.
    // For now, let's assume it doesn't clear global action to allow continuous mass planting/harvesting.
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
      setSelectedSeedToPlant(undefined); // Ensure no seed is selected when switching to harvest
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
        Loading Happy Farm...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground items-center p-2 sm:p-4">
      <ResourceBar gold={gameState.gold} xp={gameState.xp} level={gameState.level} />
      
      <main className="flex flex-col items-center w-full max-w-7xl mt-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary font-headline my-4 text-center">Happy Farm</h1>
        <FarmGrid
          plots={gameState.plots}
          onPlotClick={handlePlotClick}
          availableSeedsForPopover={availableSeedsForPlanting}
          onPlantFromPopover={plantSeedFromPlotPopover}
          isGloballyPlanting={currentAction === 'planting'}
          isGloballyHarvesting={currentAction === 'harvesting'}
        />
      </main>
      
      {/* Advisor Dialog can be triggered from somewhere else if needed, e.g. a ? icon or from ResourceBar */}
      {/* For now, removing ActionButtons also removes the explicit advisor trigger */}

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
        marketItems={MARKET_ITEMS}
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
