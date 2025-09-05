import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { PageTransition } from '@/components/PageTransition';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'FindIt - Lost and Found',
  description: 'Lost something on campus? Connect, share, and help each other find what matters.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 style=%22fill: %234285F4;%22></rect><path d=%22M73.5,68.5 L60.5,55.5 M65.5,45.5 C65.5,54.6127 58.1127,62 49,62 C39.8873,62 32.5,54.6127 32.5,45.5 C32.5,36.3873 39.8873,29 49,29 C58.1127,29 65.5,36.3873 65.5,45.5 Z%22 style=%22stroke: white; stroke-width: 8; fill: none; stroke-linecap: round;%22></path></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        <AuthProvider>
          <Header />
          <main className="flex-1">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
