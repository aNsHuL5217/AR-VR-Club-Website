import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { LoadingProvider } from "@/context/LoadingContext";
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AR/VR Club GHRCEM | Computer Engineering Department',
  description: 'Building the Metaverse - AR/VR Club at G H Raisoni College of Engineering and Management',
  other: {
    'font-awesome': 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  },
  verification: {
    google: 't73gLmUlCT1Gn99-o6J7KYOROQuNE0LxzZ0h4aIwLLE',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

