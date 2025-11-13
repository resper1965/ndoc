import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { Metadata } from 'next';
import { meta } from '../../config/meta';

export const metadata: Metadata = meta;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-montserrat: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
        `}</style>
      </head>
      <body
        className="text-sm font-regular tracking-wide antialiased"
        style={{
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
