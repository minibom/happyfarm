
'use client';

import type { Metadata } from 'next';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, where, getDocs } from 'firebase/firestore';

import ResourceBar from '@/components/game/ResourceBar';
import dynamic from 'next/dynamic';
const MarketModal = dynamic(() => import('@/components/game/MarketModal'));
const InventoryModal = dynamic(() => import('@/components/game/InventoryModal'));
const PlayerProfileModal = dynamic(() => import('@/components/game/PlayerProfileModal'));
const LeaderboardModal = dynamic(() => import('@/components/game/LeaderboardModal'));
const MailModal = dynamic(() => import('@/components/game/MailModal'));
const MissionModal = dynamic(() => import('@/components/game/MissionModal'));
const ChatPanel = dynamic(() => import('@/components/game/ChatPanel'));
const WelcomePopup = dynamic(() => import('@/components/game/WelcomePopup'));
const FriendsModal = dynamic(() => import('@/components/game/FriendsModal'));
const UserProfilePopup = dynamic(() => import('@/components/game/UserProfilePopup'));

const Dialog = dynamic(() => import('@/components/ui/dialog').then(mod => mod.Dialog), { ssr: false });
const DialogContent = dynamic(() => import('@/components/ui/dialog').then(mod => mod.DialogContent), { ssr: false });
const DialogHeader = dynamic(() => import('@/components/ui/dialog').then(mod => mod.DialogHeader), { ssr: false });
const DialogTitle = dynamic(() => import('@/components/ui/dialog').then(mod => mod.DialogTitle), { ssr: false });
const DialogDescription = dynamic(() => import('@/components/ui/dialog').then(mod => mod.DialogDescription), {ssr: false});

import BottomNavBar from '@/components/game/BottomNavBar';
import GameArea from '@/components/game/GameArea';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/hooks/useAuth';
import { usePresence } from '@/hooks/usePresence';
import type { SeedId, CropId, FertilizerId, FertilizerDetails, MailMessage, RewardItem, GameState, ActiveGameEvent, FriendInfo, FriendRequestReceived } from '@/types';
import { LEVEL_UP_XP_THRESHOLD, getPlayerTierInfo, TOTAL_PLOTS, ALL_SEED_IDS, ALL_CROP_IDS, FERTILIZER_DATA, ALL_FERTILIZER_IDS } from '@/lib/constants';
import { Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateWelcomeGreeting } from '@/ai/flows/generate-welcome-greeting';
import { useFriends } from '@/hooks/useFriends';

// Metadata for the game page - typically not indexed if behind auth
export const metadata: Metadata = {
  title: 'Chơi Game Happy Farm',
  description: 'Vào game Happy Farm và bắt đầu hành trình nông trại của bạn.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function GamePage() {
  const { user, userId, loading: authLoading } = useAuth();
  usePresence();
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
    claimMissionReward,
  } = useGameLogic();

  const {
    friendsList,
    incomingRequests,
    outgoingRequests,
    unreadRequestCount,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    loadingFriendsData,
  } = useFriends();

  const [mailMessages, setMailMessages] = useState<MailMessage[]>([]);
  const [showMarket, setShowMarket] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showUserProfilePopup, setShowUserProfilePopup] = useState(false);
  const [selectedUserProfileData, setSelectedUserProfileData] = useState<{ uid: string; displayName: string } | null>(null);

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

  const handleOpenUserProfilePopup = useCallback((uid: string, displayName: string) => {
    setSelectedUserProfileData({ uid, displayName });
    setShowUserProfilePopup(true);
  }, []);

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
      if (plot.state === 'empty') {
        plantCrop(plotId, selectedSeedToPlant);
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
    plantCrop(plotId, seedId);
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
      .filter(seedId => (gameState.inventory[seedId] || 0) > 0);
  }, [gameState.inventory, cropData]);

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
  const claimableMissionCount = useMemo(() => {
    return Object.values(gameState.activeMissions || {}).filter(
      (mission) => mission.status === 'completed_pending_claim'
    ).length;
  }, [gameState.activeMissions]);

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

  if (authLoading || !isInitialized || !user || !cropData || !gameState || !playerTierInfo || !fertilizerData || loadingFriendsData) {
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
        onOpenMissionModal={() => setIsMissionModalOpen(true)}
        onOpenFriendsModal={() => setShowFriendsModal(true)}
        unreadMailCount={unreadMailCount}
        unreadFriendRequestCount={unreadRequestCount}
        claimableMissionCount={claimableMissionCount}
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

      {showMarket && MarketModal && (
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
      )}
      {showInventoryModal && InventoryModal && (
        <InventoryModal
          isOpen={showInventoryModal}
          onClose={() => setShowInventoryModal(false)}
          inventory={gameState.inventory}
        />
      )}
      {showProfileModal && PlayerProfileModal && (
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
      )}

      {showLeaderboardModal && LeaderboardModal && (
        <LeaderboardModal
          isOpen={showLeaderboardModal}
          onClose={() => setShowLeaderboardModal(false)}
          currentUserId={userId}
        />
      )}

      {isMailModalOpen && MailModal && (
        <MailModal
          isOpen={isMailModalOpen}
          onClose={() => setIsMailModalOpen(false)}
          mailMessages={mailMessages}
          onMarkAsRead={handleMarkMailAsRead}
          onClaimRewards={handleClaimMailRewards}
          onDeleteMail={handleDeleteMail}
        />
      )}
      
      {isMissionModalOpen && MissionModal && (
        <MissionModal
          isOpen={isMissionModalOpen}
          onClose={() => setIsMissionModalOpen(false)}
          playerMissionState={gameState.activeMissions || {}}
          onClaimMissionReward={claimMissionReward}
        />
      )}
      
      {Dialog && DialogContent && DialogHeader && DialogTitle && DialogDescription && ChatPanel && (
        <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
          <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent shadow-none flex flex-col h-[700px] max-h-[85vh]">
            <DialogHeader className="sr-only">
              <DialogTitle>Trò Chuyện Nông Trại</DialogTitle>
              <DialogDescription>Cửa sổ trò chuyện với những người chơi khác trong Happy Farm.</DialogDescription>
            </DialogHeader>
            <ChatPanel userStatus={gameState.status} onUsernameClick={handleOpenUserProfilePopup} />
          </DialogContent>
        </Dialog>
      )}

      {showWelcomePopup && !isLoadingWelcomeData && WelcomePopup && (
        <WelcomePopup
          isOpen={showWelcomePopup}
          onClose={() => setShowWelcomePopup(false)}
          activeEvents={activeGameEventsForPopup}
          aiGreeting={aiGreeting}
          isLoadingGreeting={isLoadingWelcomeData}
        />
      )}

      {showFriendsModal && FriendsModal && (
        <FriendsModal
          isOpen={showFriendsModal}
          onClose={() => setShowFriendsModal(false)}
          currentUserId={userId}
          friendsList={friendsList}
          incomingRequests={incomingRequests}
          outgoingRequests={outgoingRequests}
          onAcceptRequest={acceptFriendRequest}
          onDeclineRequest={declineFriendRequest}
          onRemoveFriend={removeFriend}
          onBlockUser={blockUser}
          onUnblockUser={unblockUser}
          onViewProfile={(friendId, friendName) => handleOpenUserProfilePopup(friendId, friendName)}
          loading={loadingFriendsData}
        />
      )}

      {showUserProfilePopup && UserProfilePopup && selectedUserProfileData && (
        <UserProfilePopup
          isOpen={showUserProfilePopup}
          onClose={() => setShowUserProfilePopup(false)}
          targetUserId={selectedUserProfileData.uid}
          targetUserDisplayName={selectedUserProfileData.displayName}
          currentUserId={userId}
          friendsList={friendsList}
          incomingRequests={incomingRequests}
          outgoingRequests={outgoingRequests}
          onSendFriendRequest={sendFriendRequest}
          onAcceptFriendRequest={acceptFriendRequest}
          onDeclineFriendRequest={declineFriendRequest}
          onRemoveFriend={removeFriend}
          onBlockUser={blockUser}
          onUnblockUser={unblockUser}
        />
      )}
    </div>
  );
}
