
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Sprout, Gift, BarChart3, Library } from 'lucide-react';

export default function LibraryIntroductionPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Image
              src="https://placehold.co/80x80.png"
              alt="Happy Farm Logo"
              width={80}
              height={80}
              className="rounded-lg"
              data-ai-hint="farm logo"
            />
            <div>
              <CardTitle className="text-3xl font-bold text-primary font-headline">Chào Mừng Đến Với Happy Farm!</CardTitle>
              <CardDescription className="text-md">
                Nơi bạn kiến tạo trang trại mơ ước và khám phá thế giới nông nghiệp diệu kỳ.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-base">
          <p>
            Happy Farm là một trò chơi mô phỏng nông trại thú vị, nơi bạn có thể hóa thân thành một người nông dân thực thụ. 
            Bắt đầu từ một mảnh đất nhỏ, bạn sẽ gieo trồng, chăm sóc các loại cây trái, thu hoạch nông sản và mở rộng trang trại của mình.
          </p>
          <p>
            Hãy khám phá các cấp bậc khác nhau, mở khóa những loại cây trồng và phân bón mới, tham gia vào các sự kiện hấp dẫn 
            và giao lưu cùng cộng đồng người chơi.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 /> Các Cấp Bậc</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">Tiến bộ qua các cấp bậc để mở khóa nhiều lợi ích và nội dung mới.</p>
                <Button variant="outline" asChild><Link href="/library/tiers">Xem Chi Tiết Bậc</Link></Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sprout /> Vật Phẩm & Cây Trồng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">Tìm hiểu về các loại cây trồng, hạt giống, và phân bón có trong game.</p>
                <Button variant="outline" asChild><Link href="/library/items">Khám Phá Vật Phẩm</Link></Button>
              </CardContent>
            </Card>
             <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gift /> Sự Kiện Đặc Biệt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">Theo dõi các sự kiện đang diễn ra và sắp tới để nhận những phần thưởng giá trị.</p>
                <Button variant="outline" asChild><Link href="/library/events">Xem Sự Kiện</Link></Button>
              </CardContent>
            </Card>
             <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Cộng Đồng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">Tham gia trò chuyện, kết bạn và thi đua trên bảng xếp hạng.</p>
                <Button variant="outline" asChild><Link href="/game">Vào Game Ngay</Link></Button>
              </CardContent>
            </Card>
          </div>
          <p className="mt-6 text-center text-muted-foreground">
            Chúc bạn có những giờ phút thư giãn và vui vẻ tại Happy Farm!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
    