
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { AdminUserView } from '@/types';
import { Gift, Zap, UserX, MessageSquareOff, ShieldCheck, ShieldX, UserCircle2 } from 'lucide-react';
import { getPlayerTierInfo } from '@/lib/constants';

export interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: AdminUserView;
  onAction: (userId: string, action: 'delete' | 'toggle_ban_chat' | 'view_game_state' | 'reset_progress' | 'grant_items') => void;
}

export const UserDetailModal: FC<UserDetailModalProps> = ({ isOpen, onClose, userData, onAction }) => {
  if (!userData) return null;

  const handleSimulatedAction = (actionType: 'reset_progress' | 'grant_items') => {
    // In a real app, these would trigger backend functions.
    // For now, they might just log or show a toast.
    onAction(userData.uid, actionType);
  };

  const tierInfo = getPlayerTierInfo(userData.level);
  const displayUserIdentifier = userData.displayName || userData.email || userData.uid;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <UserCircle2 className="h-6 w-6 text-primary"/>
            Chi Tiết: <span className="font-semibold text-primary">{displayUserIdentifier}</span>
          </DialogTitle>
          <DialogDescription>
            Thông tin và các hành động quản trị cho người dùng này.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] my-4 pr-3">
            <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-x-4 gap-y-2">
                    <Label className="text-right font-medium">User ID (UID):</Label>
                    <Input value={userData.uid} readOnly className="col-span-2 bg-muted text-sm" />

                    <Label className="text-right font-medium">Tên Hiển Thị:</Label>
                    <Input value={userData.displayName || 'Chưa đặt'} readOnly className="col-span-2 bg-muted text-sm" />

                    <Label className="text-right font-medium">Email:</Label>
                    <Input value={userData.email || 'N/A'} readOnly className="col-span-2 bg-muted text-sm" />

                    <Label className="text-right font-medium">Trạng Thái:</Label>
                    <Badge 
                        variant={userData.status === 'active' ? 'default' : 'destructive'} 
                        className={`col-span-2 ${userData.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                        {userData.status === 'active' ? 'Hoạt động' : 'Cấm Chat'}
                    </Badge>

                    <Label className="text-right font-medium">Cấp Độ:</Label>
                    <Input value={userData.level.toString()} readOnly className="col-span-2 bg-muted text-sm" />
                    
                    <Label className="text-right font-medium">Bậc:</Label>
                    <Input value={`${tierInfo.tierName} (Bậc ${tierInfo.tier})`} readOnly className="col-span-2 bg-muted text-sm" />

                    <Label className="text-right font-medium">Vàng:</Label>
                    <Input value={userData.gold.toLocaleString()} readOnly className="col-span-2 bg-muted text-sm" />

                    <Label className="text-right font-medium">Kinh Nghiệm (XP):</Label>
                    <Input value={userData.xp.toLocaleString()} readOnly className="col-span-2 bg-muted text-sm" />
                    
                    <Label className="text-right font-medium">Đăng Nhập Cuối:</Label>
                    <Input value={userData.lastLogin ? new Date(userData.lastLogin).toLocaleString('vi-VN') : 'Chưa có'} readOnly className="col-span-2 bg-muted text-sm" />
                
                    <Label className="text-right font-medium">Số Ô Đã Mở:</Label>
                    <Input value={userData.unlockedPlotsCount.toString()} readOnly className="col-span-2 bg-muted text-sm" />
                </div>
                
                <Card>
                    <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-lg font-semibold">Hành Động Nhanh</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onAction(userData.uid, 'toggle_ban_chat')}
                            className={userData.status === 'active' ? "text-orange-600 border-orange-600 hover:bg-orange-50" : "text-green-600 border-green-600 hover:bg-green-50"}
                          >
                            {userData.status === 'active' ? <ShieldX className="mr-2 h-4 w-4"/> : <ShieldCheck className="mr-2 h-4 w-4"/>}
                            {userData.status === 'active' ? 'Cấm Chat' : 'Bỏ Cấm Chat'}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onAction(userData.uid, 'delete')}>
                            <UserX className="mr-2 h-4 w-4"/> Xóa Người Dùng (Mô Phỏng)
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSimulatedAction('grant_items')} className="text-blue-600 border-blue-600 hover:bg-blue-50">
                            <Gift className="mr-2 h-4 w-4"/> Tặng Vật Phẩm (Mô Phỏng)
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSimulatedAction('reset_progress')} className="text-purple-600 border-purple-600 hover:bg-purple-50">
                            <Zap className="mr-2 h-4 w-4"/> Reset Tiến Trình (Mô Phỏng)
                        </Button>
                    </CardContent>
                </Card>
                <p className="text-xs text-muted-foreground mt-2 px-1">
                    <strong>Lưu ý:</strong> Một số hành động là mô phỏng và cần triển khai đầy đủ với quyền hạn admin thích hợp (ví dụ: Cloud Functions) trong hệ thống thực tế.
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
