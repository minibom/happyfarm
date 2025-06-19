
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Sprout, Gift, BarChart3, Zap, ListChecks, Info } from 'lucide-react'; // Added Zap, ListChecks, Info

export default function LibraryIntroductionPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="pb-4">
          <div className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary font-headline flex items-center justify-center gap-2">
                <Info className="h-8 w-8" /> Chào Mừng Đến Với Happy Farm!
            </CardTitle>
            <CardDescription className="text-md md:text-lg mt-2">
              Nơi bạn kiến tạo trang trại mơ ước và khám phá thế giới nông nghiệp diệu kỳ.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-base pt-0">
          <div className="mt-4 mb-8">
            <Image
              src="https://placehold.co/600x300.png"
              alt="Happy Farm Scenery"
              width={600}
              height={300}
              className="rounded-lg w-full object-cover shadow-md aspect-[2/1]"
              data-ai-hint="farm landscape"
              priority
            />
          </div>
          
          <p className="text-lg leading-relaxed">
            Happy Farm là một trò chơi mô phỏng nông trại thú vị, nơi bạn có thể hóa thân thành một người nông dân thực thụ. 
            Bắt đầu từ một mảnh đất nhỏ, bạn sẽ gieo trồng, chăm sóc các loại cây trái, thu hoạch nông sản và mở rộng trang trại của mình.
          </p>
          <p className="text-lg leading-relaxed">
            Hãy khám phá các cấp bậc khác nhau, mở khóa những loại cây trồng và phân bón mới, hoàn thành các nhiệm vụ đầy thử thách, tham gia vào các sự kiện hấp dẫn 
            và giao lưu cùng cộng đồng người chơi.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-8 pt-6 border-t">
            <Card className="hover:shadow-xl transition-shadow bg-background/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><BarChart3 /> Các Cấp Bậc</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Tiến bộ qua các cấp bậc để mở khóa nhiều lợi ích và nội dung mới.</p>
                <Button variant="outline" asChild className="w-full"><Link href="/library/tiers">Xem Chi Tiết Bậc</Link></Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow bg-background/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Sprout /> Vật Phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Tìm hiểu về các loại cây trồng, hạt giống, và phân bón có trong game.</p>
                <Button variant="outline" asChild className="w-full"><Link href="/library/items">Khám Phá Vật Phẩm</Link></Button>
              </CardContent>
            </Card>
             <Card className="hover:shadow-xl transition-shadow bg-background/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Zap /> Sự Kiện Đặc Biệt</CardTitle> {/* Changed icon */}
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Theo dõi các sự kiện đang diễn ra và sắp tới để nhận những phần thưởng giá trị.</p>
                <Button variant="outline" asChild className="w-full"><Link href="/library/events">Xem Sự Kiện</Link></Button>
              </CardContent>
            </Card>
             <Card className="hover:shadow-xl transition-shadow bg-background/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><ListChecks /> Nhiệm Vụ</CardTitle> {/* Added Missions link */}
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Khám phá các loại nhiệm vụ: chính, hàng ngày, hàng tuần và phần thưởng.</p>
                <Button variant="outline" asChild className="w-full"><Link href="/game">Xem Nhiệm Vụ Trong Game</Link></Button>
              </CardContent>
            </Card>
          </div>
          <p className="mt-8 text-center text-muted-foreground">
            Chúc bạn có những giờ phút thư giãn và vui vẻ tại Happy Farm!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
