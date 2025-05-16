'use client';

import { useState, useEffect } from 'react';
import { signIn, getCsrfToken, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(searchParams.get('error'));
  const [csrfToken, setCsrfToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    getCsrfToken().then(token => setCsrfToken(token || ''));
  }, []);

  useEffect(() => {
    const errorMessage = searchParams.get('error');
    if (errorMessage) {
        // Map common error messages to more user-friendly ones
        if (errorMessage === "CredentialsSignin") {
            setError("Invalid email or password. Please try again.");
        } else {
            setError("An unknown error occurred. Please try again.");
        }
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false, // Handle redirect manually after checking result
      email: email,
      password: password,
      // csrfToken: csrfToken, // CSRF token is usually handled automatically by NextAuth.js for credentials
    });

    setLoading(false);

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(result.error); // Or a generic message
      }
    } else if (result?.ok && !result.error) {
      // Successful sign in
      router.push('/'); // Redirect to home page or a designated dashboard page
    }
  };
  
  // If already authenticated (e.g. navigating back), redirect immediately
  if (status === 'authenticated') {
    return <p>Redirecting...</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CSRF token input is often not needed for Credentials if not using a separate backend form post */}
            {/* <input name="csrfToken" type="hidden" defaultValue={csrfToken} /> */}
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{
              loading ? 'Signing In...' : 'Sign In'
            }</Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm flex flex-col space-y-2">
          <p>Don't have an account? <Link href="/auth/signup" className="font-semibold text-blue-600 hover:underline">Sign Up</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
} 