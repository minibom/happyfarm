
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

// Removed metadata export

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error: authError } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      toast({ title: "Đăng Nhập Thành Công", description: "Chào mừng trở lại Happy Farm!", className: "bg-primary text-primary-foreground" });
      router.push('/game'); 
    } catch (err: any) {
      console.error("Login failed:", err);
      const errorMessage = err.code === 'auth/invalid-credential' 
        ? "Email hoặc mật khẩu không hợp lệ. Vui lòng thử lại."
        : err.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      toast({ title: "Đăng Nhập Thất Bại", description: errorMessage, variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary font-headline flex items-center justify-center">
            <LogIn className="mr-2 h-8 w-8" /> Đăng Nhập Happy Farm
          </CardTitle>
          <CardDescription>Nhập thông tin đăng nhập để vào nông trại của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@example.com"
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật Khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="text-base"
              />
            </div>
            {authError && <p className="text-sm text-destructive text-center">{authError.message}</p>}
            <Button type="submit" className="w-full text-lg py-3" disabled={loading}>
              {loading ? 'Đang Đăng Nhập...' : 'Đăng Nhập'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-center justify-center space-y-2">
          <p className="text-sm">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Đăng ký tại đây
            </Link>
          </p>
          <p className="text-sm">
            <Link href="/" className="font-medium text-muted-foreground hover:underline">
              Về trang chủ
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
