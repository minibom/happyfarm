
'use client';

import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Sprout, Gift, BarChart3, Zap, ListChecks, Info, ShoppingCart, TrendingUp, Compass } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Giới Thiệu Game - Thư Viện Happy Farm',
  description: 'Khám phá tổng quan về game Happy Farm, cách chơi, các tính năng chính và mẹo để trở thành một nông dân tài ba.',
  alternates: {
    canonical: '/library',
  },
  openGraph: {
    title: 'Giới Thiệu Game Happy Farm',
    description: 'Tìm hiểu mọi thứ bạn cần biết để bắt đầu hành trình nông trại tại Happy Farm.',
    url: '/library',
  },
};

export default function LibraryIntroductionPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="pb-4">
          <div className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary font-headline flex items-center justify-center gap-2">
                <Compass className="h-8 w-8" /> Chào Mừng Đến Với Thư Viện Happy Farm!
            </CardTitle>
            <CardDescription className="text-md md:text-lg mt-2">
              Khám phá cơ chế, hướng dẫn cách chơi và những thông tin hữu ích để làm chủ nông trại của bạn.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 text-base pt-0">
          <div className="mt-4 mb-8">
            <Image
              src="https://placehold.co/600x300.png"
              alt="Khung cảnh nông trại Happy Farm rực rỡ"
              width={600}
              height={300}
              className="rounded-lg w-full object-cover shadow-md aspect-[2/1]"
              data-ai-hint="farm landscape"
              priority
            />
          </div>
          
          <section>
            <h2 className="text-2xl font-semibold text-accent mb-3 flex items-center gap-2"><Info className="h-6 w-6"/> Giới Thiệu Chung</h2>
            <p className="text-lg leading-relaxed">
              Happy Farm là một trò chơi mô phỏng nông trại đầy màu sắc và thú vị, nơi bạn có thể hóa thân thành một người nông dân thực thụ. 
              Bắt đầu từ một mảnh đất nhỏ, nhiệm vụ của bạn là gieo trồng, chăm sóc các loại cây trái, thu hoạch nông sản, mua bán tại chợ và từng bước mở rộng trang trại mơ ước của mình.
              Hãy chăm chỉ làm việc, lên cấp, hoàn thành nhiệm vụ và khám phá vô vàn điều kỳ diệu đang chờ đón!
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-accent mb-3 flex items-center gap-2"><Sprout className="h-6 w-6"/> Cơ Chế Nông Trại</h2>
            <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed">
              <li><strong>Gieo Trồng:</strong> Chọn hạt giống từ kho đồ và gieo xuống các ô đất trống đã được mở khóa.</li>
              <li><strong>Chăm Sóc:</strong> Cây trồng sẽ tự động lớn qua các giai đoạn. Bạn có thể sử dụng phân bón để rút ngắn thời gian sinh trưởng.</li>
              <li><strong>Thu Hoạch:</strong> Khi cây trồng đã sẵn sàng, hãy thu hoạch để nhận nông sản và điểm kinh nghiệm (XP).</li>
              <li><strong>Mở Khóa Ô Đất:</strong> Sử dụng vàng để mở khóa thêm các ô đất mới, mở rộng diện tích canh tác của bạn.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-accent mb-3 flex items-center gap-2"><ShoppingCart className="h-6 w-6"/> Chợ Nông Sản</h2>
             <p className="text-lg leading-relaxed mb-2">
              Chợ là nơi bạn thực hiện các giao dịch mua bán quan trọng:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed">
              <li><strong>Mua Hạt Giống & Phân Bón:</strong> Tích trữ hạt giống để gieo trồng và mua các loại phân bón để tăng năng suất.</li>
              <li><strong>Bán Nông Sản:</strong> Bán những nông sản bạn đã thu hoạch được để kiếm vàng.</li>
              <li><strong>Giá Cả Biến Động:</strong> Lưu ý rằng giá cả trên thị trường có thể thay đổi do sự kiện hoặc các yếu tố khác. Hãy theo dõi để có quyết định mua bán tốt nhất!</li>
            </ul>
          </section>

           <section>
            <h2 className="text-2xl font-semibold text-accent mb-3 flex items-center gap-2"><ListChecks className="h-6 w-6"/> Hệ Thống Nhiệm Vụ</h2>
             <p className="text-lg leading-relaxed mb-2">
              Hoàn thành các nhiệm vụ là một phần quan trọng để phát triển và nhận phần thưởng giá trị:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed">
              <li><strong>Nhiệm Vụ Chính:</strong> Dẫn dắt bạn qua các cột mốc quan trọng của game, mở khóa tính năng và phần thưởng lớn.</li>
              <li><strong>Nhiệm Vụ Hàng Ngày:</strong> Các mục tiêu ngắn hạn, làm mới mỗi ngày, giúp bạn kiếm thêm tài nguyên.</li>
              <li><strong>Nhiệm Vụ Hàng Tuần:</strong> Các thử thách lớn hơn với phần thưởng hấp dẫn hơn, kéo dài trong một tuần.</li>
            </ul>
            <p className="text-lg leading-relaxed mt-2">
                Kiểm tra sổ tay nhiệm vụ thường xuyên để không bỏ lỡ bất kỳ cơ hội nào!
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-accent mb-3 flex items-center gap-2"><TrendingUp className="h-6 w-6"/> Lên Cấp & Thăng Bậc</h2>
            <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed">
              <li><strong>Kinh Nghiệm (XP):</strong> Kiếm XP từ việc thu hoạch cây trồng, hoàn thành nhiệm vụ và các hoạt động khác.</li>
              <li><strong>Lên Cấp (Level):</strong> Khi đủ XP, bạn sẽ lên cấp, mở khóa các tính năng và vật phẩm mới.</li>
              <li><strong>Thăng Bậc (Tier):</strong> Đạt các mốc cấp độ nhất định sẽ giúp bạn thăng hạng lên các Bậc cao hơn, mang lại những lợi ích vĩnh viễn như tăng % XP nhận được, tăng giá bán nông sản, hoặc giảm thời gian trồng trọt.</li>
            </ul>
          </section>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-10 pt-8 border-t">
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
                <CardTitle className="flex items-center gap-2 text-xl"><Zap /> Sự Kiện Đặc Biệt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Theo dõi các sự kiện đang diễn ra và sắp tới để nhận những phần thưởng giá trị.</p>
                <Button variant="outline" asChild className="w-full"><Link href="/library/events">Xem Sự Kiện</Link></Button>
              </CardContent>
            </Card>
             <Card className="hover:shadow-xl transition-shadow bg-background/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><ListChecks /> Nhiệm Vụ Trong Game</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Xem danh sách nhiệm vụ chính, hàng ngày và hàng tuần đang hoạt động của bạn.</p>
                <Button variant="outline" asChild className="w-full"><Link href="/game">Mở Sổ Tay Nhiệm Vụ</Link></Button>
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
