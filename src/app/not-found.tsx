'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <FileQuestion className="w-16 h-16 mb-6 text-primary" />
      <h2 className="text-3xl font-bold mb-4 text-primary">404 - Không Tìm Thấy Trang</h2>
      <p className="mb-8 text-lg text-muted-foreground">
        Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
        (Sorry, we couldn't find the page you were looking for.)
      </p>
      <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
        <Link href="/">Về Trang Chủ (Go back to Home)</Link>
      </Button>
    </div>
  );
}
