
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase'; // Firestore instance
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, writeBatch } from 'firebase/firestore';

import ResourceBar from '@/components/game/ResourceBar';
import MarketModal from '@/components/game/MarketModal';
import BottomNavBar from '@/components/game/BottomNavBar';
import InventoryModal from '@/components/game/InventoryModal';
import PlayerProfileModal from '@/components/game/PlayerProfileModal';
import LeaderboardModal from '@/components/game/LeaderboardModal';
import MailModal from '@/components/game/MailModal';
import GameArea from '@/components/game/GameArea';
import ChatPanel from '@/components/game/ChatPanel';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/hooks/useAuth';
import type { SeedId, CropId, FertilizerId, FertilizerDetails, MailMessage, RewardItem, GameState } from '@/types';
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
    setGameState, // Still needed for applying rewards from mail
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

  const [mailMessages, setMailMessages] = useState<MailMessage[]>([]);
  const [showMarket, setShowMarket] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);

  const [currentAction, setCurrentAction] = useState<'none' | 'planting' | 'harvesting' | 'fertilizing'>('none');
  const [selectedSeedToPlant, setSelectedSeedToPlant] = useState<SeedId | undefined>(undefined);
  const [selectedFertilizerId, setSelectedFertilizerId] = useState<FertilizerId | undefined>(undefined);

  useEffect(() => {
    if (!authLoading && !user && isInitialized) {
      router.push('/login');
    }
  }, [user, authLoading, router, isInitialized]);

  // Listen to Mail Subcollection
  useEffect(() => {
    if (!userId) {
      setMailMessages([]);
      return;
    }
    const mailCollectionRef = collection(db, 'users', userId, 'mail');
    const q = query(mailCollectionRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mails: MailMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        mails.push({ 
            id: docSnap.id, 
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
            expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt.toMillis() : data.expiresAt,
        } as MailMessage);
      });
      setMailMessages(mails);
    }, (error) => {
      console.error("Error fetching mail:", error);
      toast({ title: "Lỗi Hộp Thư", description: "Không thể tải thư của bạn.", variant: "destructive" });
    });

    return () => unsubscribe();
  }, [userId, toast]);


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


  const unreadMailCount = useMemo(() => mailMessages.filter(m => !m.isRead).length, [mailMessages]);

  const handleMarkMailAsRead = async (mailId: string) => {
    if (!userId) return;
    const mailRef = doc(db, 'users', userId, 'mail', mailId);
    try {
      await updateDoc(mailRef, { isRead: true });
      // Local state update is handled by onSnapshot
    } catch (error) {
      console.error("Error marking mail as read:", error);
      toast({ title: "Lỗi", description: "Không thể đánh dấu thư đã đọc.", variant: "destructive"});
    }
  };

  const handleClaimMailRewards = async (mailId: string) => {
    if (!userId) return;
    const mailToClaim = mailMessages.find(m => m.id === mailId);
    if (!mailToClaim || mailToClaim.isClaimed || mailToClaim.rewards.length === 0) {
      toast({ title: "Không thể nhận", description: "Thư không có quà hoặc đã nhận.", variant: "default" });
      return;
    }

    let goldReward = 0;
    let xpReward = 0;
    const itemRewards: {itemId: string, quantity: number}[] = [];
    let bonusKeyToClaim: string | undefined = undefined;

    // Check if this mail corresponds to a unique bonus (e.g. tierUp bonuses)
    // This is a simplified check; a more robust system might involve a 'bonusId' field in the mail document.
    if (mailToClaim.subject.includes("Chúc Mừng Lên Bậc")) {
        const tierMatch = mailToClaim.subject.match(/Bậc (\d+)/);
        if (tierMatch && tierMatch[1]) {
            bonusKeyToClaim = `tierUp_${tierMatch[1]}`;
        }
    }
    // Add more checks for other unique bonus mail types here if needed

    mailToClaim.rewards.forEach(reward => {
      if (reward.type === 'gold' && reward.amount) goldReward += reward.amount;
      if (reward.type === 'xp' && reward.amount) xpReward += reward.amount;
      if (reward.type === 'item' && reward.itemId && reward.quantity) itemRewards.push({itemId: reward.itemId, quantity: reward.quantity});
    });
    
    // Optimistically update client GameState
    setGameState(prev => {
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

      const updatedClaimedBonuses = { ...prev.claimedBonuses };
      if (bonusKeyToClaim) {
        updatedClaimedBonuses[bonusKeyToClaim] = true;
      }

      return {
        ...prev,
        gold: prev.gold + goldReward,
        xp: newXp,
        level: newLevel,
        inventory: newInventory,
        claimedBonuses: updatedClaimedBonuses,
        lastUpdate: Date.now(),
      };
    });

    // Update Firestore
    const mailRef = doc(db, 'users', userId, 'mail', mailId);
    try {
      await updateDoc(mailRef, { isClaimed: true, isRead: true });
      // Note: GameState (gold, xp, inventory, claimedBonuses) is saved via its own useEffect in useGameStateCore
      toast({ title: "Đã Nhận Quà!", description: `Bạn đã nhận quà từ thư: ${mailToClaim.subject}`, className: "bg-accent text-accent-foreground" });
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast({ title: "Lỗi Nhận Quà", description: "Không thể cập nhật trạng thái thư.", variant: "destructive"});
      // Revert client-side GameState changes if Firestore update fails (more complex, consider for production)
    }
  };

  const handleDeleteMail = async (mailId: string) => {
    if (!userId) return;
    const mailRef = doc(db, 'users', userId, 'mail', mailId);
    try {
      await deleteDoc(mailRef);
      toast({ title: "Đã Xóa Thư", description: "Thư đã được xóa." });
      // Local state update is handled by onSnapshot
    } catch (error) {
      console.error("Error deleting mail:", error);
      toast({ title: "Lỗi", description: "Không thể xóa thư.", variant: "destructive"});
    }
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
        fertilizeFromPlotPopover={fertilizeFromPlotPopover} // Pass down
        unlockPlot={unlockPlot}
        userStatus={gameState.status}
      />

      <BottomNavBar
        onOpenInventory={() => setShowInventoryModal(true)}
        onOpenMarket={() => setShowMarket(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenChatModal={() => setIsChatModalOpen(true)}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenMailModal={() => setIsMailModalOpen(true)}
        unreadMailCount={unreadMailCount}
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
        mailMessages={mailMessages}
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
