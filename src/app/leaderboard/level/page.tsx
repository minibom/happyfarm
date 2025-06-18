
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
import { Loader2, TrendingUp, UserCircle2, Coins } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import type { GameState } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LeaderboardUser extends GameState {
  uid: string;
  rank?: number;
}

const maskEmail = (email?: string): string => {
  if (!email) return 'Ẩn Danh';
  const [localPart, domain] = email.split('@');
  if (!domain) return email; // Not a valid email format
  const maskedLocal = localPart.length > 3 ? `${localPart.substring(0, 3)}***` : `${localPart}***`;
  return `${maskedLocal}@${domain}`;
};

export default function LeaderboardLevelPage() {
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
            fetchedUsers.push({
              uid,
              email: gameState.email,
              ...gameState,
            });
          }
        }
        
        fetchedUsers.sort((a, b) => {
          if (b.level !== a.level) {
            return b.level - a.level;
          }
          return b.xp - a.xp; // Secondary sort by XP
        });
        
        setUsers(fetchedUsers.map((user, index) => ({ ...user, rank: index + 1 })));
      } catch (error) {
        console.error("Error fetching users for leaderboard:", error);
        // Consider adding a toast notification for the user here
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
          Bảng Xếp Hạng - Theo Cấp Độ
        </CardTitle>
        <CardDescription>
          Những người chơi có cấp độ cao nhất trong Happy Farm.
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
          <ScrollArea className="flex-grow h-0"> {/* Ensure ScrollArea takes remaining space */}
            <Table className="relative border-separate border-spacing-0">
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[80px] text-center">Hạng</TableHead>
                  <TableHead><UserCircle2 className="inline mr-1 h-4 w-4"/>Người Chơi</TableHead>
                  <TableHead className="w-[120px] text-center"><TrendingUp className="inline mr-1 h-4 w-4"/>Cấp Độ</TableHead>
                  <TableHead className="w-[150px]">XP Hiện Tại</TableHead>
                  <TableHead className="w-[150px]"><Coins className="inline mr-1 h-4 w-4"/>Vàng</TableHead>
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
                      <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white text-sm">
                        {user.level}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.xp.toLocaleString()}</TableCell>
                    <TableCell className="text-yellow-600 font-semibold">{user.gold.toLocaleString()}</TableCell>
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
