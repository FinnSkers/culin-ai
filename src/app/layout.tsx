import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CulinAIProvider } from '@/context/CulinAIProvider';
import { ThemeManager } from '@/components/layout/ThemeManager';
import PageTransition from '@/components/layout/PageTransition';

export const metadata: Metadata = {
  title: 'CulinAI - Kitchen Rebel',
  description: 'Your badass AI-powered kitchen partner.',
  applicationName: 'CulinAI',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CulinAI',
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: '#FF8C00',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        {isConfigured ? (
          <CulinAIProvider>
            <ThemeManager />
            <PageTransition>{children}</PageTransition>
            <Toaster />
          </CulinAIProvider>
        ) : (
          <>
            {children}
            <Toaster />
          </>
        )}
      </body>
    </html>
  );
}
