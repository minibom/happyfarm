
'use client';

import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, UserCircle2, Coins, TrendingUp, ShieldHalf, ListOrdered } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import type { GameState, TierInfo } from '@/types';
import { getPlayerTierInfo } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LeaderboardUser extends GameState {
  uid: string;
  rank?: number;
  tierInfo?: TierInfo; // Optional for level leaderboard, required for tier
}

const maskEmail = (email?: string): string => {
  if (!email) return 'Ẩn Danh';
  const [localPart, domain] = email.split('@');
  if (!domain || localPart.length === 0) return email;
  const maskedLocal = localPart.length > 3 ? `${localPart.substring(0, 3)}***` : `${localPart[0]}***`;
  return `${maskedLocal}@${domain}`;
};

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string | null;
}

const LeaderboardModal: FC<LeaderboardModalProps> = ({ isOpen, onClose, currentUserId }) => {
  const [allUsers, setAllUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersCollectionRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollectionRef);
        const fetchedUsers: LeaderboardUser[] = [];

        for (const userDoc of usersSnapshot.docs) {
          const uid = userDoc.id;
          const gameStateRef = doc(db, 'users', uid, 'gameState', 'data');
          const gameStateSnap = await getDoc(gameStateRef);

          if (gameStateSnap.exists()) {
            const gameState = gameStateSnap.data() as GameState;
            fetchedUsers.push({
              uid,
              email: gameState.email,
              ...gameState,
            });
          }
        }
        setAllUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users for leaderboard modal:", error);
        // Consider adding a toast notification here
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  const levelLeaderboard = useMemo(() => {
    if (isLoading) return [];
    return [...allUsers]
      .sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        return b.xp - a.xp;
      })
      .map((user, index) => ({ ...user, rank: index + 1 }));
  }, [allUsers, isLoading]);

  const tierLeaderboard = useMemo(() => {
    if (isLoading) return [];
    return [...allUsers]
      .map(user => ({ ...user, tierInfo: getPlayerTierInfo(user.level) }))
      .sort((a, b) => {
        if (b.tierInfo!.tier !== a.tierInfo!.tier) return b.tierInfo!.tier - a.tierInfo!.tier;
        return b.level - a.level;
      })
      .map((user, index) => ({ ...user, rank: index + 1 }));
  }, [allUsers, isLoading]);

  const currentUserLevelData = useMemo(() => {
    if (!currentUserId || levelLeaderboard.length === 0) return null;
    return levelLeaderboard.find(u => u.uid === currentUserId);
  }, [levelLeaderboard, currentUserId]);

  const currentUserTierData = useMemo(() => {
    if (!currentUserId || tierLeaderboard.length === 0) return null;
    return tierLeaderboard.find(u => u.uid === currentUserId);
  }, [tierLeaderboard, currentUserId]);


  const renderRank = (rank?: number) => {
    if (!rank) return '-';
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const renderLoading = () => (
    <div className="flex-1 flex items-center justify-center py-10">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="ml-3 text-lg">Đang tải bảng xếp hạng...</p>
    </div>
  );

  const renderEmptyState = () => (
     <div className="flex-1 flex items-center justify-center py-10">
        <p className="text-lg text-muted-foreground">Chưa có dữ liệu người chơi để hiển thị.</p>
    </div>
  );
  
  const renderCurrentUserRank = (userData: LeaderboardUser | null | undefined, type: 'level' | 'tier') => {
    if (!userData) return null;
    return (
        <Card className="mt-4 border-primary shadow-md">
            <CardContent className="p-3 text-sm">
                <p className="font-semibold text-center">
                    Vị Trí Của Bạn ({type === 'level' ? 'Cấp Độ' : 'Bậc'}): 
                    <span className="text-primary ml-1">Hạng {renderRank(userData.rank)}</span>
                    {type === 'level' && <span className="ml-2"> - Cấp {userData.level} - {userData.xp.toLocaleString()} XP</span>}
                    {type === 'tier' && userData.tierInfo && <span className="ml-2">- {userData.tierInfo.icon} {userData.tierInfo.tierName} (Cấp {userData.level})</span>}
                </p>
            </CardContent>
        </Card>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <ListOrdered className="w-7 h-7 text-primary" /> Bảng Xếp Hạng
          </DialogTitle>
          <DialogDescription>
            Xem thứ hạng của bạn và những người chơi hàng đầu trong Happy Farm.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="level" className="w-full flex-grow flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="level">Theo Cấp Độ</TabsTrigger>
            <TabsTrigger value="tier">Theo Bậc</TabsTrigger>
          </TabsList>
          
          <TabsContent value="level" className="mt-4 flex-1 overflow-y-auto flex flex-col">
            {isLoading ? renderLoading() : levelLeaderboard.length === 0 ? renderEmptyState() : (
              <>
                <ScrollArea className="flex-grow h-0 pr-3">
                  <Table className="relative border-separate border-spacing-0">
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead className="w-[70px] text-center">Hạng</TableHead>
                        <TableHead><UserCircle2 className="inline mr-1 h-4 w-4"/>Người Chơi</TableHead>
                        <TableHead className="w-[100px] text-center"><TrendingUp className="inline mr-1 h-4 w-4"/>Cấp</TableHead>
                        <TableHead className="w-[110px]">XP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {levelLeaderboard.slice(0, 10).map((user) => (
                        <TableRow key={user.uid} className={cn(user.uid === currentUserId && "bg-primary/10")}>
                          <TableCell className="text-center font-bold">{renderRank(user.rank)}</TableCell>
                          <TableCell className="font-medium">{maskEmail(user.email)}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-sm">
                              {user.level}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.xp.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                {currentUserLevelData && renderCurrentUserRank(currentUserLevelData, 'level')}
              </>
            )}
          </TabsContent>

          <TabsContent value="tier" className="mt-4 flex-1 overflow-y-auto flex flex-col">
            {isLoading ? renderLoading() : tierLeaderboard.length === 0 ? renderEmptyState() : (
              <>
                <ScrollArea className="flex-grow h-0 pr-3">
                  <Table className="relative border-separate border-spacing-0">
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead className="w-[70px] text-center">Hạng</TableHead>
                        <TableHead><UserCircle2 className="inline mr-1 h-4 w-4"/>Người Chơi</TableHead>
                        <TableHead className="w-[180px] text-center"><ShieldHalf className="inline mr-1 h-4 w-4"/>Bậc</TableHead>
                        <TableHead className="w-[100px] text-center">Cấp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tierLeaderboard.slice(0, 10).map((user) => (
                        <TableRow key={user.uid} className={cn(user.uid === currentUserId && "bg-primary/10")}>
                          <TableCell className="text-center font-bold">{renderRank(user.rank)}</TableCell>
                          <TableCell className="font-medium">{maskEmail(user.email)}</TableCell>
                          <TableCell className="text-center">
                            {user.tierInfo && (
                               <Badge className={cn("text-sm px-2 py-1 font-semibold", user.tierInfo.colorClass, "border-current")}>
                                <span className="mr-1.5 text-base">{user.tierInfo.icon}</span>
                                {user.tierInfo.tierName}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                             <Badge variant="secondary" className="text-sm">{user.level}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                {currentUserTierData && renderCurrentUserRank(currentUserTierData, 'tier')}
              </>
            )}
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardModal;

    