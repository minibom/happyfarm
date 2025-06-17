
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, DatabaseZap, ServerCog, BarChartHorizontalBig } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CROP_DATA } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import type { CropId, CropDetails } from '@/types';

export default function AdminConfigPage() {
  const { toast } = useToast();

  const handlePushData = async () => {
    toast({
      title: "Đang Xử Lý...",
      description: "Bắt đầu đẩy dữ liệu vật phẩm cục bộ lên Firestore. Vui lòng đợi...",
      duration: 5000,
    });

    try {
      const batch = writeBatch(db);
      let itemCount = 0;

      for (const cropId in CROP_DATA) {
        if (Object.prototype.hasOwnProperty.call(CROP_DATA, cropId)) {
          // Ensure unlockTier is included, defaulting to 1 if not present in constants
          const itemData: CropDetails = {
            ...CROP_DATA[cropId as CropId],
            unlockTier: CROP_DATA[cropId as CropId].unlockTier || 1, 
          };
          const itemRef = doc(db, 'gameItems', cropId);
          batch.set(itemRef, itemData);
          itemCount++;
        }
      }

      await batch.commit();

      toast({
        title: "Thành Công!",
        description: `Đã đẩy ${itemCount} vật phẩm từ 'src/lib/constants.ts' (bao gồm unlockTier) lên collection 'gameItems' trong Firestore.`,
        duration: 10000,
        className: "bg-green-500 text-white"
      });
      console.log("Data pushed to Firestore (including unlockTier):", CROP_DATA);

    } catch (error) {
      console.error("Error pushing data to Firestore:", error);
      toast({
        title: "Lỗi Đẩy Dữ Liệu",
        description: `Không thể đẩy dữ liệu lên Firestore. Lỗi: ${(error as Error).message}`,
        variant: "destructive",
        duration: 10000,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
            <ServerCog className="h-7 w-7"/> Cấu Hình Hệ Thống
          </CardTitle>
          <CardDescription>
            Các cài đặt và hành động quản trị cấp cao cho trò chơi. 
            Hãy cẩn thận khi thực hiện các thay đổi trên trang này.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                  <DatabaseZap className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">Đồng Bộ Dữ Liệu Vật Phẩm (Local {'>'} Database)</CardTitle>
              </div>
              <CardDescription>
                Chức năng này sẽ đẩy TOÀN BỘ cấu hình vật phẩm (bao gồm Bậc Mở Khóa) từ file 
                <code>src/lib/constants.ts</code> lên collection <code>gameItems</code> trong Firestore.
                Sử dụng để khởi tạo hoặc ghi đè dữ liệu vật phẩm trên database bằng dữ liệu từ file constants cục bộ.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handlePushData} className="bg-accent hover:bg-accent/90">
                <UploadCloud className="mr-2 h-5 w-5" />
                Đẩy Dữ Liệu Vật Phẩm Lên Database
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                Thao tác này sẽ <strong>GHI ĐÈ</strong> toàn bộ dữ liệu vật phẩm hiện có trên collection <code>gameItems</code>.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                  <BarChartHorizontalBig className="h-6 w-6 text-blue-500" />
                  <CardTitle className="text-xl">Quản Lý Sự Kiện Game (Placeholder)</CardTitle>
              </div>
              <CardDescription>
                Khu vực này có thể chứa các cài đặt cho sự kiện trong game, ví dụ:
                tỷ lệ rơi vật phẩm đặc biệt, thời gian diễn ra sự kiện, phần thưởng, v.v.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Chức năng quản lý sự kiện sẽ được phát triển trong tương lai...</p>
              <Button variant="outline" disabled className="mt-2">Thiết Lập Sự Kiện Mới</Button>
            </CardContent>
          </Card>
          
          <Card className="border-orange-500/50">
            <CardHeader>
                <CardTitle className="text-xl">Thông Báo Hệ Thống (Placeholder)</CardTitle>
                <CardDescription>
                Gửi thông báo chung cho tất cả người chơi trong game.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Chức năng gửi thông báo sẽ được phát triển trong tương lai...</p>
                <Button variant="outline" disabled className="mt-2">Soạn Thông Báo</Button>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
