
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, DatabaseZap } from 'lucide-react';
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
          const itemData = CROP_DATA[cropId as CropId] as CropDetails;
          const itemRef = doc(db, 'gameItems', cropId);
          batch.set(itemRef, itemData);
          itemCount++;
        }
      }

      await batch.commit();

      toast({
        title: "Thành Công!",
        description: `Đã đẩy ${itemCount} vật phẩm từ 'src/lib/constants.ts' lên collection 'gameItems' trong Firestore.`,
        duration: 10000,
        className: "bg-green-500 text-white"
      });
      console.log("Data pushed to Firestore:", CROP_DATA);

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
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary font-headline">
          Cấu Hình Hệ Thống
        </CardTitle>
        <CardDescription>
          Trang này dành cho các cài đặt và hành động quản trị cấp cao.
          <br />
          <strong>Lưu ý:</strong> Hãy cẩn thận khi thực hiện các hành động trên trang này.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
                <DatabaseZap className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Đồng Bộ Dữ Liệu Vật Phẩm (Cục Bộ {'>'} Database)</CardTitle>
            </div>
            <CardDescription>
              Chức năng này sẽ đẩy TOÀN BỘ cấu hình vật phẩm từ file 
              <code>src/lib/constants.ts</code> lên collection <code>gameItems</code> trong Firestore.
              Sử dụng chức năng này để khởi tạo dữ liệu vật phẩm trên database hoặc ghi đè toàn bộ dữ liệu trên database bằng dữ liệu cục bộ.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handlePushData} className="bg-accent hover:bg-accent/90">
              <UploadCloud className="mr-2 h-5 w-5" />
              Đẩy Dữ Liệu Vật Phẩm Lên Database
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              Thao tác này sẽ <strong>GHI ĐÈ</strong> toàn bộ dữ liệu vật phẩm hiện có trên collection <code>gameItems</code> bằng dữ liệu từ file constants cục bộ.
              Hãy chắc chắn bạn hiểu rõ tác động trước khi thực hiện.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Các Cấu Hình Khác</CardTitle>
            <CardDescription>
              Khu vực này có thể chứa các cài đặt toàn cục khác cho game, ví dụ:
              tỷ lệ sự kiện, thông báo hệ thống, bật/tắt tính năng beta, v.v.
              Hiện tại chưa có cấu hình nào được triển khai.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Sẽ được cập nhật trong tương lai...</p>
          </CardContent>
        </Card>

      </CardContent>
    </Card>
  );
}
