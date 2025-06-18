
'use client';

import { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useRouter } from 'next/navigation';
import ResourceBar from '@/components/game/ResourceBar';
import MarketModal from '@/components/game/MarketModal';
import BottomNavBar from '@/components/game/BottomNavBar';
import InventoryModal from '@/components/game/InventoryModal';
import PlayerProfileModal from '@/components/game/PlayerProfileModal';
import LeaderboardModal from '@/components/game/LeaderboardModal';
import MailModal from '@/components/game/MailModal'; // New MailModal import
import GameArea from '@/components/game/GameArea';
import ChatPanel from '@/components/game/ChatPanel';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/hooks/useAuth';
import type { SeedId, CropId, FertilizerId, FertilizerDetails, MailMessage } from '@/types';
import { LEVEL_UP_XP_THRESHOLD, getPlayerTierInfo, TOTAL_PLOTS, ALL_SEED_IDS, ALL_CROP_IDS, FERTILIZER_DATA, ALL_FERTILIZER_IDS } from '@/lib/constants';
import { Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function GamePage() {
  const { user, userId, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const {
    gameState,
    setGameState, // Added setGameState for mail operations
    plantCrop,
    harvestCrop,
    buyItem,
    sellItem,
    unlockPlot,
    updateDisplayName,
    applyFertilizer,
    isInitialized,
    playerTierInfo,
    cropData,
  } = useGameLogic();

  const [showMarket, setShowMarket] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false); // State for MailModal

  const [currentAction, setCurrentAction] = useState<'none' | 'planting' | 'harvesting' | 'fertilizing'>('none');
  const [selectedSeedToPlant, setSelectedSeedToPlant] = useState<SeedId | undefined>(undefined);
  const [selectedFertilizerId, setSelectedFertilizerId] = useState<FertilizerId | undefined>(undefined);

  useEffect(() => {
    if (!authLoading && !user && isInitialized) {
      router.push('/login');
    }
  }, [user, authLoading, router, isInitialized]);

  const handlePlotClick = (plotId: number) => {
    const plot = gameState.plots.find(p => p.id === plotId);
    if (!plot || !cropData) return;

    if (plotId >= gameState.unlockedPlotsCount) {
      if (plotId === gameState.unlockedPlotsCount && gameState.unlockedPlotsCount < TOTAL_PLOTS) {
        unlockPlot(plotId);
      } else if (gameState.unlockedPlotsCount < TOTAL_PLOTS) {
        toast({ title: "Đất Bị Khóa", description: "Bạn cần mở khóa ô đất trước đó theo thứ tự.", variant: "destructive" });
      } else {
         toast({ title: "Đã Mở Hết", description: "Tất cả ô đất đã được mở khóa.", variant: "default" });
      }
      return;
    }

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
    } else if (currentAction === 'fertilizing' && selectedFertilizerId) {
      if (plot.state === 'planted' || plot.state === 'growing') {
        applyFertilizer(plotId, selectedFertilizerId);
      } else {
        toast({ title: "Không Thể Bón Phân", description: "Chỉ có thể bón phân cho cây đang trồng hoặc đang lớn.", variant: "default"});
      }
    }
    // If not in global action mode, plot popover logic is handled in FarmPlot.tsx
  };

  const plantSeedFromPlotPopover = (plotId: number, seedId: SeedId) => {
     if (!cropData) return;
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

  const fertilizeFromPlotPopover = (plotId: number, fertilizerId: FertilizerId) => {
    if (!FERTILIZER_DATA[fertilizerId] || !gameState.plots.find(p => p.id === plotId)) return;
    
    const plot = gameState.plots.find(p => p.id === plotId);
    if (!plot) return;

    if (plot.state === 'planted' || plot.state === 'growing') {
      applyFertilizer(plotId, fertilizerId);
    } else {
      toast({ title: "Không Thể Bón Phân", description: "Ô đất này không phù hợp để bón phân.", variant: "default"});
    }
  };

  const handleSetPlantMode = (seedId: SeedId) => {
    if (!cropData) return;
    const seedCropDetail = cropData[seedId.replace('Seed','') as CropId];
    if (!seedCropDetail || playerTierInfo.tier < seedCropDetail.unlockTier) {
      toast({ title: "Bậc Chưa Mở Khóa", description: `Bạn cần đạt ${getPlayerTierInfo( (seedCropDetail.unlockTier-1) * 10 +1 ).tierName} (Bậc ${seedCropDetail.unlockTier}) để chọn hạt giống ${seedCropDetail.name}.`, variant: "destructive" });
      setCurrentAction('none');
      setSelectedSeedToPlant(undefined);
      setSelectedFertilizerId(undefined);
      return;
    }

    if (currentAction === 'planting' && selectedSeedToPlant === seedId) {
      setCurrentAction('none');
      setSelectedSeedToPlant(undefined);
    } else {
      setCurrentAction('planting');
      setSelectedSeedToPlant(seedId);
      setSelectedFertilizerId(undefined);
    }
  };

  const handleToggleHarvestMode = () => {
    if (currentAction === 'harvesting') {
      setCurrentAction('none');
    } else {
      setCurrentAction('harvesting');
      setSelectedSeedToPlant(undefined);
      setSelectedFertilizerId(undefined);
    }
  };

  const handleSetFertilizeMode = (fertilizerId: FertilizerId) => {
    if (!FERTILIZER_DATA[fertilizerId]) return; 
    const fertilizerDetail = FERTILIZER_DATA[fertilizerId];

    if (playerTierInfo.tier < fertilizerDetail.unlockTier) {
        toast({ title: "Bậc Chưa Mở Khóa", description: `Bạn cần đạt ${getPlayerTierInfo( (fertilizerDetail.unlockTier-1) * 10 +1 ).tierName} (Bậc ${fertilizerDetail.unlockTier}) để chọn phân bón ${fertilizerDetail.name}.`, variant: "destructive" });
        setCurrentAction('none');
        setSelectedFertilizerId(undefined);
        setSelectedSeedToPlant(undefined);
        return;
    }

    if (currentAction === 'fertilizing' && selectedFertilizerId === fertilizerId) {
        setCurrentAction('none');
        setSelectedFertilizerId(undefined);
    } else {
        setCurrentAction('fertilizing');
        setSelectedFertilizerId(fertilizerId);
        setSelectedSeedToPlant(undefined);
    }
  };

  const handleClearAction = () => {
    setCurrentAction('none');
    setSelectedSeedToPlant(undefined);
    setSelectedFertilizerId(undefined);
  };

  const availableSeedsForPlanting = ALL_SEED_IDS
    .filter(seedId => (gameState.inventory[seedId] || 0) > 0)
    .filter(seedId => {
        if (!cropData) return false;
        const cropDetail = cropData[seedId.replace('Seed','') as CropId];
        return cropDetail && playerTierInfo.tier >= cropDetail.unlockTier;
    });

  const allAvailableSeedsInInventory = ALL_SEED_IDS
    .filter(seedId => (gameState.inventory[seedId] || 0) > 0);

  const availableFertilizersForSelection = useMemo(() => {
    return ALL_FERTILIZER_IDS
    .map(id => FERTILIZER_DATA[id])
    .filter(fert => fert && (gameState.inventory[fert.id] || 0) > 0 && playerTierInfo.tier >= fert.unlockTier) as FertilizerDetails[];
  }, [gameState.inventory, playerTierInfo.tier]);


  // Mail Logic
  const unreadMailCount = useMemo(() => gameState.mail.filter(m => !m.isRead).length, [gameState.mail]);

  const handleMarkMailAsRead = (mailId: string) => {
    setGameState(prev => ({
      ...prev,
      mail: prev.mail.map(m => m.id === mailId ? { ...m, isRead: true } : m),
      lastUpdate: Date.now(),
    }));
  };

  const handleClaimMailRewards = (mailId: string) => {
    // Placeholder for actual reward claiming logic
    // For now, just marks as claimed and shows a toast.
    // In a real implementation, this would add items/gold/xp to gameState.
    const mailToClaim = gameState.mail.find(m => m.id === mailId);
    if (!mailToClaim || mailToClaim.isClaimed || mailToClaim.rewards.length === 0) {
      toast({ title: "Không thể nhận", description: "Thư không có quà hoặc đã nhận.", variant: "default" });
      return;
    }

    // Simulate applying rewards
    let goldReward = 0;
    let xpReward = 0;
    const itemRewards: {itemId: string, quantity: number}[] = [];

    mailToClaim.rewards.forEach(reward => {
      if (reward.type === 'gold' && reward.amount) goldReward += reward.amount;
      if (reward.type === 'xp' && reward.amount) xpReward += reward.amount;
      if (reward.type === 'item' && reward.itemId && reward.quantity) itemRewards.push({itemId: reward.itemId, quantity: reward.quantity});
    });
    
    setGameState(prev => {
      const updatedMail = prev.mail.map(m => m.id === mailId ? { ...m, isClaimed: true, isRead: true } : m);
      const newInventory = { ...prev.inventory };
      itemRewards.forEach(item => {
        newInventory[item.itemId] = (newInventory[item.itemId] || 0) + item.quantity;
      });

      let newXp = prev.xp + xpReward;
      let newLevel = prev.level;
      let xpThreshold = LEVEL_UP_XP_THRESHOLD(newLevel);
      while (newXp >= xpThreshold) {
        newXp -= xpThreshold;
        newLevel += 1;
        xpThreshold = LEVEL_UP_XP_THRESHOLD(newLevel);
      }

      return {
        ...prev,
        gold: prev.gold + goldReward,
        xp: newXp,
        level: newLevel,
        inventory: newInventory,
        mail: updatedMail,
        lastUpdate: Date.now(),
      };
    });
    toast({ title: "Đã Nhận Quà!", description: `Bạn đã nhận quà từ thư: ${mailToClaim.subject}`, className: "bg-accent text-accent-foreground" });
  };

  const handleDeleteMail = (mailId: string) => {
    // Placeholder - for now, mail isn't actually deleted
    toast({ title: "Sắp có", description: "Chức năng xóa thư sẽ được cập nhật sau.", variant: "default" });
  };


  if (authLoading || !isInitialized || !user || !cropData || !gameState || !playerTierInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl font-semibold bg-background">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        Đang tải Happy Farm...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground items-center p-2 sm:p-4 pb-24">
      <ResourceBar 
        gold={gameState.gold} 
        xp={gameState.xp} 
        level={gameState.level} 
        playerTierInfo={playerTierInfo}
        playerDisplayName={gameState.displayName}
      />

      <GameArea
        gameState={gameState}
        cropData={cropData}
        playerTierInfo={playerTierInfo}
        currentAction={currentAction}
        selectedSeedToPlant={selectedSeedToPlant}
        selectedFertilizerId={selectedFertilizerId} 
        availableSeedsForPlanting={availableSeedsForPlanting}
        availableFertilizersForPopover={availableFertilizersForSelection}
        handlePlotClick={handlePlotClick}
        plantSeedFromPlotPopover={plantSeedFromPlotPopover}
        fertilizeFromPlotPopover={fertilizeFromPlotPopover}
        unlockPlot={unlockPlot}
        userStatus={gameState.status}
      />

      <BottomNavBar
        onOpenInventory={() => setShowInventoryModal(true)}
        onOpenMarket={() => setShowMarket(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenChatModal={() => setIsChatModalOpen(true)}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenMailModal={() => setIsMailModalOpen(true)} // Connect to MailModal
        unreadMailCount={unreadMailCount} // Pass unread count
        onSetPlantMode={handleSetPlantMode}
        onToggleHarvestMode={handleToggleHarvestMode}
        onSetFertilizeMode={handleSetFertilizeMode} 
        onClearAction={handleClearAction}
        currentAction={currentAction}
        selectedSeed={selectedSeedToPlant}
        selectedFertilizerId={selectedFertilizerId} 
        availableSeeds={allAvailableSeedsInInventory}
        availableFertilizers={availableFertilizersForSelection} 
        inventory={gameState.inventory}
        cropData={cropData}
        fertilizerData={FERTILIZER_DATA} 
        playerTier={playerTierInfo.tier}
      />

      <MarketModal
        isOpen={showMarket}
        onClose={() => setShowMarket(false)}
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
        currentDisplayName={gameState.displayName}
      />
      
      <LeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        currentUserId={userId}
      />

      <MailModal
        isOpen={isMailModalOpen}
        onClose={() => setIsMailModalOpen(false)}
        mailMessages={gameState.mail}
        onMarkAsRead={handleMarkMailAsRead}
        onClaimRewards={handleClaimMailRewards}
        onDeleteMail={handleDeleteMail}
      />

      <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
        <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent shadow-none">
          <ChatPanel isModalMode userStatus={gameState.status} />
        </DialogContent>
      </Dialog>

    </div>
  );
}
