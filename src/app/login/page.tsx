
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
      toast({ title: "Logged In", description: "Welcome back to Happy Farm!", className: "bg-primary text-primary-foreground" });
      router.push('/');
    } catch (err: any) {
      console.error("Login failed:", err);
      const errorMessage = err.code === 'auth/invalid-credential' 
        ? "Invalid email or password. Please try again."
        : err.message || "Failed to log in. Please try again.";
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary font-headline flex items-center justify-center">
            <LogIn className="mr-2 h-8 w-8" /> Login to Happy Farm
          </CardTitle>
          <CardDescription>Enter your credentials to access your farm.</CardDescription>
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
                placeholder="you@example.com"
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
              {loading ? 'Logging In...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
