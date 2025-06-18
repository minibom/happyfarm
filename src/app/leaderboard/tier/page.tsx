
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, ShieldHalf, UserCircle2, TrendingUp } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import type { GameState, TierInfo } from '@/types';
import { getPlayerTierInfo } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LeaderboardUser extends GameState {
  uid: string;
  rank?: number;
  tierInfo: TierInfo;
}

const maskEmail = (email?: string): string => {
  if (!email) return 'Ẩn Danh';
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = localPart.length > 3 ? `${localPart.substring(0, 3)}***` : `${localPart}***`;
  return `${maskedLocal}@${domain}`;
};

export default function LeaderboardTierPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
            const tierInfo = getPlayerTierInfo(gameState.level);
            fetchedUsers.push({
              uid,
              email: gameState.email,
              ...gameState,
              tierInfo,
            });
          }
        }
        
        fetchedUsers.sort((a, b) => {
          if (b.tierInfo.tier !== a.tierInfo.tier) {
            return b.tierInfo.tier - a.tierInfo.tier;
          }
          return b.level - a.level; // Secondary sort by level
        });
        
        setUsers(fetchedUsers.map((user, index) => ({ ...user, rank: index + 1 })));
      } catch (error) {
        console.error("Error fetching users for tier leaderboard:", error);
        // Consider adding a toast notification
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Card className="shadow-xl flex-1 flex flex-col min-h-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary font-headline">
          Bảng Xếp Hạng - Theo Bậc
        </CardTitle>
        <CardDescription>
          Những người chơi đạt bậc cao nhất trong Happy Farm.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-6 pt-0 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-xl">Đang tải bảng xếp hạng...</p>
          </div>
        ) : users.length === 0 ? (
             <div className="flex-1 flex items-center justify-center">
                <p className="text-xl text-muted-foreground">Chưa có dữ liệu người chơi để hiển thị.</p>
            </div>
        ) : (
          <ScrollArea className="flex-grow h-0">
            <Table className="relative border-separate border-spacing-0">
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[80px] text-center">Hạng</TableHead>
                  <TableHead><UserCircle2 className="inline mr-1 h-4 w-4"/>Người Chơi</TableHead>
                  <TableHead className="w-[200px] text-center"><ShieldHalf className="inline mr-1 h-4 w-4"/>Bậc Hiện Tại</TableHead>
                  <TableHead className="w-[120px] text-center"><TrendingUp className="inline mr-1 h-4 w-4"/>Cấp Độ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="text-center font-bold">
                      {user.rank === 1 && '🏆'}
                      {user.rank === 2 && '🥈'}
                      {user.rank === 3 && '🥉'}
                      {user.rank && user.rank > 3 ? user.rank : ''}
                       {!user.rank && '-'}
                    </TableCell>
                    <TableCell className="font-medium">{maskEmail(user.email)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("text-sm px-2 py-1 font-semibold", user.tierInfo.colorClass)}>
                        <span className="mr-1.5 text-base">{user.tierInfo.icon}</span>
                        {user.tierInfo.tierName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge variant="secondary" className="text-sm">{user.level}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
