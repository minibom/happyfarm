
'use client';

import type { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Using the same mock user type for consistency
interface MockUser {
    id: string;
    email: string;
    status: string;
    lastLogin: string;
    gold: number;
    level: number;
}

export interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: MockUser;
  onAction: (userId: string, action: 'delete' | 'ban_chat' | 'unban_chat' | 'view_game_state') => void;
}

export const UserDetailModal: FC<UserDetailModalProps> = ({ isOpen, onClose, userData, onAction }) => {
  if (!userData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chi Tiết Người Dùng: {userData.email}</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết (mock data) cho người dùng. Trong hệ thống thực, dữ liệu này sẽ được tải từ Firestore.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right">User ID</Label>
            <Input value={userData.id} readOnly className="col-span-2 bg-muted" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right">Email</Label>
            <Input value={userData.email} readOnly className="col-span-2 bg-muted" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right">Trạng Thái</Label>
             <Badge variant={userData.status === 'active' ? 'default' : 'destructive'} className={`col-span-2 ${userData.status === 'active' ? 'bg-green-500' : ''}`}>
                {userData.status === 'active' ? 'Hoạt động' : 'Cấm Chat'}
            </Badge>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right">Đăng Nhập Cuối</Label>
            <Input value={new Date(userData.lastLogin).toLocaleString('vi-VN')} readOnly className="col-span-2 bg-muted" />
          </div>
           <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right">Vàng</Label>
            <Input value={userData.gold.toLocaleString()} readOnly className="col-span-2 bg-muted" />
          </div>
           <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right">Cấp Độ</Label>
            <Input value={userData.level.toLocaleString()} readOnly className="col-span-2 bg-muted" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Lưu ý:</strong> Dữ liệu game (vàng, cấp độ, kho đồ) sẽ cần được tải từ Firestore của người dùng trong hệ thống thực.
            Các nút hành động bên dưới chỉ mô phỏng.
          </p>
        </div>
        <DialogFooter className="justify-between">
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                onAction(userData.id, userData.status === 'banned_chat' ? 'unban_chat' : 'ban_chat');
                onClose();
              }}
            >
              {userData.status === 'banned_chat' ? 'Bỏ Cấm Chat' : 'Cấm Chat'} (Mô Phỏng)
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onAction(userData.id, 'delete');
                onClose();
              }}
            >
              Xóa Người Dùng (Mô Phỏng)
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
