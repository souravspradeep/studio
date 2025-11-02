'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { PageTransition } from '@/components/PageTransition';
import { usePathname } from 'next/navigation';
import { FirebaseClientProvider } from '@/firebase';
import { useEffect } from 'react';

// ✅ Import as unknown because median-js-bridge lacks types
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MedianBridge: any = require('median-js-bridge');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const noHeaderPaths = ['/login', '/signup', '/'];
  const showHeader = !noHeaderPaths.includes(pathname);

  useEffect(() => {
    if (typeof window !== 'undefined' && /median|gonative/i.test(navigator.userAgent)) {
      try {
        // Handle multiple possible SDK export styles
        if (typeof MedianBridge === 'function') {
          MedianBridge();
          console.log('✅ Median bridge initialized (function export)');
        } else if (MedianBridge.default?.initialize) {
          MedianBridge.default.initialize();
          console.log('✅ Median bridge initialized (default.initialize export)');
        } else if (MedianBridge.bridge?.initialize) {
          MedianBridge.bridge.initialize();
          console.log('✅ Median bridge initialized (bridge.initialize export)');
        } else {
          console.warn('⚠️ Unknown Median bridge export shape:', MedianBridge);
        }
      } catch (err) {
        console.error('❌ Median bridge initialization failed:', err);
      }
    } else {
      console.log('ℹ️ Not inside Median WebView — skipping bridge init');
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>FindIt - Lost and Found</title>
        <meta
          name="description"
          content="Lost something on campus? Connect, share, and help each other find what matters."
        />
        <link
          rel="icon"
          href='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" style="fill: #4285F4;"></rect><path d="M73.5,68.5 L60.5,55.5 M65.5,45.5 C65.5,54.6127 58.1127,62 49,62 C39.8873,62 32.5,54.6127 32.5,45.5 C32.5,36.3873 39.8873,29 49,29 C58.1127,29 65.5,36.3873 65.5,45.5 Z" style="stroke: white; stroke-width: 8; fill: none; stroke-linecap: round;"></path></svg>'
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn('min-h-screen bg-background font-sans antialiased')}
        suppressHydrationWarning={true}
      >
        <FirebaseClientProvider>
          {showHeader && <Header />}
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
