'use client';

import { useState, useEffect } from 'react';
import ResourceBar from '@/components/game/ResourceBar';
import FarmGrid from '@/components/game/FarmGrid';
import InventoryDisplay from '@/components/game/InventoryDisplay';
import ActionButtons from '@/components/game/ActionButtons';
import MarketModal from '@/components/game/MarketModal';
import AdvisorDialog from '@/components/game/AdvisorDialog';
import ItemDescriptionDialog from '@/components/game/ItemDescriptionDialog';
import { useGameLogic } from '@/hooks/useGameLogic';
import { Button } from '@/components/ui/button';
import { CROP_DATA, MARKET_ITEMS, ALL_SEED_IDS } from '@/lib/constants';
import type { SeedId } from '@/types';
import { RefreshCcw } from 'lucide-react';


export default function HomePage() {
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
    newItemDescription,
    isDescriptionLoading,
    clearNewItemDescription,
    resetGame,
  } = useGameLogic();

  const [showMarket, setShowMarket] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [showItemDescriptionModal, setShowItemDescriptionModal] = useState(false);

  const [currentAction, setCurrentAction] = useState<'none' | 'planting' | 'harvesting'>('none');
  const [selectedSeedToPlant, setSelectedSeedToPlant] = useState<SeedId | undefined>(undefined);

  useEffect(() => {
    if (newItemDescription && !isDescriptionLoading) {
      setShowItemDescriptionModal(true);
    }
  }, [newItemDescription, isDescriptionLoading]);

  const handlePlotClick = (plotId: number) => {
    if (currentAction === 'planting' && selectedSeedToPlant) {
      plantCrop(plotId, selectedSeedToPlant);
      // Optional: setCurrentAction('none'); to require re-selecting plant action
    } else if (currentAction === 'harvesting') {
      harvestCrop(plotId);
    } else {
      // Default action: view plot info or select plot (not implemented here)
      console.log(`Plot ${plotId} clicked. No action selected.`);
    }
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
    setSelectedSeedToPlant(undefined);
  };

  const availableSeedsForPlanting = ALL_SEED_IDS.filter(seedId => gameState.inventory[seedId] > 0);

  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen text-xl font-semibold">Loading Happy Farm...</div>;
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
            isPlanting={currentAction === 'planting'}
            isHarvesting={currentAction === 'harvesting'}
          />
        </div>
        
        <aside className="lg:w-1/4 flex flex-col gap-4 lg:sticky lg:top-20 self-start">
          <ActionButtons
            onTogglePlantMode={togglePlantMode}
            onToggleHarvestMode={toggleHarvestMode}
            onOpenMarket={() => setShowMarket(true)}
            onOpenAdvisor={() => { fetchAdvisorTip(); setShowAdvisor(true); }}
            availableSeeds={availableSeedsForPlanting}
            isPlanting={currentAction === 'planting'}
            isHarvesting={currentAction === 'harvesting'}
            selectedSeed={selectedSeedToPlant}
          />
          <InventoryDisplay inventory={gameState.inventory} />
          <Button variant="destructive" onClick={resetGame} className="w-full mt-4">
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset Game
          </Button>
        </aside>
      </main>

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
      <ItemDescriptionDialog
        isOpen={showItemDescriptionModal}
        onClose={() => {
          setShowItemDescriptionModal(false);
          clearNewItemDescription();
        }}
        item={newItemDescription}
      />
    </div>
  );
}
