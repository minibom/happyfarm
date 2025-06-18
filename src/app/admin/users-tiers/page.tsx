
'use client';

import { useState, useEffect } from 'react';
import type { AdminUserView, GameState } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added CardHeader, CardTitle, CardDescription
import { Button } from '@/components/ui/button';
import { Loader2, Users, BarChart3, DollarSign, TrendingUp, Zap } from 'lucide-react'; // Added DollarSign, TrendingUp, Zap
import { UserDetailModal } from '@/components/admin/UserActionModals';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { TIER_DATA, type TierDetail, INITIAL_GAME_STATE } from '@/lib/constants';
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
import { Eye } from 'lucide-react'; // Explicitly import Eye if it was missing

type ActiveView = 'users' | 'tiers';

const maskEmail = (email?: string): string => {
  if (!email) return 'N/A';
  const [localPart, domain] = email.split('@');
  if (!domain || localPart.length === 0) return email; 
  const maskedLocal = localPart.length > 3 ? `${localPart.substring(0, 3)}***` : `${localPart[0]}***`;
  return `${maskedLocal}@${domain}`;
};

const UsersManagementView = () => {
  const [allUsers, setAllUsers] = useState<AdminUserView[]>([]); // Store all fetched users
  const [filteredUsers, setFilteredUsers] = useState<AdminUserView[]>([]); // Store users after filtering
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserView | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned_chat'>('all');
  const { toast } = useToast();

  useEffect(() => {
    const usersCollectionRef = collection(db, 'users');
    // Querying by lastLogin on the top-level 'users' collection.
    // Ensure 'lastLogin' field exists and is indexed on 'users/{uid}' documents.
    const q = query(usersCollectionRef, orderBy('lastLogin', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedUsersList: AdminUserView[] = [];
      for (const userDoc of snapshot.docs) {
        const uid = userDoc.id;
        const baseUserData = userDoc.data(); // Data from users/{uid}

        const gameStateRef = doc(db, 'users', uid, 'gameState', 'data');
        const gameStateSnap = await getDoc(gameStateRef);

        let userView: AdminUserView;

        if (gameStateSnap.exists()) {
          const gameState = gameStateSnap.data() as GameState;
          userView = {
            uid,
            email: gameState.email || baseUserData.email, 
            displayName: gameState.displayName || baseUserData.displayName,
            ...gameState, 
            // Ensure lastLogin from top-level is used for consistency if available and more recent
            lastLogin: baseUserData.lastLogin?.toMillis?.() || gameState.lastLogin,
          };
        } else {
           // Fallback if gameState subcollection doesn't exist
           userView = {
            uid,
            email: baseUserData.email || undefined,
            displayName: baseUserData.displayName || undefined,
            ...INITIAL_GAME_STATE, 
            level: baseUserData.level || INITIAL_GAME_STATE.level, // Prioritize baseUserData if available
            gold: baseUserData.gold || INITIAL_GAME_STATE.gold,
            xp: baseUserData.xp || INITIAL_GAME_STATE.xp,
            lastLogin: baseUserData.lastLogin?.toMillis?.() || INITIAL_GAME_STATE.lastLogin,
            status: baseUserData.status || INITIAL_GAME_STATE.status,
            unlockedPlotsCount: baseUserData.unlockedPlotsCount || INITIAL_GAME_STATE.unlockedPlotsCount,
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
    // Apply filters whenever allUsers, searchTerm, or filterStatus changes
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
    setFilteredUsers(currentFilteredUsers);
  }, [allUsers, searchTerm, filterStatus]);


  const handleViewDetails = (user: AdminUserView) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUserAction = async (userId: string, action: 'delete' | 'toggle_ban_chat' | 'view_game_state' | 'reset_progress' | 'grant_items') => {
    const userToUpdate = allUsers.find(u => u.uid === userId);
    if (!userToUpdate) return;

    if (action === 'toggle_ban_chat') {
      const newStatus = userToUpdate.status === 'active' ? 'banned_chat' : 'active';
      try {
        // Update status in both top-level user doc and gameState subcollection for consistency
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
        setIsModalOpen(false); 
      } catch (err) {
        console.error("Error updating user status:", err);
        toast({ title: "Lỗi", description: "Không thể cập nhật trạng thái người dùng.", variant: "destructive"});
      }
    } else if (action === 'delete') {
        toast({ title: "Mô Phỏng Xóa", description: `Đã yêu cầu xóa người dùng ${userToUpdate.displayName || userToUpdate.email} (cần triển khai Cloud Function).`, variant: "default" });
    } else {
        toast({ title: "Hành Động Chưa Hỗ Trợ", description: `Hành động "${action}" chưa được triển khai.`, variant: "default" });
    }
  };

  const getEmptyStateMessage = () => {
    if (allUsers.length === 0) {
      return "Hệ thống chưa có người dùng nào.";
    }
    if (filteredUsers.length === 0) {
      return "Không tìm thấy người dùng nào khớp với bộ lọc của bạn.";
    }
    return "Không tìm thấy người dùng nào khớp."; // Fallback, should not be reached if logic is correct
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email, UID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 px-3 py-2 border border-input rounded-md text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex-grow bg-background"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'banned_chat')}
          className="h-10 px-3 py-2 border border-input rounded-md text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background"
        >
          <option value="all">Tất cả Trạng Thái</option>
          <option value="active">Đang Hoạt Động</option>
          <option value="banned_chat">Bị Cấm Chat</option>
        </select>
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
                <TableHead className="w-[200px]">Tên Hiển Thị</TableHead>
                <TableHead className="w-[220px]">Email (Masked)</TableHead>
                <TableHead className="w-[80px] text-center">UID (Ngắn)</TableHead>
                <TableHead className="w-[80px] text-center">Cấp</TableHead>
                <TableHead className="w-[100px] text-center">Trạng Thái</TableHead>
                <TableHead className="w-[150px]">Lần Đ.Nhập Cuối</TableHead>
                <TableHead className="text-center w-[100px]">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {getEmptyStateMessage()}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.displayName || 'Chưa đặt'}</TableCell>
                    <TableCell>{maskEmail(user.email)}</TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground" title={user.uid}>
                      {user.uid.substring(0, 6)}...
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{user.level}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className={cn(user.status === 'active' ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600", "text-white")}>
                        {user.status === 'active' ? 'Hoạt động' : 'Cấm Chat'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa có'}
                    </TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(user)} className="hover:text-primary" title="Xem chi tiết">
                        <Eye className="h-5 w-5" />
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
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
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
}

const TiersManagementView = () => {
  const tierData: TierDisplayData[] = TIER_DATA.map((tierDetail, index) => {
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
        if (endLevelText >= startLevel) {
             levelRange += ` - ${endLevelText}`;
        }
    } else {
        levelRange += ` ${endLevelText}`;
    }

    return {
      ...tierDetail,
      tierNumber,
      levelRange,
    };
  });

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {tierData.map((tier) => (
            <TableRow key={tier.tierNumber}>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


export default function AdminUsersTiersPage() {
  const [activeView, setActiveView] = useState<ActiveView>('users');

  return (
    <Card className="shadow-xl flex flex-col flex-1 min-h-0">
      <CardHeader className="p-6 pb-4"> {/* Keep CardHeader for overall page title if desired, or remove if title is in AdminLayout */}
          <CardTitle className="text-2xl font-bold text-primary">
            {activeView === 'users' ? 'Quản Lý Người Dùng' : 'Quản Lý Cấp Bậc'}
          </CardTitle>
          <CardDescription>
            {activeView === 'users' 
              ? 'Xem, tìm kiếm và quản lý người dùng trong hệ thống.' 
              : 'Xem lại thông tin chi tiết về các cấp bậc trong game.'}
          </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-6 pt-0"> {/* Ensure CardContent allows flex grow */}
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

