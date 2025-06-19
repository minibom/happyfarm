
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AdminUserView, GameState, TierDataFromFirestore } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, BarChart3, DollarSign, TrendingUp, Zap, Eye, Edit, Circle } from 'lucide-react';
import { UserDetailModal } from '@/components/admin/UserActionModals';
import { TierActionModal } from '@/components/admin/TierActionModal';
import { useToast } from '@/hooks/use-toast';
import { db, rtdb } from '@/lib/firebase'; // Import rtdb
import { collection, onSnapshot, doc, getDoc, updateDoc, query, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref as rtdbRef, get as rtdbGet } from 'firebase/database'; // Import RTDB get
import { TIER_DATA, type TierDetail, INITIAL_GAME_STATE, INITIAL_UNLOCKED_PLOTS, NUMBER_OF_DAILY_MISSIONS, NUMBER_OF_WEEKLY_MISSIONS, MAIN_MISSIONS_DATA, DAILY_MISSION_TEMPLATES_DATA, WEEKLY_MISSION_TEMPLATES_DATA } from '@/lib/constants';
import { assignMainMissions, refreshTimedMissions } from '@/lib/mission-logic';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getPlayerTierInfo } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type ActiveView = 'users' | 'tiers';
type UserFilterStatus = 'all' | 'active' | 'banned_chat';
type UserOnlineStatusFilter = 'all' | 'online' | 'offline';

const maskEmail = (email?: string): string => {
  if (!email) return 'N/A';
  const [localPart, domain] = email.split('@');
  if (!domain || localPart.length === 0) return email;
  const maskedLocal = localPart.length > 3 ? `${localPart.substring(0, 3)}***` : `${localPart[0]}***`;
  return `${maskedLocal}@${domain}`;
};

const UsersManagementView = () => {
  const [allUsers, setAllUsers] = useState<AdminUserView[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUserView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserView | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<UserFilterStatus>('all');
  const [onlineStatusFilter, setOnlineStatusFilter] = useState<UserOnlineStatusFilter>('all');
  const { toast } = useToast();

  useEffect(() => {
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, orderBy('lastLogin', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      setIsLoading(true);
      const fetchedUsersList: AdminUserView[] = [];
      const allStatusRef = rtdbRef(rtdb, 'status');
      const allStatusSnapshot = await rtdbGet(allStatusRef);
      const onlineStatuses: Record<string, { state: 'online' | 'offline' }> = allStatusSnapshot.exists() ? allStatusSnapshot.val() : {};

      for (const userDoc of snapshot.docs) {
        const uid = userDoc.id;
        const baseUserData = userDoc.data();
        const gameStateRef = doc(db, 'users', uid, 'gameState', 'data');
        const gameStateSnap = await getDoc(gameStateRef);
        let userView: AdminUserView;
        const rtdbStatus = onlineStatuses[uid]?.state || 'offline';

        if (gameStateSnap.exists()) {
          const gameState = gameStateSnap.data() as GameState;
          userView = {
            uid,
            email: gameState.email || baseUserData.email,
            displayName: gameState.displayName || baseUserData.displayName,
            ...gameState,
            lastLogin: baseUserData.lastLogin?.toMillis?.() || gameState.lastLogin,
            onlineStatus: rtdbStatus,
          };
        } else {
           userView = {
            uid,
            email: baseUserData.email || undefined,
            displayName: baseUserData.displayName || undefined,
            ...INITIAL_GAME_STATE,
            level: baseUserData.level || INITIAL_GAME_STATE.level,
            gold: baseUserData.gold || INITIAL_GAME_STATE.gold,
            xp: baseUserData.xp || INITIAL_GAME_STATE.xp,
            lastLogin: baseUserData.lastLogin?.toMillis?.() || INITIAL_GAME_STATE.lastLogin,
            status: baseUserData.status || INITIAL_GAME_STATE.status,
            unlockedPlotsCount: baseUserData.unlockedPlotsCount || INITIAL_GAME_STATE.unlockedPlotsCount,
            onlineStatus: rtdbStatus,
          };
        }
        fetchedUsersList.push(userView);
      }
      setAllUsers(fetchedUsersList);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      toast({ title: "Lỗi Tải Người Dùng", description: "Không thể tải danh sách người dùng.", variant: "destructive" });
      setAllUsers([]);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    let currentFilteredUsers = allUsers;
    if (searchTerm) {
      currentFilteredUsers = currentFilteredUsers.filter(user =>
        (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.uid.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      currentFilteredUsers = currentFilteredUsers.filter(user => user.status === filterStatus);
    }
    if (onlineStatusFilter !== 'all') {
      currentFilteredUsers = currentFilteredUsers.filter(user => user.onlineStatus === onlineStatusFilter);
    }
    setFilteredUsers(currentFilteredUsers);
  }, [allUsers, searchTerm, filterStatus, onlineStatusFilter]);


  const handleViewDetails = (user: AdminUserView) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleUserAction = async (userId: string, action: 'delete' | 'toggle_ban_chat' | 'reset_progress' | 'grant_items') => {
    const userToUpdate = allUsers.find(u => u.uid === userId);
    if (!userToUpdate) return;

    if (action === 'toggle_ban_chat') {
      const newStatus = userToUpdate.status === 'active' ? 'banned_chat' : 'active';
      try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { status: newStatus });
        
        const userGameStateRef = doc(db, 'users', userId, 'gameState', 'data');
        const gameStateSnap = await getDoc(userGameStateRef);
        if (gameStateSnap.exists()) {
            await updateDoc(userGameStateRef, { status: newStatus });
        }

        toast({
          title: `Cập Nhật Thành Công`,
          description: `Người dùng ${userToUpdate.displayName || userToUpdate.email} đã được ${newStatus === 'active' ? 'bỏ cấm chat' : 'cấm chat'}.`,
          className: "bg-green-500 text-white"
        });
        setIsUserModalOpen(false);
         setAllUsers(prev => prev.map(u => u.uid === userId ? { ...u, status: newStatus } : u)); 
      } catch (err) {
        console.error("Error updating user status:", err);
        toast({ title: "Lỗi", description: "Không thể cập nhật trạng thái người dùng.", variant: "destructive"});
      }
    } else if (action === 'reset_progress') {
        try {
            const userGameStateRef = doc(db, 'users', userId, 'gameState', 'data');
            const userTopLevelRef = doc(db, 'users', userId);

            // Fetch current basic info to preserve
            let existingEmail = userToUpdate.email;
            let existingDisplayName = userToUpdate.displayName;

            if (!existingEmail || !existingDisplayName) {
                const gsSnap = await getDoc(userGameStateRef);
                if (gsSnap.exists()) {
                    const gsData = gsSnap.data() as GameState;
                    if (!existingEmail) existingEmail = gsData.email;
                    if (!existingDisplayName) existingDisplayName = gsData.displayName;
                }
                if (!existingEmail || !existingDisplayName) {
                    const userSnap = await getDoc(userTopLevelRef);
                    if (userSnap.exists()) {
                        const baseData = userSnap.data();
                         if (!existingEmail) existingEmail = baseData.email;
                         if (!existingDisplayName) existingDisplayName = baseData.displayName;
                    }
                }
            }
            
            const newState: GameState = {
                ...INITIAL_GAME_STATE,
                inventory: { ...INITIAL_GAME_STATE.inventory },
                plots: INITIAL_GAME_STATE.plots.map(p => ({ ...p })),
                email: existingEmail || undefined,
                displayName: existingDisplayName || `Farmer${Date.now().toString().slice(-5)}`,
                lastLogin: Date.now(),
                lastUpdate: Date.now(),
                status: 'active',
                unlockedPlotsCount: INITIAL_UNLOCKED_PLOTS,
                claimedBonuses: {},
                activeMissions: {},
                lastDailyMissionRefresh: 0,
                lastWeeklyMissionRefresh: 0,
            };

            newState.activeMissions = assignMainMissions(newState.level, newState.activeMissions, MAIN_MISSIONS_DATA);
            const dailyResult = refreshTimedMissions(newState.activeMissions, 0, DAILY_MISSION_TEMPLATES_DATA, NUMBER_OF_DAILY_MISSIONS, 'daily');
            newState.activeMissions = dailyResult.updatedMissions;
            newState.lastDailyMissionRefresh = dailyResult.newRefreshTime;

            const weeklyResult = refreshTimedMissions(newState.activeMissions, 0, WEEKLY_MISSION_TEMPLATES_DATA, NUMBER_OF_WEEKLY_MISSIONS, 'weekly');
            newState.activeMissions = weeklyResult.updatedMissions;
            newState.lastWeeklyMissionRefresh = weeklyResult.newRefreshTime;
            
            await setDoc(userGameStateRef, newState);
            await updateDoc(userTopLevelRef, {
                level: INITIAL_GAME_STATE.level,
                xp: INITIAL_GAME_STATE.xp,
                gold: INITIAL_GAME_STATE.gold, // Assuming gold might be at top level too
                lastLogin: serverTimestamp(), // Use server timestamp for top-level
                progressResetAt: serverTimestamp(),
            });

            toast({
                title: "Reset Thành Công!",
                description: `Tiến trình của người dùng ${userToUpdate.displayName || userToUpdate.email} đã được reset.`,
                className: "bg-orange-500 text-white",
                duration: 7000
            });
            setIsUserModalOpen(false);
            // Refetch or update local state for allUsers if necessary
            const updatedUserView = { ...userToUpdate, ...newState, lastLogin: Date.now(), onlineStatus: userToUpdate.onlineStatus };
            setAllUsers(prev => prev.map(u => u.uid === userId ? updatedUserView : u));


        } catch (err) {
            console.error("Error resetting user progress:", err);
            toast({ title: "Lỗi Reset", description: "Không thể reset tiến trình người dùng.", variant: "destructive"});
        }
    } else if (action === 'delete') {
        toast({ title: "Mô Phỏng Xóa", description: `Đã yêu cầu xóa người dùng ${userToUpdate.displayName || userToUpdate.email} (cần triển khai Cloud Function).`, variant: "default" });
    } else {
        toast({ title: "Hành Động Chưa Hỗ Trợ", description: `Hành động "${action}" chưa được triển khai.`, variant: "default" });
    }
  };

  const getEmptyStateMessage = () => {
    if (allUsers.length === 0 && !isLoading) {
      return "Hệ thống chưa có người dùng nào.";
    }
    if (filteredUsers.length === 0 && !isLoading) {
      return "Không tìm thấy người dùng nào khớp với bộ lọc của bạn.";
    }
    return "Không tìm thấy người dùng nào khớp.";
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex flex-col md:flex-row items-center gap-2 mb-4 shrink-0">
        <Input
          type="text"
          placeholder="Tìm kiếm theo tên, email, UID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 px-3 py-2 border border-input rounded-md text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex-grow bg-background"
        />
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as UserFilterStatus)}>
            <SelectTrigger className="h-10 w-full md:w-auto bg-background">
                <SelectValue placeholder="Trạng thái Chat" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Tất cả Trạng Thái Chat</SelectItem>
                <SelectItem value="active">Đang Hoạt Động (Chat)</SelectItem>
                <SelectItem value="banned_chat">Bị Cấm Chat</SelectItem>
            </SelectContent>
        </Select>
        <Select value={onlineStatusFilter} onValueChange={(value) => setOnlineStatusFilter(value as UserOnlineStatusFilter)}>
            <SelectTrigger className="h-10 w-full md:w-auto bg-background">
                <SelectValue placeholder="Trạng thái Online" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Tất cả TT Online</SelectItem>
                <SelectItem value="online">Đang Online</SelectItem>
                <SelectItem value="offline">Đang Offline</SelectItem>
            </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-xl">Đang tải danh sách người dùng...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <Table className="relative border-separate border-spacing-0">
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[180px]">Tên Hiển Thị</TableHead>
                <TableHead className="w-[200px] hidden sm:table-cell">Email (Masked)</TableHead>
                <TableHead className="w-[80px] text-center">UID (Ngắn)</TableHead>
                <TableHead className="w-[80px] text-center">Cấp</TableHead>
                <TableHead className="w-[100px] text-center">TT Online</TableHead>
                <TableHead className="w-[100px] text-center">TT Chat</TableHead>
                <TableHead className="w-[150px] hidden md:table-cell">Lần Đ.Nhập Cuối</TableHead>
                <TableHead className="text-center w-[100px]">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    {getEmptyStateMessage()}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.displayName || 'Chưa đặt'}</TableCell>
                    <TableCell className="hidden sm:table-cell">{maskEmail(user.email)}</TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground" title={user.uid}>
                      {user.uid.substring(0, 6)}...
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{user.level}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                            <Circle className={cn("h-3 w-3 mr-1.5", user.onlineStatus === 'online' ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400')} />
                            <span className="text-xs capitalize">{user.onlineStatus || 'N/A'}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className={cn(user.status === 'active' ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600", "text-white text-xs")}>
                        {user.status === 'active' ? 'Hoạt động' : 'Cấm Chat'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs hidden md:table-cell">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa có'}
                    </TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(user)} className="hover:text-primary h-8 w-8" title="Xem chi tiết">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {selectedUser && (
        <UserDetailModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          userData={selectedUser}
          onAction={handleUserAction}
        />
      )}
    </div>
  );
};

interface TierDisplayData extends TierDetail {
  tierNumber: number;
  levelRange: string;
  id: string; 
}

const TiersManagementView = () => {
  const [tiersFromFirestore, setTiersFromFirestore] = useState<TierDisplayData[]>([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(true);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [tierModalProps, setTierModalProps] = useState<React.ComponentProps<typeof TierActionModal> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const tiersCollectionRef = collection(db, 'gameTiers');
    const unsubscribe = onSnapshot(tiersCollectionRef, (snapshot) => {
      const fetchedTiers: Partial<Record<string, TierDataFromFirestore>> = {};
      snapshot.forEach(docSnap => {
        fetchedTiers[docSnap.id] = docSnap.data() as TierDataFromFirestore;
      });

      const combinedTierData = TIER_DATA.map((constantTier, index) => {
        const tierId = `tier_${index + 1}`;
        const firestoreData = fetchedTiers[tierId] || {};
        return {
          id: tierId,
          tierNumber: index + 1,
          name: firestoreData.name || constantTier.name,
          icon: firestoreData.icon || constantTier.icon,
          colorClass: firestoreData.colorClass || constantTier.colorClass,
          levelStart: constantTier.levelStart,
          xpBoostPercent: firestoreData.xpBoostPercent !== undefined ? firestoreData.xpBoostPercent : constantTier.xpBoostPercent,
          sellPriceBoostPercent: firestoreData.sellPriceBoostPercent !== undefined ? firestoreData.sellPriceBoostPercent : constantTier.sellPriceBoostPercent,
          growthTimeReductionPercent: firestoreData.growthTimeReductionPercent !== undefined ? firestoreData.growthTimeReductionPercent : constantTier.growthTimeReductionPercent,
        };
      });

      const finalTierDisplayData = combinedTierData
        .sort((a,b) => a.levelStart - b.levelStart)
        .map((tier, index, allTiers) => {
          let endLevelText;
          if (index < allTiers.length - 1) {
            endLevelText = allTiers[index + 1].levelStart - 1;
          } else {
            endLevelText = "trở lên";
          }
          let levelRange = `Cấp ${tier.levelStart}`;
          if (typeof endLevelText === 'number') {
            if (endLevelText >= tier.levelStart) {
                levelRange += ` - ${endLevelText}`;
            }
          } else {
            levelRange += ` ${endLevelText}`;
          }
          return { ...tier, levelRange };
      });

      setTiersFromFirestore(finalTierDisplayData);
      setIsLoadingTiers(false);
    }, (error) => {
      console.error("Error fetching tiers from Firestore:", error);
      toast({ title: "Lỗi Tải Dữ Liệu Bậc", description: "Không thể tải dữ liệu cấp bậc. Hiển thị dữ liệu mặc định.", variant: "destructive" });
      const constantDisplayData = TIER_DATA.map((tierDetail, index) => {
          const tierNumber = index + 1;
          const startLevel = tierDetail.levelStart;
          let endLevelText;
          if (tierNumber < TIER_DATA.length) {
            endLevelText = TIER_DATA[tierNumber].levelStart - 1;
          } else {
            endLevelText = "trở lên";
          }
          let levelRange = `Cấp ${startLevel}`;
          if (typeof endLevelText === 'number') {
              if (endLevelText >= startLevel) { levelRange += ` - ${endLevelText}`; }
          } else { levelRange += ` ${endLevelText}`; }
          return { ...tierDetail, tierNumber, levelRange, id: `tier_${tierNumber}` };
      });
      setTiersFromFirestore(constantDisplayData);
      setIsLoadingTiers(false);
    });
    return () => unsubscribe();
  }, [toast]);


  const openTierModal = (mode: 'view' | 'edit', tier: TierDisplayData) => {
    setTierModalProps({
      isOpen: true,
      onClose: () => setIsTierModalOpen(false),
      mode,
      tierData: tier, 
      tierId: tier.id,
      onSave: handleTierSaveChanges,
    });
    setIsTierModalOpen(true);
  };

  const handleTierSaveChanges = async (data: TierDataFromFirestore, idToSave: string) => {
    try {
      const tierRef = doc(db, 'gameTiers', idToSave);
      const dataToSave: Partial<TierDataFromFirestore> = {
        name: data.name,
        icon: data.icon,
        colorClass: data.colorClass,
        xpBoostPercent: data.xpBoostPercent,
        sellPriceBoostPercent: data.sellPriceBoostPercent,
        growthTimeReductionPercent: data.growthTimeReductionPercent,
      };
      await setDoc(tierRef, dataToSave, { merge: true }); 
      toast({
        title: "Thành Công!",
        description: `Đã cập nhật thông tin cho ${data.name}.`,
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      console.error("Error saving tier data:", error);
      toast({ title: "Lỗi Lưu Trữ", description: "Không thể lưu thay đổi cho bậc.", variant: "destructive" });
    }
    setIsTierModalOpen(false);
  };


  if (isLoadingTiers) {
    return (
      <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-xl">Đang tải danh sách cấp bậc...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[80px] text-center">Bậc</TableHead>
            <TableHead className="w-[60px] text-center">Icon</TableHead>
            <TableHead>Tên Bậc</TableHead>
            <TableHead className="w-[150px]">Cấp Độ Yêu Cầu</TableHead>
            <TableHead className="w-[250px]">Lợi Ích (Buff)</TableHead>
            <TableHead className="text-center w-[80px]">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiersFromFirestore.map((tier) => (
            <TableRow key={tier.id}>
              <TableCell className="text-center">
                <Badge variant="outline" className={cn("text-sm px-2 py-1 font-semibold", tier.colorClass, "border-current")}>
                  {tier.tierNumber}
                </Badge>
              </TableCell>
              <TableCell className="text-2xl text-center">{tier.icon}</TableCell>
              <TableCell className="font-medium">{tier.name}</TableCell>
              <TableCell>{tier.levelRange}</TableCell>
              <TableCell className="text-xs">
                <div className="flex flex-col gap-1">
                  {tier.xpBoostPercent > 0 && (
                     <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <TrendingUp className="h-3 w-3 text-green-500"/> Tăng XP: +{(tier.xpBoostPercent * 100).toFixed(0)}%
                     </Badge>
                  )}
                  {tier.sellPriceBoostPercent > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <DollarSign className="h-3 w-3 text-yellow-500"/> Giá Bán: +{(tier.sellPriceBoostPercent * 100).toFixed(0)}%
                    </Badge>
                  )}
                  {tier.growthTimeReductionPercent > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <Zap className="h-3 w-3 text-blue-500"/> TG Trồng: -{(tier.growthTimeReductionPercent * 100).toFixed(0)}%
                    </Badge>
                  )}
                   {tier.xpBoostPercent === 0 && tier.sellPriceBoostPercent === 0 && tier.growthTimeReductionPercent === 0 && (
                      <span className="text-muted-foreground">Không có</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="icon" onClick={() => openTierModal('edit', tier)} className="hover:text-blue-600 h-8 w-8" title="Chỉnh sửa Bậc">
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isTierModalOpen && tierModalProps && (
        <TierActionModal {...tierModalProps} />
      )}
    </div>
  );
};


export default function AdminUsersTiersPage() {
  const [activeView, setActiveView] = useState<ActiveView>('users');

  return (
    <Card className="shadow-xl flex flex-col flex-1 min-h-0">
      <CardContent className="flex-1 flex flex-col min-h-0 p-6">
        <div className="flex border-b mb-4 shrink-0">
          <Button
            variant="ghost"
            onClick={() => setActiveView('users')}
            className={cn(
              "py-3 px-4 rounded-none text-base",
              activeView === 'users' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            <Users className="mr-2 h-5 w-5"/> Người Dùng
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveView('tiers')}
            className={cn(
              "py-3 px-4 rounded-none text-base",
              activeView === 'tiers' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            <BarChart3 className="mr-2 h-5 w-5"/> Cấp Bậc
          </Button>
        </div>
        
        {activeView === 'users' && <UsersManagementView />}
        {activeView === 'tiers' && <TiersManagementView />}
      </CardContent>
    </Card>
  );
}
