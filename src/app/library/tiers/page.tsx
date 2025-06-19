
import type { Metadata } from 'next';
import LibraryTiersContent from './tiers-content';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Các Cấp Bậc - Thư Viện Happy Farm',
    description: 'Tìm hiểu về hệ thống cấp bậc trong Happy Farm, bao gồm các lợi ích (buff) và yêu cầu cấp độ để thăng hạng.',
    alternates: {
      canonical: '/library/tiers',
    },
    openGraph: {
      title: 'Các Cấp Bậc - Thư Viện Happy Farm',
      description: 'Thông tin chi tiết về các cấp bậc và lợi ích trong Happy Farm.',
      url: '/library/tiers',
    },
  };
}

export default function LibraryTiersPage() {
  return <LibraryTiersContent />;
}
