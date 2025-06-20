
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Tractor, Wheat, LogIn, UserPlus } from 'lucide-react';
import ClientOnlyLeafBackground from '@/components/game/ClientOnlyLeafBackground';
import happyFarmGameImage from '@/components/icons/happyfarm.png'; // Import the local image

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleJoinGame = () => {
    if (user) {
      router.push('/game');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-200 via-yellow-100 to-sky-200 p-6 text-center overflow-hidden">
      <ClientOnlyLeafBackground />
      <main className="z-10">
        <header className="mb-10 sm:mb-12">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-primary font-headline mb-4 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <Wheat className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500" />
            Happy Farm
            <Tractor className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
          </h1>
          <p className="text-xl sm:text-2xl text-green-700 max-w-xl sm:max-w-2xl mx-auto">
            Chào mừng bạn đến với Nông Trại Vui Vẻ! Hãy gieo hạt, chăm sóc cây trồng, thu hoạch và xây dựng trang trại mơ ước của bạn.
          </p>
        </header>

        <div className="mb-10 sm:mb-12">
          <Image
            src={happyFarmGameImage} // Use the imported image
            alt="Happy Farm Game Illustration" // Updated alt text
            width={600} // Kept original dimensions, adjust if needed
            height={400} // Kept original dimensions, adjust if needed
            className="rounded-xl shadow-2xl border-4 border-white transform transition-transform duration-500 hover:scale-105"
            priority
            data-ai-hint="farm game" // Updated data-ai-hint
          />
        </div>

        <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-row sm:items-center sm:justify-center sm:space-x-6">
          <Button
            onClick={handleJoinGame}
            size="lg"
            className="w-full sm:w-auto text-lg sm:text-xl px-8 sm:px-10 py-6 sm:py-7 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transform hover:scale-105 transition-transform"
            disabled={loading}
          >
            <LogIn className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
            {loading ? "Đang tải..." : (user ? "Vào Game" : "Tham Gia Ngay")}
          </Button>
          {!user && !loading && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-lg sm:text-xl px-8 sm:px-10 py-6 sm:py-7 border-primary text-primary hover:bg-primary/10 shadow-lg transform hover:scale-105 transition-transform"
            >
              <Link href="/register">
                <UserPlus className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                Đăng Ký
              </Link>
            </Button>
          )}
        </div>
      </main>

      <footer className="mt-12 sm:mt-16 text-sm text-gray-600 z-10">
        <p>&copy; {new Date().getFullYear()} Happy Farm by Firebase Studio. Chúc bạn chơi game vui vẻ!</p>
      </footer>
    </div>
  );
}
