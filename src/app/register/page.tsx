
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
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, loading, error: authError } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Registration Failed", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    try {
      await signUp(email, password);
      toast({ title: "Registered Successfully!", description: "Welcome to Happy Farm! You can now log in.", className: "bg-primary text-primary-foreground" });
      router.push('/'); // Or router.push('/login') if you prefer
    } catch (err: any) {
      console.error("Registration failed:", err);
       const errorMessage = err.code === 'auth/email-already-in-use' 
        ? "This email is already registered. Please try logging in."
        : err.message || "Failed to register. Please try again.";
      toast({ title: "Registration Failed", description: errorMessage, variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary font-headline flex items-center justify-center">
            <UserPlus className="mr-2 h-8 w-8" /> Register for Happy Farm
          </CardTitle>
          <CardDescription>Create your account to start farming.</CardDescription>
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
                placeholder="•••••••• (min. 6 characters)"
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="text-base"
              />
            </div>
            {authError && <p className="text-sm text-destructive text-center">{authError.message}</p>}
            <Button type="submit" className="w-full text-lg py-3" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
