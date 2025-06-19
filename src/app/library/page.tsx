
import type { Metadata } from 'next';
import LibraryIntroductionContent from './library-content';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Giới Thiệu Game - Thư Viện Happy Farm',
    description: 'Khám phá tổng quan về game Happy Farm, cách chơi, các tính năng chính và mẹo để trở thành một nông dân tài ba.',
    alternates: {
      canonical: '/library',
    },
    openGraph: {
      title: 'Giới Thiệu Game - Thư Viện Happy Farm',
      description: 'Tìm hiểu mọi thứ về Happy Farm: từ trồng trọt, chăn nuôi đến các sự kiện đặc biệt.',
      url: '/library',
    },
  };
}

export default function LibraryPage() {
  return <LibraryIntroductionContent />;
}
