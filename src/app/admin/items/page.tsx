
'use client';

import { CROP_DATA, ALL_CROP_IDS } from '@/lib/constants';
import type { CropId } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function AdminItemsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary font-headline">
            Quản Trị - Cấu Hình Vật Phẩm Cây Trồng
          </CardTitle>
          <CardDescription>
            Trang này hiển thị cấu hình hiện tại cho các vật phẩm cây trồng trong trò chơi.
            Các giá trị này được định nghĩa trong <code>src/lib/constants.ts</code>.
            <br />
            <strong>Để sửa đổi các giá trị này, vui lòng mô tả những thay đổi bạn muốn cho trợ lý AI.</strong>
            <br />
            Đối với một ứng dụng sản xuất, dữ liệu này lý tưởng nhất nên được quản lý trong cơ sở dữ liệu (ví dụ: Firestore)
            với một giao diện quản trị phù hợp để chỉnh sửa và lưu các thay đổi trực tiếp. Trang này hiện chỉ có thể đọc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Biểu Tượng</TableHead>
                  <TableHead>Tên (ID)</TableHead>
                  <TableHead>Tên Hạt Giống</TableHead>
                  <TableHead>Thời Gian Lớn (ms)</TableHead>
                  <TableHead>Thời Gian Sẵn Sàng (ms)</TableHead>
                  <TableHead>Sản Lượng</TableHead>
                  <TableHead>Giá Hạt Giống</TableHead>
                  <TableHead>Giá Nông Sản</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ALL_CROP_IDS.map((cropId: CropId) => {
                  const item = CROP_DATA[cropId];
                  return (
                    <TableRow key={cropId}>
                      <TableCell className="text-2xl">{item.icon}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <Badge variant="outline" className="text-xs">{cropId}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{item.seedName.replace('Seed', ' Hạt Giống')}</Badge>
                      </TableCell>
                      <TableCell>{item.timeToGrowing.toLocaleString()}</TableCell>
                      <TableCell>{item.timeToReady.toLocaleString()}</TableCell>
                      <TableCell>{item.harvestYield}</TableCell>
                      <TableCell className="text-primary font-semibold">{item.seedPrice}</TableCell>
                      <TableCell className="text-accent font-semibold">{item.cropPrice}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
