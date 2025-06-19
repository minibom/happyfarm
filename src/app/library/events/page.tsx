
import type { Metadata } from 'next';
import LibraryEventsContent from './events-content';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Sự Kiện Game - Thư Viện Happy Farm',
    description: 'Theo dõi các sự kiện đặc biệt đang diễn ra trong Happy Farm. Tìm hiểu về hiệu ứng, thời gian và các vật phẩm bị ảnh hưởng.',
    alternates: {
      canonical: '/library/events',
    },
    openGraph: {
      title: 'Sự Kiện Game - Thư Viện Happy Farm',
      description: 'Thông tin chi tiết về các sự kiện trong Happy Farm.',
      url: '/library/events',
    },
  };
}

export default function LibraryEventsPage() {
  return <LibraryEventsContent />;
}
