
'use client';

import { useState } from 'react';
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
import { Eye, Trash2, MessageCircleOff, ShieldAlert, Users, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { UserDetailModal } from '@/components/admin/UserActionModals';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';


// Mock user data for demonstration
const mockUsers = [
  { id: 'user123', email: 'playerone@example.com', status: 'active', lastLogin: '2024-07-29T10:00:00Z', gold: 1500, level: 15, tier: 2, tierName: "Chủ Vườn Chăm Chỉ" },
  { id: 'user456', email: 'farmfanatic@example.com', status: 'active', lastLogin: '2024-07-29T12:30:00Z', gold: 250, level: 8, tier: 1, tierName: "Nông Dân Tập Sự" },
  { id: 'user789', email: 'testaccount@example.com', status: 'banned_chat', lastLogin: '2024-07-28T15:00:00Z', gold: 0, level: 1, tier: 1, tierName: "Nông Dân Tập Sự" },
  { id: 'userABC', email: 'proharvester@example.com', status: 'active', lastLogin: '2024-07-30T08:00:00Z', gold: 10000, level: 33, tier: 4, tierName: "Chuyên Gia Mùa Vụ"},
  { id: 'userDEF', email: 'newbie@example.com', status: 'active', lastLogin: '2024-07-30T09:15:00Z', gold: 50, level: 3, tier: 1, tierName: "Nông Dân Tập Sự"},
];

export type MockUserForAdmin = typeof mockUsers[0];

export default function AdminUsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MockUserForAdmin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const openUserModal = (user: MockUserForAdmin) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUserAction = (userId: string, action: 'delete' | 'ban_chat' | 'unban_chat' | 'view_game_state' | 'reset_progress' | 'grant_items') => {
    const user = mockUsers.find(u => u.id === userId);
    let actionDescription = '';
    switch(action) {
        case 'delete': actionDescription = `xóa người dùng ${user?.email}`; break;
        case 'ban_chat': actionDescription = `cấm chat người dùng ${user?.email}`; break;
        case 'unban_chat': actionDescription = `bỏ cấm chat người dùng ${user?.email}`; break;
        case 'view_game_state': actionDescription = `xem trạng thái game của ${user?.email}`; break;
        case 'reset_progress': actionDescription = `reset tiến trình của ${user?.email}`; break;
        case 'grant_items': actionDescription = `tặng vật phẩm cho ${user?.email}`; break;
    }

    toast({
      title: "Hành Động Người Dùng (Mô Phỏng)",
      description: `Yêu cầu ${actionDescription} đã được ghi nhận. Trong một hệ thống hoàn chỉnh, hành động này sẽ tương tác với cơ sở dữ liệu. Hiện tại, đây chỉ là mô phỏng.`,
      duration: 7000,
      className: "bg-blue-500 text-white"
    });
    console.log(`Simulated action: ${action} for user ${userId}`);
  };

  const filteredUsers = mockUsers.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
                    <Users className="h-7 w-7"/> Quản Lý Người Dùng (Mô Phỏng)
                </CardTitle>
                <CardDescription>
                    Quản lý thông tin, trạng thái và dữ liệu người chơi trong game. 
                    <br/><strong>Lưu ý:</strong> Dữ liệu và hành động là mô phỏng.
                </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search" 
                    placeholder="Tìm kiếm email hoặc ID..." 
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[calc(100vh-300px)] border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[120px]">ID Người Dùng</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[150px]">Trạng Thái</TableHead>
                  <TableHead className="w-[100px] text-center">Cấp/Bậc</TableHead>
                  <TableHead className="w-[180px]">Đăng Nhập Lần Cuối</TableHead>
                  <TableHead className="text-center w-[150px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{user.id}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className={user.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {user.status === 'active' ? 'Hoạt động' : 'Cấm Chat'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                        Cấp {user.level} <br/>
                        <Badge variant="outline" className="text-xs">{user.tierName}</Badge>
                    </TableCell>
                    <TableCell>{new Date(user.lastLogin).toLocaleString('vi-VN')}</TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openUserModal(user)} className="hover:text-blue-600" title="Xem chi tiết">
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleUserAction(user.id, user.status === 'banned_chat' ? 'unban_chat' : 'ban_chat')} className="hover:text-orange-500" title={user.status === 'banned_chat' ? 'Bỏ cấm chat' : 'Cấm chat'}>
                        <MessageCircleOff className="h-5 w-5" />
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleUserAction(user.id, 'view_game_state')} className="hover:text-teal-500" title="Xem dữ liệu game">
                        <ShieldAlert className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleUserAction(user.id, 'delete')} className="hover:text-destructive" title="Xóa người dùng">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {filteredUsers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Không tìm thấy người dùng nào khớp.</p>
            )}
          </ScrollArea>
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
