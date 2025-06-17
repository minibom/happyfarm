
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
import { ScrollArea } from '@/components/ui/scroll-area';
import type { MockUserForAdmin } from '@/app/admin/users/page'; // Import the specific type
import { Gift, PiggyBank, Zap, UserX, MessageSquareOff, ShieldCheck, ShieldOff } from 'lucide-react';

export interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: MockUserForAdmin;
  onAction: (userId: string, action: 'delete' | 'ban_chat' | 'unban_chat' | 'view_game_state' | 'reset_progress' | 'grant_items') => void;
}

export const UserDetailModal: FC<UserDetailModalProps> = ({ isOpen, onClose, userData, onAction }) => {
  if (!userData) return null;

  const handleSimulatedAction = (actionType: 'reset_progress' | 'grant_items') => {
    onAction(userData.id, actionType);
    // Optionally close modal or keep open for more actions
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Chi Tiết Người Dùng: <span className="font-semibold text-primary">{userData.email}</span></DialogTitle>
          <DialogDescription>
            Thông tin (mô phỏng) và các hành động quản trị cho người dùng này.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] my-4 pr-3">
            <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-x-4 gap-y-2">
                    <Label className="text-right font-medium">User ID:</Label>
                    <Input value={userData.id} readOnly className="col-span-2 bg-muted text-sm" />

                    <Label className="text-right font-medium">Email:</Label>
                    <Input value={userData.email} readOnly className="col-span-2 bg-muted text-sm" />

                    <Label className="text-right font-medium">Trạng Thái:</Label>
                    <Badge variant={userData.status === 'active' ? 'default' : 'destructive'} className={`col-span-2 ${userData.status === 'active' ? 'bg-green-500' : ''}`}>
                        {userData.status === 'active' ? 'Hoạt động' : 'Cấm Chat'}
                    </Badge>

                    <Label className="text-right font-medium">Cấp Độ:</Label>
                    <Input value={userData.level.toString()} readOnly className="col-span-2 bg-muted text-sm" />
                    
                    <Label className="text-right font-medium">Bậc:</Label>
                    <Input value={`${userData.tierName} (Bậc ${userData.tier})`} readOnly className="col-span-2 bg-muted text-sm" />

                    <Label className="text-right font-medium">Vàng:</Label>
                    <Input value={userData.gold.toLocaleString()} readOnly className="col-span-2 bg-muted text-sm" />
                    
                    <Label className="text-right font-medium">Đăng Nhập Cuối:</Label>
                    <Input value={new Date(userData.lastLogin).toLocaleString('vi-VN')} readOnly className="col-span-2 bg-muted text-sm" />
                </div>
                
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">Hành Động Nhanh (Mô Phỏng)</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <Button variant="outline" size="sm" onClick={() => handleSimulatedAction('grant_items')} className="text-green-600 border-green-600 hover:bg-green-50">
                            <Gift className="mr-2 h-4 w-4"/> Tặng Vật Phẩm
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSimulatedAction('reset_progress')} className="text-orange-600 border-orange-600 hover:bg-orange-50">
                            <Zap className="mr-2 h-4 w-4"/> Reset Tiến Trình
                        </Button>
                         <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onAction(userData.id, userData.status === 'banned_chat' ? 'unban_chat' : 'ban_chat')}
                            className={userData.status === 'banned_chat' ? "text-blue-600 border-blue-600 hover:bg-blue-50" : "text-yellow-600 border-yellow-600 hover:bg-yellow-50"}
                          >
                            {userData.status === 'banned_chat' ? <ShieldCheck className="mr-2 h-4 w-4"/> : <MessageSquareOff className="mr-2 h-4 w-4"/>}
                            {userData.status === 'banned_chat' ? 'Bỏ Cấm Chat' : 'Cấm Chat'}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onAction(userData.id, 'delete')}>
                            <UserX className="mr-2 h-4 w-4"/> Xóa Người Dùng
                        </Button>
                    </CardContent>
                </Card>
                <p className="text-xs text-muted-foreground mt-2 px-1">
                    <strong>Lưu ý:</strong> Dữ liệu game (vàng, cấp độ, kho đồ, v.v.) và các hành động sẽ cần được triển khai đầy đủ với cơ sở dữ liệu Firestore trong hệ thống thực tế.
                </p>
            </div>
        </ScrollArea>
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
