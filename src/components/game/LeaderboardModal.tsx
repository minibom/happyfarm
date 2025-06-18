
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, UserCircle2, TrendingUp, ListOrdered } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import type { GameState } from '@/types'; // TierInfo is no longer needed
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LeaderboardUser extends GameState {
  uid: string;
  rank?: number;
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

const LEADERBOARD_DISPLAY_ROWS = 10;

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
              email: gameState.email, // Keep email for masking
              displayName: gameState.displayName, // Add displayName
              ...gameState,
            });
          }
        }
        setAllUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users for leaderboard modal:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  const levelLeaderboard = useMemo(() => {
    if (isLoading) return [];
    const sortedUsers = [...allUsers]
      .sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        return b.xp - a.xp;
      })
      .map((user, index) => ({ ...user, rank: index + 1 }));
    
    const displayUsers = sortedUsers.slice(0, LEADERBOARD_DISPLAY_ROWS);
    
    while (displayUsers.length < LEADERBOARD_DISPLAY_ROWS) {
      displayUsers.push({
        uid: `placeholder-${displayUsers.length}`,
        rank: undefined, // No rank for placeholder
        displayName: "Chưa có người chơi",
        email: undefined,
        level: 0, // Or a suitable placeholder value like '-'
        xp: 0,    // Or a suitable placeholder value like '-'
        // Add other GameState defaults if needed for type consistency
        gold: 0,
        plots: [],
        inventory: {},
        lastUpdate: 0,
        unlockedPlotsCount: 0,
        status: 'active',
        lastLogin: 0,
      });
    }
    return displayUsers;
  }, [allUsers, isLoading]);


  const currentUserLevelData = useMemo(() => {
    if (!currentUserId || isLoading || allUsers.length === 0) return null;
    // Find rank from the original sorted list before padding
    const originalSorted = [...allUsers]
      .sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        return b.xp - a.xp;
      })
      .map((user, index) => ({ ...user, rank: index + 1 }));
    return originalSorted.find(u => u.uid === currentUserId);
  }, [allUsers, currentUserId, isLoading]);


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
  
  const renderCurrentUserRank = (userData: LeaderboardUser | null | undefined) => {
    if (!userData || !userData.rank) return null; // Don't show if no rank (e.g., user not found)
    return (
        <Card className="mt-4 border-primary shadow-md">
            <CardContent className="p-3 text-sm">
                <p className="font-semibold text-center">
                    Vị Trí Của Bạn: 
                    <span className="text-primary ml-1">Hạng {renderRank(userData.rank)}</span>
                    <span className="ml-2"> - Cấp {userData.level} - {userData.xp.toLocaleString()} XP</span>
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
            <ListOrdered className="w-7 h-7 text-primary" /> Bảng Xếp Hạng Theo Cấp Độ
          </DialogTitle>
          <DialogDescription>
            Xem thứ hạng của bạn và 10 người chơi hàng đầu trong Happy Farm.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 flex-1 overflow-y-auto flex flex-col">
            {isLoading ? renderLoading() : (
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
                      {levelLeaderboard.map((user, index) => (
                        <TableRow key={user.uid || `placeholder-${index}`} className={cn(user.uid === currentUserId && user.rank && "bg-primary/10")}>
                          <TableCell className="text-center font-bold">{user.rank ? renderRank(user.rank) : '-'}</TableCell>
                          <TableCell className="font-medium">
                            {user.rank ? (user.displayName || maskEmail(user.email)) : <span className="text-muted-foreground italic">{user.displayName}</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            {user.rank ? (
                                <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-sm">
                                  {user.level}
                                </Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{user.rank ? user.xp.toLocaleString() : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                {currentUserLevelData && renderCurrentUserRank(currentUserLevelData)}
              </>
            )}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardModal;


    