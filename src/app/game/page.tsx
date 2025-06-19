
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase'; // Firestore instance
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, where, getDocs } from 'firebase/firestore';

import ResourceBar from '@/components/game/ResourceBar';
import MarketModal from '@/components/game/MarketModal';
import BottomNavBar from '@/components/game/BottomNavBar';
import InventoryModal from '@/components/game/InventoryModal';
import PlayerProfileModal from '@/components/game/PlayerProfileModal';
import LeaderboardModal from '@/components/game/LeaderboardModal';
import MailModal from '@/components/game/MailModal';
import MissionModal from '@/components/game/MissionModal'; // New Mission Modal
import GameArea from '@/components/game/GameArea';
import ChatPanel from '@/components/game/ChatPanel';
import WelcomePopup from '@/components/game/WelcomePopup';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/hooks/useAuth';
import type { SeedId, CropId, FertilizerId, FertilizerDetails, MailMessage, RewardItem, GameState, ActiveGameEvent } from '@/types';
import { LEVEL_UP_XP_THRESHOLD, getPlayerTierInfo, TOTAL_PLOTS, ALL_SEED_IDS, ALL_CROP_IDS, FERTILIZER_DATA, ALL_FERTILIZER_IDS } from '@/lib/constants';
import { Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { generateWelcomeGreeting } from '@/ai/flows/generate-welcome-greeting';

export default function GamePage() {
  const { user, userId, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const {
    gameState,
    setGameState,
    plantCrop,
    harvestCrop,
    buyItem,
    sellItem,
    unlockPlot,
    updateDisplayName,
    applyFertilizer,
    uprootCrop,
    isInitialized,
    playerTierInfo,
    cropData,
    fertilizerData,
    // claimMissionReward, // Will be added in Phase 2
  } = useGameLogic();

  const [mailMessages, setMailMessages] = useState<MailMessage[]>([]);
  const [showMarket, setShowMarket] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false); // New state for MissionModal

  const [currentAction, setCurrentAction] = useState<'none' | 'planting' | 'harvesting' | 'fertilizing'>('none');
  const [selectedSeedToPlant, setSelectedSeedToPlant] = useState<SeedId | undefined>(undefined);
  const [selectedFertilizerId, setSelectedFertilizerId] = useState<FertilizerId | undefined>(undefined);

  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [activeGameEventsForPopup, setActiveGameEventsForPopup] = useState<ActiveGameEvent[]>([]);
  const [aiGreeting, setAiGreeting] = useState<string | null>(null);
  const [isLoadingWelcomeData, setIsLoadingWelcomeData] = useState(true);


  useEffect(() => {
    if (!authLoading && !user && isInitialized) {
      router.push('/login');
    }
  }, [user, authLoading, router, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !userId) return;

    const WELCOME_POPUP_SESSION_KEY = 'happyFarmWelcomePopupShown';
    const hasShownWelcomePopupThisSession = sessionStorage.getItem(WELCOME_POPUP_SESSION_KEY);

    if (hasShownWelcomePopupThisSession) {
      setIsLoadingWelcomeData(false);
      return;
    }

    const fetchWelcomeData = async () => {
      setIsLoadingWelcomeData(true);
      try {
        const now = Timestamp.now();
        const eventsCollectionRef = collection(db, 'activeGameEvents');
        const q = query(
          eventsCollectionRef,
          where('isActive', '==', true),
          where('startTime', '<=', now)
        );
        const snapshot = await getDocs(q);
        const fetchedEvents: ActiveGameEvent[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Omit<ActiveGameEvent, 'id'>;
          if (data.endTime.toMillis() > now.toMillis()) {
            fetchedEvents.push({ id: docSnap.id, ...data });
          }
        });
        setActiveGameEventsForPopup(fetchedEvents);

        if (fetchedEvents.length === 0) {
          try {
            const greetingOutput = await generateWelcomeGreeting();
            setAiGreeting(greetingOutput.greeting);
          } catch (aiError) {
            console.error("AI greeting generation failed:", aiError);
            setAiGreeting("Chào mừng bạn trở lại Happy Farm! Chúc bạn một ngày vui vẻ!");
          }
        }
        setShowWelcomePopup(true);
        sessionStorage.setItem(WELCOME_POPUP_SESSION_KEY, 'true');
      } catch (error) {
        console.error("Error fetching active events for popup:", error);
        try {
            const greetingOutput = await generateWelcomeGreeting();
            setAiGreeting(greetingOutput.greeting);
        } catch (aiError) {
            console.error("AI greeting generation failed after event error:", aiError);
            setAiGreeting("Chào bạn! Nông trại luôn chào đón bạn!");
        }
        setShowWelcomePopup(true);
        sessionStorage.setItem(WELCOME_POPUP_SESSION_KEY, 'true');
      } finally {
        setIsLoadingWelcomeData(false);
      }
    };

    fetchWelcomeData();

  }, [isInitialized, userId]);


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

  const uprootCropFromPlotPopover = (plotId: number) => {
    const plot = gameState.plots.find(p => p.id === plotId);
    if (!plot) return;
    if (plot.state === 'planted' || plot.state === 'growing') {
        uprootCrop(plotId);
    } else {
        toast({ title: "Không Có Gì Để Nhổ", description: "Ô đất này không có cây đang trồng/lớn.", variant: "default"});
    }
  };

  const harvestCropFromPlotPopover = (plotId: number) => {
    const plot = gameState.plots.find(p => p.id === plotId);
    if (!plot) return;
    if (plot.state === 'ready_to_harvest') {
        harvestCrop(plotId);
    } else {
        toast({ title: "Chưa Sẵn Sàng", description: "Cây chưa sẵn sàng để thu hoạch.", variant: "default"});
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
    if (!fertilizerData || !fertilizerData[fertilizerId]) return;
    const fertilizerDetail = fertilizerData[fertilizerId];

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

  const availableSeedsForPlanting = useMemo(() => {
    if (!cropData) return [];
    return ALL_SEED_IDS
      .filter(seedId => (gameState.inventory[seedId] || 0) > 0)
      .filter(seedId => {
          const cropDetail = cropData[seedId.replace('Seed','') as CropId];
          return cropDetail && playerTierInfo.tier >= cropDetail.unlockTier;
      });
  }, [gameState.inventory, cropData, playerTierInfo.tier]);

  const allAvailableSeedsInInventory = useMemo(() => {
    return ALL_SEED_IDS
      .filter(seedId => (gameState.inventory[seedId] || 0) > 0);
  }, [gameState.inventory]);


  const availableFertilizersForSelection = useMemo(() => {
    if (!fertilizerData) return [];
    return ALL_FERTILIZER_IDS
    .map(id => fertilizerData[id])
    .filter(fert => fert && (gameState.inventory[fert.id] || 0) > 0 && playerTierInfo.tier >= fert.unlockTier) as FertilizerDetails[];
  }, [gameState.inventory, playerTierInfo.tier, fertilizerData]);


  const unreadMailCount = useMemo(() => mailMessages.filter(m => !m.isRead).length, [mailMessages]);

  const handleMarkMailAsRead = async (mailId: string) => {
    if (!userId) return;
    const mailRef = doc(db, 'users', userId, 'mail', mailId);
    try {
      await updateDoc(mailRef, { isRead: true });
    } catch (error) {
      console.error("Error marking mail as read:", error);
      toast({ title: "Lỗi", description: "Không thể đánh dấu thư đã đọc.", variant: "destructive"});
    }
  };

  const handleClaimMailRewards = async (mailId: string) => {
    if (!userId || !gameState) return;
    const mailToClaim = mailMessages.find(m => m.id === mailId);
    if (!mailToClaim) {
      toast({ title: "Lỗi", description: "Không tìm thấy thư để nhận.", variant: "destructive" });
      return;
    }
    if (mailToClaim.isClaimed) {
      toast({ title: "Đã Nhận", description: "Bạn đã nhận quà từ thư này rồi.", variant: "default" });
      return;
    }
     if (mailToClaim.bonusId && gameState.claimedBonuses[mailToClaim.bonusId]) {
      toast({ title: "Bonus Đã Nhận", description: "Bạn đã nhận phần thưởng bonus này rồi.", variant: "default" });
      const mailRef = doc(db, 'users', userId, 'mail', mailId);
      try { await updateDoc(mailRef, { isClaimed: true, isRead: true }); } catch (e) { console.error("Error updating mail for already claimed bonus:", e);}
      return;
    }

    if (mailToClaim.rewards.length === 0) {
      toast({ title: "Không Có Quà", description: "Thư này không có vật phẩm đính kèm.", variant: "default" });
      const mailRef = doc(db, 'users', userId, 'mail', mailId);
      try {
        await updateDoc(mailRef, { isClaimed: true, isRead: true });
      } catch (error) {
        console.error("Error marking mail as claimed (no rewards):", error);
      }
      return;
    }

    setGameState(prev => {
      if (!prev) return INITIAL_GAME_STATE;
      const newState = { ...prev };
      let goldReward = 0;
      let xpReward = 0;
      const newInventory = { ...newState.inventory };
      const newClaimedBonuses = { ...newState.claimedBonuses };

      mailToClaim.rewards.forEach(reward => {
        if (reward.type === 'gold' && reward.amount) goldReward += reward.amount;
        if (reward.type === 'xp' && reward.amount) xpReward += reward.amount;
        if (reward.type === 'item' && reward.itemId && reward.quantity) {
          newInventory[reward.itemId] = (newInventory[reward.itemId] || 0) + reward.quantity;
        }
      });

      newState.gold += goldReward;
      
      let currentXp = newState.xp + xpReward;
      let currentLevel = newState.level;
      let xpToNext = LEVEL_UP_XP_THRESHOLD(currentLevel);
      while (currentXp >= xpToNext && xpToNext > 0) {
        currentXp -= xpToNext;
        currentLevel += 1;
        xpToNext = LEVEL_UP_XP_THRESHOLD(currentLevel);
      }
      newState.xp = currentXp;
      newState.level = currentLevel;
      newState.inventory = newInventory;

      if (mailToClaim.bonusId) {
        newClaimedBonuses[mailToClaim.bonusId] = true;
      }
      newState.claimedBonuses = newClaimedBonuses;
      newState.lastUpdate = Date.now();
      return newState;
    });

    const mailRef = doc(db, 'users', userId, 'mail', mailId);
    try {
      await updateDoc(mailRef, { isClaimed: true, isRead: true });
      toast({ title: "Đã Nhận Quà!", description: `Bạn đã nhận quà từ thư: ${mailToClaim.subject}`, className: "bg-accent text-accent-foreground" });
    } catch (error) {
      console.error("Error claiming rewards in Firestore:", error);
      toast({ title: "Lỗi Nhận Quà", description: "Không thể cập nhật trạng thái thư. Vui lòng thử lại.", variant: "destructive"});
    }
  };

  const handleDeleteMail = async (mailId: string) => {
    if (!userId) return;
    const mailRef = doc(db, 'users', userId, 'mail', mailId);
    try {
      await deleteDoc(mailRef);
      toast({ title: "Đã Xóa Thư", description: "Thư đã được xóa." });
    } catch (error) {
      console.error("Error deleting mail:", error);
      toast({ title: "Lỗi", description: "Không thể xóa thư.", variant: "destructive"});
    }
  };

  // Placeholder for claimMissionReward - to be implemented in Phase 2
  const claimMissionReward = useCallback(async (missionId: string) => {
    console.log("Attempting to claim mission:", missionId);
    toast({ title: "Tính năng sắp ra mắt", description: `Chức năng nhận thưởng cho nhiệm vụ ${missionId} sẽ sớm được cập nhật.`});
    // Actual logic will modify gameState and playerMissionState
  }, [toast]);


  if (authLoading || !isInitialized || !user || !cropData || !gameState || !playerTierInfo || !fertilizerData) {
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
        uprootCropFromPlotPopover={uprootCropFromPlotPopover}
        harvestCropFromPlotPopover={harvestCropFromPlotPopover}
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
        onOpenMissionModal={() => setIsMissionModalOpen(true)} // Pass handler for Mission Modal
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
        fertilizerData={fertilizerData}
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

      {/* New Mission Modal */}
      <MissionModal
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        playerMissionState={gameState.activeMissions || {}} // Pass player's mission state
        onClaimMissionReward={claimMissionReward} // Pass claim function
      />

      <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
        <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent shadow-none">
          <ChatPanel isModalMode userStatus={gameState.status} />
        </DialogContent>
      </Dialog>

      {showWelcomePopup && !isLoadingWelcomeData && (
        <WelcomePopup
          isOpen={showWelcomePopup}
          onClose={() => setShowWelcomePopup(false)}
          activeEvents={activeGameEventsForPopup}
          aiGreeting={aiGreeting}
          isLoadingGreeting={isLoadingWelcomeData}
        />
      )}
    </div>
  );
}

  