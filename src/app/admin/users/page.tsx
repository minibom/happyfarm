
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, ShieldAlert, Users, Search, Loader2, ShieldCheck, ShieldX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UserDetailModal } from '@/components/admin/UserActionModals';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import type { GameState, AdminUserView } from '@/types';
import { getPlayerTierInfo } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserView | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersCollectionRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollectionRef);
      const fetchedUsers: AdminUserView[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const uid = userDoc.id;
        const gameStateRef = doc(db, 'users', uid, 'gameState', 'data');
        const gameStateSnap = await getDoc(gameStateRef);

        if (gameStateSnap.exists()) {
          const gameState = gameStateSnap.data() as GameState;
          fetchedUsers.push({
            uid,
            email: gameState.email || 'N/A',
            ...gameState,
          });
        } else {
           fetchedUsers.push({
            uid,
            email: 'N/A (No GameState)',
            gold: 0, xp: 0, level: 1, plots: [], inventory: {}, lastUpdate: 0, unlockedPlotsCount: 0,
            status: 'active', lastLogin: 0 
          });
        }
      }
      fetchedUsers.sort((a, b) => {
        if (b.level !== a.level) {
            return b.level - a.level;
        }
        return (b.lastLogin || 0) - (a.lastLogin || 0);
      });
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users from Firestore:", error);
      toast({ title: "Lỗi Tải Người Dùng", description: "Không thể tải danh sách người dùng.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openUserModal = (user: AdminUserView) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUserAction = async (userId: string, action: 'delete' | 'toggle_ban_chat' | 'view_game_state' | 'reset_progress' | 'grant_items') => {
    const userToUpdate = users.find(u => u.uid === userId);
    if (!userToUpdate) return;

    let actionDescription = '';
    let successMessage = '';

    if (action === 'toggle_ban_chat') {
      const newStatus = userToUpdate.status === 'active' ? 'banned_chat' : 'active';
      actionDescription = newStatus === 'banned_chat' ? `cấm chat ${userToUpdate.email}` : `bỏ cấm chat ${userToUpdate.email}`;
      successMessage = `Đã ${actionDescription}.`;
      try {
        const userGameStateRef = doc(db, 'users', userId, 'gameState', 'data');
        await updateDoc(userGameStateRef, { status: newStatus });
        setUsers(prevUsers => prevUsers.map(u => u.uid === userId ? { ...u, status: newStatus } : u));
        if (selectedUser?.uid === userId) {
            setSelectedUser(prev => prev ? {...prev, status: newStatus} : null);
        }
        toast({ title: "Thành Công", description: successMessage, className: "bg-green-500 text-white" });
      } catch (error) {
        console.error(`Error ${actionDescription}:`, error);
        toast({ title: "Lỗi", description: `Không thể ${actionDescription}.`, variant: "destructive" });
        return;
      }
    } else {
    }
    if (action === 'view_game_state' && userToUpdate) {
        openUserModal(userToUpdate);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card className="shadow-xl flex-1 flex flex-col min-h-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
            <Users className="h-7 w-7"/> Quản Lý Người Dùng
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6 pt-0">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-xl">Đang tải dữ liệu người dùng từ Firestore...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-xl flex flex-col flex-1 min-h-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
                    <Users className="h-7 w-7"/> Quản Lý Người Dùng ({filteredUsers.length})
                </CardTitle>
                <CardDescription>
                    Quản lý thông tin, trạng thái và dữ liệu người chơi trong game từ Firestore.
                </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search" 
                    placeholder="Tìm kiếm email hoặc UID..." 
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 pt-0">
            <Table className="relative border-separate border-spacing-0">
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[150px]">User ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[150px]">Trạng Thái</TableHead>
                  <TableHead className="w-[180px] text-center">Cấp/Bậc</TableHead>
                  <TableHead className="w-[180px]">Đăng Nhập Lần Cuối</TableHead>
                  <TableHead className="text-center w-[150px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {users.length === 0 ? "Không có dữ liệu người dùng nào." : "Không tìm thấy người dùng nào khớp với tìm kiếm."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const tierInfo = getPlayerTierInfo(user.level);
                    return (
                      <TableRow key={user.uid}>
                          <TableCell>
                          <Badge variant="secondary" className="text-xs cursor-pointer" title={user.uid} onClick={() => {navigator.clipboard.writeText(user.uid); toast({title: "Đã sao chép UID"})}}>
                              {user.uid.substring(0,8)}...
                          </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                          <Badge 
                              variant={user.status === 'active' ? 'default' : 'destructive'} 
                              className={cn("font-semibold", user.status === 'active' ? 'bg-green-500 hover:bg-green-600 text-primary-foreground' : 'bg-red-500 hover:bg-red-600 text-destructive-foreground')}
                          >
                              {user.status === 'active' ? 'Hoạt động' : 'Cấm Chat'}
                          </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                              Cấp {user.level} <br/>
                              <Badge variant="outline" className={cn("text-xs mt-1 px-2 py-0.5 font-semibold border-current", tierInfo.colorClass)}>
                                  <span className="mr-1 text-sm">{tierInfo.icon}</span>
                                  {tierInfo.tierName}
                              </Badge>
                          </TableCell>
                          <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa có'}</TableCell>
                          <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => openUserModal(user)} className="hover:text-blue-600" title="Xem chi tiết">
                              <Eye className="h-5 w-5" />
                          </Button>
                          <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleUserAction(user.uid, 'toggle_ban_chat')} 
                              className={user.status === 'active' ? "hover:text-orange-500" : "hover:text-green-500"}
                              title={user.status === 'active' ? 'Cấm Chat người dùng này' : 'Bỏ cấm chat'}
                          >
                              {user.status === 'active' ? <ShieldX className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleUserAction(user.uid, 'delete')} className="hover:text-destructive" title="Xóa người dùng (Mô Phỏng)">
                              <Trash2 className="h-5 w-5" />
                          </Button>
                          </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      {selectedUser && (
        <UserDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            userData={selectedUser}
            onAction={handleUserAction}
        />
      )}
    </>
  );
}
