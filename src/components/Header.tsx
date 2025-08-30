'use client';

import Link from 'next/link';
import { Search, Menu, FileQuestion, FilePlus } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import React from 'react';

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

        <div className="hidden md:flex items-center space-x-4">
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
                    </div>
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
