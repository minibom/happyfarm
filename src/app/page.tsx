
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ResourceBar from '@/components/game/ResourceBar';
import FarmGrid from '@/components/game/FarmGrid';
import ActionButtons from '@/components/game/ActionButtons';
import MarketModal from '@/components/game/MarketModal';
import AdvisorDialog from '@/components/game/AdvisorDialog';
import BottomNavBar from '@/components/game/BottomNavBar';
import InventoryModal from '@/components/game/InventoryModal';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/hooks/useAuth.tsx';
import type { SeedId } from '@/types';
import { ALL_SEED_IDS, MARKET_ITEMS } from '@/lib/constants';
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

    // If in global planting mode (seed selected from ActionButtons)
    if (currentAction === 'planting' && selectedSeedToPlant) {
      if (plot.state === 'empty') {
        plantCrop(plotId, selectedSeedToPlant);
      } else {
        console.log("Plot not empty for global planting action.");
      }
    } 
    // If in global harvesting mode
    else if (currentAction === 'harvesting') {
      if (plot.state === 'ready_to_harvest') {
        harvestCrop(plotId);
      } else {
        console.log("Plot not ready for global harvesting action.");
      }
    } 
    // If no global action, and plot is not empty (empty plot click is handled by FarmPlot's popover)
    else if (plot.state !== 'empty' && currentAction === 'none') {
      console.log(`Plot ${plotId} clicked. State: ${plot.state}. No global action. No local action defined for non-empty plots without global action.`);
    }
    // If plot is empty and currentAction is 'none', FarmPlot's internal popover logic takes precedence via its own click handler.
    // The onClick passed to FarmPlot from here will be called by FarmPlot if it doesn't open its popover.
  };
  
  const plantSeedFromPlotPopover = (plotId: number, seedId: SeedId) => {
    plantCrop(plotId, seedId);
  };

  const togglePlantMode = (seedId: SeedId) => {
    if (currentAction === 'planting' && selectedSeedToPlant === seedId) {
      setCurrentAction('none');
      setSelectedSeedToPlant(undefined);
    } else {
      setCurrentAction('planting');
      setSelectedSeedToPlant(seedId);
    }
  };

  const toggleHarvestMode = () => {
    setCurrentAction(prev => (prev === 'harvesting' ? 'none' : 'harvesting'));
    setSelectedSeedToPlant(undefined); // Ensure no seed is selected when switching to harvest
  };

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
      
      <main className="flex flex-col lg:flex-row gap-4 w-full max-w-7xl mt-4">
        <div className="lg:w-3/4 flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary font-headline my-4 text-center">Happy Farm</h1>
          <FarmGrid
            plots={gameState.plots}
            onPlotClick={handlePlotClick}
            availableSeedsForPopover={availableSeedsForPlanting}
            onPlantFromPopover={plantSeedFromPlotPopover}
            isGloballyPlanting={currentAction === 'planting'}
            isGloballyHarvesting={currentAction === 'harvesting'}
          />
        </div>
        
        <aside className="lg:w-1/4 flex flex-col gap-4 lg:sticky lg:top-20 self-start">
          <ActionButtons
            onTogglePlantMode={togglePlantMode}
            onToggleHarvestMode={toggleHarvestMode}
            onOpenAdvisor={() => { fetchAdvisorTip(); setShowAdvisor(true); }}
            availableSeeds={availableSeedsForPlanting}
            isPlanting={currentAction === 'planting'}
            isHarvesting={currentAction === 'harvesting'}
            selectedSeed={selectedSeedToPlant}
          />
        </aside>
      </main>

      <BottomNavBar 
        onOpenInventory={() => setShowInventoryModal(true)}
        onOpenMarket={() => setShowMarket(true)}
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
