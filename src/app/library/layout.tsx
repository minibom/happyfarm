
'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftCircle, Library } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LibraryLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col p-4">
      <header className="mb-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary font-headline flex items-center gap-2">
            <Library className="h-8 w-8" />
            Thư Viện Game
          </h1>
          <Button variant="outline" asChild>
            <Link href="/game">
              <ArrowLeftCircle className="mr-2 h-5 w-5" />
              Về Trang Game
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto">
        {children}
      </main>
      <footer className="text-center mt-8 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Happy Farm by Firebase Studio.</p>
      </footer>
    </div>
  );
}
