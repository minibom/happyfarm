
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
import { Eye, Trash2, MessageCircleOff, ShieldAlert } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { UserDetailModal, type UserDetailModalProps } from '@/components/admin/UserActionModals';
import { useToast } from '@/hooks/use-toast';


// Mock user data for demonstration
const mockUsers = [
  { id: 'user123', email: 'playerone@example.com', status: 'active', lastLogin: '2024-07-29T10:00:00Z', gold: 1500, level: 5 },
  { id: 'user456', email: 'farmfanatic@example.com', status: 'active', lastLogin: '2024-07-29T12:30:00Z', gold: 250, level: 2 },
  { id: 'user789', email: 'testaccount@example.com', status: 'banned_chat', lastLogin: '2024-07-28T15:00:00Z', gold: 0, level: 1 },
];

type MockUser = typeof mockUsers[0];

export default function AdminUsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const { toast } = useToast();

  const openUserModal = (user: MockUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUserAction = (userId: string, action: 'delete' | 'ban_chat' | 'unban_chat' | 'view_game_state') => {
    const user = mockUsers.find(u => u.id === userId);
    let actionDescription = '';
    switch(action) {
        case 'delete': actionDescription = `xóa người dùng ${user?.email}`; break;
        case 'ban_chat': actionDescription = `cấm chat người dùng ${user?.email}`; break;
        case 'unban_chat': actionDescription = `bỏ cấm chat người dùng ${user?.email}`; break;
        case 'view_game_state': actionDescription = `xem trạng thái game của ${user?.email}`; break;
    }

    toast({
      title: "Hành Động Người Dùng (Mô Phỏng)",
      description: `Yêu cầu ${actionDescription} đã được ghi nhận. Trong một hệ thống hoàn chỉnh, hành động này sẽ tương tác với cơ sở dữ liệu. Hiện tại, đây chỉ là mô phỏng.`,
      duration: 7000,
      className: "bg-blue-500 text-white"
    });
    console.log(`Simulated action: ${action} for user ${userId}`);
  };


  return (
    <>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary font-headline">
            Quản Lý Người Dùng (Placeholder)
          </CardTitle>
          <CardDescription>
            Trang này dùng để quản lý thông tin người dùng trong game.
            <br />
            <strong>Lưu ý:</strong> Dữ liệu người dùng và các hành động dưới đây là ví dụ minh họa (mock data).
            Trong một ứng dụng thực tế, dữ liệu này sẽ được lấy từ cơ sở dữ liệu (ví dụ: Firebase Authentication và Firestore)
            và các hành động sẽ thực sự thay đổi trạng thái người dùng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[calc(100vh-250px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Người Dùng</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead>Đăng Nhập Lần Cuối</TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Badge variant="secondary">{user.id}</Badge>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className={user.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {user.status === 'active' ? 'Hoạt động' : 'Cấm Chat'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.lastLogin).toLocaleString('vi-VN')}</TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openUserModal(user)} className="hover:text-blue-600">
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleUserAction(user.id, user.status === 'banned_chat' ? 'unban_chat' : 'ban_chat')} className="hover:text-orange-500">
                        <MessageCircleOff className="h-5 w-5" />
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleUserAction(user.id, 'view_game_state')} className="hover:text-teal-500">
                        <ShieldAlert className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleUserAction(user.id, 'delete')} className="hover:text-destructive">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
