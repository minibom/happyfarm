
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, DatabaseZap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CROP_DATA } from '@/lib/constants';

export default function AdminConfigPage() {
  const { toast } = useToast();

  const handlePushData = () => {
    console.log("Simulating: Pushing local item data to database...");
    console.log("Data to be pushed (from src/lib/constants.ts):", CROP_DATA);
    
    // In a real scenario, you would:
    // 1. Iterate through CROP_DATA.
    // 2. For each item, create a document in a Firestore collection (e.g., 'gameItems').
    // Example:
    // const itemRef = doc(db, 'gameItems', cropId);
    // await setDoc(itemRef, CROP_DATA[cropId]);

    toast({
      title: "Cấu Hình Hệ Thống (Mô Phỏng)",
      description: "Đã mô phỏng việc đẩy dữ liệu vật phẩm từ 'src/lib/constants.ts' lên cơ sở dữ liệu. Kiểm tra console để xem dữ liệu. Trong một ứng dụng thực tế, hành động này sẽ ghi dữ liệu vào Firestore.",
      duration: 10000,
      className: "bg-sky-500 text-white"
    });
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary font-headline">
          Cấu Hình Hệ Thống (Placeholder)
        </CardTitle>
        <CardDescription>
          Trang này dành cho các cài đặt và hành động quản trị cấp cao.
          <br />
          <strong>Lưu ý:</strong> Các chức năng hiện tại chỉ mang tính chất minh họa và mô phỏng.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
                <DatabaseZap className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Đồng Bộ Dữ Liệu Vật Phẩm</CardTitle>
            </div>
            <CardDescription>
              Chức năng này (trong tương lai) sẽ cho phép đẩy cấu hình vật phẩm từ file 
              <code>src/lib/constants.ts</code> lên một collection trong Firestore.
              Điều này hữu ích nếu bạn muốn quản lý vật phẩm từ cơ sở dữ liệu thay vì code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handlePushData} className="bg-accent hover:bg-accent/90">
              <UploadCloud className="mr-2 h-5 w-5" />
              Đẩy Dữ Liệu Vật Phẩm Lên Database (Mô Phỏng)
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              Việc này sẽ ghi đè dữ liệu vật phẩm hiện có trên database (nếu có) bằng dữ liệu từ file constants cục bộ.
              Hành động này cần được thực hiện cẩn thận.
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
