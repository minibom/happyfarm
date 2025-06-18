
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Added import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gift, PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { BonusTriggerType, RewardItem } from '@/types'; // Assuming types are defined

// Placeholder for bonus data - In a real app, this would come from Firestore
const placeholderBonusConfigurations = [
  { id: 'tierUp_2', triggerType: 'tierUp', triggerValue: '2', description: 'Thưởng khi đạt Bậc 2', rewards: [{ type: 'gold', amount: 200 }], mailSubject: 'Chúc mừng lên Bậc 2!', mailBody: 'Phần thưởng cho việc đạt Bậc 2.', isEnabled: true },
  { id: 'firstLogin', triggerType: 'firstLogin', description: 'Thưởng lần đầu đăng nhập', rewards: [{ type: 'item', itemId: 'tomatoSeed', quantity: 10 }], mailSubject: 'Chào mừng đến Happy Farm!', mailBody: 'Món quà nhỏ cho bạn bắt đầu.', isEnabled: true },
];


export default function AdminBonusesPage() {
  // TODO: Fetch and manage bonus configurations from Firestore

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
            <Gift className="h-7 w-7"/> Quản Lý Bonus & Phần Thưởng
          </CardTitle>
          <CardDescription>
            Cấu hình các loại bonus tự động (ví dụ: quà lên bậc) và phần thưởng cho sự kiện.
            Hệ thống sẽ tự động gửi thư kèm phần thưởng khi người chơi đạt điều kiện.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-end">
            <Button className="bg-accent hover:bg-accent/90" disabled>
              <PlusCircle className="mr-2 h-5 w-5" /> Tạo Bonus Mới (Sắp có)
            </Button>
          </div>

          <Card className="border-green-500/50">
            <CardHeader>
              <CardTitle className="text-xl">Danh Sách Bonus Hiện Tại</CardTitle>
              <CardDescription>
                Quản lý các cấu hình bonus đang hoạt động. (Chức năng chỉnh sửa và tạo mới sẽ được cập nhật)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {placeholderBonusConfigurations.length > 0 ? (
                <div className="space-y-4">
                  {placeholderBonusConfigurations.map((bonus) => (
                    <Card key={bonus.id} className="p-4 flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{bonus.description} (ID: {bonus.id})</h4>
                        <p className="text-sm text-muted-foreground">
                          Loại: {bonus.triggerType}
                          {bonus.triggerValue && ` (Giá trị: ${bonus.triggerValue})`}
                        </p>
                        <p className="text-sm">Thư: "{bonus.mailSubject}"</p>
                        <p className="text-sm">Phần thưởng: {bonus.rewards.map(r => 
                            r.type === 'gold' ? `${r.amount} vàng` : 
                            r.type === 'xp' ? `${r.amount} XP` : 
                            r.type === 'item' ? `${r.quantity}x ${r.itemId}` : ''
                          ).join(', ')}
                        </p>
                         <p className="text-sm">Trạng thái: <span className={bonus.isEnabled ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{bonus.isEnabled ? "Đang Bật" : "Đang Tắt"}</span></p>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Button variant="outline" size="icon" disabled title="Chỉnh sửa (Sắp có)">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" disabled title="Xóa (Sắp có)">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Chưa có cấu hình bonus nào.</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-orange-500/50">
             <CardHeader>
                <CardTitle className="text-xl">Cấu Hình Bonus (Mẫu - Sắp có)</CardTitle>
                <CardDescription>
                Giao diện để tạo/chỉnh sửa một cấu hình bonus.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="bonusId">ID Bonus (duy nhất)</Label>
                        <Input id="bonusId" placeholder="vd: tierUp_3, event_xmas2024" disabled />
                    </div>
                    <div>
                        <Label htmlFor="bonusDescription">Mô tả Bonus (cho Admin)</Label>
                        <Input id="bonusDescription" placeholder="vd: Thưởng khi lên Bậc 3" disabled />
                    </div>
                </div>
                <div>
                    <Label htmlFor="triggerType">Loại Kích Hoạt</Label>
                    <Select disabled>
                        <SelectTrigger id="triggerType">
                            <SelectValue placeholder="Chọn loại kích hoạt" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tierUp">Lên Bậc</SelectItem>
                            <SelectItem value="firstLogin">Lần Đầu Đăng Nhập</SelectItem>
                            <SelectItem value="event">Sự Kiện Đặc Biệt</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="triggerValue">Giá Trị Kích Hoạt (nếu có)</Label>
                    <Input id="triggerValue" placeholder="vd: 3 (cho tierUp), xmas2024 (cho event)" disabled />
                </div>
                 <div>
                    <Label htmlFor="mailSubjectEdit">Chủ Đề Thư Gửi Kèm</Label>
                    <Input id="mailSubjectEdit" placeholder="Chúc mừng bạn đã..." disabled />
                </div>
                <div>
                    <Label htmlFor="mailBodyEdit">Nội Dung Thư Gửi Kèm</Label>
                    <Textarea id="mailBodyEdit" placeholder="Nội dung chi tiết thư..." disabled />
                </div>
                <div>
                    <Label>Phần Thưởng (Sắp có giao diện thêm/xóa)</Label>
                    <p className="text-xs text-muted-foreground">Ví dụ: 100 Vàng, 5 x cà chuaSeed</p>
                    {/* TODO: UI to add/remove rewards */}
                </div>
                <Button disabled>Lưu Cấu Hình Bonus (Sắp có)</Button>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
