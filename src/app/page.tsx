
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

export default function WelcomePage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && user) {
            router.replace('/home');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || user) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
            </div>
        );
    }

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-4 text-center text-white bg-cover bg-center"
      style={{ backgroundImage: "url('https://i.postimg.cc/9FXLjvCJ/360-F-1135376117-C3z-CMB5t-Mx-Usz2r-OQz-EOITEVG6-IG5-LRP.jpg')" }}
    >
      <div className="bg-black/40 p-10 rounded-2xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
          Welcome to FindIt
        </h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-xl mb-8">
          The central place for all lost and found items on campus.
          Connect, share, and help each other find what matters.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="btn-gradient">
              <Link href="/login">
                Login
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
                <Link href="/signup">
                    Sign Up
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
