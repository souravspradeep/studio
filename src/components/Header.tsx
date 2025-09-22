
'use client';

import Link from 'next/link';
import { Search, Menu, LogIn, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import React from 'react';
import { useAuth } from './AuthProvider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const navLinks = [
  { href: '/home', label: 'Home' },
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
        <Link href="/home" className="flex items-center space-x-3">
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
           {navLinks.map((link) => (
             <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
           ))}
        </nav>

        <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login"><LogIn className="mr-2"/>Login</Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2"/>Logout
            </Button>
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
                    <Link href="/home" className="flex items-center space-x-3" onClick={() => setIsOpen(false)}>
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
                        <hr className="border-blue-300 my-2" />
                        <NavLink href="/login" onClick={() => setIsOpen(false)}>Login</NavLink>
                        <button onClick={() => { handleLogout(); setIsOpen(false);}} className="text-left text-base font-medium text-blue-200 hover:text-white">Logout</button>
                    </div>
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
