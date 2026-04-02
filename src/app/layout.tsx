// File: src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'react-hot-toast';

// Environment validation — runs at startup
import { env, clientEnv, printStartupDiagnostics } from '@/lib/env';

// Print startup diagnostics once
if (typeof globalThis !== 'undefined') {
  const startupKey = '__mc_startup_printed__';
  if (!(globalThis as any)[startupKey]) {
    (globalThis as any)[startupKey] = true;
    printStartupDiagnostics();
  }
}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: clientEnv.NEXT_PUBLIC_APP_NAME,
  description: 'Production-ready task management with authentication and security.',
  robots: env.NODE_ENV === 'production' ? 'index, follow' : 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-mc-bg text-mc-text`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--mc-surface)',
                color: 'var(--mc-text)',
                border: '1px solid var(--mc-border)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
