'use client';

import Link from 'next/link';
import { Search, Menu, FileQuestion, FilePlus, LogIn, LogOut, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import React from 'react';
import { useAuth } from './AuthProvider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/items', label: 'Browse Items' },
  { href: '/match-items', label: 'AI Matcher' },
  { href: '/contact-authority', label: 'Contact' },
];

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode, onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href} passHref>
      <span
        onClick={onClick}
        className={cn(
          'text-base font-medium transition-colors hover:text-white',
          isActive ? 'text-white' : 'text-blue-200'
        )}
      >
        {children}
      </span>
    </Link>
  );
}

export default function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };


  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight">
              FindIt
            </span>
            <p className="text-xs text-blue-200">Lost and Found</p>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
           <NavLink href="/items">Browse Items</NavLink>
           <NavLink href="/match-items">AI Matcher</NavLink>
           <NavLink href="/contact-authority">Contact</NavLink>
        </nav>

        <div className="hidden md:flex items-center space-x-2">
            {user ? (
            <>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login"><LogIn className="mr-2"/>Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup"><UserPlus className="mr-2" />Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-primary text-primary-foreground border-l-0">
                <div className="grid gap-6 p-6">
                    <Link href="/" className="flex items-center space-x-3" onClick={() => setIsOpen(false)}>
                        <div className="bg-white/20 p-2 rounded-lg">
                           <Search className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="font-extrabold text-xl tracking-tight">FindIt</span>
                            <p className="text-xs text-blue-200">Lost and Found</p>
                        </div>
                    </Link>

                    <div className="grid gap-4 mt-8">
                        {navLinks.map((link) => (
                            <NavLink key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                                {link.label}
                            </NavLink>
                        ))}
                         <NavLink href="/lost-item" onClick={() => setIsOpen(false)}>I lost something</NavLink>
                         <NavLink href="/found-item" onClick={() => setIsOpen(false)}>I found something</NavLink>
                        <hr className="border-blue-300 my-2" />
                        {user ? (
                           <button onClick={() => { handleLogout(); setIsOpen(false);}} className="text-left text-base font-medium text-blue-200 hover:text-white">Logout</button>
                        ) : (
                            <>
                                <NavLink href="/login" onClick={() => setIsOpen(false)}>Login</NavLink>
                                <NavLink href="/signup" onClick={() => setIsOpen(false)}>Sign Up</NavLink>
                            </>
                        )}
                    </div>
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
