
'use client';

import Link from 'next/link';
import { Search, Menu, User } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import React from 'react';
import { useAuth } from './AuthProvider';
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

        <div className="hidden md:flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || ''} alt={user?.fullName || 'User'} />
                  <AvatarFallback>
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User />}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold">{user?.fullName || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-bold">{user?.fullName || 'User'}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
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
                    </div>
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
