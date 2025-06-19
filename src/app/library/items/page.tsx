
import type { Metadata } from 'next';
import LibraryItemsContent from './items-content';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Vật Phẩm Game - Thư Viện Happy Farm',
    description: 'Khám phá chi tiết về các loại cây trồng, hạt giống và phân bón trong Happy Farm. Tìm hiểu thông tin về thời gian trồng, giá cả, và bậc mở khóa.',
    alternates: {
      canonical: '/library/items',
    },
    openGraph: {
      title: 'Vật Phẩm Game - Thư Viện Happy Farm',
      description: 'Danh sách và chi tiết các vật phẩm trong Happy Farm.',
      url: '/library/items',
    },
  };
}

export default function LibraryItemsPage() {
  return <LibraryItemsContent />;
}
