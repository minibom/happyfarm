
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ResourceBar from '@/components/game/ResourceBar';
import FarmGrid from '@/components/game/FarmGrid';
import InventoryDisplay from '@/components/game/InventoryDisplay';
import ActionButtons from '@/components/game/ActionButtons';
import MarketModal from '@/components/game/MarketModal';
import AdvisorDialog from '@/components/game/AdvisorDialog';
import ItemDescriptionDialog from '@/components/game/ItemDescriptionDialog';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/hooks/useAuth';
import type { SeedId } from '@/types';
import { ALL_SEED_IDS } from '@/lib/constants';
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
    isInitialized, // This now also considers userId and authLoading from useGameLogic
    advisorTip,
    fetchAdvisorTip,
    isAdvisorLoading,
    newItemDescription,
    isDescriptionLoading,
    clearNewItemDescription,
  } = useGameLogic();

  const [showMarket, setShowMarket] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [showItemDescriptionModal, setShowItemDescriptionModal] = useState(false);

  const [currentAction, setCurrentAction] = useState<'none' | 'planting' | 'harvesting'>('none');
  const [selectedSeedToPlant, setSelectedSeedToPlant] = useState<SeedId | undefined>(undefined);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (newItemDescription && !isDescriptionLoading) {
      setShowItemDescriptionModal(true);
    }
  }, [newItemDescription, isDescriptionLoading]);

  const handlePlotClick = (plotId: number) => {
    if (currentAction === 'planting' && selectedSeedToPlant) {
      plantCrop(plotId, selectedSeedToPlant);
    } else if (currentAction === 'harvesting') {
      harvestCrop(plotId);
    } else {
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
          {/* Reset Game button removed */}
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
